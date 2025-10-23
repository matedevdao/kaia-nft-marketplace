import { el } from "@webtaku/el";
import { formatEther } from "viem";
import "./explore.css";
import { ActiveListing, getActiveListings } from "../api/nfts";

export class Explore {
  root: HTMLElement;

  // UI
  private stateBar: HTMLElement;
  private grid: HTMLElement;
  private btnMore: HTMLElement;

  // Filters
  private iptOwner: HTMLElement;
  private iptNftAddr: HTMLElement;
  private btnSearch: HTMLElement;
  private btnReset: HTMLElement;

  // Paging & state
  private nextCursor: string | null = null;
  private loading = false;
  private reachedEnd = false;
  private reqToken = 0;

  // Infinite scroll
  private sentinel: HTMLElement;
  private io?: IntersectionObserver;

  constructor() {
    const title = el("h2.page-title", "탐색");
    const subtitle = el("p.page-subtitle", "현재 리스팅 중인 NFT를 둘러보세요.");

    // Inputs
    this.iptOwner = el("sl-input", {
      label: "판매자 주소 (owner)",
      placeholder: "0x…",
      size: "small",
      clearable: true,
      style: { minWidth: "280px" }
    }) as any;

    this.iptNftAddr = el("sl-input", {
      label: "NFT 컨트랙트 주소 (nft_address)",
      placeholder: "0x…",
      size: "small",
      clearable: true,
      style: { minWidth: "280px" }
    }) as any;

    this.btnSearch = el("sl-button", { size: "small", variant: "primary" }, "검색");
    this.btnReset = el("sl-button", { size: "small", variant: "neutral", outline: true }, "초기화");

    const filterRow = el("div", { className: "filters-row" }, this.iptOwner, this.iptNftAddr, this.btnSearch, this.btnReset);
    const filterSticky = el("div", { className: "filters-sticky" }, filterRow);

    // State + grid
    this.stateBar = el("div", { className: "state-bar" });
    this.grid = el("div", { className: "items-grid" });

    // Load more
    this.btnMore = el("sl-button", { variant: "neutral", size: "small" }, "더 불러오기");
    this.btnMore.addEventListener("click", () => this.loadNextPage());
    const moreWrap = el("div.load-more-wrap", this.btnMore);

    // Sentinel
    this.sentinel = el("div", { style: { height: "1px" } });

    // Root
    this.root = el(
      "section.explore",
      title,
      subtitle,
      filterSticky,
      this.stateBar,
      this.grid,
      moreWrap,
      this.sentinel
    );

    // Events
    this.btnSearch.addEventListener("click", () => this.search());
    this.btnReset.addEventListener("click", () => this.reset());
    [this.iptOwner, this.iptNftAddr].forEach((ipt) =>
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
  }

  // ---- Public-ish actions ----
  private reset() {
    // Clear paging & UI
    this.grid.replaceChildren();
    this.stateBar.replaceChildren();
    this.nextCursor = null;
    this.reachedEnd = false;
    this.reqToken++;
    // Load first page
    this.loadNextPage(true);
  }

  private async search() {
    this.grid.replaceChildren();
    this.stateBar.replaceChildren();
    this.nextCursor = null;
    this.reachedEnd = false;
    this.reqToken++;
    this.loadNextPage(true);
  }

  // ---- Data load ----
  private async loadNextPage(isFirst = false) {
    if (this.loading || this.reachedEnd) return;
    this.loading = true;
    const myReq = this.reqToken;

    // show skeletons on first load or while appending
    if (isFirst) {
      this.renderSkeletons(8);
    } else {
      this.renderSkeletons(4, true);
    }

    try {
      const owner = String((this.iptOwner as any).value ?? "").trim() || undefined;
      const nft_address = String((this.iptNftAddr as any).value ?? "").trim() || undefined;

      const page = await getActiveListings({
        owner,
        nft_address,
        cursor: this.nextCursor ?? undefined,
        limit: 24
      });

      // If a newer request started, ignore this result
      if (myReq !== this.reqToken) return;

      // remove loading skeletons
      this.stripSkeletons();

      // render or show empty
      if (isFirst && page.items.length === 0) {
        this.showEmpty();
      } else {
        this.renderItems(page.items);
      }

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

  // ---- Rendering helpers ----
  private renderItems(items: ActiveListing[]) {
    if (!items.length) return;
    const cards = items.map((it) => this.renderCard(it));
    this.grid.append(...cards);
  }

  private renderCard(it: ActiveListing) {
    const nft = it.nft;

    // NFT 이미지 (없으면 회색 placeholder)
    const media = el("img", {
      className: "card-media",
      src: nft?.image || "",
      alt: `#${it.token_id}`,
      onerror: (e: any) => {
        e.currentTarget.src = "";
        e.currentTarget.style.background = "var(--sl-color-neutral-200)";
      }
    });

    // NFT 이름 or 주소 줄임
    const titleText = nft
      ? nft.name
      : `${short(it.nft_address)} #${it.token_id}`;

    const head = el(
      "div.card-meta",
      el("div.name", titleText)
    );

    const priceRow = el(
      "div.price-row",
      el("span.label", "가격"),
      el("strong", `${formatEther(BigInt(it.price_wei))} KAIA`)
    );

    const ownerRow = el(
      "div.owner-row",
      `판매자: ${short(it.owner)}`
    );

    const actions = el(
      "div.card-actions",
      // 향후 구매 기능 추가 시 여기 버튼 추가
    );

    return el(
      "sl-card.nft-card",
      media,
      head,
      priceRow,
      ownerRow,
      actions
    );
  }

  private renderSkeletons(n = 8, append = false) {
    const nodes = Array.from({ length: n }, () =>
      el(
        "sl-card",
        { "data-skeleton": "1" },
        el("sl-skeleton", {
          effect: "pulse",
          style: { width: "100%", height: "180px", display: "block" }
        }),
        el(
          "div",
          { style: { paddingTop: "8px" } },
          el("sl-skeleton", { effect: "sheen", style: { width: "70%", height: "14px" } }),
          el("sl-skeleton", { effect: "sheen", style: { width: "50%", height: "12px", marginTop: "6px" } })
        )
      )
    );
    if (append) this.grid.append(...nodes);
    else this.grid.replaceChildren(...nodes);
  }

  private stripSkeletons() {
    const kids = Array.from(this.grid.children);
    kids.forEach((k) => {
      if ((k as HTMLElement).dataset?.skeleton) k.remove();
    });
  }

  private updateFooterState() {
    // “더 불러오기” 버튼 활성/비활성
    (this.btnMore as any).disabled = this.loading || this.reachedEnd;
    (this.btnMore as any).variant = this.reachedEnd ? "neutral" : "neutral";
    (this.btnMore as any).textContent = this.reachedEnd ? "모두 불러왔습니다" : "더 불러오기";
  }

  private showEmpty() {
    this.stateBar.replaceChildren(
      el(
        "sl-alert",
        { variant: "neutral", open: true },
        el("strong", "현재 리스팅이 없습니다.")
      )
    );
  }

  private showError(err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    this.stateBar.replaceChildren(el("sl-alert", { variant: "danger", open: true }, msg));
  }
}

// ---- utils ----
function short(addr: string, len = 4) {
  if (!addr?.startsWith("0x") || addr.length < 2 + len * 2) return addr ?? "";
  return `${addr.slice(0, 2 + len)}…${addr.slice(-len)}`;
}
