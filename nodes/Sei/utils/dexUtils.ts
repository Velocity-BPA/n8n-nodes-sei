/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { OrderSide, OrderType, TimeInForce, DEX_CONSTANTS } from '../constants/markets';

/**
 * DEX Utilities for Sei Native Order Book
 *
 * Sei has a native DEX built into the chain with parallel order matching.
 */

/**
 * Order input interface
 */
export interface OrderInput {
  price: string;
  quantity: string;
  side: OrderSide;
  orderType: OrderType;
  timeInForce?: TimeInForce;
}

/**
 * Formatted order for chain submission
 */
export interface FormattedOrder {
  price: string;
  quantity: string;
  priceDenom: string;
  assetDenom: string;
  positionDirection: string;
  orderType: string;
  data: string;
}

/**
 * Orderbook entry
 */
export interface OrderbookEntry {
  price: string;
  quantity: string;
}

/**
 * Orderbook structure
 */
export interface Orderbook {
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
  timestamp: number;
}

/**
 * Format price with proper precision
 */
export function formatPrice(price: string | number, decimals: number = 6): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return num.toFixed(decimals);
}

/**
 * Format quantity with proper precision
 */
export function formatQuantity(quantity: string | number, decimals: number = 6): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  return num.toFixed(decimals);
}

/**
 * Calculate order value (price * quantity)
 */
export function calculateOrderValue(price: string, quantity: string): string {
  const priceNum = parseFloat(price);
  const quantityNum = parseFloat(quantity);
  return (priceNum * quantityNum).toFixed(6);
}

/**
 * Calculate price with slippage
 */
export function calculatePriceWithSlippage(
  price: string,
  slippageBps: number,
  side: OrderSide,
): string {
  const priceNum = parseFloat(price);
  const slippageFactor = slippageBps / 10000;

  if (side === OrderSide.BUY) {
    // For buys, allow higher price
    return (priceNum * (1 + slippageFactor)).toFixed(6);
  } else {
    // For sells, allow lower price
    return (priceNum * (1 - slippageFactor)).toFixed(6);
  }
}

/**
 * Validate slippage is within acceptable range
 */
export function validateSlippage(slippageBps: number): boolean {
  return slippageBps >= 0 && slippageBps <= DEX_CONSTANTS.MAX_SLIPPAGE_BPS;
}

/**
 * Format order for DEX submission
 */
export function formatOrderForSubmission(
  order: OrderInput,
  priceDenom: string,
  assetDenom: string,
): FormattedOrder {
  return {
    price: order.price,
    quantity: order.quantity,
    priceDenom,
    assetDenom,
    positionDirection: order.side,
    orderType: order.orderType,
    data: '', // Custom data field
  };
}

/**
 * Calculate mid price from orderbook
 */
export function calculateMidPrice(orderbook: Orderbook): string | null {
  if (orderbook.bids.length === 0 || orderbook.asks.length === 0) {
    return null;
  }

  const bestBid = orderbook.bids[0];
  const bestAsk = orderbook.asks[0];

  if (!bestBid || !bestAsk) {
    return null;
  }

  const bid = parseFloat(bestBid.price);
  const ask = parseFloat(bestAsk.price);

  return ((bid + ask) / 2).toFixed(6);
}

/**
 * Calculate spread from orderbook
 */
export function calculateSpread(orderbook: Orderbook): {
  absolute: string;
  percentage: string;
} | null {
  if (orderbook.bids.length === 0 || orderbook.asks.length === 0) {
    return null;
  }

  const bestBid = orderbook.bids[0];
  const bestAsk = orderbook.asks[0];

  if (!bestBid || !bestAsk) {
    return null;
  }

  const bid = parseFloat(bestBid.price);
  const ask = parseFloat(bestAsk.price);

  const absolute = ask - bid;
  const midPrice = (bid + ask) / 2;
  const percentage = midPrice > 0 ? (absolute / midPrice) * 100 : 0;

  return {
    absolute: absolute.toFixed(6),
    percentage: percentage.toFixed(4),
  };
}

/**
 * Calculate total depth at price level
 */
export function calculateDepthAtPrice(
  entries: OrderbookEntry[],
  priceLimit: string,
  side: 'bid' | 'ask',
): string {
  const limit = parseFloat(priceLimit);
  let totalQuantity = 0;

  for (const entry of entries) {
    const price = parseFloat(entry.price);
    const quantity = parseFloat(entry.quantity);

    if (side === 'bid' && price >= limit) {
      totalQuantity += quantity;
    } else if (side === 'ask' && price <= limit) {
      totalQuantity += quantity;
    }
  }

  return totalQuantity.toFixed(6);
}

/**
 * Calculate average fill price for a given quantity
 */
export function calculateAverageFillPrice(
  entries: OrderbookEntry[],
  quantity: string,
): { averagePrice: string; filledQuantity: string; remainingQuantity: string } {
  const targetQuantity = parseFloat(quantity);
  let filledQuantity = 0;
  let totalValue = 0;

  for (const entry of entries) {
    const price = parseFloat(entry.price);
    const availableQuantity = parseFloat(entry.quantity);
    const remainingNeed = targetQuantity - filledQuantity;

    if (remainingNeed <= 0) break;

    const fillAmount = Math.min(availableQuantity, remainingNeed);
    filledQuantity += fillAmount;
    totalValue += fillAmount * price;
  }

  const averagePrice = filledQuantity > 0 ? totalValue / filledQuantity : 0;
  const remainingQuantity = Math.max(0, targetQuantity - filledQuantity);

  return {
    averagePrice: averagePrice.toFixed(6),
    filledQuantity: filledQuantity.toFixed(6),
    remainingQuantity: remainingQuantity.toFixed(6),
  };
}

/**
 * Validate order parameters
 */
export function validateOrderParams(order: OrderInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate price
  const price = parseFloat(order.price);
  if (isNaN(price) || price <= 0) {
    errors.push('Price must be a positive number');
  }

  // Validate quantity
  const quantity = parseFloat(order.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }

  // Validate order type
  if (!Object.values(OrderType).includes(order.orderType)) {
    errors.push(`Invalid order type: ${order.orderType}`);
  }

  // Validate side
  if (!Object.values(OrderSide).includes(order.side)) {
    errors.push(`Invalid order side: ${order.side}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse order ID from transaction result
 */
export function parseOrderId(txResult: { events?: Array<{ attributes?: Array<{ key: string; value: string }> }> }): string | null {
  if (!txResult.events) return null;

  for (const event of txResult.events) {
    if (!event.attributes) continue;

    for (const attr of event.attributes) {
      if (attr.key === 'order_id') {
        return attr.value;
      }
    }
  }

  return null;
}

/**
 * Format trade for display
 */
export interface Trade {
  price: string;
  quantity: string;
  side: OrderSide;
  timestamp: number;
}

export function formatTrade(trade: Trade): string {
  const side = trade.side === OrderSide.BUY ? '🟢 BUY' : '🔴 SELL';
  return `${side} ${trade.quantity} @ ${trade.price}`;
}

/**
 * Calculate VWAP (Volume Weighted Average Price)
 */
export function calculateVWAP(trades: Trade[]): string {
  if (trades.length === 0) return '0';

  let totalValue = 0;
  let totalVolume = 0;

  for (const trade of trades) {
    const price = parseFloat(trade.price);
    const quantity = parseFloat(trade.quantity);
    totalValue += price * quantity;
    totalVolume += quantity;
  }

  return totalVolume > 0 ? (totalValue / totalVolume).toFixed(6) : '0';
}
