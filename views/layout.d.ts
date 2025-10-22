import "./layout.css";
export declare class Layout {
    header: HTMLElement;
    contentContainer: HTMLElement;
    drawer: HTMLElement;
    constructor();
    /** 헤더/드로어를 마운트하고, 외부 콘텐츠를 주입합니다. */
    mount(target?: HTMLElement, ...content: (HTMLElement | string)[]): void;
    /** 본문 교체 */
    mountContent(content: HTMLElement): void;
}
//# sourceMappingURL=layout.d.ts.map