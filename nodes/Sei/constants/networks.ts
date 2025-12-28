/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Sei Network Configuration
 *
 * Sei is a Layer 1 blockchain built on Cosmos SDK optimized for trading.
 * It features Twin Turbo consensus, parallel execution, and native DEX support.
 */

export interface SeiNetworkConfig {
  name: string;
  chainId: string;
  evmChainId: number;
  rpcEndpoint: string;
  restEndpoint: string;
  evmRpcEndpoint: string;
  wsEndpoint: string;
  explorerUrl: string;
  faucetUrl?: string;
  bech32Prefix: string;
  nativeDenom: string;
  coinDecimals: number;
  coinGeckoId: string;
  gasPrice: string;
  isTestnet: boolean;
}

/**
 * Sei Pacific-1 Mainnet Configuration
 */
export const SEI_MAINNET: SeiNetworkConfig = {
  name: 'Sei Pacific-1 (Mainnet)',
  chainId: 'pacific-1',
  evmChainId: 1329,
  rpcEndpoint: 'https://rpc.sei-apis.com',
  restEndpoint: 'https://rest.sei-apis.com',
  evmRpcEndpoint: 'https://evm-rpc.sei-apis.com',
  wsEndpoint: 'wss://rpc.sei-apis.com/websocket',
  explorerUrl: 'https://seistream.app',
  bech32Prefix: 'sei',
  nativeDenom: 'usei',
  coinDecimals: 6,
  coinGeckoId: 'sei-network',
  gasPrice: '0.1usei',
  isTestnet: false,
};

/**
 * Sei Atlantic-2 Testnet Configuration
 */
export const SEI_TESTNET: SeiNetworkConfig = {
  name: 'Sei Atlantic-2 (Testnet)',
  chainId: 'atlantic-2',
  evmChainId: 1328,
  rpcEndpoint: 'https://rpc.atlantic-2.seinetwork.io',
  restEndpoint: 'https://rest.atlantic-2.seinetwork.io',
  evmRpcEndpoint: 'https://evm-rpc.atlantic-2.seinetwork.io',
  wsEndpoint: 'wss://rpc.atlantic-2.seinetwork.io/websocket',
  explorerUrl: 'https://seistream.app/atlantic-2',
  faucetUrl: 'https://atlantic-2.app.sei.io/faucet',
  bech32Prefix: 'sei',
  nativeDenom: 'usei',
  coinDecimals: 6,
  coinGeckoId: 'sei-network',
  gasPrice: '0.1usei',
  isTestnet: true,
};

/**
 * Sei Devnet Configuration
 */
export const SEI_DEVNET: SeiNetworkConfig = {
  name: 'Sei Devnet',
  chainId: 'sei-devnet-3',
  evmChainId: 713715,
  rpcEndpoint: 'https://rpc.sei-devnet-3.seinetwork.io',
  restEndpoint: 'https://rest.sei-devnet-3.seinetwork.io',
  evmRpcEndpoint: 'https://evm-rpc.sei-devnet-3.seinetwork.io',
  wsEndpoint: 'wss://rpc.sei-devnet-3.seinetwork.io/websocket',
  explorerUrl: 'https://seistream.app/sei-devnet-3',
  faucetUrl: 'https://sei-devnet-3.app.sei.io/faucet',
  bech32Prefix: 'sei',
  nativeDenom: 'usei',
  coinDecimals: 6,
  coinGeckoId: 'sei-network',
  gasPrice: '0.1usei',
  isTestnet: true,
};

/**
 * Network registry for easy lookup
 */
export const NETWORKS: Record<string, SeiNetworkConfig> = {
  mainnet: SEI_MAINNET,
  'pacific-1': SEI_MAINNET,
  testnet: SEI_TESTNET,
  'atlantic-2': SEI_TESTNET,
  devnet: SEI_DEVNET,
  'sei-devnet-3': SEI_DEVNET,
};

/**
 * Network selection options for n8n dropdown
 */
export const NETWORK_OPTIONS = [
  {
    name: 'Sei Pacific-1 (Mainnet)',
    value: 'mainnet',
  },
  {
    name: 'Sei Atlantic-2 (Testnet)',
    value: 'testnet',
  },
  {
    name: 'Sei Devnet',
    value: 'devnet',
  },
  {
    name: 'Custom',
    value: 'custom',
  },
];

/**
 * Get network configuration by identifier
 */
export function getNetworkConfig(network: string): SeiNetworkConfig | undefined {
  return NETWORKS[network.toLowerCase()];
}

/**
 * Default derivation paths
 */
export const DERIVATION_PATHS = {
  cosmos: "m/44'/118'/0'/0/0",
  sei: "m/44'/118'/0'/0/0",
  ethereum: "m/44'/60'/0'/0/0",
};

/**
 * Sei block time (in milliseconds)
 * Sei has ~400ms block times thanks to Twin Turbo consensus
 */
export const SEI_BLOCK_TIME_MS = 400;

/**
 * Sei TPS capacity
 * Sei can handle 12,500+ TPS with parallel execution
 */
export const SEI_MAX_TPS = 12500;
