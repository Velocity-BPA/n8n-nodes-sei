/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const dexOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['dex'] } },
    options: [
      { name: 'Get Markets', value: 'getMarkets', description: 'Get available trading markets', action: 'Get markets' },
      { name: 'Get Orderbook', value: 'getOrderbook', description: 'Get orderbook for a market', action: 'Get orderbook' },
      { name: 'Get Price', value: 'getPrice', description: 'Get current price', action: 'Get price' },
      { name: 'Get Mid Price', value: 'getMidPrice', description: 'Get mid price from orderbook', action: 'Get mid price' },
      { name: 'Get Spread', value: 'getSpread', description: 'Get bid-ask spread', action: 'Get spread' },
      { name: 'Get Trade History', value: 'getTradeHistory', description: 'Get recent trades', action: 'Get trade history' },
      { name: 'Get 24h Volume', value: 'get24hVolume', description: 'Get 24-hour trading volume', action: 'Get 24h volume' },
      { name: 'Get Market Stats', value: 'getMarketStats', description: 'Get market statistics', action: 'Get market stats' },
    ],
    default: 'getMarkets',
  },
];

export const dexFields: INodeProperties[] = [
  {
    displayName: 'Contract Address',
    name: 'contractAddress',
    type: 'string',
    default: '',
    placeholder: 'sei1...',
    description: 'DEX contract address',
    displayOptions: { show: { resource: ['dex'], operation: ['getOrderbook', 'getPrice', 'getMidPrice', 'getSpread', 'getTradeHistory', 'get24hVolume', 'getMarketStats'] } },
  },
  {
    displayName: 'Price Denom',
    name: 'priceDenom',
    type: 'string',
    default: 'usei',
    description: 'Quote token denomination',
    displayOptions: { show: { resource: ['dex'], operation: ['getOrderbook', 'getPrice', 'getMidPrice', 'getSpread'] } },
  },
  {
    displayName: 'Asset Denom',
    name: 'assetDenom',
    type: 'string',
    default: '',
    description: 'Base token denomination',
    displayOptions: { show: { resource: ['dex'], operation: ['getOrderbook', 'getPrice', 'getMidPrice', 'getSpread'] } },
  },
];
