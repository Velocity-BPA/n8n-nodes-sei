/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { EvmClient } from '../../transport/evmClient';
import { isValidEvmAddress } from '../../utils/addressUtils';

export async function executeEvmOperation(
  this: IExecuteFunctions,
  itemIndex: number,
  operation: string,
): Promise<unknown> {
  const credentials = await this.getCredentials('seiEvm');
  const client = new EvmClient({
    network: credentials.network as string,
    evmRpcEndpoint: credentials.evmRpcUrl as string,
    privateKey: credentials.privateKey as string,
  });

  try {
    switch (operation) {
      case 'getEvmBalance': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        if (!isValidEvmAddress(address)) throw new Error('Invalid EVM address');
        const balance = await client.getBalance(address);
        const balanceWei = await client.getBalanceWei(address);
        return { success: true, data: { address, balance, balanceWei } };
      }
      case 'sendEvmTransaction': {
        const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex) as string;
        if (!isValidEvmAddress(toAddress)) throw new Error('Invalid recipient address');
        const result = await client.sendTransaction(toAddress, amount);
        return { success: true, data: result };
      }
      case 'getTransactionReceipt': {
        const txHash = this.getNodeParameter('txHash', itemIndex) as string;
        const receipt = await client.getTransactionReceipt(txHash);
        return { success: true, data: receipt };
      }
      case 'callContract': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const abi = this.getNodeParameter('abi', itemIndex) as string[];
        const methodName = this.getNodeParameter('methodName', itemIndex) as string;
        const methodArgs = this.getNodeParameter('methodArgs', itemIndex, []) as unknown[];
        if (!isValidEvmAddress(contractAddress)) throw new Error('Invalid contract address');
        const result = await client.callContract(contractAddress, abi, methodName, methodArgs);
        return { success: true, data: { result } };
      }
      case 'executeContract': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const abi = this.getNodeParameter('abi', itemIndex) as string[];
        const methodName = this.getNodeParameter('methodName', itemIndex) as string;
        const methodArgs = this.getNodeParameter('methodArgs', itemIndex, []) as unknown[];
        if (!isValidEvmAddress(contractAddress)) throw new Error('Invalid contract address');
        const result = await client.executeContract(contractAddress, abi, methodName, methodArgs);
        return { success: true, data: result };
      }
      case 'deployContract': {
        const abi = this.getNodeParameter('abi', itemIndex) as string[];
        const bytecode = this.getNodeParameter('bytecode', itemIndex) as string;
        const methodArgs = this.getNodeParameter('methodArgs', itemIndex, []) as unknown[];
        const result = await client.deployContract(abi, bytecode, methodArgs);
        return { success: true, data: result };
      }
      case 'getGasPrice': {
        const gasPrice = await client.getGasPrice();
        return { success: true, data: { gasPrice, gasPriceGwei: (parseInt(gasPrice) / 1e9).toFixed(2) } };
      }
      case 'estimateGas': {
        const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
        const estimate = await client.estimateGas({ to: toAddress });
        return { success: true, data: { gasEstimate: estimate } };
      }
      case 'getBlock': {
        const blockNumber = this.getNodeParameter('blockNumber', itemIndex, 0) as number;
        const block = await client.getBlock(blockNumber || undefined);
        return { success: true, data: block };
      }
      case 'getLogs': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const logs = await client.getLogs({ address: contractAddress });
        return { success: true, data: { logs, count: logs.length } };
      }
      case 'getNonce': {
        const address = this.getNodeParameter('address', itemIndex) as string;
        if (!isValidEvmAddress(address)) throw new Error('Invalid EVM address');
        const nonce = await client.getNonce(address);
        return { success: true, data: { address, nonce } };
      }
      case 'signMessage': {
        const message = this.getNodeParameter('message', itemIndex) as string;
        const signature = await client.signMessage(message);
        return { success: true, data: { message, signature } };
      }
      case 'getErc20Balance': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const address = this.getNodeParameter('address', itemIndex, client.getAddress()) as string;
        if (!isValidEvmAddress(contractAddress)) throw new Error('Invalid contract address');
        const balance = await client.getErc20Balance(contractAddress, address);
        const tokenInfo = await client.getErc20Info(contractAddress);
        return { success: true, data: { balance, tokenInfo } };
      }
      case 'transferErc20': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const recipient = this.getNodeParameter('recipient', itemIndex) as string;
        const tokenAmount = this.getNodeParameter('tokenAmount', itemIndex) as string;
        if (!isValidEvmAddress(contractAddress)) throw new Error('Invalid contract address');
        if (!isValidEvmAddress(recipient)) throw new Error('Invalid recipient address');
        const result = await client.transferErc20(contractAddress, recipient, tokenAmount);
        return { success: true, data: result };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    throw error;
  }
}
