import { isAddress } from 'viem';
import {
  getAccount,
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract
} from 'wagmi/actions';
import { wagmiConfig } from '../components/wallet';

const erc721Abi = [
  // 읽기
  {
    type: "function",
    stateMutability: "view",
    name: "isApprovedForAll",
    inputs: [
      { name: "owner", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  // 단건
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "approve",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  // 전체
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  // 전송
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "safeTransferFrom",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

/** operator(예: 마켓플레이스)가 대신 옮길 수 있도록 전체 승인 보장 */
export async function ensureApprovalForAll(params: {
  nft: `0x${string}`;
  operator: `0x${string}`;
}) {
  const me = getAccount(wagmiConfig)?.address as `0x${string}` | undefined;
  if (!me) throw new Error("지갑이 연결되어 있지 않습니다.");
  if (!isAddress(params.nft) || !isAddress(params.operator))
    throw new Error("잘못된 주소입니다.");

  const approved = await readContract(wagmiConfig, {
    address: params.nft,
    abi: erc721Abi,
    functionName: "isApprovedForAll",
    args: [me, params.operator],
  });

  if (approved) return { approved: true as const };

  // 승인 트랜잭션
  const { request } = await simulateContract(wagmiConfig, {
    address: params.nft,
    abi: erc721Abi,
    functionName: "setApprovalForAll",
    args: [params.operator, true],
    account: me,
  });

  const hash = await writeContract(wagmiConfig, request);
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
  return { approved: true as const, hash, receipt };
}

export async function sendNft(params: {
  contract: `0x${string}`;
  to: `0x${string}`;
  tokenId: bigint;
}) {
  const me = getAccount(wagmiConfig)?.address as `0x${string}` | undefined;
  if (!me) throw new Error('지갑이 연결되어 있지 않습니다.');
  if (!isAddress(params.contract)) throw new Error('잘못된 컨트랙트 주소');
  if (!isAddress(params.to)) throw new Error('잘못된 수신자 주소');

  const { request } = await simulateContract(wagmiConfig, {
    address: params.contract,
    abi: erc721Abi,
    functionName: 'safeTransferFrom',
    args: [me, params.to, params.tokenId],
    account: me
  });

  const hash = await writeContract(wagmiConfig, request);
  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
  return { hash, receipt };
}
