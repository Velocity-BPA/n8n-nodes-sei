/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['account'],
      },
    },
    options: [
      {
        name: 'Get Account Info',
        value: 'getAccountInfo',
        description: 'Get account information including sequence and account number',
        action: 'Get account info',
      },
      {
        name: 'Get SEI Balance',
        value: 'getSeiBalance',
        description: 'Get the SEI token balance for an address',
        action: 'Get SEI balance',
      },
      {
        name: 'Get All Balances',
        value: 'getAllBalances',
        description: 'Get all token balances for an address',
        action: 'Get all balances',
      },
      {
        name: 'Get Delegations',
        value: 'getDelegations',
        description: 'Get all staking delegations for an address',
        action: 'Get delegations',
      },
      {
        name: 'Get Rewards',
        value: 'getRewards',
        description: 'Get pending staking rewards for an address',
        action: 'Get rewards',
      },
      {
        name: 'Get Unbonding Delegations',
        value: 'getUnbondingDelegations',
        description: 'Get all unbonding delegations for an address',
        action: 'Get unbonding delegations',
      },
      {
        name: 'Validate Address',
        value: 'validateAddress',
        description: 'Validate a Sei or EVM address format',
        action: 'Validate address',
      },
      {
        name: 'Get EVM Address',
        value: 'getEvmAddress',
        description: 'Convert a Sei address to its EVM equivalent',
        action: 'Get EVM address',
      },
      {
        name: 'Get Sei Address',
        value: 'getSeiAddress',
        description: 'Convert an EVM address to its Sei equivalent',
        action: 'Get Sei address',
      },
      {
        name: 'Get Account Transactions',
        value: 'getAccountTransactions',
        description: 'Get transaction history for an address',
        action: 'Get account transactions',
      },
    ],
    default: 'getAccountInfo',
  },
];

export const accountFields: INodeProperties[] = [
  // Address field for most operations
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    description: 'The Sei address to query',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: [
          'getAccountInfo',
          'getSeiBalance',
          'getAllBalances',
          'getDelegations',
          'getRewards',
          'getUnbondingDelegations',
          'getAccountTransactions',
        ],
      },
    },
  },
  // Address for validation
  {
    displayName: 'Address',
    name: 'addressToValidate',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1... or 0x...',
    description: 'The address to validate (Sei or EVM format)',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['validateAddress'],
      },
    },
  },
  // Sei address for EVM conversion
  {
    displayName: 'Sei Address',
    name: 'seiAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    description: 'The Sei address to convert to EVM format',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getEvmAddress'],
      },
    },
  },
  // EVM address for Sei conversion
  {
    displayName: 'EVM Address',
    name: 'evmAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The EVM address to convert to Sei format',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getSeiAddress'],
      },
    },
  },
  // Denom field for balance query
  {
    displayName: 'Token Denom',
    name: 'denom',
    type: 'string',
    default: 'usei',
    description: 'The token denomination to query (default: usei)',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getSeiBalance'],
      },
    },
  },
  // Pagination for transactions
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    description: 'Maximum number of transactions to return',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getAccountTransactions'],
      },
    },
  },
  {
    displayName: 'Offset',
    name: 'offset',
    type: 'number',
    default: 0,
    description: 'Number of transactions to skip',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getAccountTransactions'],
      },
    },
  },
];
