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
 * Sei Network Credentials
 *
 * Provides authentication for Sei blockchain operations including:
 * - Network selection (Mainnet, Testnet, Devnet, Custom)
 * - RPC and REST endpoints
 * - Wallet configuration via mnemonic
 * - HD derivation path customization
 * - EVM private key support
 */
export class SeiNetwork implements ICredentialType {
  name = 'seiNetwork';
  displayName = 'Sei Network';
  documentationUrl = 'https://docs.sei.io/';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
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
      ],
      default: 'mainnet',
      description: 'The Sei network to connect to',
    },
    {
      displayName: 'RPC Endpoint URL',
      name: 'rpcEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://rpc.sei-apis.com',
      description: 'RPC endpoint URL (required for custom network, optional override for others)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
      required: true,
    },
    {
      displayName: 'REST/LCD Endpoint URL',
      name: 'restEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://rest.sei-apis.com',
      description: 'REST/LCD endpoint URL (required for custom network)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
      required: true,
    },
    {
      displayName: 'EVM RPC Endpoint URL',
      name: 'evmRpcEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://evm-rpc.sei-apis.com',
      description: 'EVM RPC endpoint URL (required for EVM operations on custom network)',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Mnemonic Phrase',
      name: 'mnemonic',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: 'word1 word2 word3 ... word24',
      description:
        '24-word mnemonic phrase for wallet access. Required for signing transactions.',
    },
    {
      displayName: 'HD Derivation Path',
      name: 'derivationPath',
      type: 'string',
      default: "m/44'/118'/0'/0/0",
      placeholder: "m/44'/118'/0'/0/0",
      description:
        'HD derivation path for the wallet. Default is Cosmos standard path.',
    },
    {
      displayName: 'EVM Private Key',
      name: 'evmPrivateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: '0x...',
      description:
        'Ethereum-format private key for EVM operations. Optional if mnemonic is provided.',
    },
    {
      displayName: 'Gas Price',
      name: 'gasPrice',
      type: 'string',
      default: '0.1usei',
      description: 'Default gas price for transactions',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.rpcEndpoint : ($credentials.network === "mainnet" ? "https://rpc.sei-apis.com" : ($credentials.network === "testnet" ? "https://rpc.atlantic-2.seinetwork.io" : "https://rpc.sei-devnet-3.seinetwork.io"))}}',
      url: '/status',
      method: 'GET',
    },
  };
}
