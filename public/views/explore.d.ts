import "./explore.css";
export declare class Explore {
    root: HTMLElement;
    private stateBar;
    private grid;
    private btnMore;
    private iptOwner;
    private iptNftAddr;
    private btnSearch;
    private btnReset;
    private nextCursor;
    private loading;
    private reachedEnd;
    private reqToken;
    private sentinel;
    private io?;
    constructor();
    destroy(): void;
    private reset;
    private search;
    private loadNextPage;
    private renderItems;
    private renderCard;
    private renderSkeletons;
    private stripSkeletons;
    private updateFooterState;
    private showEmpty;
    private showError;
}
//# sourceMappingURL=explore.d.ts.map