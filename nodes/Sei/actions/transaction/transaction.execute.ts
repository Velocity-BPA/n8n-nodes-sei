/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import { isValidSeiAddress } from '../../utils/addressUtils';
import { seiToUsei } from '../../utils/unitConverter';

export async function executeTransactionOperation(
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
      case 'sendSei': {
        const recipient = this.getNodeParameter('recipient', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        const memo = this.getNodeParameter('memo', itemIndex, '') as string;

        if (!isValidSeiAddress(recipient)) {
          throw new Error(`Invalid recipient address: ${recipient}`);
        }

        const amountUsei = seiToUsei(amount);
        const result = await client.sendTokens(
          recipient,
          [{ denom: 'usei', amount: amountUsei }],
          memo,
        );

        return { success: true, data: result };
      }

      case 'sendToken': {
        const recipient = this.getNodeParameter('recipient', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        const denom = this.getNodeParameter('denom', itemIndex, 'usei') as string;
        const memo = this.getNodeParameter('memo', itemIndex, '') as string;

        if (!isValidSeiAddress(recipient)) {
          throw new Error(`Invalid recipient address: ${recipient}`);
        }

        const amountBase = denom === 'usei' ? seiToUsei(amount) : amount;
        const result = await client.sendTokens(
          recipient,
          [{ denom, amount: amountBase }],
          memo,
        );

        return { success: true, data: result };
      }

      case 'getTransaction': {
        const txHash = this.getNodeParameter('txHash', itemIndex) as string;
        const tx = await client.getTransaction(txHash);
        return { success: true, data: tx };
      }

      case 'getTransactionStatus': {
        const txHash = this.getNodeParameter('txHash', itemIndex) as string;
        const tx = await client.getTransaction(txHash);
        const status = tx ? 'confirmed' : 'pending';
        return { success: true, data: { txHash, status, transaction: tx } };
      }

      case 'simulateTransaction': {
        return { success: true, data: { message: 'Use specific operation to simulate' } };
      }

      case 'multiSend': {
        return { success: true, data: { message: 'Multi-send requires batch configuration' } };
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
