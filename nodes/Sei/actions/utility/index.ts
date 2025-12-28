/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const utilityOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['utility'] } },
    options: [
      { name: 'Convert Units', value: 'convertUnits', description: 'Convert between SEI and usei', action: 'Convert units' },
      { name: 'Convert Address', value: 'convertAddress', description: 'Convert Sei ↔ EVM address', action: 'Convert address' },
      { name: 'Validate Address', value: 'validateAddress', description: 'Validate address format', action: 'Validate address' },
      { name: 'Get Chain ID', value: 'getChainId', description: 'Get chain ID', action: 'Get chain ID' },
      { name: 'Get Network Status', value: 'getNetworkStatus', description: 'Get network status', action: 'Get network status' },
    ],
    default: 'convertUnits',
  },
];

export const utilityFields: INodeProperties[] = [
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1.0',
    displayOptions: { show: { resource: ['utility'], operation: ['convertUnits'] } },
  },
  {
    displayName: 'From Unit',
    name: 'fromUnit',
    type: 'options',
    options: [
      { name: 'SEI', value: 'sei' },
      { name: 'usei (micro)', value: 'usei' },
      { name: 'Wei', value: 'wei' },
    ],
    default: 'sei',
    displayOptions: { show: { resource: ['utility'], operation: ['convertUnits'] } },
  },
  {
    displayName: 'To Unit',
    name: 'toUnit',
    type: 'options',
    options: [
      { name: 'SEI', value: 'sei' },
      { name: 'usei (micro)', value: 'usei' },
      { name: 'Wei', value: 'wei' },
    ],
    default: 'usei',
    displayOptions: { show: { resource: ['utility'], operation: ['convertUnits'] } },
  },
  {
    displayName: 'Address',
    name: 'address',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1... or 0x...',
    displayOptions: { show: { resource: ['utility'], operation: ['convertAddress', 'validateAddress'] } },
  },
];
