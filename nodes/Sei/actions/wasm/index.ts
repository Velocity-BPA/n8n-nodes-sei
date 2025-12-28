/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const wasmOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['wasm'] } },
    options: [
      { name: 'Get Contract Info', value: 'getContractInfo', description: 'Get contract information', action: 'Get contract info' },
      { name: 'Query Contract', value: 'queryContract', description: 'Query contract state', action: 'Query contract' },
      { name: 'Execute Contract', value: 'executeContract', description: 'Execute contract method', action: 'Execute contract' },
      { name: 'Instantiate Contract', value: 'instantiateContract', description: 'Create new contract instance', action: 'Instantiate contract' },
      { name: 'Get Code Info', value: 'getCodeInfo', description: 'Get code information', action: 'Get code info' },
      { name: 'Get Codes', value: 'getCodes', description: 'Get all uploaded codes', action: 'Get codes' },
      { name: 'Get Contracts by Code', value: 'getContractsByCode', description: 'Get contracts by code ID', action: 'Get contracts by code' },
    ],
    default: 'getContractInfo',
  },
];

export const wasmFields: INodeProperties[] = [
  {
    displayName: 'Contract Address',
    name: 'contractAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['wasm'], operation: ['getContractInfo', 'queryContract', 'executeContract'] } },
  },
  {
    displayName: 'Query Message (JSON)',
    name: 'queryMsg',
    type: 'json',
    required: true,
    default: '{}',
    placeholder: '{"get_config": {}}',
    displayOptions: { show: { resource: ['wasm'], operation: ['queryContract'] } },
  },
  {
    displayName: 'Execute Message (JSON)',
    name: 'executeMsg',
    type: 'json',
    required: true,
    default: '{}',
    placeholder: '{"transfer": {"recipient": "sei1...", "amount": "1000"}}',
    displayOptions: { show: { resource: ['wasm'], operation: ['executeContract'] } },
  },
  {
    displayName: 'Funds to Send',
    name: 'funds',
    type: 'json',
    default: '[]',
    placeholder: '[{"denom": "usei", "amount": "1000000"}]',
    displayOptions: { show: { resource: ['wasm'], operation: ['executeContract', 'instantiateContract'] } },
  },
  {
    displayName: 'Code ID',
    name: 'codeId',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: { show: { resource: ['wasm'], operation: ['getCodeInfo', 'getContractsByCode', 'instantiateContract'] } },
  },
  {
    displayName: 'Init Message (JSON)',
    name: 'initMsg',
    type: 'json',
    required: true,
    default: '{}',
    displayOptions: { show: { resource: ['wasm'], operation: ['instantiateContract'] } },
  },
  {
    displayName: 'Label',
    name: 'label',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'My Contract',
    displayOptions: { show: { resource: ['wasm'], operation: ['instantiateContract'] } },
  },
  {
    displayName: 'Admin Address',
    name: 'admin',
    type: 'string',
    default: '',
    placeholder: 'sei1... (optional)',
    displayOptions: { show: { resource: ['wasm'], operation: ['instantiateContract'] } },
  },
];
