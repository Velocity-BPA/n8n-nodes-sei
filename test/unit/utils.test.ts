/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  isValidSeiAddress,
  isValidEvmAddress,
  detectAddressType,
  AddressType,
  seiToEvmAddress,
  evmToSeiAddress,
} from '../../nodes/Sei/utils/addressUtils';

import {
  seiToUsei,
  useiToSei,
  formatAmount,
  parseAmount,
} from '../../nodes/Sei/utils/unitConverter';

describe('Address Utilities', () => {
  describe('isValidSeiAddress', () => {
    it('should validate correct Sei addresses', () => {
      expect(isValidSeiAddress('sei1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq7mkr2s')).toBe(true);
    });

    it('should reject invalid Sei addresses', () => {
      expect(isValidSeiAddress('0x1234567890123456789012345678901234567890')).toBe(false);
      expect(isValidSeiAddress('cosmos1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')).toBe(false);
      expect(isValidSeiAddress('')).toBe(false);
      expect(isValidSeiAddress('invalid')).toBe(false);
    });
  });

  describe('isValidEvmAddress', () => {
    it('should validate correct EVM addresses', () => {
      expect(isValidEvmAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidEvmAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).toBe(true);
    });

    it('should reject invalid EVM addresses', () => {
      expect(isValidEvmAddress('sei1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq')).toBe(false);
      expect(isValidEvmAddress('0x123')).toBe(false);
      expect(isValidEvmAddress('')).toBe(false);
    });
  });

  describe('detectAddressType', () => {
    it('should detect Sei addresses', () => {
      expect(detectAddressType('sei1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq7mkr2s')).toBe(AddressType.SEI);
    });

    it('should detect EVM addresses', () => {
      expect(detectAddressType('0x1234567890123456789012345678901234567890')).toBe(AddressType.EVM);
    });

    it('should detect valoper addresses', () => {
      expect(detectAddressType('seivaloper1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq7mkr2s')).toBe(AddressType.VALOPER);
    });

    it('should return unknown for invalid addresses', () => {
      expect(detectAddressType('invalid')).toBe(AddressType.UNKNOWN);
      expect(detectAddressType('')).toBe(AddressType.UNKNOWN);
    });
  });
});

describe('Unit Converter', () => {
  describe('seiToUsei', () => {
    it('should convert SEI to usei correctly', () => {
      expect(seiToUsei('1')).toBe('1000000');
      expect(seiToUsei('0.5')).toBe('500000');
      expect(seiToUsei('100')).toBe('100000000');
      expect(seiToUsei(1.5)).toBe('1500000');
    });
  });

  describe('useiToSei', () => {
    it('should convert usei to SEI correctly', () => {
      expect(useiToSei('1000000')).toBe('1.000000');
      expect(useiToSei('500000')).toBe('0.500000');
      expect(useiToSei('100000000')).toBe('100.000000');
    });
  });

  describe('formatAmount', () => {
    it('should format amounts correctly', () => {
      expect(formatAmount('1000000', 6)).toBe('1');
      expect(formatAmount('1500000', 6)).toBe('1.5');
      expect(formatAmount('1000000000000000000', 18)).toBe('1');
    });
  });

  describe('parseAmount', () => {
    it('should parse amounts correctly', () => {
      expect(parseAmount('1', 6)).toBe('1000000');
      expect(parseAmount('1.5', 6)).toBe('1500000');
      expect(parseAmount('0.000001', 6)).toBe('1');
    });
  });
});

describe('Network Constants', () => {
  it('should have correct mainnet configuration', async () => {
    const { SEI_MAINNET } = await import('../../nodes/Sei/constants/networks');
    expect(SEI_MAINNET.chainId).toBe('pacific-1');
    expect(SEI_MAINNET.evmChainId).toBe(1329);
    expect(SEI_MAINNET.bech32Prefix).toBe('sei');
    expect(SEI_MAINNET.nativeDenom).toBe('usei');
  });

  it('should have correct testnet configuration', async () => {
    const { SEI_TESTNET } = await import('../../nodes/Sei/constants/networks');
    expect(SEI_TESTNET.chainId).toBe('atlantic-2');
    expect(SEI_TESTNET.evmChainId).toBe(1328);
    expect(SEI_TESTNET.isTestnet).toBe(true);
  });
});
