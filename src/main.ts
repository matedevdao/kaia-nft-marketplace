import '@shoelace-style/shoelace';
import Navigo from 'navigo';
import { createRainbowKit } from './components/wallet';
import './main.css';
import { Layout } from './views/layout';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/kaia-nft-marketplace/' : '/';
const router = new Navigo(BASE_PATH) as Navigo;

const layout = new Layout()
document.body.append(layout.header, layout.contentContainer, layout.drawer, createRainbowKit())

router.on('/', () => {
  console.log('test')
})

router.on('/about', () => {
})

router.on('/contact', () => {
})

router.resolve();