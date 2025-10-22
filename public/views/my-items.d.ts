import './my-items.css';
export declare class MyItems {
    root: HTMLElement;
    private grid;
    private stateBar;
    private holder;
    private unwatch?;
    private reqToken;
    private dlgSend;
    private iptTo;
    private dlgList;
    private iptPrice;
    private pending;
    private refreshHandler;
    constructor();
    destroy(): void;
    private toast;
    setHolder(addr: `0x${string}` | null): void;
    private load;
    private renderItems;
    private renderCard;
    private openSendDialog;
    private confirmSend;
    private openListDialog;
    private confirmList;
    private renderSkeletons;
    private showEmptyWalletHint;
    private showEmpty;
    private showError;
}
//# sourceMappingURL=my-items.d.ts.map