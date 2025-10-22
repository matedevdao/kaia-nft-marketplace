import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ConnectButton, getDefaultWallets, lightTheme, RainbowKitProvider, useConnectModal } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getPublicClient } from '@wagmi/core';
import { el } from '@webtaku/el';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { kaia } from 'wagmi/chains';
import './wallet.css';
const queryClient = new QueryClient();
// wagmi + rainbowkit 최신 설정
const { connectors } = getDefaultWallets({
    appName: APP_NAME,
    projectId: WALLET_CONNECT_PROJECT_ID,
});
const config = createConfig({
    chains: [kaia],
    transports: {
        [kaia.id]: http(), // RPC를 설정
    },
    connectors,
    ssr: false, // (선택) SSR 사용하지 않을 경우
});
let openWalletConnectModal;
function ConnectModalController() {
    const { openConnectModal } = useConnectModal();
    useEffect(() => {
        openWalletConnectModal = () => {
            if (openConnectModal)
                openConnectModal();
        };
    }, [openConnectModal]);
    return null;
}
function createRainbowKit() {
    const container = el();
    createRoot(container).render(React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(WagmiProvider, { config: config },
            React.createElement(RainbowKitProvider, { theme: lightTheme() },
                React.createElement(ConnectModalController, null)))));
    return container;
}
function createConnectButton() {
    const container = el('.connect-button');
    createRoot(container).render(React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(WagmiProvider, { config: config },
            React.createElement(RainbowKitProvider, { theme: lightTheme() },
                React.createElement(ConnectButton, null)))));
    return container;
}
const publicClient = getPublicClient(config, { chainId: kaia.id });
export { createConnectButton, createRainbowKit, openWalletConnectModal, publicClient, config as wagmiConfig };
//# sourceMappingURL=wallet.js.map