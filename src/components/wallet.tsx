import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import { ConnectButton, getDefaultConfig, lightTheme, RainbowKitProvider, useConnectModal } from '@rainbow-me/rainbowkit';
import {
  kaiaWallet,
  kaikasWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getPublicClient } from '@wagmi/core';
import { el } from '@webtaku/el';
import {
  http,
  WagmiProvider
} from 'wagmi';
import { kaia } from 'wagmi/chains';
import './wallet.css';

declare const APP_NAME: string;
declare const WALLET_CONNECT_PROJECT_ID: string;

const queryClient = new QueryClient();

const config: any = getDefaultConfig({
  appName: APP_NAME,
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [kaia as any],
  transports: {
    [kaia.id]: http(), // RPC를 설정
  },
  wallets: [{
    groupName: "Recommended",
    wallets: [kaiaWallet, kaikasWallet, metaMaskWallet, walletConnectWallet],
  }],
  ssr: false, // (선택) SSR 사용하지 않을 경우
});

let openWalletConnectModal: () => void;

function ConnectModalController() {
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    openWalletConnectModal = () => {
      if (openConnectModal) openConnectModal();
    };
  }, [openConnectModal]);

  return null;
}

function createRainbowKit() {
  const container = el();
  createRoot(container).render(
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider theme={lightTheme()}>
          <ConnectModalController />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
  return container;
}

function showKlipToast(message = 'Klip을 사용하시는 경우, WalletConnect를 통해 접속해주세요.') {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.bottom = '0';
  wrapper.style.right = '0';
  wrapper.style.padding = '10px';
  wrapper.style.zIndex = '2147483647';

  const alert = document.createElement('sl-alert') as HTMLElement & { toast?: () => void };
  alert.setAttribute('variant', 'primary');
  alert.setAttribute('closable', 'true');
  alert.setAttribute('duration', '4000');
  alert.setAttribute('open', 'true');
  alert.innerHTML = `
    <sl-icon slot="icon" name="info-circle"></sl-icon>
    ${message}
  `;
  wrapper.appendChild(alert);
  document.body.appendChild(wrapper);
}

function createConnectButton() {
  const container = el('.connect-button');
  createRoot(container).render(
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider theme={lightTheme()}>
          <ConnectButton />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );

  container.addEventListener('click', () => {
    showKlipToast();
  });

  return container;
}
const publicClient = getPublicClient(config, { chainId: kaia.id });

export {
  createConnectButton, createRainbowKit,
  openWalletConnectModal, publicClient, config as wagmiConfig
};

