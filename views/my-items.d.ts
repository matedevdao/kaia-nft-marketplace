import './my-items.css';
export declare class MyItems {
    root: HTMLElement;
    private grid;
    private stateBar;
    private holder;
    private unwatch?;
    private reqToken;
    constructor();
    destroy(): void;
    setHolder(addr: string | null): void;
    private load;
    private renderItems;
    private renderCard;
    private renderSkeletons;
    private showEmptyWalletHint;
    private showEmpty;
    private showError;
}
//# sourceMappingURL=my-items.d.ts.map