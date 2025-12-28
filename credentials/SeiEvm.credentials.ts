/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
  IAuthenticateGeneric,
} from 'n8n-workflow';

/**
 * Sei EVM Credentials
 *
 * Provides authentication for Sei EVM operations.
 * Sei supports full EVM compatibility with Ethereum-style addresses and contracts.
 */
export class SeiEvm implements ICredentialType {
  name = 'seiEvm';
  displayName = 'Sei EVM';
  documentationUrl = 'https://docs.sei.io/evm';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Sei Pacific-1 (Mainnet) - Chain ID: 1329',
          value: 'mainnet',
        },
        {
          name: 'Sei Atlantic-2 (Testnet) - Chain ID: 1328',
          value: 'testnet',
        },
        {
          name: 'Sei Devnet - Chain ID: 713715',
          value: 'devnet',
        },
        {
          name: 'Custom',
          value: 'custom',
        },
      ],
      default: 'mainnet',
      description: 'The Sei EVM network to connect to',
    },
    {
      displayName: 'EVM RPC URL',
      name: 'evmRpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://evm-rpc.sei-apis.com',
      description: 'EVM JSON-RPC endpoint URL',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
      required: true,
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 1329,
      description: 'EVM Chain ID (auto-populated for known networks)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: '0x...',
      description:
        'Ethereum-format private key (64 hex characters with 0x prefix). Required for signing transactions.',
      required: true,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.evmRpcUrl : ($credentials.network === "mainnet" ? "https://evm-rpc.sei-apis.com" : ($credentials.network === "testnet" ? "https://evm-rpc.atlantic-2.seinetwork.io" : "https://evm-rpc.sei-devnet-3.seinetwork.io"))}}',
      url: '',
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    },
  };
}
