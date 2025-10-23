import { getAddress } from 'viem';

declare const NFT_API_BASE_URI: string;

export type HeldNft = {
  collection: string;
  id: number;
  holder: string;
  type?: string | null;
  gender?: string | null;
  parts?: string | null; // JSON string일 수 있음
  image?: string | null; // 상대/절대 경로 모두 가능
  contract_addr?: string;
};

export type FetchHeldNftsOptions = {
  collection?: string;     // 특정 컬렉션만 필터링할 때
  start?: number;          // 토큰 범위 시작 (백엔드가 지원하면)
  end?: number;            // 토큰 범위 끝
  cursor?: string;         // 페이지네이션 커서(지원 시)
  limit?: number | string; // 페이지 크기(지원 시)
};

/**
 * 지갑 주소가 보유한 NFT 전체를 조회
 * 백엔드 라우팅이 `/{holder}/nfts` (endsWith('/nfts'))인 점을 활용합니다.
 */
export async function fetchHeldNfts(
  holder: string,
  opts: FetchHeldNftsOptions = {}
): Promise<HeldNft[]> {
  if (!holder) return [];

  const normalized = getAddress(holder);
  const url = new URL(`${NFT_API_BASE_URI}/${normalized}/nfts`);

  // 백엔드가 지원하는 쿼리만 붙여주세요.
  if (opts.collection) url.searchParams.set('collection', opts.collection);
  if (opts.start !== undefined) url.searchParams.set('start', String(opts.start));
  if (opts.end !== undefined) url.searchParams.set('end', String(opts.end));
  if (opts.limit !== undefined) url.searchParams.set('limit', String(opts.limit));
  if (opts.cursor) url.searchParams.set('cursor', opts.cursor);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`fetchHeldNfts failed: ${res.status} ${res.statusText}`, text);
    throw new Error(`Failed to fetch held NFTs: ${res.status}`);
  }

  const data = await res.json();
  // 배열 또는 { items, nextCursor } 형태 모두 대응
  const items: HeldNft[] = Array.isArray(data) ? data : (data?.items ?? []);
  return items;
}


// === Types ===
export type ActiveListing = {
  list_id: number;
  owner: string;
  nft_address: string;
  token_id: string;
  price_wei: string;
  tx_listed: string;
  block_listed: number | null;
  ts_listed: number | null;

  nft: {
    collection: string;
    id: number;
    name: string;
    description?: string;
    image: string;
    external_url?: string;
    animation_url?: string;
    traits?: { [traitName: string]: string | number };
    parts?: { [partName: string]: string | number };
    holder: string;
    contract_addr: string;
  } | null;
};

export type GetActiveListingsResponse = {
  items: ActiveListing[];
  nextCursor: string | null;
  filters: { owner: string | null; nft_address: string | null };
  pageInfo: { limit: number };
};

export type GetActiveListingsParams = {
  owner?: string;
  nft_address?: string;
  cursor?: string | number;
  limit?: number;                // 기본 50, 최대 200 (서버와 일치)
  signal?: AbortSignal;          // 필요 시 fetch 취소
};

/** 현재 LISTED 상태의 리스팅 목록 조회 */
export async function getActiveListings(params: GetActiveListingsParams = {}): Promise<GetActiveListingsResponse> {
  const { owner, nft_address, cursor, limit, signal } = params;

  const qs = new URLSearchParams();
  if (owner) qs.set("owner", owner);
  if (nft_address) qs.set("nft_address", nft_address);
  if (cursor !== undefined && cursor !== null) qs.set("cursor", String(cursor));
  if (limit !== undefined) qs.set("limit", String(limit));

  const url = `${NFT_API_BASE_URI}/active-listings${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`getActiveListings failed: ${res.status} ${res.statusText}`, text);
    throw new Error(`Failed to fetch listings: ${res.status}`);
  }

  // 서버가 { items, nextCursor, filters, pageInfo } 형태로 응답
  return res.json() as Promise<GetActiveListingsResponse>;
}

/**
 * (옵션) 모든 페이지를 이어서 불러오는 유틸 함수
 * 사용 예: const all = await getAllActiveListings({ nft_address: '0x...' });
 */
export async function getAllActiveListings(params: GetActiveListingsParams = {}): Promise<ActiveListing[]> {
  const acc: ActiveListing[] = [];
  let cursor = params.cursor;

  // 안전장치: 최대 10 페이지
  for (let i = 0; i < 10; i++) {
    const page = await getActiveListings({ ...params, cursor });
    acc.push(...page.items);
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return acc;
}

// === types.ts 또는 api 파일 상단의 타입 재사용 ===
// ActiveListing / GetActiveListingsResponse 등 기존 타입 그대로 사용

export type GetListingByIdOptions = {
  include_inactive?: boolean;   // 구매/취소된 리스팅도 조회
  signal?: AbortSignal;
};

export async function getListingById(
  list_id: string | number,
  opts: GetListingByIdOptions = {}
): Promise<{ item: ActiveListing }> {
  if (list_id === undefined || list_id === null || String(list_id).trim() === "") {
    throw new Error("list_id is required");
  }
  const qs = new URLSearchParams();
  if (opts.include_inactive) qs.set("include_inactive", "1");

  const url = `${NFT_API_BASE_URI}/listings/${encodeURIComponent(String(list_id))}${qs.toString() ? `?${qs.toString()}` : ""
    }`;

  const res = await fetch(url, { signal: opts.signal });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`getListingById failed: ${res.status} ${res.statusText}`, text);
    if (res.status === 404) {
      throw new Error("Listing not found");
    }
    throw new Error(`Failed to fetch listing: ${res.status}`);
  }

  return res.json() as Promise<{ item: ActiveListing }>;
}
