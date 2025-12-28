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
 * Sei API Credentials
 *
 * Provides authentication for Sei API and indexer services.
 * Used for querying blockchain data without signing transactions.
 */
export class SeiApi implements ICredentialType {
  name = 'seiApi';
  displayName = 'Sei API';
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
      displayName: 'API Endpoint',
      name: 'apiEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://rest.sei-apis.com',
      description: 'Sei REST API endpoint',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
      required: true,
    },
    {
      displayName: 'Indexer Endpoint',
      name: 'indexerEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://indexer.sei-apis.com',
      description: 'Sei indexer endpoint for advanced queries',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API key if required by your endpoint provider',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{$credentials.apiKey ? "Bearer " + $credentials.apiKey : ""}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.network === "custom" ? $credentials.apiEndpoint : ($credentials.network === "mainnet" ? "https://rest.sei-apis.com" : ($credentials.network === "testnet" ? "https://rest.atlantic-2.seinetwork.io" : "https://rest.sei-devnet-3.seinetwork.io"))}}',
      url: '/cosmos/base/tendermint/v1beta1/node_info',
      method: 'GET',
    },
  };
}
