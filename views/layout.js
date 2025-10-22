import { el } from "@webtaku/el";
import "./layout.css";
import { createConnectButton } from "../components/wallet";
export class Layout {
    header;
    contentContainer;
    drawer;
    constructor() {
        // 브랜드
        const brandLink = el('a.brand', el('img', { src: 'data:image/png;base64,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Uk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAJcEhZcwAACxMAAAsTAQCanBgAAAXMaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA5LjEtYzAwMiA3OS5hNmE2Mzk2LCAyMDI0LzAzLzEyLTA3OjQ4OjIzICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjUuMTIgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0xMC0yOVQxMToyMzoxMiswOTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMTAtMjlUMTI6MDM6MzkrMDk6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMTAtMjlUMTI6MDM6MzkrMDk6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjU3M2IxNTkzLTdlMjctNzY0MC04YzZjLTA0NWNkN2I1MjRjYiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmE2ZWJmYmYxLTRmZGQtYTc0YS04MDg5LTE3M2MzYTM5NzgwNiIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjUwNzI3YjIzLTljYmYtYzI0ZS04ZmM3LThkOGQ5ZDMzODBjYiI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTA3MjdiMjMtOWNiZi1jMjRlLThmYzctOGQ4ZDlkMzM4MGNiIiBzdEV2dDp3aGVuPSIyMDI0LTEwLTI5VDExOjIzOjEyKzA5OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjUuMTIgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NzNiMTU5My03ZTI3LTc2NDAtOGM2Yy0wNDVjZDdiNTI0Y2IiIHN0RXZ0OndoZW49IjIwMjQtMTAtMjlUMTI6MDM6MzkrMDk6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNS4xMiAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Qg1byAAAApFJREFUSIm9lb9rU1EUxz/nvbykSZMmGWLTNvUHInQriJMojkpxEQuCDoL4Y1F0dnFwqIuTCv0DpIMoHbpIKRSEoosQ2kEstS2a0tIfNk1S86Pv3evw0lQwL4m09Yzvnnc+53vOPffIZDY4BnQBWxy8RYFlH3ABiBwCYNfyxiEGr9l/gfhadXQUdIThiCWYwA6QyWkqCkw5AIitoDcubGxpht84rGcgEoOL1w064lAu7hOiNKTiwtdZzc1zO2TXtPujH85ftkh2GpSLen+QtiAU0Ty5ZVcBbm2CbWAYgqYxAFpofDwgpD9q0lMKgEfPTWa0n3dzFj0nwa766QashkqUcrNIxKSqQBOJuZNbTkB23fWxAiANmu+pRGvw+90pnZvbTVMYuufQ11VhILXDpe4KDwdstIZQg3H2ViLQ0y68eOnw7IFd+2zbsL5SdUDYWKlm26DwnpBkVPj0WdUAVkC4ctug54QQCArvRxzSUwqfT2rK/xkSAiZGVU3W09cm9wd9bKJJIWwsaNJTjnfkZhDDhDLwfRZA03/a4NqgybSjKOaBGFTU3nVuZvUrqd0Dy++qWP0J2zYkTCEagzDC0kJL8b0hSoEF9J91M11eVDy+a5NHE0EYemUzMdpaqQBkMhvMUWeftHeAU4QbZ3aY/+J2NdHlNj0zv9erZK8wMu0jHIXtXF2G9z7JZSEeEobHLVKnXEVry5rMvKKz1+B4nwAKpdwEGg2j5+0yDfixqTmaEsZmLN6OKL6lNeEYXL1jUtzSfBhXdB8TRKD0yxviWa5dcxS0hyAZcPeIAKu2xtDQaQkFDUs5jdJg1FeTb/oKmwaUSrBY+nvasn+8wB4A96wZ5CDsv+34Am5PCocQPwwUfgP5s+FSXZGn+wAAAABJRU5ErkJggg==' }), 'Kaia NFT Marketplace', { href: '/' });
        // 데스크톱 내비 (가운데)
        const makeBtn = (label, key) => el('sl-button', label, { variant: 'text', size: 'large', className: 'nav-btn', 'data-key': key });
        const nav = el('nav.primary-nav', makeBtn('탐색', 'explore'), makeBtn('내 NFT', 'my-nft'), makeBtn('히스토리', 'history'));
        // 우측 액션(지갑 + 햄버거)
        const connectButton = createConnectButton();
        const menuToggle = el('sl-icon-button#menuToggle', {
            name: 'list',
            label: '메뉴 열기',
            className: 'menu-toggle'
        });
        const rightActions = el('div.right-actions', connectButton, menuToggle);
        // 모바일 드로어
        const drawerMenu = el('sl-menu', el('sl-menu-item', '탐색', { 'data-key': 'explore' }), el('sl-menu-item', '내 NFT', { 'data-key': 'my-nft' }), el('sl-menu-item', '히스토리', { 'data-key': 'history' }));
        const drawerFooter = el('div.drawer-footer', createConnectButton());
        this.drawer = el('sl-drawer#mobileNav', { label: '메뉴', placement: 'start' }, el('div.drawer-body', el('div.menu-card', drawerMenu), drawerFooter));
        // 헤더
        this.header = el('header.site-header', el('div.inner', brandLink, nav, rightActions));
        // 이벤트
        menuToggle.addEventListener('click', () => {
            this.drawer.open = true;
        });
        this.drawer.addEventListener('sl-select', (e) => {
            const key = e.detail?.item?.dataset?.key;
            if (key) {
                // TODO: 라우팅 연결
                this.drawer.hide();
            }
        });
        // 데스크톱 내비 클릭
        nav.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.key;
                if (key)
                    console.log('navigate:', key);
            });
        });
        // 본문 컨테이너
        this.contentContainer = el('main.content-container');
    }
    /** 헤더/드로어를 마운트하고, 외부 콘텐츠를 주입합니다. */
    mount(target = document.body, ...content) {
        if (!this.drawer.isConnected)
            document.body.appendChild(this.drawer);
        if (!this.header.isConnected)
            target.prepend(this.header);
        if (!this.contentContainer.isConnected)
            target.append(this.contentContainer);
        if (content.length)
            this.contentContainer.append(...content);
    }
    /** 본문 교체 */
    mountContent(content) {
        this.contentContainer.replaceChildren(content);
    }
}
//# sourceMappingURL=layout.js.map