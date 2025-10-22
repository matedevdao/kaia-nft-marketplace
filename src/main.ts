import '@shoelace-style/shoelace';
import Navigo from 'navigo';
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
