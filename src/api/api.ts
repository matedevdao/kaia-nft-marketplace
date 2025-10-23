
declare const API_BASE_URI: string;

/** NFT 보유 이력 싱크 트리거 */
export async function syncNftOwnershipFromEventsApi() {
  const res = await fetch(`${API_BASE_URI}/sync-nft-ownership-from-events`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`syncNftOwnershipFromEventsApi failed: ${res.status} ${res.statusText}`, text);
    throw new Error(`Failed to trigger ownership sync: ${res.status}`);
  }
  return res.json();
}

/** 마켓플레이스 이벤트 싱크 트리거 */
export async function syncMarketplaceEventsApi() {
  const res = await fetch(`${API_BASE_URI}/sync-marketplace-events`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`syncMarketplaceEventsApi failed: ${res.status} ${res.statusText}`, text);
    throw new Error(`Failed to trigger marketplace sync: ${res.status}`);
  }
  return res.json();
}
