/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Sei Oracle Module Configuration
 *
 * The Oracle module on Sei provides decentralized price feeds
 * from validators. It's used for accurate pricing in the native DEX
 * and other DeFi applications.
 */

export interface OracleDenom {
  denom: string;
  symbol: string;
  name: string;
}

/**
 * Oracle denoms supported on Sei
 */
export const ORACLE_DENOMS: OracleDenom[] = [
  { denom: 'usei', symbol: 'SEI', name: 'Sei' },
  { denom: 'uusdc', symbol: 'USDC', name: 'USD Coin' },
  { denom: 'uatom', symbol: 'ATOM', name: 'Cosmos Hub' },
  { denom: 'ueth', symbol: 'ETH', name: 'Ethereum' },
  { denom: 'ubtc', symbol: 'BTC', name: 'Bitcoin' },
];

/**
 * Oracle query endpoints
 */
export const ORACLE_QUERY_ENDPOINTS = {
  EXCHANGE_RATE: '/sei-protocol/seichain/oracle/denoms/exchange_rate',
  EXCHANGE_RATES: '/sei-protocol/seichain/oracle/denoms/exchange_rates',
  ACTIVES: '/sei-protocol/seichain/oracle/denoms/actives',
  VOTE_TARGETS: '/sei-protocol/seichain/oracle/denoms/vote_targets',
  FEEDER_DELEGATION: '/sei-protocol/seichain/oracle/validators/{validator}/feeder',
  MISS_COUNTER: '/sei-protocol/seichain/oracle/validators/{validator}/miss',
  AGGREGATE_PREVOTE: '/sei-protocol/seichain/oracle/validators/{validator}/aggregate_prevote',
  AGGREGATE_VOTE: '/sei-protocol/seichain/oracle/validators/{validator}/aggregate_vote',
  PARAMS: '/sei-protocol/seichain/oracle/params',
  TWAP: '/sei-protocol/seichain/oracle/denoms/twap',
};

/**
 * Oracle message types
 */
export const ORACLE_MSG_TYPES = {
  AGGREGATE_EXCHANGE_RATE_PREVOTE:
    '/seiprotocol.seichain.oracle.MsgAggregateExchangeRatePrevote',
  AGGREGATE_EXCHANGE_RATE_VOTE:
    '/seiprotocol.seichain.oracle.MsgAggregateExchangeRateVote',
  DELEGATE_FEED_CONSENT: '/seiprotocol.seichain.oracle.MsgDelegateFeedConsent',
};

/**
 * Oracle parameters
 */
export const ORACLE_PARAMS = {
  // Vote period in blocks
  VOTE_PERIOD: 1,

  // Vote threshold (67%)
  VOTE_THRESHOLD: '0.67',

  // Reward band (2%)
  REWARD_BAND: '0.02',

  // Slash fraction (0.01%)
  SLASH_FRACTION: '0.0001',

  // Slash window (blocks)
  SLASH_WINDOW: 100800,

  // Min valid per window (5%)
  MIN_VALID_PER_WINDOW: '0.05',

  // Lookback duration (seconds)
  LOOKBACK_DURATION: 3600,
};

/**
 * TWAP window options (in seconds)
 */
export const TWAP_WINDOWS = {
  '5_MIN': 300,
  '15_MIN': 900,
  '1_HOUR': 3600,
  '4_HOUR': 14400,
  '24_HOUR': 86400,
};

/**
 * TWAP window options for n8n
 */
export const TWAP_WINDOW_OPTIONS = [
  { name: '5 Minutes', value: 300 },
  { name: '15 Minutes', value: 900 },
  { name: '1 Hour', value: 3600 },
  { name: '4 Hours', value: 14400 },
  { name: '24 Hours', value: 86400 },
  { name: 'Custom', value: 'custom' },
];

/**
 * Exchange rate interface
 */
export interface ExchangeRate {
  denom: string;
  exchangeRate: string;
}

/**
 * TWAP result interface
 */
export interface TwapResult {
  denom: string;
  twap: string;
  lookbackSeconds: number;
}

/**
 * Oracle vote interface
 */
export interface OracleVote {
  exchangeRateTuples: ExchangeRate[];
  voter: string;
}

/**
 * Format exchange rate for display
 */
export function formatExchangeRate(rate: string, decimals: number = 6): string {
  const num = parseFloat(rate);
  return num.toFixed(decimals);
}

/**
 * Calculate price change percentage
 */
export function calculatePriceChange(
  currentPrice: string,
  previousPrice: string,
): { change: string; percentage: string; direction: 'up' | 'down' | 'unchanged' } {
  const current = parseFloat(currentPrice);
  const previous = parseFloat(previousPrice);

  const change = current - previous;
  const percentage = previous !== 0 ? (change / previous) * 100 : 0;

  return {
    change: change.toFixed(6),
    percentage: percentage.toFixed(2),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged',
  };
}
