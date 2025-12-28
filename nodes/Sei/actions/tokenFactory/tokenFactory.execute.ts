/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import { isValidSeiAddress } from '../../utils/addressUtils';

export async function executeTokenFactoryOperation(
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
      case 'createDenom': {
        const subdenom = this.getNodeParameter('subdenom', itemIndex) as string;
        return { success: true, data: { message: 'Create denom requires signing', subdenom } };
      }
      case 'mintTokens': {
        const fullDenom = this.getNodeParameter('fullDenom', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        return { success: true, data: { message: 'Mint tokens requires signing', fullDenom, amount } };
      }
      case 'burnTokens': {
        const fullDenom = this.getNodeParameter('fullDenom', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        return { success: true, data: { message: 'Burn tokens requires signing', fullDenom, amount } };
      }
      case 'changeAdmin': {
        const fullDenom = this.getNodeParameter('fullDenom', itemIndex) as string;
        const newAdmin = this.getNodeParameter('newAdmin', itemIndex) as string;
        if (!isValidSeiAddress(newAdmin)) throw new Error('Invalid new admin address');
        return { success: true, data: { message: 'Change admin requires signing', fullDenom, newAdmin } };
      }
      case 'getDenomInfo': {
        const fullDenom = this.getNodeParameter('fullDenom', itemIndex) as string;
        const encodedDenom = encodeURIComponent(fullDenom);
        const info = await client.restQuery(`/osmosis/tokenfactory/v1beta1/denoms/${encodedDenom}/authority_metadata`);
        return { success: true, data: info };
      }
      case 'getDenomsByCreator': {
        const creatorAddress = this.getNodeParameter('creatorAddress', itemIndex, '') as string;
        const address = creatorAddress || client.getAddress();
        const denoms = await client.restQuery(`/osmosis/tokenfactory/v1beta1/denoms_from_creator/${address}`);
        return { success: true, data: denoms };
      }
      case 'getAuthorityMetadata': {
        const fullDenom = this.getNodeParameter('fullDenom', itemIndex) as string;
        const encodedDenom = encodeURIComponent(fullDenom);
        const metadata = await client.restQuery(`/osmosis/tokenfactory/v1beta1/denoms/${encodedDenom}/authority_metadata`);
        return { success: true, data: metadata };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
