// explore.ts
import { getAccount } from "@wagmi/core";
import { el } from "@webtaku/el";
import { formatEther, getAddress, isAddressEqual } from "viem";
import { syncMarketplaceEventsApi, syncNftOwnershipFromEventsApi } from "../api/api";
import { ActiveListing, getActiveListings, getListingById } from "../api/nfts";
import { wagmiConfig } from "../components/wallet";
import { buyListing, cancelListing } from "../contracts/nft-marketplace";
import "./explore.css";

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

  // 상세 모달
  private dialog: HTMLDivElement;

  constructor() {
    const title = el("h2.page-title", "탐색");
    const subtitle = el("p.page-subtitle", "현재 리스팅 중인 NFT를 둘러보세요.");

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

    this.stateBar = el("div", { className: "state-bar" });
    this.grid = el("div", { className: "items-grid" });

    this.btnMore = el("sl-button", { variant: "neutral", size: "small" }, "더 불러오기");
    this.btnMore.addEventListener("click", () => this.loadNextPage());
    const moreWrap = el("div.load-more-wrap", this.btnMore);

    this.sentinel = el("div", { style: { height: "1px" } });

    // ✅ 상세 모달(슬롯으로 내용 채움)
    this.dialog = el("sl-dialog", {
      label: "상세 보기",
      className: "listing-dialog",
      style: { width: "680px" }
    }) as any;
    document.body.appendChild(this.dialog);

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
    this.dialog?.remove();
  }

  // ---- Public-ish actions ----
  private reset() {
    this.grid.replaceChildren();
    this.stateBar.replaceChildren();
    this.nextCursor = null;
    this.reachedEnd = false;
    this.reqToken++;
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

    if (isFirst) this.renderSkeletons(8);
    else this.renderSkeletons(4, true);

    try {
      const owner = String((this.iptOwner as any).value ?? "").trim() || undefined;
      const nft_address = String((this.iptNftAddr as any).value ?? "").trim() || undefined;

      const page = await getActiveListings({
        owner,
        nft_address,
        cursor: this.nextCursor ?? undefined,
        limit: 24
      });

      if (myReq !== this.reqToken) return;

      this.stripSkeletons();

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
    const media = el("img", {
      className: "card-media",
      src: nft?.image || "",
      alt: `#${it.token_id}`,
      onerror: (e: any) => {
        e.currentTarget.src = "";
        e.currentTarget.style.background = "var(--sl-color-neutral-200)";
      }
    });

    const titleText = nft ? nft.name : `${short(it.nft_address)} #${it.token_id}`;

    const head = el("div.card-meta", el("div.name", titleText));

    const priceRow = el(
      "div.price-row",
      el("span.label", "가격"),
      el("strong", `${formatEther(BigInt(it.price_wei))} KAIA`)
    );

    const ownerRow = el("div.owner-row", `판매자: ${short(it.owner)}`);

    // ✅ 현재 지갑 소유자 확인
    const acc = getAccount(wagmiConfig);
    const me = acc.address ? getAddress(acc.address) : undefined;
    const isMine = me && isAddressEqual(getAddress(it.owner), me);

    // ✅ 액션들
    const btnDetail = el("sl-button", { size: "small", variant: "neutral", outline: true }, "상세보기");
    btnDetail.addEventListener("click", () => this.openDetailModal(it.list_id));

    let btnPrimary: HTMLElement | null = null;
    if (isMine) {
      btnPrimary = el("sl-button", { size: "small", variant: "danger" }, "리스팅 취소");
      btnPrimary.addEventListener("click", async () => {
        await this.onCancel(it);
      });
    } else {
      btnPrimary = el("sl-button", { size: "small", variant: "primary" }, "구매하기");
      btnPrimary.addEventListener("click", async () => {
        await this.onBuy(it);
      });
    }

    const actions = el("div.card-actions", btnDetail, btnPrimary);

    // 카드 루트
    const card = el("sl-card.nft-card", media, head, priceRow, ownerRow, actions);

    // 구매/취소 후 optimistic 제거를 위해 id를 dataset에
    (card as any).dataset.listId = String(it.list_id);
    return card;
  }

  private async onBuy(it: ActiveListing) {
    try {
      this.toast("구매 트랜잭션 전송 중…");
      const { hash } = await buyListing(BigInt(it.list_id), BigInt(it.price_wei));
      this.toast(`구매 전송 완료: ${short(hash)}`);
      // 성공 시 카드 제거
      this.removeCard(it.list_id);
      await syncNftOwnershipFromEventsApi()
      await syncMarketplaceEventsApi()
    } catch (e: any) {
      this.toast(e?.shortMessage || e?.message || "구매 실패", "danger");
    }
  }

  private async onCancel(it: ActiveListing) {
    try {
      this.toast("리스팅 취소 전송 중…");
      const { hash } = await cancelListing(BigInt(it.list_id));
      this.toast(`취소 전송 완료: ${short(hash)}`);
      // 성공 시 카드 제거
      this.removeCard(it.list_id);
      await syncNftOwnershipFromEventsApi()
      await syncMarketplaceEventsApi()
    } catch (e: any) {
      this.toast(e?.shortMessage || e?.message || "취소 실패", "danger");
    }
  }

  private removeCard(listId: string | number) {
    const kids = Array.from(this.grid.children) as HTMLElement[];
    for (const k of kids) {
      if (k.dataset?.listId === String(listId)) {
        k.animate([{ opacity: 1 }, { opacity: 0, transform: "scale(0.98)" }], { duration: 160, easing: "ease" })
          .onfinish = () => k.remove();
        break;
      }
    }
  }

  private async openDetailModal(listId: string | number) {
    // 상세 데이터 fetch
    try {
      (this.dialog as any).innerHTML = ""; // reset
      (this.dialog as any).open = true;

      const wrap = el("div", { className: "detail-wrap" },
        el("sl-skeleton", { effect: "pulse", style: { width: "100%", height: "280px", display: "block", borderRadius: "12px" } }),
        el("div", { style: { marginTop: "12px" } },
          el("sl-skeleton", { effect: "sheen", style: { width: "60%", height: "18px" } }),
          el("sl-skeleton", { effect: "sheen", style: { width: "40%", height: "14px", marginTop: "8px" } })
        )
      );
      (this.dialog as any).appendChild(wrap);

      const data = await getListingById(String(listId)); // { item: ActiveListing }
      const it = data.item as ActiveListing;
      (this.dialog as any).innerHTML = ""; // clear skeletons
      (this.dialog as any).appendChild(this.renderDetail(it));
    } catch (e: any) {
      (this.dialog as any).innerHTML = `<sl-alert variant="danger" open>상세 데이터를 불러오지 못했습니다: ${e?.message ?? e}</sl-alert>`;
    }
  }

  private renderDetail(it: ActiveListing) {
    const nft = it.nft;
    const img = el("img", {
      src: nft?.image || "",
      alt: `${it.token_id}`,
      className: "detail-media",
      onerror: (e: any) => {
        e.currentTarget.src = "";
        e.currentTarget.style.background = "var(--sl-color-neutral-200)";
      }
    });

    const title = el("h3", nft?.name || `${short(it.nft_address)} #${it.token_id}`);
    const meta = el("div", { className: "detail-meta" },
      el("div", `컨트랙트: ${it.nft_address}`),
      el("div", `토큰 ID: ${it.token_id}`),
      el("div", `판매자: ${it.owner}`),
      el("div", `가격: ${formatEther(BigInt(it.price_wei))} KAIA`)
    );

    const desc = nft?.description
      ? el("p", { className: "detail-desc" }, nft.description)
      : el("p", { className: "detail-desc muted" }, "설명이 없습니다.");

    // 액션 영역도 카드와 동일 로직
    const acc = getAccount(wagmiConfig);
    const me = acc.address ? getAddress(acc.address) : undefined;
    const isMine = me && isAddressEqual(getAddress(it.owner), me);

    const btnPrimary = isMine
      ? el("sl-button", { variant: "danger" }, "리스팅 취소")
      : el("sl-button", { variant: "primary" }, "구매하기");

    btnPrimary.addEventListener("click", async () => {
      if (isMine) await this.onCancel(it);
      else await this.onBuy(it);
      // 성공 시 모달 닫기
      (this.dialog as any).open = false;
    });

    const btnClose = el("sl-button", { variant: "neutral", outline: true }, "닫기");
    btnClose.addEventListener("click", () => ((this.dialog as any).open = false));

    const actions = el("div", { className: "detail-actions" }, btnClose, btnPrimary);

    return el("div", { className: "detail-grid" },
      el("div", { className: "detail-left" }, img),
      el("div", { className: "detail-right" }, title, meta, desc, actions)
    );
  }

  // ---- UI helpers ----
  private toast(message: string, variant: "primary" | "success" | "neutral" | "warning" | "danger" = "neutral") {
    const t = el("sl-alert", { variant, open: true, duration: 3000 }, message);
    this.stateBar.appendChild(t);
    setTimeout(() => t.remove(), 3200);
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
    (this.btnMore as any).disabled = this.loading || this.reachedEnd;
    (this.btnMore as any).variant = this.reachedEnd ? "neutral" : "neutral";
    (this.btnMore as any).textContent = this.reachedEnd ? "모두 불러왔습니다" : "더 불러오기";
  }

  private showEmpty() {
    this.stateBar.replaceChildren(
      el("sl-alert", { variant: "neutral", open: true }, el("strong", "현재 리스팅이 없습니다."))
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
