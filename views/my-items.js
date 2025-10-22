import { el } from '@webtaku/el';
import { watchAccount, getAccount } from 'wagmi/actions'; // ⬅ getAccount 추가
import { fetchHeldNfts } from '../api/nfts';
import { wagmiConfig } from '../components/wallet';
import './my-items.css';
export class MyItems {
    root;
    grid;
    stateBar;
    holder = null;
    unwatch;
    reqToken = 0; // 경쟁 상태 방지용 토큰
    constructor() {
        const title = el('h2.page-title', '내 NFT');
        const subtitle = el('p.page-subtitle', '지갑이 보유한 NFT 목록입니다.');
        this.stateBar = el('div.state-bar');
        this.grid = el('div.items-grid');
        this.root = el('section.my-items', title, subtitle, this.stateBar, this.grid);
        // 1) 초기 동기화
        const { address } = getAccount(wagmiConfig) ?? {};
        this.setHolder(address ?? null);
        // 2) 구독 설정 (언마운트에서 해제)
        this.unwatch = watchAccount(wagmiConfig, {
            onChange: (account) => this.setHolder(account.address ?? null)
        });
    }
    destroy() {
        this.unwatch?.();
        this.unwatch = undefined;
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
        // 3) 경쟁 상태 방지 토큰
        const myReq = ++this.reqToken;
        this.renderSkeletons(4);
        try {
            const items = await fetchHeldNfts(this.holder);
            if (myReq !== this.reqToken)
                return; // holder가 바뀌어 이전 응답이면 무시
            if (!items.length) {
                this.showEmpty();
                return;
            }
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
        return el('sl-card.nft-card', el('img.card-media', {
            src: nft.image ?? '',
            alt: `${nft.collection} #${nft.id}`,
            onerror: (e) => e.currentTarget.src = 'fallback.png'
        }), el('div.card-meta', el('div.name', `${nft.collection ?? 'NFT'} #${nft.id}`)));
    }
    renderSkeletons(n = 8) {
        this.grid.replaceChildren(...Array.from({ length: n }, () => el('sl-card', el('sl-skeleton', { effect: 'pulse', style: { width: '100%', height: '200px' } }))));
    }
    showEmptyWalletHint() {
        this.stateBar.replaceChildren(el('sl-alert', { variant: 'primary', open: true }, el('strong', '지갑이 연결되어 있지 않습니다.')));
    }
    showEmpty() {
        this.stateBar.replaceChildren();
        this.grid.replaceChildren(el('div.empty', el('h3', '보유한 NFT가 없습니다.'), el('p', '탐색 탭에서 새로운 NFT를 찾아보세요.')));
    }
    showError(err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.stateBar.replaceChildren(el('sl-alert', { variant: 'danger', open: true }, msg));
    }
}
//# sourceMappingURL=my-items.js.map