// src/views/my-items.ts
import { el } from '@webtaku/el';
import { watchAccount, getAccount, simulateContract, writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { isAddress } from 'viem';
import { fetchHeldNfts } from '../api/nfts';
import { wagmiConfig } from '../components/wallet';
import './my-items.css';
const ERC721_ABI = [
    {
        type: 'function',
        stateMutability: 'nonpayable',
        name: 'safeTransferFrom',
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' }
        ],
        outputs: []
    }
];
export class MyItems {
    root;
    grid;
    stateBar;
    holder = null;
    unwatch;
    reqToken = 0;
    // dialogs
    dlgSend;
    iptTo;
    dlgList;
    iptPrice;
    pending = {};
    refreshHandler = () => { if (this.holder)
        this.load(); };
    constructor() {
        const title = el('h2.page-title', '내 NFT');
        const subtitle = el('p.page-subtitle', '지갑이 보유한 NFT 목록입니다.');
        this.stateBar = el('div.state-bar');
        this.grid = el('div.items-grid');
        this.root = el('section.my-items', title, subtitle, this.stateBar, this.grid);
        // ===== dialogs (once, reuse) =====
        // Send
        this.iptTo = el('sl-input', { type: 'text', label: '받는 주소', placeholder: '0x...' });
        const btnSendCancel = el('sl-button', { slot: 'footer', variant: 'neutral' }, '취소');
        const btnSendOk = el('sl-button', { slot: 'footer', variant: 'primary' }, '보내기');
        this.dlgSend = el('sl-dialog', { label: 'NFT 보내기' }, el('div', { style: { marginBottom: '8px' } }, '수신자 지갑 주소를 입력하세요.'), this.iptTo, btnSendCancel, btnSendOk);
        btnSendCancel.addEventListener('click', () => { this.dlgSend.open = false; });
        btnSendOk.addEventListener('click', () => this.confirmSend());
        // List
        this.iptPrice = el('sl-input', { type: 'number', label: '가격 (ETH)', placeholder: '0.01', min: 0, step: 0.0001 });
        const btnListCancel = el('sl-button', { slot: 'footer', variant: 'neutral' }, '취소');
        const btnListOk = el('sl-button', { slot: 'footer', variant: 'primary' }, '리스팅');
        this.dlgList = el('sl-dialog', { label: 'NFT 리스팅' }, el('div', { style: { marginBottom: '8px' } }, '판매 가격(ETH)을 입력하세요.'), this.iptPrice, btnListCancel, btnListOk);
        btnListCancel.addEventListener('click', () => { this.dlgList.open = false; });
        btnListOk.addEventListener('click', () => this.confirmList());
        this.root.append(this.dlgSend, this.dlgList);
        // ===== initial sync =====
        const { address } = getAccount(wagmiConfig) ?? {};
        this.setHolder(address ?? null);
        // ===== subscribe account changes =====
        this.unwatch = watchAccount(wagmiConfig, {
            onChange: (account) => this.setHolder(account.address ?? null)
        });
        // refresh hook after external actions succeed (optional)
        window.addEventListener('myitems:refresh', this.refreshHandler);
    }
    destroy() {
        this.unwatch?.();
        this.unwatch = undefined;
        window.removeEventListener('myitems:refresh', this.refreshHandler);
    }
    toast(variant, msg) {
        const a = el('sl-alert', { variant, duration: 3000, closable: true }, msg);
        document.body.appendChild(a);
        customElements.whenDefined('sl-alert').then(() => a.toast?.());
    }
    setHolder(addr) {
        this.holder = addr;
        this.grid.replaceChildren();
        this.stateBar.replaceChildren();
        if (!this.holder) {
            this.showEmptyWalletHint();
            return;
        }
        this.load();
    }
    async load() {
        if (!this.holder)
            return;
        const myReq = ++this.reqToken;
        this.stateBar.replaceChildren();
        this.renderSkeletons(6);
        try {
            const items = await fetchHeldNfts(this.holder);
            if (myReq !== this.reqToken)
                return;
            if (!items.length)
                return this.showEmpty();
            this.renderItems(items);
        }
        catch (err) {
            if (myReq !== this.reqToken)
                return;
            this.showError(err);
        }
    }
    renderItems(items) {
        this.stateBar.replaceChildren();
        const cards = items.map((nft) => this.renderCard(nft));
        this.grid.replaceChildren(...cards);
    }
    renderCard(nft) {
        const contract = nft.contract_addr;
        const btnList = el('sl-button', { size: 'small', variant: 'primary' }, '리스팅');
        const btnSend = el('sl-button', { size: 'small', variant: 'neutral', outline: true }, '보내기');
        btnList.addEventListener('click', () => {
            if (!contract)
                return this.showError('컨트랙트 주소를 찾을 수 없습니다.');
            this.openListDialog({ contract, tokenId: BigInt(nft.id), nft });
        });
        btnSend.addEventListener('click', () => {
            if (!contract)
                return this.showError('컨트랙트 주소를 찾을 수 없습니다.');
            this.openSendDialog({ contract, tokenId: BigInt(nft.id), nft });
        });
        const actions = el('div.card-actions', btnList, btnSend);
        return el('sl-card.nft-card', el('img.card-media', {
            src: nft.image ?? '',
            alt: `${nft.collection ?? 'NFT'} #${nft.id}`,
            onerror: (e) => e.currentTarget.src = 'fallback.png'
        }), el('div.card-meta', el('div.name', `${nft.collection ?? 'NFT'} #${nft.id}`)), actions);
    }
    openSendDialog(payload) {
        this.pending = payload;
        this.iptTo.value = '';
        this.dlgSend.open = true;
    }
    async confirmSend() {
        const to = String(this.iptTo.value ?? '').trim();
        if (!to || !isAddress(to)) {
            this.stateBar.replaceChildren(el('sl-alert', { variant: 'warning', open: true }, '유효한 수신자 주소를 입력하세요.'));
            return;
        }
        const me = getAccount(wagmiConfig)?.address;
        if (!me) {
            this.stateBar.replaceChildren(el('sl-alert', { variant: 'warning', open: true }, '지갑이 연결되어 있지 않습니다.'));
            return;
        }
        const { contract, tokenId } = this.pending;
        if (!contract || tokenId == null)
            return;
        this.dlgSend.open = false;
        this.toast('primary', '전송을 시작합니다…');
        try {
            const { request } = await simulateContract(wagmiConfig, {
                address: contract,
                abi: ERC721_ABI,
                functionName: 'safeTransferFrom',
                args: [me, to, tokenId],
                account: me
            });
            const hash = await writeContract(wagmiConfig, request);
            await waitForTransactionReceipt(wagmiConfig, { hash });
            this.toast('success', '전송 완료!');
            window.dispatchEvent(new CustomEvent('myitems:refresh'));
        }
        catch (err) {
            console.error(err);
            this.toast('danger', err?.shortMessage || err?.message || '전송 실패');
        }
    }
    openListDialog(payload) {
        this.pending = payload;
        this.iptPrice.value = '';
        this.dlgList.open = true;
    }
    confirmList() {
        const priceEth = String(this.iptPrice.value ?? '').trim();
        if (!priceEth || Number(priceEth) <= 0) {
            this.stateBar.replaceChildren(el('sl-alert', { variant: 'warning', open: true }, '유효한 가격(ETH)을 입력하세요.'));
            return;
        }
        const detail = { ...this.pending, priceEth };
        this.dlgList.open = false;
        // 상위(메인)에서 marketplace.list() 처리
        window.dispatchEvent(new CustomEvent('myitems:list', { detail }));
    }
    renderSkeletons(n = 8) {
        this.grid.replaceChildren(...Array.from({ length: n }, () => el('sl-card', el('sl-skeleton', { effect: 'pulse', style: { width: '100%', height: '200px', display: 'block' } }), el('div', { style: { padding: '10px' } }, el('sl-skeleton', { effect: 'sheen', style: { width: '60%', height: '16px' } })))));
    }
    showEmptyWalletHint() {
        this.stateBar.replaceChildren(el('sl-alert', { variant: 'primary', open: true }, el('strong', '지갑이 연결되어 있지 않습니다.')));
    }
    showEmpty() {
        this.stateBar.replaceChildren(el('sl-alert', { variant: 'neutral', open: true }, el('strong', '보유한 NFT가 없습니다.'), el('br'), '탐색 탭에서 새로운 NFT를 찾아보세요.'));
        this.grid.replaceChildren();
    }
    showError(err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.stateBar.replaceChildren(el('sl-alert', { variant: 'danger', open: true }, msg));
    }
}
//# sourceMappingURL=my-items.js.map