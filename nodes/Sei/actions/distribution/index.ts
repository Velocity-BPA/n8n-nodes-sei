/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const distributionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['distribution'] } },
    options: [
      { name: 'Get Delegation Rewards', value: 'getDelegationRewards', description: 'Get rewards from a validator', action: 'Get delegation rewards' },
      { name: 'Get All Rewards', value: 'getAllRewards', description: 'Get all staking rewards', action: 'Get all rewards' },
      { name: 'Withdraw Rewards', value: 'withdrawRewards', description: 'Withdraw rewards from validator', action: 'Withdraw rewards' },
      { name: 'Withdraw All Rewards', value: 'withdrawAllRewards', description: 'Withdraw all rewards', action: 'Withdraw all rewards' },
      { name: 'Get Community Pool', value: 'getCommunityPool', description: 'Get community pool balance', action: 'Get community pool' },
      { name: 'Get Distribution Params', value: 'getDistributionParams', description: 'Get distribution parameters', action: 'Get distribution params' },
    ],
    default: 'getAllRewards',
  },
];

export const distributionFields: INodeProperties[] = [
  {
    displayName: 'Delegator Address',
    name: 'delegatorAddress',
    type: 'string',
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['distribution'], operation: ['getDelegationRewards', 'getAllRewards', 'withdrawRewards', 'withdrawAllRewards'] } },
  },
  {
    displayName: 'Validator Address',
    name: 'validatorAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'seivaloper1...',
    displayOptions: { show: { resource: ['distribution'], operation: ['getDelegationRewards', 'withdrawRewards'] } },
  },
];
