/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { WasmClient } from '../../transport/wasmClient';
import { isValidSeiAddress } from '../../utils/addressUtils';

export async function executeWasmOperation(
  this: IExecuteFunctions,
  itemIndex: number,
  operation: string,
): Promise<unknown> {
  const credentials = await this.getCredentials('seiNetwork');
  const client = new WasmClient({
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
      case 'getContractInfo': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        if (!isValidSeiAddress(contractAddress)) throw new Error('Invalid contract address');
        const info = await client.getContractInfo(contractAddress);
        return { success: true, data: info };
      }
      case 'queryContract': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const queryMsg = this.getNodeParameter('queryMsg', itemIndex) as object;
        if (!isValidSeiAddress(contractAddress)) throw new Error('Invalid contract address');
        const result = await client.queryContract(contractAddress, queryMsg as Record<string, unknown>);
        return { success: true, data: result };
      }
      case 'executeContract': {
        const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
        const executeMsg = this.getNodeParameter('executeMsg', itemIndex) as object;
        const funds = this.getNodeParameter('funds', itemIndex, []) as Array<{ denom: string; amount: string }>;
        if (!isValidSeiAddress(contractAddress)) throw new Error('Invalid contract address');
        const result = await client.executeContract(
          contractAddress,
          executeMsg as Record<string, unknown>,
          '',
          funds,
        );
        return { success: true, data: result };
      }
      case 'instantiateContract': {
        const codeId = this.getNodeParameter('codeId', itemIndex) as number;
        const initMsg = this.getNodeParameter('initMsg', itemIndex) as object;
        const label = this.getNodeParameter('label', itemIndex) as string;
        const admin = this.getNodeParameter('admin', itemIndex, '') as string;
        const funds = this.getNodeParameter('funds', itemIndex, []) as Array<{ denom: string; amount: string }>;
        const result = await client.instantiateContract(
          codeId,
          initMsg as Record<string, unknown>,
          label,
          admin || undefined,
          funds,
        );
        return { success: true, data: result };
      }
      case 'getCodeInfo': {
        const codeId = this.getNodeParameter('codeId', itemIndex) as number;
        const info = await client.getCodeInfo(codeId);
        return { success: true, data: info };
      }
      case 'getCodes': {
        const codes = await client.getCodes();
        return { success: true, data: { codes, count: codes.length } };
      }
      case 'getContractsByCode': {
        const codeId = this.getNodeParameter('codeId', itemIndex) as number;
        const contracts = await client.getContractsByCode(codeId);
        return { success: true, data: { codeId, contracts, count: contracts.length } };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
