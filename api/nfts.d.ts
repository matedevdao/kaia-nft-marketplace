export type HeldNft = {
    collection: string;
    id: number;
    holder: string;
    type?: string | null;
    gender?: string | null;
    parts?: string | null;
    image?: string | null;
    contract_addr?: string;
};
export type FetchHeldNftsOptions = {
    collection?: string;
    start?: number;
    end?: number;
    cursor?: string;
    limit?: number | string;
};
/**
 * 지갑 주소가 보유한 NFT 전체를 조회
 * 백엔드 라우팅이 `/{holder}/nfts` (endsWith('/nfts'))인 점을 활용합니다.
 */
export declare function fetchHeldNfts(holder: string, opts?: FetchHeldNftsOptions): Promise<HeldNft[]>;
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
        traits?: {
            [traitName: string]: string | number;
        };
        parts?: {
            [partName: string]: string | number;
        };
        holder: string;
        contract_addr: string;
    } | null;
};
export type GetActiveListingsResponse = {
    items: ActiveListing[];
    nextCursor: string | null;
    filters: {
        owner: string | null;
        nft_address: string | null;
    };
    pageInfo: {
        limit: number;
    };
};
export type GetActiveListingsParams = {
    owner?: string;
    nft_address?: string;
    cursor?: string | number;
    limit?: number;
    signal?: AbortSignal;
};
/** 현재 LISTED 상태의 리스팅 목록 조회 */
export declare function getActiveListings(params?: GetActiveListingsParams): Promise<GetActiveListingsResponse>;
/**
 * (옵션) 모든 페이지를 이어서 불러오는 유틸 함수
 * 사용 예: const all = await getAllActiveListings({ nft_address: '0x...' });
 */
export declare function getAllActiveListings(params?: GetActiveListingsParams): Promise<ActiveListing[]>;
export type GetListingByIdOptions = {
    include_inactive?: boolean;
    signal?: AbortSignal;
};
export declare function getListingById(list_id: string | number, opts?: GetListingByIdOptions): Promise<{
    item: ActiveListing;
}>;
export type HistoryEventKind = "LISTED" | "SOLD" | "CANCELLED";
export type HistoryEvent = {
    event_id: number;
    kind: HistoryEventKind;
    tx_hash: string | null;
    block_number: number | null;
    ts_sec: number | null;
    nft_address: string;
    token_id: string;
    price_wei: string | null;
    actor: string | null;
    from: string | null;
    to: string | null;
    nft: {
        collection: string;
        id: number;
        name: string;
        description?: string;
        image: string;
        external_url?: string;
        animation_url?: string;
        traits?: Record<string, string | number>;
        parts?: Record<string, string | number>;
        holder: string;
        contract_addr: string;
        thumbnail?: string;
    } | null;
};
export type GetHistoryParams = {
    account?: string;
    nft_address?: string;
    kind?: HistoryEventKind;
    cursor?: string | number;
    limit?: number;
    signal?: AbortSignal;
};
export type GetHistoryResponse = {
    items: HistoryEvent[];
    nextCursor: string | null;
    filters: {
        account: string | null;
        nft_address: string | null;
        kind: HistoryEventKind | null;
    };
    pageInfo: {
        limit: number;
    };
};
export declare function getHistory(params?: GetHistoryParams): Promise<GetHistoryResponse>;
//# sourceMappingURL=nfts.d.ts.map