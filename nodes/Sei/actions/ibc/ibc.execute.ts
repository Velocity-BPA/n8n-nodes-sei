/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import { SEI_IBC_CHANNELS } from '../../constants/ibc';

export async function executeIbcOperation(
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
      case 'ibcTransfer': {
        const destinationChain = this.getNodeParameter('destinationChain', itemIndex) as string;
        const recipient = this.getNodeParameter('recipient', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        const denom = this.getNodeParameter('denom', itemIndex) as string;
        
        let channelId: string;
        if (destinationChain === 'custom') {
          channelId = this.getNodeParameter('channelId', itemIndex) as string;
        } else {
          const channel = SEI_IBC_CHANNELS[destinationChain];
          if (!channel) throw new Error(`Unknown destination chain: ${destinationChain}`);
          channelId = channel.channelId;
        }
        
        return { 
          success: true, 
          data: { 
            message: 'IBC transfer requires signing', 
            channelId, 
            recipient, 
            amount, 
            denom,
            destinationChain 
          } 
        };
      }
      case 'getIbcChannels': {
        const channels = await client.restQuery('/ibc/core/channel/v1/channels');
        return { success: true, data: channels };
      }
      case 'getIbcConnections': {
        const connections = await client.restQuery('/ibc/core/connection/v1/connections');
        return { success: true, data: connections };
      }
      case 'getChannelInfo': {
        const channelId = this.getNodeParameter('channelId', itemIndex) as string;
        const portId = this.getNodeParameter('portId', itemIndex, 'transfer') as string;
        const channel = await client.restQuery(`/ibc/core/channel/v1/channels/${channelId}/ports/${portId}`);
        return { success: true, data: channel };
      }
      case 'getDenomTrace': {
        const denomHash = this.getNodeParameter('denomHash', itemIndex) as string;
        const hash = denomHash.replace('ibc/', '');
        const trace = await client.restQuery(`/ibc/apps/transfer/v1/denom_traces/${hash}`);
        return { success: true, data: trace };
      }
      case 'getIbcParams': {
        const params = await client.restQuery('/ibc/apps/transfer/v1/params');
        return { success: true, data: params };
      }
      case 'getEscrowAddress': {
        const channelId = this.getNodeParameter('channelId', itemIndex) as string;
        const portId = this.getNodeParameter('portId', itemIndex, 'transfer') as string;
        const escrow = await client.restQuery(`/ibc/apps/transfer/v1/channels/${channelId}/ports/${portId}/escrow_address`);
        return { success: true, data: escrow };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
