/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';

export async function executeDexOperation(
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
      case 'getMarkets': {
        const pairs = await client.restQuery('/sei-protocol/seichain/dex/registered_pairs');
        return { success: true, data: pairs };
      }
      case 'getOrderbook': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const priceDenom = this.getNodeParameter('priceDenom', itemIndex) as string;
        const assetDenom = this.getNodeParameter('assetDenom', itemIndex) as string;
        const orderbook = await client.restQuery(
          `/sei-protocol/seichain/dex/get_order_book/${contractAddress}/${priceDenom}/${assetDenom}`
        );
        return { success: true, data: orderbook };
      }
      case 'getPrice': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const priceDenom = this.getNodeParameter('priceDenom', itemIndex) as string;
        const assetDenom = this.getNodeParameter('assetDenom', itemIndex) as string;
        const price = await client.restQuery(
          `/sei-protocol/seichain/dex/get_price/${contractAddress}/${priceDenom}/${assetDenom}`
        );
        return { success: true, data: price };
      }
      case 'getMidPrice': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const priceDenom = this.getNodeParameter('priceDenom', itemIndex) as string;
        const assetDenom = this.getNodeParameter('assetDenom', itemIndex) as string;
        const orderbook = await client.restQuery<{ long_book: Array<{ price: string }>; short_book: Array<{ price: string }> }>(
          `/sei-protocol/seichain/dex/get_order_book/${contractAddress}/${priceDenom}/${assetDenom}`
        );
        let midPrice = null;
        if (orderbook.long_book?.length && orderbook.short_book?.length) {
          const bestBid = parseFloat(orderbook.long_book[0]?.price || '0');
          const bestAsk = parseFloat(orderbook.short_book[0]?.price || '0');
          midPrice = ((bestBid + bestAsk) / 2).toFixed(6);
        }
        return { success: true, data: { midPrice } };
      }
      case 'getSpread': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const priceDenom = this.getNodeParameter('priceDenom', itemIndex) as string;
        const assetDenom = this.getNodeParameter('assetDenom', itemIndex) as string;
        const orderbook = await client.restQuery<{ long_book: Array<{ price: string }>; short_book: Array<{ price: string }> }>(
          `/sei-protocol/seichain/dex/get_order_book/${contractAddress}/${priceDenom}/${assetDenom}`
        );
        let spread = null;
        if (orderbook.long_book?.length && orderbook.short_book?.length) {
          const bestBid = parseFloat(orderbook.long_book[0]?.price || '0');
          const bestAsk = parseFloat(orderbook.short_book[0]?.price || '0');
          spread = { absolute: (bestAsk - bestBid).toFixed(6), percentage: bestBid > 0 ? (((bestAsk - bestBid) / bestBid) * 100).toFixed(4) : '0' };
        }
        return { success: true, data: { spread } };
      }
      case 'getTradeHistory': {
        return { success: true, data: { message: 'Trade history requires indexer' } };
      }
      case 'get24hVolume': {
        return { success: true, data: { message: '24h volume requires indexer' } };
      }
      case 'getMarketStats': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const summary = await client.restQuery(`/sei-protocol/seichain/dex/get_market_summary/${contractAddress}`);
        return { success: true, data: summary };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
