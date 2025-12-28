/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Sei Native DEX Markets Configuration
 *
 * Sei has a native order book DEX built into the chain,
 * allowing for high-performance trading with parallel execution.
 */

export interface DexMarket {
  contractAddress: string;
  baseDenom: string;
  quoteDenom: string;
  baseSymbol: string;
  quoteSymbol: string;
  tickSize: string;
  minQuantity: string;
  priceDecimals: number;
  quantityDecimals: number;
}

/**
 * Order side enum
 */
export enum OrderSide {
  BUY = 'Buy',
  SELL = 'Sell',
}

/**
 * Order type enum
 */
export enum OrderType {
  LIMIT = 'Limit',
  MARKET = 'Market',
  STOP_LOSS = 'StopLoss',
  STOP_LIMIT = 'StopLimit',
}

/**
 * Order status enum
 */
export enum OrderStatus {
  OPEN = 'Open',
  PARTIAL_FILLED = 'PartialFilled',
  FILLED = 'Filled',
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired',
}

/**
 * Position effect for orders
 */
export enum PositionEffect {
  OPEN = 'Open',
  CLOSE = 'Close',
}

/**
 * Time in force options
 */
export enum TimeInForce {
  GTC = 'GTC', // Good Till Cancelled
  IOC = 'IOC', // Immediate Or Cancel
  FOK = 'FOK', // Fill Or Kill
  GTT = 'GTT', // Good Till Time
}

/**
 * DEX module constants
 */
export const DEX_CONSTANTS = {
  // Maximum orders per batch
  MAX_ORDERS_PER_BATCH: 100,

  // Default slippage tolerance (0.5%)
  DEFAULT_SLIPPAGE_BPS: 50,

  // Maximum slippage allowed (10%)
  MAX_SLIPPAGE_BPS: 1000,

  // Order expiry (blocks)
  DEFAULT_ORDER_EXPIRY_BLOCKS: 100000,

  // Minimum order value in usei
  MIN_ORDER_VALUE_USEI: '1000000',
};

/**
 * DEX message types
 */
export const DEX_MSG_TYPES = {
  PLACE_ORDERS: '/seiprotocol.seichain.dex.MsgPlaceOrders',
  CANCEL_ORDERS: '/seiprotocol.seichain.dex.MsgCancelOrders',
  REGISTER_CONTRACT: '/seiprotocol.seichain.dex.MsgRegisterContract',
  UPDATE_PRICE_TICK_SIZE: '/seiprotocol.seichain.dex.MsgUpdatePriceTickSize',
  UPDATE_QUANTITY_TICK_SIZE: '/seiprotocol.seichain.dex.MsgUpdateQuantityTickSize',
};

/**
 * DEX query endpoints
 */
export const DEX_QUERY_ENDPOINTS = {
  GET_ORDER: '/sei-protocol/seichain/dex/get_order',
  GET_ORDERS: '/sei-protocol/seichain/dex/get_orders',
  GET_MARKET_SUMMARY: '/sei-protocol/seichain/dex/get_market_summary',
  GET_ORDERBOOK: '/sei-protocol/seichain/dex/get_order_book',
  GET_PRICE: '/sei-protocol/seichain/dex/get_price',
  GET_TWAP: '/sei-protocol/seichain/dex/get_twap',
  GET_ASSET_LIST: '/sei-protocol/seichain/dex/asset_list',
  GET_REGISTERED_PAIRS: '/sei-protocol/seichain/dex/registered_pairs',
};

/**
 * Order direction options for n8n
 */
export const ORDER_DIRECTION_OPTIONS = [
  { name: 'Buy', value: 'Buy' },
  { name: 'Sell', value: 'Sell' },
];

/**
 * Order type options for n8n
 */
export const ORDER_TYPE_OPTIONS = [
  { name: 'Limit', value: 'Limit' },
  { name: 'Market', value: 'Market' },
];

/**
 * Time in force options for n8n
 */
export const TIME_IN_FORCE_OPTIONS = [
  { name: 'Good Till Cancelled (GTC)', value: 'GTC' },
  { name: 'Immediate Or Cancel (IOC)', value: 'IOC' },
  { name: 'Fill Or Kill (FOK)', value: 'FOK' },
];

/**
 * Calculate slippage amount
 */
export function calculateSlippage(
  price: string,
  slippageBps: number,
  side: OrderSide,
): string {
  const priceNum = parseFloat(price);
  const slippageFactor = slippageBps / 10000;

  if (side === OrderSide.BUY) {
    // For buys, increase the price
    return (priceNum * (1 + slippageFactor)).toString();
  } else {
    // For sells, decrease the price
    return (priceNum * (1 - slippageFactor)).toString();
  }
}

/**
 * Format order for DEX submission
 */
export interface DexOrder {
  price: string;
  quantity: string;
  priceDenom: string;
  assetDenom: string;
  orderType: OrderType;
  positionDirection: OrderSide;
  data: string;
  statusDescription: string;
  nominal: string;
}
