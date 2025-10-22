import '@shoelace-style/shoelace';
import Navigo from 'navigo';
import { sendNft } from './chain/erc721';
import { createRainbowKit } from './components/wallet';
import './main.css';
import { Explore } from './views/explore';
import { History } from './views/history';
import { Layout } from './views/layout';
import { MyItems } from './views/my-items';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/kaia-nft-marketplace/' : '/';
const router = new Navigo(BASE_PATH) as Navigo;

const layout = new Layout(router)
document.body.append(layout.header, layout.contentContainer, layout.drawer, createRainbowKit())

router.on('/', () => {
  const explore = new Explore()
  layout.mountContent(explore.root)
})
router.on('/explore', () => {
  const explore = new Explore()
  layout.mountContent(explore.root)
})

router.on('/my-items', () => {
  const myItems = new MyItems()
  layout.mountContent(myItems.root)
})

router.on('/history', () => {
  const history = new History()
  layout.mountContent(history.root)
})

router.resolve();

function toast(kind: 'success' | 'danger' | 'primary', msg: string) {
  const a = document.createElement('sl-alert');
  a.setAttribute('variant', kind);
  a.setAttribute('duration', '3000');
  a.setAttribute('closable', '');
  a.innerHTML = msg;
  document.body.appendChild(a);
  (customElements.whenDefined('sl-alert') as any).then(() => (a as any).toast?.());
}

window.addEventListener('myitems:transfer', async (ev: any) => {
  const { contract, tokenId, to } = ev.detail;
  try {
    toast('primary', '전송을 시작합니다…');
    const { hash } = await sendNft({
      contract,
      to,
      tokenId: BigInt(tokenId)
    });
    toast('success', `전송 성공!<br><small>${hash.slice(0, 10)}…</small>`);
    // 리스트 새로고침
    window.dispatchEvent(new CustomEvent('myitems:refresh'));
  } catch (err: any) {
    console.error(err);
    toast('danger', err?.shortMessage || err?.message || '전송 실패');
  }
});
