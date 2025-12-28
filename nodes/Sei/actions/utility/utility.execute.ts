/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';
import {
  seiToEvmAddress,
  evmToSeiAddress,
  detectAddressType,
  AddressType,
  isValidSeiAddress,
  isValidEvmAddress,
} from '../../utils/addressUtils';
import { seiToUsei, useiToSei, seiToWei, weiToSei, useiToWei, weiToUsei } from '../../utils/unitConverter';

export async function executeUtilityOperation(
  this: IExecuteFunctions,
  itemIndex: number,
  operation: string,
): Promise<unknown> {
  switch (operation) {
    case 'convertUnits': {
      const amount = this.getNodeParameter('amount', itemIndex) as string;
      const fromUnit = this.getNodeParameter('fromUnit', itemIndex) as string;
      const toUnit = this.getNodeParameter('toUnit', itemIndex) as string;

      let result: string;
      if (fromUnit === 'sei' && toUnit === 'usei') {
        result = seiToUsei(amount);
      } else if (fromUnit === 'usei' && toUnit === 'sei') {
        result = useiToSei(amount);
      } else if (fromUnit === 'sei' && toUnit === 'wei') {
        result = seiToWei(amount);
      } else if (fromUnit === 'wei' && toUnit === 'sei') {
        result = weiToSei(amount);
      } else if (fromUnit === 'usei' && toUnit === 'wei') {
        result = useiToWei(amount);
      } else if (fromUnit === 'wei' && toUnit === 'usei') {
        result = weiToUsei(amount);
      } else if (fromUnit === toUnit) {
        result = amount;
      } else {
        throw new Error(`Unsupported conversion: ${fromUnit} to ${toUnit}`);
      }

      return { success: true, data: { amount, fromUnit, toUnit, result } };
    }

    case 'convertAddress': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const addressType = detectAddressType(address);

      if (addressType === AddressType.SEI) {
        const evmAddress = seiToEvmAddress(address);
        return { success: true, data: { original: address, type: 'sei', converted: evmAddress, convertedType: 'evm' } };
      } else if (addressType === AddressType.EVM) {
        const seiAddress = evmToSeiAddress(address);
        return { success: true, data: { original: address, type: 'evm', converted: seiAddress, convertedType: 'sei' } };
      } else {
        throw new Error(`Unable to convert address: ${address}. Not a valid Sei or EVM address.`);
      }
    }

    case 'validateAddress': {
      const address = this.getNodeParameter('address', itemIndex) as string;
      const addressType = detectAddressType(address);
      const isValid = addressType !== AddressType.UNKNOWN;
      return {
        success: true,
        data: {
          address,
          isValid,
          type: addressType,
          isSei: isValidSeiAddress(address),
          isEvm: isValidEvmAddress(address),
        },
      };
    }

    case 'getChainId': {
      const credentials = await this.getCredentials('seiNetwork');
      const client = new SeiClient({
        network: credentials.network as string,
        rpcEndpoint: credentials.rpcEndpoint as string,
        restEndpoint: credentials.restEndpoint as string,
      });
      await client.connect();
      try {
        const chainId = await client.getChainId();
        const networkConfig = client.getNetworkConfig();
        return { success: true, data: { chainId, evmChainId: networkConfig.evmChainId, network: networkConfig.name } };
      } finally {
        client.disconnect();
      }
    }

    case 'getNetworkStatus': {
      const credentials = await this.getCredentials('seiNetwork');
      const client = new SeiClient({
        network: credentials.network as string,
        rpcEndpoint: credentials.rpcEndpoint as string,
        restEndpoint: credentials.restEndpoint as string,
      });
      await client.connect();
      try {
        const height = await client.getHeight();
        const chainId = await client.getChainId();
        const networkConfig = client.getNetworkConfig();
        return {
          success: true,
          data: {
            network: networkConfig.name,
            chainId,
            evmChainId: networkConfig.evmChainId,
            currentHeight: height,
            rpcEndpoint: networkConfig.rpcEndpoint,
            restEndpoint: networkConfig.restEndpoint,
            evmRpcEndpoint: networkConfig.evmRpcEndpoint,
            isTestnet: networkConfig.isTestnet,
          },
        };
      } finally {
        client.disconnect();
      }
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
