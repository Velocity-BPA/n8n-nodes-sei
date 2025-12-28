/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import { isValidSeiAddress, isValidValoperAddress } from '../../utils/addressUtils';
import { seiToUsei } from '../../utils/unitConverter';

export async function executeStakingOperation(
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
      case 'getValidators': {
        const statusFilter = this.getNodeParameter('statusFilter', itemIndex, '') as string;
        const validators = await client.getValidators(statusFilter || undefined);
        return { success: true, data: { validators, count: validators.length } };
      }
      case 'getValidatorInfo': {
        const validatorAddress = this.getNodeParameter('validatorAddress', itemIndex) as string;
        if (!isValidValoperAddress(validatorAddress)) throw new Error('Invalid validator address');
        const validator = await client.restQuery(`/cosmos/staking/v1beta1/validators/${validatorAddress}`);
        return { success: true, data: validator };
      }
      case 'getActiveValidators': {
        const validators = await client.getValidators('BOND_STATUS_BONDED');
        return { success: true, data: { validators, count: validators.length } };
      }
      case 'delegate': {
        const validatorAddress = this.getNodeParameter('validatorAddress', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        if (!isValidValoperAddress(validatorAddress)) throw new Error('Invalid validator address');
        const amountUsei = seiToUsei(amount);
        const result = await client.delegate(validatorAddress, { denom: 'usei', amount: amountUsei });
        return { success: true, data: result };
      }
      case 'undelegate': {
        const validatorAddress = this.getNodeParameter('validatorAddress', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        if (!isValidValoperAddress(validatorAddress)) throw new Error('Invalid validator address');
        const amountUsei = seiToUsei(amount);
        const result = await client.undelegate(validatorAddress, { denom: 'usei', amount: amountUsei });
        return { success: true, data: result };
      }
      case 'redelegate': {
        const srcValidator = this.getNodeParameter('srcValidatorAddress', itemIndex) as string;
        const dstValidator = this.getNodeParameter('dstValidatorAddress', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        return { success: true, data: { message: 'Redelegate operation requires signing', srcValidator, dstValidator, amount } };
      }
      case 'getDelegations': {
        const delegatorAddress = this.getNodeParameter('delegatorAddress', itemIndex, '') as string;
        const address = delegatorAddress || client.getAddress();
        if (!isValidSeiAddress(address)) throw new Error('Invalid address');
        const delegations = await client.getDelegations(address);
        return { success: true, data: { address, delegations } };
      }
      case 'getStakingPool': {
        const pool = await client.restQuery('/cosmos/staking/v1beta1/pool');
        return { success: true, data: pool };
      }
      case 'getStakingParams': {
        const params = await client.restQuery('/cosmos/staking/v1beta1/params');
        return { success: true, data: params };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
