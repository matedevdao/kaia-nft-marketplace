import { simulateContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { wagmiConfig } from "../components/wallet";
import { ensureApprovalForAll } from "./erc721";
import abi from "./nft-marketplace-abi.json";

const NFT_MARKETPLACE_ADDRESS = "0x53F54285c4112232CC933bE787E3170fe2931218";

export async function listNft(
  nftAddress: `0x${string}`,
  tokenId: bigint,
  price: bigint
) {
  await ensureApprovalForAll({ nft: nftAddress, operator: NFT_MARKETPLACE_ADDRESS });

  const { request } = await simulateContract(wagmiConfig, {
    address: NFT_MARKETPLACE_ADDRESS,
    abi,
    functionName: 'list',
    args: [nftAddress, tokenId, price],
  });

  const hash = await writeContract(wagmiConfig, request);
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
  return { hash, receipt };
}