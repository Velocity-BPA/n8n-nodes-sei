/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { bech32 } from 'bech32';
import { ethers } from 'ethers';

/**
 * Sei Address Utilities
 *
 * Sei supports both Cosmos-style (bech32) addresses and EVM addresses.
 * There's a 1:1 mapping between Sei addresses (sei1...) and EVM addresses (0x...).
 */

const SEI_BECH32_PREFIX = 'sei';
const SEI_VALOPER_PREFIX = 'seivaloper';
const SEI_VALCONS_PREFIX = 'seivalcons';

/**
 * Address type enum
 */
export enum AddressType {
  SEI = 'sei',
  EVM = 'evm',
  VALOPER = 'valoper',
  VALCONS = 'valcons',
  UNKNOWN = 'unknown',
}

/**
 * Validate a Sei bech32 address
 */
export function isValidSeiAddress(address: string): boolean {
  try {
    if (!address.startsWith(SEI_BECH32_PREFIX)) {
      return false;
    }
    const decoded = bech32.decode(address);
    return decoded.prefix === SEI_BECH32_PREFIX && decoded.words.length > 0;
  } catch {
    return false;
  }
}

/**
 * Validate an EVM address
 */
export function isValidEvmAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validate a validator operator address
 */
export function isValidValoperAddress(address: string): boolean {
  try {
    if (!address.startsWith(SEI_VALOPER_PREFIX)) {
      return false;
    }
    const decoded = bech32.decode(address);
    return decoded.prefix === SEI_VALOPER_PREFIX;
  } catch {
    return false;
  }
}

/**
 * Validate a validator consensus address
 */
export function isValidValconsAddress(address: string): boolean {
  try {
    if (!address.startsWith(SEI_VALCONS_PREFIX)) {
      return false;
    }
    const decoded = bech32.decode(address);
    return decoded.prefix === SEI_VALCONS_PREFIX;
  } catch {
    return false;
  }
}

/**
 * Detect the type of address
 */
export function detectAddressType(address: string): AddressType {
  if (address.startsWith('0x') && isValidEvmAddress(address)) {
    return AddressType.EVM;
  }
  if (address.startsWith(SEI_VALOPER_PREFIX) && isValidValoperAddress(address)) {
    return AddressType.VALOPER;
  }
  if (address.startsWith(SEI_VALCONS_PREFIX) && isValidValconsAddress(address)) {
    return AddressType.VALCONS;
  }
  if (address.startsWith(SEI_BECH32_PREFIX) && isValidSeiAddress(address)) {
    return AddressType.SEI;
  }
  return AddressType.UNKNOWN;
}

/**
 * Convert Sei address to EVM address
 *
 * Note: This is a deterministic conversion but requires the actual
 * precompile query on-chain for accurate results. This function
 * provides a local approximation based on the bech32 encoding.
 */
export function seiToEvmAddress(seiAddress: string): string {
  if (!isValidSeiAddress(seiAddress)) {
    throw new Error(`Invalid Sei address: ${seiAddress}`);
  }

  try {
    const decoded = bech32.decode(seiAddress);
    const data = bech32.fromWords(decoded.words);
    const hex = Buffer.from(data).toString('hex');
    return ethers.getAddress('0x' + hex.padStart(40, '0'));
  } catch (error) {
    throw new Error(`Failed to convert Sei address to EVM: ${error}`);
  }
}

/**
 * Convert EVM address to Sei address
 *
 * Note: This is a deterministic conversion but requires the actual
 * precompile query on-chain for accurate results. This function
 * provides a local approximation based on the hex encoding.
 */
export function evmToSeiAddress(evmAddress: string): string {
  if (!isValidEvmAddress(evmAddress)) {
    throw new Error(`Invalid EVM address: ${evmAddress}`);
  }

  try {
    const cleanAddress = evmAddress.toLowerCase().replace('0x', '');
    const data = Buffer.from(cleanAddress, 'hex');
    const words = bech32.toWords(data);
    return bech32.encode(SEI_BECH32_PREFIX, words);
  } catch (error) {
    throw new Error(`Failed to convert EVM address to Sei: ${error}`);
  }
}

/**
 * Convert account address to validator operator address
 */
export function accountToValoperAddress(accountAddress: string): string {
  if (!isValidSeiAddress(accountAddress)) {
    throw new Error(`Invalid Sei account address: ${accountAddress}`);
  }

  try {
    const decoded = bech32.decode(accountAddress);
    return bech32.encode(SEI_VALOPER_PREFIX, decoded.words);
  } catch (error) {
    throw new Error(`Failed to convert to valoper address: ${error}`);
  }
}

/**
 * Convert validator operator address to account address
 */
export function valoperToAccountAddress(valoperAddress: string): string {
  if (!isValidValoperAddress(valoperAddress)) {
    throw new Error(`Invalid valoper address: ${valoperAddress}`);
  }

  try {
    const decoded = bech32.decode(valoperAddress);
    return bech32.encode(SEI_BECH32_PREFIX, decoded.words);
  } catch (error) {
    throw new Error(`Failed to convert to account address: ${error}`);
  }
}

/**
 * Validate any address type
 */
export function validateAddress(address: string, expectedType?: AddressType): boolean {
  const detectedType = detectAddressType(address);

  if (detectedType === AddressType.UNKNOWN) {
    return false;
  }

  if (expectedType && detectedType !== expectedType) {
    return false;
  }

  return true;
}

/**
 * Normalize an address (checksum for EVM, lowercase for Sei)
 */
export function normalizeAddress(address: string): string {
  const type = detectAddressType(address);

  switch (type) {
    case AddressType.EVM:
      return ethers.getAddress(address);
    case AddressType.SEI:
    case AddressType.VALOPER:
    case AddressType.VALCONS:
      return address.toLowerCase();
    default:
      return address;
  }
}

/**
 * Abbreviate an address for display
 */
export function abbreviateAddress(
  address: string,
  startChars: number = 8,
  endChars: number = 6,
): string {
  if (address.length <= startChars + endChars + 3) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Address validation result
 */
export interface AddressValidationResult {
  isValid: boolean;
  type: AddressType;
  normalized: string | null;
  error?: string;
}

/**
 * Comprehensive address validation
 */
export function validateAndNormalizeAddress(address: string): AddressValidationResult {
  try {
    const type = detectAddressType(address);

    if (type === AddressType.UNKNOWN) {
      return {
        isValid: false,
        type: AddressType.UNKNOWN,
        normalized: null,
        error: 'Unknown address format',
      };
    }

    const normalized = normalizeAddress(address);

    return {
      isValid: true,
      type,
      normalized,
    };
  } catch (error) {
    return {
      isValid: false,
      type: AddressType.UNKNOWN,
      normalized: null,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}
