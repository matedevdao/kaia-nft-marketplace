import { el } from '@webtaku/el';
import { isAddress, parseEther } from 'viem';
import { getAccount, simulateContract, waitForTransactionReceipt, watchAccount, writeContract } from 'wagmi/actions';
import { fetchHeldNfts, type HeldNft } from '../api/nfts';
import { wagmiConfig } from '../components/wallet';
import { listNft } from '../contracts/nft-marketplace';
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
] as const;

export class MyItems {
  root: HTMLElement;
  private grid: HTMLElement;
  private stateBar: HTMLElement;
  private holder: `0x${string}` | null = null;
  private unwatch?: () => void;
  private reqToken = 0;

  // dialogs
  private dlgSend!: HTMLElement;
  private iptTo!: HTMLElement;
  private dlgList!: HTMLElement;
  private iptPrice!: HTMLElement;
  private pending: { contract?: `0x${string}`; tokenId?: bigint; nft?: HeldNft } = {};

  private refreshHandler = () => { if (this.holder) this.load(); };

  constructor() {
    const title = el('h2.page-title', '내 NFT');
    const subtitle = el('p.page-subtitle', '지갑이 보유한 NFT 목록입니다.');
    this.stateBar = el('div.state-bar');
    this.grid = el('div.items-grid');
    this.root = el('section.my-items', title, subtitle, this.stateBar, this.grid);

    // ===== dialogs (once, reuse) =====
    // Send
    this.iptTo = el('sl-input', { type: 'text', label: '받는 주소', placeholder: '0x...' }) as any;
    const btnSendCancel = el('sl-button', { slot: 'footer', variant: 'neutral' }, '취소');
    const btnSendOk = el('sl-button', { slot: 'footer', variant: 'primary' }, '보내기');
    this.dlgSend = el('sl-dialog', { label: 'NFT 보내기' },
      el('div', { style: { marginBottom: '8px' } }, '수신자 지갑 주소를 입력하세요.'),
      this.iptTo, btnSendCancel, btnSendOk
    );
    btnSendCancel.addEventListener('click', () => { (this.dlgSend as any).open = false; });
    btnSendOk.addEventListener('click', () => this.confirmSend());

    // List
    this.iptPrice = el('sl-input', { type: 'number', label: '가격 (KAIA)', min: 0 }) as any;
    const btnListCancel = el('sl-button', { slot: 'footer', variant: 'neutral' }, '취소');
    const btnListOk = el('sl-button', { slot: 'footer', variant: 'primary' }, '리스팅');
    this.dlgList = el('sl-dialog', { label: 'NFT 리스팅' },
      el('div', { style: { marginBottom: '8px' } }, '판매 가격(KAIA)을 입력하세요.'),
      this.iptPrice, btnListCancel, btnListOk
    );
    btnListCancel.addEventListener('click', () => { (this.dlgList as any).open = false; });
    btnListOk.addEventListener('click', () => this.confirmList());

    this.root.append(this.dlgSend, this.dlgList);

    // ===== initial sync =====
    const { address } = getAccount(wagmiConfig) ?? {};
    this.setHolder((address as `0x${string}`) ?? null);

    // ===== subscribe account changes =====
    this.unwatch = watchAccount(wagmiConfig, {
      onChange: (account) => this.setHolder((account.address as `0x${string}`) ?? null)
    });
  }

  destroy() {
    this.unwatch?.(); this.unwatch = undefined;
  }

  private toast(variant: 'primary' | 'success' | 'neutral' | 'warning' | 'danger', msg: string) {
    const a = el('sl-alert', { variant, duration: 3000, closable: true }, msg);
    document.body.appendChild(a);
    (customElements.whenDefined('sl-alert') as any).then(() => (a as any).toast?.());
  }

  setHolder(addr: `0x${string}` | null) {
    this.holder = addr;
    this.grid.replaceChildren();
    this.stateBar.replaceChildren();
    if (!this.holder) {
      this.showEmptyWalletHint();
      return;
    }
    this.load();
  }

  private async load() {
    if (!this.holder) return;
    const myReq = ++this.reqToken;
    this.stateBar.replaceChildren();
    this.renderSkeletons(6);

    try {
      const items = await fetchHeldNfts(this.holder);
      if (myReq !== this.reqToken) return;
      if (!items.length) return this.showEmpty();
      this.renderItems(items);
    } catch (err) {
      if (myReq !== this.reqToken) return;
      this.showError(err);
    }
  }

  private renderItems(items: HeldNft[]) {
    this.stateBar.replaceChildren();
    const cards = items.map((nft) => this.renderCard(nft));
    this.grid.replaceChildren(...cards);
  }

