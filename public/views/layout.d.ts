import "./layout.css";
import Navigo from "navigo";
export declare class Layout {
    header: HTMLElement;
    contentContainer: HTMLElement;
    drawer: HTMLElement;
    footer: HTMLElement;
    constructor(router: Navigo);
    /** 본문 교체 */
    mountContent(content: HTMLElement): void;
}
//# sourceMappingURL=layout.d.ts.map