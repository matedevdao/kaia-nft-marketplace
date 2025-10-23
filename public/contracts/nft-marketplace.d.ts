export declare function listNft(nftAddress: `0x${string}`, tokenId: bigint, price: bigint): Promise<{
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
export declare function buyListing(listId: bigint, priceWei: bigint): Promise<{
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
export declare function cancelListing(listId: bigint): Promise<{
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
//# sourceMappingURL=nft-marketplace.d.ts.map