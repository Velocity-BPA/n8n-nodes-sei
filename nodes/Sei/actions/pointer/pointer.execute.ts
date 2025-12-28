/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';

export async function executePointerOperation(
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
      case 'getCw20Pointer': {
        const cw20Address = this.getNodeParameter('cw20Address', itemIndex) as string;
        const pointer = await client.restQuery(`/sei-protocol/seichain/evm/pointer/cw20/${cw20Address}`);
        return { success: true, data: pointer };
      }
      case 'getCw721Pointer': {
        const cw721Address = this.getNodeParameter('cw721Address', itemIndex) as string;
        const pointer = await client.restQuery(`/sei-protocol/seichain/evm/pointer/cw721/${cw721Address}`);
        return { success: true, data: pointer };
      }
      case 'getErc20Pointer': {
        const erc20Address = this.getNodeParameter('erc20Address', itemIndex) as string;
        const pointer = await client.restQuery(`/sei-protocol/seichain/evm/pointer/erc20/${erc20Address}`);
        return { success: true, data: pointer };
      }
      case 'getErc721Pointer': {
        const erc721Address = this.getNodeParameter('erc721Address', itemIndex) as string;
        const pointer = await client.restQuery(`/sei-protocol/seichain/evm/pointer/erc721/${erc721Address}`);
        return { success: true, data: pointer };
      }
      case 'getNativePointer': {
        const nativeDenom = this.getNodeParameter('nativeDenom', itemIndex) as string;
        const pointer = await client.restQuery(`/sei-protocol/seichain/evm/pointer/native/${nativeDenom}`);
        return { success: true, data: pointer };
      }
      case 'checkPointerExists': {
        const addressType = this.getNodeParameter('addressType', itemIndex) as string;
        const pointeeAddress = this.getNodeParameter('pointeeAddress', itemIndex) as string;
        try {
          const pointer = await client.restQuery(`/sei-protocol/seichain/evm/pointer/${addressType}/${pointeeAddress}`);
          return { success: true, data: { exists: true, pointer } };
        } catch {
          return { success: true, data: { exists: false } };
        }
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
