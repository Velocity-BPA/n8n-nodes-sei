/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const blockOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['block'] } },
    options: [
      { name: 'Get Latest Block', value: 'getLatestBlock', description: 'Get the latest block', action: 'Get latest block' },
      { name: 'Get Block by Height', value: 'getBlockByHeight', description: 'Get block by height', action: 'Get block by height' },
      { name: 'Get Block Results', value: 'getBlockResults', description: 'Get block results', action: 'Get block results' },
      { name: 'Get Validator Set', value: 'getValidatorSet', description: 'Get validator set at height', action: 'Get validator set' },
      { name: 'Get Node Info', value: 'getNodeInfo', description: 'Get node information', action: 'Get node info' },
      { name: 'Get Syncing Status', value: 'getSyncingStatus', description: 'Check if node is syncing', action: 'Get syncing status' },
      { name: 'Health Check', value: 'healthCheck', description: 'Check node health', action: 'Health check' },
    ],
    default: 'getLatestBlock',
  },
];

export const blockFields: INodeProperties[] = [
  {
    displayName: 'Block Height',
    name: 'blockHeight',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: { show: { resource: ['block'], operation: ['getBlockByHeight', 'getBlockResults', 'getValidatorSet'] } },
  },
];
