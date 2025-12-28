/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const bankOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['bank'] } },
    options: [
      { name: 'Get Balance', value: 'getBalance', description: 'Get balance for a denom', action: 'Get balance' },
      { name: 'Get All Balances', value: 'getAllBalances', description: 'Get all balances', action: 'Get all balances' },
      { name: 'Get Total Supply', value: 'getTotalSupply', description: 'Get total token supply', action: 'Get total supply' },
      { name: 'Get Supply of Denom', value: 'getSupplyOfDenom', description: 'Get supply of specific denom', action: 'Get supply of denom' },
      { name: 'Get Denom Metadata', value: 'getDenomMetadata', description: 'Get denom metadata', action: 'Get denom metadata' },
      { name: 'Get Spendable Balances', value: 'getSpendableBalances', description: 'Get spendable balances', action: 'Get spendable balances' },
    ],
    default: 'getBalance',
  },
];

export const bankFields: INodeProperties[] = [
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['bank'], operation: ['getBalance', 'getAllBalances', 'getSpendableBalances'] } },
  },
  {
    displayName: 'Denom',
    name: 'denom',
    type: 'string',
    default: 'usei',
    displayOptions: { show: { resource: ['bank'], operation: ['getBalance', 'getSupplyOfDenom', 'getDenomMetadata'] } },
  },
];
