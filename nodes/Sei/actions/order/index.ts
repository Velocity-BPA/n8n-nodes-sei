/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const orderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['order'] } },
    options: [
      { name: 'Place Limit Order', value: 'placeLimitOrder', description: 'Place a limit order', action: 'Place limit order' },
      { name: 'Place Market Order', value: 'placeMarketOrder', description: 'Place a market order', action: 'Place market order' },
      { name: 'Cancel Order', value: 'cancelOrder', description: 'Cancel an existing order', action: 'Cancel order' },
      { name: 'Cancel All Orders', value: 'cancelAllOrders', description: 'Cancel all orders for a market', action: 'Cancel all orders' },
      { name: 'Get Order', value: 'getOrder', description: 'Get order by ID', action: 'Get order' },
      { name: 'Get Orders by Account', value: 'getOrdersByAccount', description: 'Get all orders for an account', action: 'Get orders by account' },
      { name: 'Get Open Orders', value: 'getOpenOrders', description: 'Get open orders', action: 'Get open orders' },
      { name: 'Batch Place Orders', value: 'batchPlaceOrders', description: 'Place multiple orders', action: 'Batch place orders' },
      { name: 'Batch Cancel Orders', value: 'batchCancelOrders', description: 'Cancel multiple orders', action: 'Batch cancel orders' },
    ],
    default: 'getOpenOrders',
  },
];

export const orderFields: INodeProperties[] = [
  {
    displayName: 'Contract Address',
    name: 'contractAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'sei1...',
    displayOptions: { show: { resource: ['order'], operation: ['placeLimitOrder', 'placeMarketOrder', 'cancelOrder', 'cancelAllOrders', 'getOrder', 'getOrdersByAccount', 'getOpenOrders'] } },
  },
  {
    displayName: 'Price',
    name: 'price',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1.5',
    displayOptions: { show: { resource: ['order'], operation: ['placeLimitOrder'] } },
  },
  {
    displayName: 'Quantity',
    name: 'quantity',
    type: 'string',
    required: true,
    default: '',
    placeholder: '100',
    displayOptions: { show: { resource: ['order'], operation: ['placeLimitOrder', 'placeMarketOrder'] } },
  },
  {
    displayName: 'Side',
    name: 'side',
    type: 'options',
    options: [
      { name: 'Buy', value: 'Buy' },
      { name: 'Sell', value: 'Sell' },
    ],
    default: 'Buy',
    displayOptions: { show: { resource: ['order'], operation: ['placeLimitOrder', 'placeMarketOrder'] } },
  },
  {
    displayName: 'Order ID',
    name: 'orderId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['order'], operation: ['cancelOrder', 'getOrder'] } },
  },
  {
    displayName: 'Price Denom',
    name: 'priceDenom',
    type: 'string',
    default: 'usei',
    displayOptions: { show: { resource: ['order'], operation: ['placeLimitOrder', 'placeMarketOrder', 'cancelOrder', 'cancelAllOrders'] } },
  },
  {
    displayName: 'Asset Denom',
    name: 'assetDenom',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['order'], operation: ['placeLimitOrder', 'placeMarketOrder', 'cancelOrder', 'cancelAllOrders'] } },
  },
];
