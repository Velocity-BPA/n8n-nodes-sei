/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Sei Token Denominations
 *
 * SEI uses micro-units (usei) as the base unit.
 * 1 SEI = 1,000,000 usei (10^6)
 */

export interface TokenDenom {
  denom: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  coinGeckoId?: string;
  logoUri?: string;
}

/**
 * Native SEI token
 */
export const SEI_NATIVE: TokenDenom = {
  denom: 'usei',
  symbol: 'SEI',
  name: 'Sei',
  decimals: 6,
  isNative: true,
  coinGeckoId: 'sei-network',
};

/**
 * Common token denominations on Sei
 */
export const COMMON_DENOMS: Record<string, TokenDenom> = {
  sei: SEI_NATIVE,
  usei: SEI_NATIVE,
};

/**
 * IBC denoms (common bridged tokens)
 */
export const IBC_DENOMS: Record<string, TokenDenom> = {
  // USDC from Noble
  'ibc/CA6FBFAF399474A06263E10D0CE5AEBBE15189D6D4B2DD9ADE61007E68EB9DB0': {
    denom: 'ibc/CA6FBFAF399474A06263E10D0CE5AEBBE15189D6D4B2DD9ADE61007E68EB9DB0',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    isNative: false,
    coinGeckoId: 'usd-coin',
  },
  // ATOM from Cosmos Hub
  'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': {
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    symbol: 'ATOM',
    name: 'Cosmos Hub',
    decimals: 6,
    isNative: false,
    coinGeckoId: 'cosmos',
  },
  // OSMO from Osmosis
  'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518': {
    denom: 'ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518',
    symbol: 'OSMO',
    name: 'Osmosis',
    decimals: 6,
    isNative: false,
    coinGeckoId: 'osmosis',
  },
};

/**
 * Factory denoms prefix
 */
export const FACTORY_DENOM_PREFIX = 'factory/';

/**
 * Token type prefixes on Sei
 */
export const TOKEN_PREFIXES = {
  native: 'usei',
  ibc: 'ibc/',
  factory: 'factory/',
  cw20: 'cw20:',
  erc20: 'erc20:',
};

/**
 * Unit conversion constants
 */
export const UNIT_CONVERSION = {
  SEI_TO_USEI: 1_000_000,
  USEI_TO_SEI: 0.000001,
  WEI_TO_SEI: 1e-18,
  SEI_TO_WEI: 1e18,
};

/**
 * Convert SEI to usei
 */
export function seiToUsei(sei: number | string): string {
  const amount = typeof sei === 'string' ? parseFloat(sei) : sei;
  return Math.floor(amount * UNIT_CONVERSION.SEI_TO_USEI).toString();
}

/**
 * Convert usei to SEI
 */
export function useiToSei(usei: number | string): string {
  const amount = typeof usei === 'string' ? parseFloat(usei) : usei;
  return (amount * UNIT_CONVERSION.USEI_TO_SEI).toFixed(6);
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(
  amount: string | number,
  decimals: number,
  symbol?: string,
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = (num / Math.pow(10, decimals)).toFixed(decimals);
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Parse token amount to base units
 */
export function parseTokenAmount(amount: string | number, decimals: number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(num * Math.pow(10, decimals)).toString();
}

/**
 * Check if a denom is an IBC denom
 */
export function isIbcDenom(denom: string): boolean {
  return denom.startsWith('ibc/');
}

/**
 * Check if a denom is a factory denom
 */
export function isFactoryDenom(denom: string): boolean {
  return denom.startsWith('factory/');
}

/**
 * Check if a denom is the native SEI token
 */
export function isNativeSei(denom: string): boolean {
  return denom === 'usei' || denom === 'sei';
}
