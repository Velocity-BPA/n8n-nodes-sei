/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const pointerOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['pointer'] } },
    options: [
      { name: 'Get CW20 Pointer', value: 'getCw20Pointer', description: 'Get ERC20 pointer for CW20 token', action: 'Get CW20 pointer' },
      { name: 'Get CW721 Pointer', value: 'getCw721Pointer', description: 'Get ERC721 pointer for CW721 token', action: 'Get CW721 pointer' },
      { name: 'Get ERC20 Pointer', value: 'getErc20Pointer', description: 'Get CW20 pointer for ERC20 token', action: 'Get ERC20 pointer' },
      { name: 'Get ERC721 Pointer', value: 'getErc721Pointer', description: 'Get CW721 pointer for ERC721 token', action: 'Get ERC721 pointer' },
      { name: 'Get Native Pointer', value: 'getNativePointer', description: 'Get pointer for native token', action: 'Get native pointer' },
      { name: 'Check Pointer Exists', value: 'checkPointerExists', description: 'Check if pointer exists', action: 'Check pointer exists' },
    ],
    default: 'getCw20Pointer',
  },
];

export const pointerFields: INodeProperties[] = [
  {
    displayName: 'CW20 Address',
    name: 'cw20Address',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['pointer'], operation: ['getCw20Pointer'] } },
  },
  {
    displayName: 'CW721 Address',
    name: 'cw721Address',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['pointer'], operation: ['getCw721Pointer'] } },
  },
  {
    displayName: 'ERC20 Address',
    name: 'erc20Address',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    displayOptions: { show: { resource: ['pointer'], operation: ['getErc20Pointer'] } },
  },
  {
    displayName: 'ERC721 Address',
    name: 'erc721Address',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    displayOptions: { show: { resource: ['pointer'], operation: ['getErc721Pointer'] } },
  },
  {
    displayName: 'Native Denom',
    name: 'nativeDenom',
    type: 'string',
    required: true,
    default: 'usei',
    displayOptions: { show: { resource: ['pointer'], operation: ['getNativePointer'] } },
  },
  {
    displayName: 'Address Type',
    name: 'addressType',
    type: 'options',
    options: [
      { name: 'CW20', value: 'cw20' },
      { name: 'CW721', value: 'cw721' },
      { name: 'ERC20', value: 'erc20' },
      { name: 'ERC721', value: 'erc721' },
      { name: 'Native', value: 'native' },
    ],
    default: 'cw20',
    displayOptions: { show: { resource: ['pointer'], operation: ['checkPointerExists'] } },
  },
  {
    displayName: 'Address/Denom',
    name: 'pointeeAddress',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['pointer'], operation: ['checkPointerExists'] } },
  },
];