  private renderCard(nft: HeldNft) {
    const contract = nft.contract_addr as `0x${string}`;

    const btnList = el('sl-button', { size: 'small', variant: 'primary' }, '리스팅');
    const btnSend = el('sl-button', { size: 'small', variant: 'neutral', outline: true }, '보내기');

    btnList.addEventListener('click', () => {
      if (!contract) return this.showError('컨트랙트 주소를 찾을 수 없습니다.');
      this.openListDialog({ contract, tokenId: BigInt(nft.id), nft });
    });

    btnSend.addEventListener('click', () => {
      if (!contract) return this.showError('컨트랙트 주소를 찾을 수 없습니다.');
      this.openSendDialog({ contract, tokenId: BigInt(nft.id), nft });
    });

    const actions = el('div.card-actions', btnList, btnSend);

    return el('sl-card.nft-card',
      el('img.card-media', {
        src: nft.image ?? '',
        alt: `${nft.collection ?? 'NFT'} #${nft.id}`,
        onerror: (e: any) => e.currentTarget.src = 'fallback.png'
      }),
      el('div.card-meta', el('div.name', `${nft.collection ?? 'NFT'} #${nft.id}`)),
      actions
    );
  }

  private openSendDialog(payload: { contract: `0x${string}`; tokenId: bigint; nft: HeldNft }) {
    this.pending = payload;
    (this.iptTo as any).value = '';
    (this.dlgSend as any).open = true;
  }

  private async confirmSend() {
    const to = String((this.iptTo as any).value ?? '').trim() as `0x${string}`;
    if (!to || !isAddress(to)) {
      this.stateBar.replaceChildren(el('sl-alert', { variant: 'warning', open: true }, '유효한 수신자 주소를 입력하세요.'));
      return;
    }
    const me = getAccount(wagmiConfig)?.address as `0x${string}` | undefined;
    if (!me) {
      this.stateBar.replaceChildren(el('sl-alert', { variant: 'warning', open: true }, '지갑이 연결되어 있지 않습니다.'));
      return;
    }

    const { contract, tokenId } = this.pending;
    if (!contract || tokenId == null) return;

    (this.dlgSend as any).open = false;
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

      this.toast('success', `전송 성공!<br><small>${hash.slice(0, 10)}…<br>목록에 반영되는데 1분 정도 소요됩니다.</small>`);
    } catch (err: any) {
      console.error(err);
      this.toast('danger', err?.shortMessage || err?.message || '전송 실패');
    }
  }

  private openListDialog(payload: { contract: `0x${string}`; tokenId: bigint; nft: HeldNft }) {
    this.pending = payload;
    (this.iptPrice as any).value = '';
    (this.dlgList as any).open = true;
  }

  private async confirmList() {
    const priceEth = String((this.iptPrice as any).value ?? '').trim();
    if (!priceEth || Number(priceEth) <= 0) {
      this.stateBar.replaceChildren(el('sl-alert', { variant: 'warning', open: true }, '유효한 가격(KAIA)을 입력하세요.'));
      return;
    }
    const detail = { ...this.pending, priceEth };
    (this.dlgList as any).open = false;

    if (!detail.contract || detail.tokenId == null) {
      this.toast('danger', '리스팅 실패');
      return;
    }

    await listNft(detail.contract, detail.tokenId, parseEther(detail.priceEth));
  }

  private renderSkeletons(n = 8) {
    this.grid.replaceChildren(...Array.from({ length: n }, () =>
      el('sl-card',
        el('sl-skeleton', { effect: 'pulse', style: { width: '100%', height: '200px', display: 'block' } }),
        el('div', { style: { padding: '10px' } },
          el('sl-skeleton', { effect: 'sheen', style: { width: '60%', height: '16px' } })
        )
      )
    ));
  }

  private showEmptyWalletHint() {
    this.stateBar.replaceChildren(
      el('sl-alert', { variant: 'primary', open: true },
        el('strong', '지갑이 연결되어 있지 않습니다.')
      )
    );
  }

  private showEmpty() {
    this.stateBar.replaceChildren(
      el('sl-alert', { variant: 'neutral', open: true },
        el('strong', '보유한 NFT가 없습니다.'), el('br'),
        '탐색 탭에서 새로운 NFT를 찾아보세요.'
      )
    );
    this.grid.replaceChildren();
  }

  private showError(err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    this.stateBar.replaceChildren(el('sl-alert', { variant: 'danger', open: true }, msg));
  }
}
