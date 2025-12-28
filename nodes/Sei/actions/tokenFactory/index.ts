/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const tokenFactoryOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['tokenFactory'] } },
    options: [
      { name: 'Create Denom', value: 'createDenom', description: 'Create a new token denomination', action: 'Create denom' },
      { name: 'Mint Tokens', value: 'mintTokens', description: 'Mint tokens of a denom', action: 'Mint tokens' },
      { name: 'Burn Tokens', value: 'burnTokens', description: 'Burn tokens of a denom', action: 'Burn tokens' },
      { name: 'Change Admin', value: 'changeAdmin', description: 'Change denom admin', action: 'Change admin' },
      { name: 'Get Denom Info', value: 'getDenomInfo', description: 'Get denom information', action: 'Get denom info' },
      { name: 'Get Denoms by Creator', value: 'getDenomsByCreator', description: 'Get all denoms by creator', action: 'Get denoms by creator' },
      { name: 'Get Authority Metadata', value: 'getAuthorityMetadata', description: 'Get denom authority metadata', action: 'Get authority metadata' },
    ],
    default: 'getDenomInfo',
  },
];

export const tokenFactoryFields: INodeProperties[] = [
  {
    displayName: 'Subdenom',
    name: 'subdenom',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'mytoken',
    displayOptions: { show: { resource: ['tokenFactory'], operation: ['createDenom'] } },
  },
  {
    displayName: 'Full Denom',
    name: 'fullDenom',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'factory/sei1.../mytoken',
    displayOptions: { show: { resource: ['tokenFactory'], operation: ['mintTokens', 'burnTokens', 'changeAdmin', 'getDenomInfo', 'getAuthorityMetadata'] } },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1000000',
    displayOptions: { show: { resource: ['tokenFactory'], operation: ['mintTokens', 'burnTokens'] } },
  },
  {
    displayName: 'New Admin',
    name: 'newAdmin',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['tokenFactory'], operation: ['changeAdmin'] } },
  },
  {
    displayName: 'Creator Address',
    name: 'creatorAddress',
    type: 'string',
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['tokenFactory'], operation: ['getDenomsByCreator'] } },
  },
];
