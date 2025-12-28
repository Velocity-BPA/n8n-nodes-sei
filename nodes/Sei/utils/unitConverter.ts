/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';

/**
 * Unit Converter Utilities for Sei
 *
 * Sei has multiple unit systems:
 * - Native Cosmos: usei (micro-sei, 10^-6)
 * - EVM: wei (10^-18)
 */

/**
 * Decimal precision for different units
 */
export const UNIT_DECIMALS = {
  SEI: 6, // Native Sei decimals
  USEI: 0, // Base unit (1 usei)
  WEI: 18, // EVM decimals
  GWEI: 9, // Gas price unit
};

/**
 * Conversion ratios
 */
export const CONVERSION_RATIOS = {
  SEI_TO_USEI: BigInt(1_000_000),
  WEI_TO_SEI: BigInt(10) ** BigInt(12), // 10^18 / 10^6 = 10^12
  GWEI_TO_WEI: BigInt(1_000_000_000),
};

/**
 * Convert SEI to usei
 */
export function seiToUsei(sei: string | number): string {
  const amount = typeof sei === 'string' ? parseFloat(sei) : sei;
  return Math.floor(amount * Number(CONVERSION_RATIOS.SEI_TO_USEI)).toString();
}

/**
 * Convert usei to SEI
 */
export function useiToSei(usei: string | number): string {
  const amount = typeof usei === 'string' ? BigInt(usei) : BigInt(Math.floor(usei));
  const sei = Number(amount) / Number(CONVERSION_RATIOS.SEI_TO_USEI);
  return sei.toFixed(6);
}

/**
 * Convert SEI to wei (for EVM operations)
 */
export function seiToWei(sei: string | number): string {
  return ethers.parseEther(sei.toString()).toString();
}

/**
 * Convert wei to SEI
 */
export function weiToSei(wei: string | number): string {
  return ethers.formatEther(wei.toString());
}

/**
 * Convert usei to wei
 */
export function useiToWei(usei: string | number): string {
  const useiAmount = typeof usei === 'string' ? BigInt(usei) : BigInt(Math.floor(usei));
  const weiAmount = useiAmount * CONVERSION_RATIOS.WEI_TO_SEI;
  return weiAmount.toString();
}

/**
 * Convert wei to usei
 */
export function weiToUsei(wei: string | number): string {
  const weiAmount = typeof wei === 'string' ? BigInt(wei) : BigInt(Math.floor(wei));
  const useiAmount = weiAmount / CONVERSION_RATIOS.WEI_TO_SEI;
  return useiAmount.toString();
}

/**
 * Convert Gwei to wei
 */
export function gweiToWei(gwei: string | number): string {
  return ethers.parseUnits(gwei.toString(), 'gwei').toString();
}

/**
 * Convert wei to Gwei
 */
export function weiToGwei(wei: string | number): string {
  return ethers.formatUnits(wei.toString(), 'gwei');
}

/**
 * Format amount with decimals
 */
export function formatAmount(
  amount: string | number | bigint,
  decimals: number,
  displayDecimals: number = 6,
): string {
  let amountBigInt: bigint;

  if (typeof amount === 'bigint') {
    amountBigInt = amount;
  } else if (typeof amount === 'string') {
    amountBigInt = BigInt(amount);
  } else {
    amountBigInt = BigInt(Math.floor(amount));
  }

  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const truncatedFractional = fractionalStr.slice(0, displayDecimals);

  // Remove trailing zeros
  const cleanFractional = truncatedFractional.replace(/0+$/, '');

  if (cleanFractional) {
    return `${wholePart}.${cleanFractional}`;
  }
  return wholePart.toString();
}

/**
 * Parse amount from human-readable to base units
 */
export function parseAmount(amount: string | number, decimals: number): string {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;

  // Handle scientific notation
  const normalizedAmount = Number(amountStr).toFixed(decimals);

  const [whole, fractional = ''] = normalizedAmount.split('.');
  const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);

  const combined = whole + paddedFractional;
  // Remove leading zeros but keep at least one digit
  return combined.replace(/^0+/, '') || '0';
}

/**
 * Format token balance with symbol
 */
export function formatBalance(
  amount: string | number | bigint,
  decimals: number,
  symbol: string,
  displayDecimals: number = 6,
): string {
  const formatted = formatAmount(amount, decimals, displayDecimals);
  return `${formatted} ${symbol}`;
}

/**
 * Compare two amounts
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareAmounts(a: string, b: string): number {
  const aBigInt = BigInt(a);
  const bBigInt = BigInt(b);

  if (aBigInt < bBigInt) return -1;
  if (aBigInt > bBigInt) return 1;
  return 0;
}

/**
 * Add two amounts
 */
export function addAmounts(a: string, b: string): string {
  return (BigInt(a) + BigInt(b)).toString();
}

/**
 * Subtract two amounts (returns '0' if result would be negative)
 */
export function subtractAmounts(a: string, b: string): string {
  const result = BigInt(a) - BigInt(b);
  return result >= BigInt(0) ? result.toString() : '0';
}

/**
 * Multiply amount by percentage (basis points)
 * 100 bps = 1%
 */
export function multiplyByBps(amount: string, bps: number): string {
  const amountBigInt = BigInt(amount);
  return ((amountBigInt * BigInt(bps)) / BigInt(10000)).toString();
}

/**
 * Calculate percentage of amount
 */
export function percentageOf(amount: string, percentage: number): string {
  const amountBigInt = BigInt(amount);
  const percentageBps = Math.floor(percentage * 100);
  return ((amountBigInt * BigInt(percentageBps)) / BigInt(10000)).toString();
}

/**
 * Validate amount string
 */
export function isValidAmount(amount: string): boolean {
  try {
    const bigInt = BigInt(amount);
    return bigInt >= BigInt(0);
  } catch {
    return false;
  }
}

/**
 * Convert between any two units with different decimals
 */
export function convertUnits(
  amount: string,
  fromDecimals: number,
  toDecimals: number,
): string {
  const amountBigInt = BigInt(amount);

  if (fromDecimals === toDecimals) {
    return amount;
  }

  if (fromDecimals > toDecimals) {
    // Divide to reduce precision
    const divisor = BigInt(10) ** BigInt(fromDecimals - toDecimals);
    return (amountBigInt / divisor).toString();
  } else {
    // Multiply to increase precision
    const multiplier = BigInt(10) ** BigInt(toDecimals - fromDecimals);
    return (amountBigInt * multiplier).toString();
  }
}
