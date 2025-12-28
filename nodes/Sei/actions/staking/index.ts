/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const stakingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['staking'] } },
    options: [
      { name: 'Get Validators', value: 'getValidators', description: 'Get list of validators', action: 'Get validators' },
      { name: 'Get Validator Info', value: 'getValidatorInfo', description: 'Get specific validator info', action: 'Get validator info' },
      { name: 'Get Active Validators', value: 'getActiveValidators', description: 'Get active validators', action: 'Get active validators' },
      { name: 'Delegate SEI', value: 'delegate', description: 'Delegate SEI to a validator', action: 'Delegate SEI' },
      { name: 'Undelegate SEI', value: 'undelegate', description: 'Undelegate SEI from a validator', action: 'Undelegate SEI' },
      { name: 'Redelegate SEI', value: 'redelegate', description: 'Move delegation to another validator', action: 'Redelegate SEI' },
      { name: 'Get Delegations', value: 'getDelegations', description: 'Get delegations for an address', action: 'Get delegations' },
      { name: 'Get Staking Pool', value: 'getStakingPool', description: 'Get staking pool info', action: 'Get staking pool' },
      { name: 'Get Staking Params', value: 'getStakingParams', description: 'Get staking parameters', action: 'Get staking params' },
    ],
    default: 'getValidators',
  },
];

export const stakingFields: INodeProperties[] = [
  {
    displayName: 'Validator Address',
    name: 'validatorAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'seivaloper1...',
    displayOptions: { show: { resource: ['staking'], operation: ['getValidatorInfo', 'delegate', 'undelegate'] } },
  },
  {
    displayName: 'Delegator Address',
    name: 'delegatorAddress',
    type: 'string',
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['staking'], operation: ['getDelegations'] } },
  },
  {
    displayName: 'Amount (SEI)',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    placeholder: '100',
    displayOptions: { show: { resource: ['staking'], operation: ['delegate', 'undelegate', 'redelegate'] } },
  },
  {
    displayName: 'Source Validator',
    name: 'srcValidatorAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'seivaloper1...',
    displayOptions: { show: { resource: ['staking'], operation: ['redelegate'] } },
  },
  {
    displayName: 'Destination Validator',
    name: 'dstValidatorAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'seivaloper1...',
    displayOptions: { show: { resource: ['staking'], operation: ['redelegate'] } },
  },
  {
    displayName: 'Status Filter',
    name: 'statusFilter',
    type: 'options',
    options: [
      { name: 'All', value: '' },
      { name: 'Bonded', value: 'BOND_STATUS_BONDED' },
      { name: 'Unbonding', value: 'BOND_STATUS_UNBONDING' },
      { name: 'Unbonded', value: 'BOND_STATUS_UNBONDED' },
    ],
    default: '',
    displayOptions: { show: { resource: ['staking'], operation: ['getValidators'] } },
  },
];
