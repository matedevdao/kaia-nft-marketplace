import { isAddress } from 'viem';
import {
  getAccount,
  simulateContract,
  writeContract,
  waitForTransactionReceipt
} from 'wagmi/actions';
import { wagmiConfig } from '../components/wallet';

export const erc721Abi = [
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'safeTransferFrom',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' }
    ],
    outputs: []
  }
] as const;

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
