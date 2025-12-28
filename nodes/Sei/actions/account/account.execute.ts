/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import {
  isValidSeiAddress,
  isValidEvmAddress,
  seiToEvmAddress,
  evmToSeiAddress,
  detectAddressType,
  AddressType,
} from '../../utils/addressUtils';
import { useiToSei } from '../../utils/unitConverter';

export async function executeAccountOperation(
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
      case 'getAccountInfo': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        if (!isValidSeiAddress(address)) {
          throw new Error(`Invalid Sei address: ${address}`);
        }
        const accountInfo = await client.getAccountInfo(address);
        return { success: true, data: accountInfo };
      }

      case 'getSeiBalance': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        const denom = this.getNodeParameter('denom', itemIndex, 'usei') as string;
        if (!isValidSeiAddress(address)) {
          throw new Error(`Invalid Sei address: ${address}`);
        }
        const balance = await client.getBalance(address, denom);
        return {
          success: true,
          data: {
            ...balance,
            formatted: denom === 'usei' ? `${useiToSei(balance.amount)} SEI` : balance.amount,
          },
        };
      }

      case 'getAllBalances': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        if (!isValidSeiAddress(address)) {
          throw new Error(`Invalid Sei address: ${address}`);
        }
        const balances = await client.getAllBalances(address);
        return {
          success: true,
          data: {
            address,
            balances: balances.map((b) => ({
              ...b,
              formatted: b.denom === 'usei' ? `${useiToSei(b.amount)} SEI` : b.amount,
            })),
          },
        };
      }

      case 'getDelegations': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        if (!isValidSeiAddress(address)) {
          throw new Error(`Invalid Sei address: ${address}`);
        }
        const delegations = await client.getDelegations(address);
        return { success: true, data: { address, delegations } };
      }

      case 'getRewards': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        if (!isValidSeiAddress(address)) {
          throw new Error(`Invalid Sei address: ${address}`);
        }
        const rewards = await client.restQuery<{ rewards: unknown[] }>(
          `/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
        );
        return { success: true, data: { address, ...rewards } };
      }

      case 'getUnbondingDelegations': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        if (!isValidSeiAddress(address)) {
          throw new Error(`Invalid Sei address: ${address}`);
        }
        const unbonding = await client.restQuery<{ unbonding_responses: unknown[] }>(
          `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`,
        );
        return { success: true, data: { address, unbondingDelegations: unbonding.unbonding_responses } };
      }

      case 'validateAddress': {
        const addressToValidate = this.getNodeParameter('addressToValidate', itemIndex) as string;
        const addressType = detectAddressType(addressToValidate);
        const isValid = addressType !== AddressType.UNKNOWN;
        return {
          success: true,
          data: {
            address: addressToValidate,
            isValid,
            type: addressType,
            isSei: addressType === AddressType.SEI,
            isEvm: addressType === AddressType.EVM,
            isValoper: addressType === AddressType.VALOPER,
          },
        };
      }

      case 'getEvmAddress': {
        const seiAddress = this.getNodeParameter('seiAddress', itemIndex) as string;
        if (!isValidSeiAddress(seiAddress)) {
          throw new Error(`Invalid Sei address: ${seiAddress}`);
        }
        const evmAddress = seiToEvmAddress(seiAddress);
        return {
          success: true,
          data: { seiAddress, evmAddress },
        };
      }

      case 'getSeiAddress': {
        const evmAddress = this.getNodeParameter('evmAddress', itemIndex) as string;
        if (!isValidEvmAddress(evmAddress)) {
          throw new Error(`Invalid EVM address: ${evmAddress}`);
        }
        const seiAddress = evmToSeiAddress(evmAddress);
        return {
          success: true,
          data: { evmAddress, seiAddress },
        };
      }

      case 'getAccountTransactions': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        const limit = this.getNodeParameter('limit', itemIndex, 50) as number;
        const offset = this.getNodeParameter('offset', itemIndex, 0) as number;
        if (!isValidSeiAddress(address)) {
          throw new Error(`Invalid Sei address: ${address}`);
        }
        const txs = await client.restQuery<{ tx_responses: unknown[]; pagination: unknown }>(
          `/cosmos/tx/v1beta1/txs`,
          {
            events: `message.sender='${address}'`,
            'pagination.limit': limit,
            'pagination.offset': offset,
          },
        );
        return {
          success: true,
          data: { address, transactions: txs.tx_responses, pagination: txs.pagination },
        };
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
