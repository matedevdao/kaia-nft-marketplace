import '@shoelace-style/shoelace';
import './main.css';
import { Layout } from './views/layout';
import Navigo from 'navigo';
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/kaia-nft-marketplace/' : '/';
const router = new Navigo(BASE_PATH);
const layout = new Layout();
document.body.append(layout.header, layout.contentContainer, layout.drawer);
router.on('/', () => {
    console.log('test');
});
router.on('/about', () => {
});
router.on('/contact', () => {
});
router.resolve();
//# sourceMappingURL=main.js.map