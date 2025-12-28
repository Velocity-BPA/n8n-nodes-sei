/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import { isValidSeiAddress } from '../../utils/addressUtils';

export async function executeOrderOperation(
  this: IExecuteFunctions,
  itemIndex: number,
  operation: string,
): Promise<unknown> {
  const credentials = await this.getCredentials('seiNetwork');
  const client = new SeiClient({
    network: credentials.network as string,
    rpcEndpoint: credentials.rpcEndpoint as string,
    restEndpoint: credentials.restEndpoint as string,
    mnemonic: credentials.mnemonic as string,
    derivationPath: credentials.derivationPath as string,
    gasPrice: credentials.gasPrice as string,
  });
  await client.connect();

  try {
    switch (operation) {
      case 'placeLimitOrder': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const price = this.getNodeParameter('price', itemIndex) as string;
        const quantity = this.getNodeParameter('quantity', itemIndex) as string;
        const side = this.getNodeParameter('side', itemIndex) as string;
        const priceDenom = this.getNodeParameter('priceDenom', itemIndex) as string;
        const assetDenom = this.getNodeParameter('assetDenom', itemIndex) as string;
        return { success: true, data: { message: 'Place limit order requires signing', contractAddress, price, quantity, side, priceDenom, assetDenom } };
      }
      case 'placeMarketOrder': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const quantity = this.getNodeParameter('quantity', itemIndex) as string;
        const side = this.getNodeParameter('side', itemIndex) as string;
        return { success: true, data: { message: 'Place market order requires signing', contractAddress, quantity, side } };
      }
      case 'cancelOrder': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const orderId = this.getNodeParameter('orderId', itemIndex) as string;
        return { success: true, data: { message: 'Cancel order requires signing', contractAddress, orderId } };
      }
      case 'cancelAllOrders': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        return { success: true, data: { message: 'Cancel all orders requires signing', contractAddress } };
      }
      case 'getOrder': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const orderId = this.getNodeParameter('orderId', itemIndex) as string;
        if (!isValidSeiAddress(contractAddress)) throw new Error('Invalid contract address');
        const order = await client.restQuery(`/sei-protocol/seichain/dex/get_order/${contractAddress}/${orderId}`);
        return { success: true, data: order };
      }
      case 'getOrdersByAccount': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const address = client.getAddress();
        const orders = await client.restQuery(`/sei-protocol/seichain/dex/get_orders/${contractAddress}/${address}`);
        return { success: true, data: orders };
      }
      case 'getOpenOrders': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const address = client.getAddress();
        const orders = await client.restQuery(`/sei-protocol/seichain/dex/get_orders/${contractAddress}/${address}`);
        return { success: true, data: orders };
      }
      case 'batchPlaceOrders': {
        return { success: true, data: { message: 'Batch place orders requires array of orders' } };
      }
      case 'batchCancelOrders': {
        return { success: true, data: { message: 'Batch cancel orders requires array of order IDs' } };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
