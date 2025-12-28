/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for Sei node
 *
 * These tests require a connection to a Sei network.
 * Set SEI_TEST_RPC and SEI_TEST_REST environment variables to run.
 */

describe('Sei Client Integration', () => {
  const skipIntegration = !process.env.SEI_TEST_RPC;

  beforeAll(() => {
    if (skipIntegration) {
      console.log('Skipping integration tests - set SEI_TEST_RPC to enable');
    }
  });

  describe('Network Connection', () => {
    it.skipIf(skipIntegration)('should connect to testnet', async () => {
      const { SeiClient } = await import('../../nodes/Sei/transport/seiClient');

      const client = new SeiClient({
        network: 'testnet',
      });

      await client.connect();
      const chainId = await client.getChainId();
      expect(chainId).toBe('atlantic-2');
      client.disconnect();
    });

    it.skipIf(skipIntegration)('should get current block height', async () => {
      const { SeiClient } = await import('../../nodes/Sei/transport/seiClient');

      const client = new SeiClient({
        network: 'testnet',
      });

      await client.connect();
      const height = await client.getHeight();
      expect(height).toBeGreaterThan(0);
      client.disconnect();
    });
  });

  describe('Account Queries', () => {
    it.skipIf(skipIntegration)('should get balance for address', async () => {
      const { SeiClient } = await import('../../nodes/Sei/transport/seiClient');

      const client = new SeiClient({
        network: 'testnet',
      });

      await client.connect();
      // Use a known testnet address
      const balance = await client.getBalance('sei1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq7mkr2s', 'usei');
      expect(balance).toHaveProperty('denom');
      expect(balance).toHaveProperty('amount');
      client.disconnect();
    });
  });
});

// Helper for conditional skipping
declare global {
  namespace jest {
    interface It {
      skipIf(condition: boolean): It;
    }
  }
}

// Add skipIf helper
const originalIt = it;
(it as typeof originalIt & { skipIf: (condition: boolean) => typeof originalIt }).skipIf = (
  condition: boolean,
) => (condition ? it.skip : it);
