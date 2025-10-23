/** operator(예: 마켓플레이스)가 대신 옮길 수 있도록 전체 승인 보장 */
export declare function ensureApprovalForAll(params: {
    nft: `0x${string}`;
    operator: `0x${string}`;
}): Promise<{
    approved: true;
    hash?: undefined;
    receipt?: undefined;
} | {
    approved: true;
    hash: `0x${string}`;
    receipt: {
        blobGasPrice?: bigint | undefined;
        blobGasUsed?: bigint | undefined;
        blockHash: import("viem").Hash;
        blockNumber: bigint;
        contractAddress: import("viem").Address | null | undefined;
        cumulativeGasUsed: bigint;
        effectiveGasPrice: bigint;
        from: import("viem").Address;
        gasUsed: bigint;
        logs: import("viem").Log<bigint, number, false>[];
        logsBloom: import("viem").Hex;
        root?: `0x${string}` | undefined;
        status: "success" | "reverted";
        to: import("viem").Address | null;
        transactionHash: import("viem").Hash;
        transactionIndex: number;
        type: import("viem").TransactionType;
        chainId: number;
    };
}>;
export declare function sendNft(params: {
    contract: `0x${string}`;
    to: `0x${string}`;
    tokenId: bigint;
}): Promise<{
    hash: `0x${string}`;
    receipt: {
        blobGasPrice?: bigint | undefined;
        blobGasUsed?: bigint | undefined;
        blockHash: import("viem").Hash;
        blockNumber: bigint;
        contractAddress: import("viem").Address | null | undefined;
        cumulativeGasUsed: bigint;
        effectiveGasPrice: bigint;
        from: import("viem").Address;
        gasUsed: bigint;
        logs: import("viem").Log<bigint, number, false>[];
        logsBloom: import("viem").Hex;
        root?: `0x${string}` | undefined;
        status: "success" | "reverted";
        to: import("viem").Address | null;
        transactionHash: import("viem").Hash;
        transactionIndex: number;
        type: import("viem").TransactionType;
        chainId: number;
    };
}>;
//# sourceMappingURL=erc721.d.ts.map