import "./history.css";
export declare class History {
    root: HTMLElement;
    private stateBar;
    private list;
    private btnMore;
    private iptAccount;
    private iptNftAddr;
    private selKind;
    private btnSearch;
    private btnReset;
    private nextCursor;
    private loading;
    private reachedEnd;
    private reqToken;
    private sentinel;
    private io?;
    private dialog;
    constructor();
    destroy(): void;
    private reset;
    private search;
    private loadNextPage;
    private renderItems;
    private renderRow;
    private openDetail;
    private toast;
    private renderSkeletons;
    private stripSkeletons;
    private updateFooterState;
    private showEmpty;
    private showError;
}
//# sourceMappingURL=history.d.ts.map