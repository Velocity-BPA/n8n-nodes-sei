/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import { isValidSeiAddress } from '../../utils/addressUtils';

export async function executeBankOperation(
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
      case 'getBalance': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        const denom = this.getNodeParameter('denom', itemIndex, 'usei') as string;
        if (!isValidSeiAddress(address)) throw new Error('Invalid address');
        const balance = await client.getBalance(address, denom);
        return { success: true, data: balance };
      }
      case 'getAllBalances': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        if (!isValidSeiAddress(address)) throw new Error('Invalid address');
        const balances = await client.getAllBalances(address);
        return { success: true, data: { address, balances } };
      }
      case 'getTotalSupply': {
        const supply = await client.restQuery('/cosmos/bank/v1beta1/supply');
        return { success: true, data: supply };
      }
      case 'getSupplyOfDenom': {
        const denom = this.getNodeParameter('denom', itemIndex, 'usei') as string;
        const supply = await client.restQuery(`/cosmos/bank/v1beta1/supply/by_denom?denom=${denom}`);
        return { success: true, data: supply };
      }
      case 'getDenomMetadata': {
        const denom = this.getNodeParameter('denom', itemIndex, 'usei') as string;
        const metadata = await client.restQuery(`/cosmos/bank/v1beta1/denoms_metadata/${denom}`);
        return { success: true, data: metadata };
      }
      case 'getSpendableBalances': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        const balances = await client.restQuery(`/cosmos/bank/v1beta1/spendable_balances/${address}`);
        return { success: true, data: balances };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
