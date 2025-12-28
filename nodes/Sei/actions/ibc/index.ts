/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const ibcOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['ibc'] } },
    options: [
      { name: 'IBC Transfer', value: 'ibcTransfer', description: 'Transfer tokens via IBC', action: 'IBC transfer' },
      { name: 'Get IBC Channels', value: 'getIbcChannels', description: 'Get all IBC channels', action: 'Get IBC channels' },
      { name: 'Get IBC Connections', value: 'getIbcConnections', description: 'Get all IBC connections', action: 'Get IBC connections' },
      { name: 'Get Channel Info', value: 'getChannelInfo', description: 'Get channel information', action: 'Get channel info' },
      { name: 'Get Denom Trace', value: 'getDenomTrace', description: 'Get IBC denom trace', action: 'Get denom trace' },
      { name: 'Get IBC Params', value: 'getIbcParams', description: 'Get IBC parameters', action: 'Get IBC params' },
      { name: 'Get Escrow Address', value: 'getEscrowAddress', description: 'Get escrow address for channel', action: 'Get escrow address' },
    ],
    default: 'getIbcChannels',
  },
];

export const ibcFields: INodeProperties[] = [
  {
    displayName: 'Destination Chain',
    name: 'destinationChain',
    type: 'options',
    options: [
      { name: 'Osmosis', value: 'osmosis' },
      { name: 'Cosmos Hub', value: 'cosmosHub' },
      { name: 'Noble (USDC)', value: 'noble' },
      { name: 'Axelar', value: 'axelar' },
      { name: 'Custom Channel', value: 'custom' },
    ],
    default: 'osmosis',
    displayOptions: { show: { resource: ['ibc'], operation: ['ibcTransfer'] } },
  },
  {
    displayName: 'Channel ID',
    name: 'channelId',
    type: 'string',
    default: '',
    placeholder: 'channel-0',
    displayOptions: { show: { resource: ['ibc'], operation: ['ibcTransfer', 'getChannelInfo', 'getEscrowAddress'], destinationChain: ['custom'] } },
  },
  {
    displayName: 'Recipient Address',
    name: 'recipient',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'osmo1... or cosmos1...',
    displayOptions: { show: { resource: ['ibc'], operation: ['ibcTransfer'] } },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1000000',
    displayOptions: { show: { resource: ['ibc'], operation: ['ibcTransfer'] } },
  },
  {
    displayName: 'Token Denom',
    name: 'denom',
    type: 'string',
    default: 'usei',
    displayOptions: { show: { resource: ['ibc'], operation: ['ibcTransfer'] } },
  },
  {
    displayName: 'IBC Denom Hash',
    name: 'denomHash',
    type: 'string',
    default: '',
    placeholder: 'ibc/...',
    displayOptions: { show: { resource: ['ibc'], operation: ['getDenomTrace'] } },
  },
  {
    displayName: 'Port ID',
    name: 'portId',
    type: 'string',
    default: 'transfer',
    displayOptions: { show: { resource: ['ibc'], operation: ['getChannelInfo', 'getEscrowAddress'] } },
  },
];
