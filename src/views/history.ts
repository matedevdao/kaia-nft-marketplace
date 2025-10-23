import { el } from "@webtaku/el";
import { formatEther, getAddress } from "viem";
import { getAccount } from "@wagmi/core";
import { wagmiConfig } from "../components/wallet";
import "./history.css";
import { getHistory, HistoryEvent, HistoryEventKind } from "../api/nfts";

const KIND_OPTIONS: { value: "" | HistoryEventKind; label: string }[] = [
  { value: "", label: "전체" },
  { value: "LISTED", label: "리스팅" },
  { value: "SOLD", label: "판매 완료" },
  { value: "CANCELLED", label: "취소" },
];

export class History {
  root: HTMLElement;

  private stateBar: HTMLElement;
  private list: HTMLElement;
  private btnMore: HTMLElement;

  private iptAccount: HTMLElement;
  private iptNftAddr: HTMLElement;
  private selKind: HTMLElement;
  private btnSearch: HTMLElement;
  private btnReset: HTMLElement;

  private nextCursor: string | null = null;
  private loading = false;
  private reachedEnd = false;
  private reqToken = 0;

  private sentinel: HTMLElement;
  private io?: IntersectionObserver;

  private dialog: HTMLDivElement;

  constructor() {
    const title = el("h2.page-title", "히스토리");
    const subtitle = el("p.page-subtitle", "리스팅/구매/취소 이력을 확인하세요.");

    const { address } = getAccount(wagmiConfig) ?? {};
    this.iptAccount = el("sl-input", {
      label: "주소 (참여자)",
      placeholder: "0x…",
      size: "small",
      clearable: true,
      value: address ?? "",
      style: { minWidth: "280px" }
    }) as any;

    this.iptNftAddr = el("sl-input", {
      label: "NFT 컨트랙트 주소",
      placeholder: "0x…",
      size: "small",
      clearable: true,
      style: { minWidth: "280px" }
    }) as any;

    this.selKind = el("sl-select", { label: "종류", size: "small", clearable: true },
      ...KIND_OPTIONS.map(o => el("sl-option", { value: o.value }, o.label))
    ) as any;

    this.btnSearch = el("sl-button", { size: "small", variant: "primary" }, "검색");
    this.btnReset = el("sl-button", { size: "small", variant: "neutral", outline: true }, "초기화");

    const filterRow = el("div", { className: "filters-row" },
      this.iptAccount, this.iptNftAddr, this.selKind, this.btnSearch, this.btnReset
    );
    const filterSticky = el("div", { className: "filters-sticky" }, filterRow);

    this.stateBar = el("div", { className: "state-bar" });
    this.list = el("div", { className: "history-list" });

    this.btnMore = el("sl-button", { variant: "neutral", size: "small" }, "더 불러오기");
    this.btnMore.addEventListener("click", () => this.loadNextPage());
    const moreWrap = el("div.load-more-wrap", this.btnMore);

    this.sentinel = el("div", { style: { height: "1px" } });

    this.dialog = el("sl-dialog", {
      label: "상세",
      className: "history-dialog",
      style: { width: "680px" }
    }) as any;
    document.body.appendChild(this.dialog);

    this.root = el(
      "section.history",
      title,
      subtitle,
      filterSticky,
      this.stateBar,
      this.list,
      moreWrap,
      this.sentinel
    );

    this.btnSearch.addEventListener("click", () => this.search());
    this.btnReset.addEventListener("click", () => this.reset());
    [this.iptAccount, this.iptNftAddr, this.selKind].forEach((ipt) =>
      ipt.addEventListener("keydown", (e: any) => { if (e.key === "Enter") this.search(); })
    );

    this.reset();

    this.io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) this.loadNextPage();
    });
    this.io.observe(this.sentinel);
  }

  destroy() {
    this.io?.disconnect();
    this.io = undefined;
    this.dialog?.remove();
  }

  private reset() {
    this.list.replaceChildren();
    this.stateBar.replaceChildren();
    this.nextCursor = null;
    this.reachedEnd = false;
    this.reqToken++;
    this.loadNextPage(true);
  }

  private async search() {
    this.list.replaceChildren();
    this.stateBar.replaceChildren();
    this.nextCursor = null;
    this.reachedEnd = false;
    this.reqToken++;
    this.loadNextPage(true);
  }

  private async loadNextPage(isFirst = false) {
    if (this.loading || this.reachedEnd) return;
    this.loading = true;
    const myReq = this.reqToken;

    if (isFirst) this.renderSkeletons(6);
    else this.renderSkeletons(3, true);

    try {
      const accountRaw = String((this.iptAccount as any).value ?? "").trim();
      const account = accountRaw ? getAddress(accountRaw) : undefined;
      const nftAddrRaw = String((this.iptNftAddr as any).value ?? "").trim();
      const nft_address = nftAddrRaw ? getAddress(nftAddrRaw) : undefined;
      const kindVal = String((this.selKind as any).value ?? "").trim() as HistoryEventKind | "";

      const page = await getHistory({
        account,
        nft_address,
        kind: (kindVal || undefined) as HistoryEventKind | undefined,
        cursor: this.nextCursor ?? undefined,
        limit: 30
      });

      if (myReq !== this.reqToken) return;

      this.stripSkeletons();

      if (isFirst && page.items.length === 0) this.showEmpty();
      else this.renderItems(page.items);

      this.nextCursor = page.nextCursor;
      this.reachedEnd = !page.nextCursor;
      this.updateFooterState();
    } catch (err) {
      if (myReq !== this.reqToken) return;
      this.stripSkeletons();
      this.showError(err);
    } finally {
      this.loading = false;
    }
  }

  private renderItems(items: HistoryEvent[]) {
    if (!items.length) return;
    const rows = items.map((ev) => this.renderRow(ev));
    this.list.append(...rows);
  }

  private renderRow(ev: HistoryEvent) {
    const img = el("img.media", {
      src: ev.nft?.image || "",
      alt: `${ev.nft?.collection ?? ""} #${ev.nft?.id ?? ev.token_id}`,
      onerror: (e: any) => {
        e.currentTarget.src = "";
        e.currentTarget.style.background = "var(--sl-color-neutral-200)";
      }
    });

    const title = ev.nft?.name || `${short(ev.nft_address)} #${ev.token_id}`;
    const when = ev.ts_sec ? formatTs(ev.ts_sec) : "-";

    const metaTop = el("div.meta-top",
      el("span.kind", kindLabel(ev.kind)),
      el("span.dot", "·"),
      el("span.when", when)
    );

    const metaBottomParts: (HTMLElement | string)[] = [];
    if (ev.price_wei && (ev.kind === "LISTED" || ev.kind === "SOLD")) {
      metaBottomParts.push(`${formatEther(BigInt(ev.price_wei))} KAIA`);
    }
    if (ev.from) metaBottomParts.push(`${metaBottomParts.length ? "  " : ""}From ${short(ev.from)}`);
    if (ev.to) metaBottomParts.push("  → ", `To ${short(ev.to)}`);

    const name = el("div.title", title);
    const metaBottom = el("div.meta-bottom", ...metaBottomParts);

    const btnDetail = el("sl-button", { size: "small", variant: "neutral", outline: true }, "상세");
    btnDetail.addEventListener("click", () => this.openDetail(ev));

    return el("div.history-row",
      img,
      el("div.body", metaTop, name, metaBottom),
      el("div.actions", btnDetail)
    );
  }

  private openDetail(ev: HistoryEvent) {
    (this.dialog as any).innerHTML = ""; // reset

    const img = el("img.detail-media", {
      src: ev.nft?.image || "",
      alt: `${ev.nft?.collection ?? ""} #${ev.nft?.id ?? ev.token_id}`,
      onerror: (e: any) => {
        e.currentTarget.src = "";
        e.currentTarget.style.background = "var(--sl-color-neutral-200)";
      }
    });

    const title = el("h3", ev.nft?.name || `${short(ev.nft_address)} #${ev.token_id}`);
    const meta = el("div.detail-meta",
      el("div", `종류: ${kindLabel(ev.kind)}`),
      ev.price_wei ? el("div", `가격: ${formatEther(BigInt(ev.price_wei))} KAIA`) : null,
      el("div", `컨트랙트: ${ev.nft_address}`),
      el("div", `토큰 ID: ${ev.token_id}`),
      ev.from ? el("div", `From: ${ev.from}`) : null,
      ev.to ? el("div", `To: ${ev.to}`) : null,
      el("div", `블록: ${ev.block_number ?? "-"}`),
      el("div", `시간: ${ev.ts_sec ? formatTs(ev.ts_sec) : "-"}`),
      el("div", `트랜잭션: ${ev.tx_hash ? short(ev.tx_hash, 6) : "-"}`)
    );

    const btnClose = el("sl-button", { variant: "neutral", outline: true }, "닫기");
    btnClose.addEventListener("click", () => ((this.dialog as any).open = false));

    (this.dialog as any).append(
      el("div.detail-grid",
        el("div.detail-left", img),
        el("div.detail-right", title, meta)
      ),
      el("div.detail-actions", btnClose)
    );
    (this.dialog as any).open = true;
  }

  private renderSkeletons(n = 6, append = false) {
    const nodes = Array.from({ length: n }, () =>
      el("div.history-row",
        el("div.media-skel", el("sl-skeleton", { effect: "pulse", style: { width: "100%", height: "100%", display: "block" } })),
        el("div.body",
          el("sl-skeleton", { effect: "sheen", style: { width: "30%", height: "14px" } }),
          el("sl-skeleton", { effect: "sheen", style: { width: "60%", height: "16px", marginTop: "8px" } }),
          el("sl-skeleton", { effect: "sheen", style: { width: "40%", height: "12px", marginTop: "6px" } }),
        ),
        el("div.actions", el("sl-skeleton", { effect: "sheen", style: { width: "70px", height: "28px" } }))
      )
    );
    if (append) this.list.append(...nodes);
    else this.list.replaceChildren(...nodes);
  }

  private stripSkeletons() {
    const kids = Array.from(this.list.children);
    kids.forEach((k) => {
      if ((k as HTMLElement).querySelector(".media-skel")) k.remove();
    });
  }

  private updateFooterState() {
    (this.btnMore as any).disabled = this.loading || this.reachedEnd;
    (this.btnMore as any).textContent = this.reachedEnd ? "모두 불러왔습니다" : "더 불러오기";
  }

  private showEmpty() {
    this.stateBar.replaceChildren(
      el("sl-alert", { variant: "neutral", open: true }, el("strong", "표시할 히스토리가 없습니다."))
    );
  }

  private showError(err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    this.stateBar.replaceChildren(el("sl-alert", { variant: "danger", open: true }, msg));
  }
}

function short(addr: string, len = 4) {
  if (!addr?.startsWith("0x") || addr.length < 2 + len * 2) return addr ?? "";
  return `${addr.slice(0, 2 + len)}…${addr.slice(-len)}`;
}
function formatTs(sec: number) {
  try {
    const d = new Date(sec * 1000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch { return "-"; }
}
function kindLabel(k: HistoryEventKind) {
  switch (k) {
    case "LISTED": return "리스팅";
    case "SOLD": return "판매 완료";
    case "CANCELLED": return "취소";
    default: return k;
  }
}
