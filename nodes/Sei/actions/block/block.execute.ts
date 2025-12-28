/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';

export async function executeBlockOperation(
  this: IExecuteFunctions,
  itemIndex: number,
  operation: string,
): Promise<unknown> {
  const credentials = await this.getCredentials('seiNetwork');
  const client = new SeiClient({
    network: credentials.network as string,
    rpcEndpoint: credentials.rpcEndpoint as string,
    restEndpoint: credentials.restEndpoint as string,
  });
  await client.connect();

  try {
    switch (operation) {
      case 'getLatestBlock': {
        const block = await client.getBlock();
        const height = await client.getHeight();
        return { success: true, data: { height, block } };
      }
      case 'getBlockByHeight': {
        const blockHeight = this.getNodeParameter('blockHeight', itemIndex) as number;
        const block = await client.getBlock(blockHeight);
        return { success: true, data: block };
      }
      case 'getBlockResults': {
        const blockHeight = this.getNodeParameter('blockHeight', itemIndex) as number;
        const results = await client.restQuery(`/cosmos/base/tendermint/v1beta1/blocks/${blockHeight}`);
        return { success: true, data: results };
      }
      case 'getValidatorSet': {
        const blockHeight = this.getNodeParameter('blockHeight', itemIndex) as number;
        const validators = await client.restQuery(`/cosmos/base/tendermint/v1beta1/validatorsets/${blockHeight}`);
        return { success: true, data: validators };
      }
      case 'getNodeInfo': {
        const nodeInfo = await client.restQuery('/cosmos/base/tendermint/v1beta1/node_info');
        return { success: true, data: nodeInfo };
      }
      case 'getSyncingStatus': {
        const syncing = await client.restQuery('/cosmos/base/tendermint/v1beta1/syncing');
        return { success: true, data: syncing };
      }
      case 'healthCheck': {
        try {
          const height = await client.getHeight();
          const chainId = await client.getChainId();
          return { success: true, data: { healthy: true, height, chainId } };
        } catch (error) {
          return { success: true, data: { healthy: false, error: error instanceof Error ? error.message : 'Unknown error' } };
        }
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
