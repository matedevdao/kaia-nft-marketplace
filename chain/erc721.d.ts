export declare const erc721Abi: readonly [{
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly name: "safeTransferFrom";
    readonly inputs: readonly [{
        readonly name: "from";
        readonly type: "address";
    }, {
        readonly name: "to";
        readonly type: "address";
    }, {
        readonly name: "tokenId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
}];
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