/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';

export async function executeOracleOperation(
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
      case 'getExchangeRate': {
        const denom = this.getNodeParameter('denom', itemIndex) as string;
        const rate = await client.restQuery(`/sei-protocol/seichain/oracle/denoms/exchange_rate/${denom}`);
        return { success: true, data: rate };
      }
      case 'getAllExchangeRates': {
        const rates = await client.restQuery('/sei-protocol/seichain/oracle/denoms/exchange_rates');
        return { success: true, data: rates };
      }
      case 'getTwap': {
        const denom = this.getNodeParameter('denom', itemIndex) as string;
        const lookbackSeconds = this.getNodeParameter('lookbackSeconds', itemIndex) as number;
        const twap = await client.restQuery(`/sei-protocol/seichain/oracle/denoms/twap/${denom}?lookback_seconds=${lookbackSeconds}`);
        return { success: true, data: twap };
      }
      case 'getVoteTargets': {
        const targets = await client.restQuery('/sei-protocol/seichain/oracle/denoms/vote_targets');
        return { success: true, data: targets };
      }
      case 'getOracleParams': {
        const params = await client.restQuery('/sei-protocol/seichain/oracle/params');
        return { success: true, data: params };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
