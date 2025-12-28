/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import { isValidSeiAddress, isValidValoperAddress } from '../../utils/addressUtils';

export async function executeDistributionOperation(
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
      case 'getDelegationRewards': {
        const delegatorAddress = this.getNodeParameter('delegatorAddress', itemIndex, '') as string;
        const validatorAddress = this.getNodeParameter('validatorAddress', itemIndex) as string;
        const address = delegatorAddress || client.getAddress();
        if (!isValidSeiAddress(address)) throw new Error('Invalid delegator address');
        if (!isValidValoperAddress(validatorAddress)) throw new Error('Invalid validator address');
        const rewards = await client.restQuery(`/cosmos/distribution/v1beta1/delegators/${address}/rewards/${validatorAddress}`);
        return { success: true, data: rewards };
      }
      case 'getAllRewards': {
        const delegatorAddress = this.getNodeParameter('delegatorAddress', itemIndex, '') as string;
        const address = delegatorAddress || client.getAddress();
        if (!isValidSeiAddress(address)) throw new Error('Invalid delegator address');
        const rewards = await client.restQuery(`/cosmos/distribution/v1beta1/delegators/${address}/rewards`);
        return { success: true, data: rewards };
      }
      case 'withdrawRewards': {
        const validatorAddress = this.getNodeParameter('validatorAddress', itemIndex) as string;
        if (!isValidValoperAddress(validatorAddress)) throw new Error('Invalid validator address');
        return { success: true, data: { message: 'Withdraw rewards requires signing transaction', validatorAddress } };
      }
      case 'withdrawAllRewards': {
        return { success: true, data: { message: 'Withdraw all rewards requires signing transaction' } };
      }
      case 'getCommunityPool': {
        const pool = await client.restQuery('/cosmos/distribution/v1beta1/community_pool');
        return { success: true, data: pool };
      }
      case 'getDistributionParams': {
        const params = await client.restQuery('/cosmos/distribution/v1beta1/params');
        return { success: true, data: params };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
