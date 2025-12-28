/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const transactionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['transaction'] } },
    options: [
      { name: 'Send SEI', value: 'sendSei', description: 'Send SEI tokens to an address', action: 'Send SEI' },
      { name: 'Send Token', value: 'sendToken', description: 'Send any token to an address', action: 'Send token' },
      { name: 'Get Transaction', value: 'getTransaction', description: 'Get transaction by hash', action: 'Get transaction' },
      { name: 'Get Transaction Status', value: 'getTransactionStatus', description: 'Get status', action: 'Get status' },
      { name: 'Simulate Transaction', value: 'simulateTransaction', description: 'Estimate gas', action: 'Simulate' },
      { name: 'Multi-Send', value: 'multiSend', description: 'Send to multiple recipients', action: 'Multi-send' },
    ],
    default: 'sendSei',
  },
];

export const transactionFields: INodeProperties[] = [
  {
    displayName: 'Recipient Address',
    name: 'recipient',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['transaction'], operation: ['sendSei', 'sendToken'] } },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1.0',
    description: 'Amount in SEI',
    displayOptions: { show: { resource: ['transaction'], operation: ['sendSei', 'sendToken'] } },
  },
  {
    displayName: 'Token Denom',
    name: 'denom',
    type: 'string',
    default: 'usei',
    displayOptions: { show: { resource: ['transaction'], operation: ['sendToken'] } },
  },
  {
    displayName: 'Transaction Hash',
    name: 'txHash',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['transaction'], operation: ['getTransaction', 'getTransactionStatus'] } },
  },
  {
    displayName: 'Memo',
    name: 'memo',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['transaction'], operation: ['sendSei', 'sendToken', 'multiSend'] } },
  },
];
