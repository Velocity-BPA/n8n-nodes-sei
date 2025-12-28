/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeConnectionType,
} from 'n8n-workflow';

import { accountOperations, accountFields } from './actions/account';
import { transactionOperations, transactionFields } from './actions/transaction';
import { bankOperations, bankFields } from './actions/bank';
import { stakingOperations, stakingFields } from './actions/staking';
import { distributionOperations, distributionFields } from './actions/distribution';
import { governanceOperations, governanceFields } from './actions/governance';
import { dexOperations, dexFields } from './actions/dex';
import { orderOperations, orderFields } from './actions/order';
import { oracleOperations, oracleFields } from './actions/oracle';
import { tokenFactoryOperations, tokenFactoryFields } from './actions/tokenFactory';
import { ibcOperations, ibcFields } from './actions/ibc';
import { wasmOperations, wasmFields } from './actions/wasm';
import { evmOperations, evmFields } from './actions/evm';
import { pointerOperations, pointerFields } from './actions/pointer';
import { blockOperations, blockFields } from './actions/block';
import { utilityOperations, utilityFields } from './actions/utility';

import { executeAccountOperation } from './actions/account/account.execute';
import { executeTransactionOperation } from './actions/transaction/transaction.execute';
import { executeBankOperation } from './actions/bank/bank.execute';
import { executeStakingOperation } from './actions/staking/staking.execute';
import { executeDistributionOperation } from './actions/distribution/distribution.execute';
import { executeGovernanceOperation } from './actions/governance/governance.execute';
import { executeDexOperation } from './actions/dex/dex.execute';
import { executeOrderOperation } from './actions/order/order.execute';
import { executeOracleOperation } from './actions/oracle/oracle.execute';
import { executeTokenFactoryOperation } from './actions/tokenFactory/tokenFactory.execute';
import { executeIbcOperation } from './actions/ibc/ibc.execute';
import { executeWasmOperation } from './actions/wasm/wasm.execute';
import { executeEvmOperation } from './actions/evm/evm.execute';
import { executePointerOperation } from './actions/pointer/pointer.execute';
import { executeBlockOperation } from './actions/block/block.execute';
import { executeUtilityOperation } from './actions/utility/utility.execute';

/**
 * Sei Node
 *
 * A comprehensive n8n community node for the Sei blockchain.
 * Sei is a Layer 1 blockchain optimized for trading with:
 * - Twin Turbo Consensus (~400ms finality)
 * - Parallel Execution (12,500+ TPS)
 * - Native DEX with order matching engine
 * - Full EVM compatibility
 * - CosmWasm smart contracts
 * - IBC interoperability
 */
export class Sei implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei',
    name: 'sei',
    icon: 'file:sei.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Sei blockchain - trading-optimized L1 with EVM compatibility',
    defaults: {
      name: 'Sei',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'seiNetwork',
        required: true,
        displayOptions: {
          show: {
            resource: [
              'account',
              'transaction',
              'bank',
              'staking',
              'distribution',
              'governance',
              'dex',
              'order',
              'oracle',
              'tokenFactory',
              'ibc',
              'wasm',
              'pointer',
              'block',
              'utility',
            ],
          },
        },
      },
      {
        name: 'seiEvm',
        required: true,
        displayOptions: {
          show: {
            resource: ['evm'],
          },
        },
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Account',
            value: 'account',
            description: 'Manage accounts, balances, and delegations',
          },
          {
            name: 'Bank',
            value: 'bank',
            description: 'Query balances and token supplies',
          },
          {
            name: 'Block',
            value: 'block',
            description: 'Query blockchain blocks and validators',
          },
          {
            name: 'DEX',
            value: 'dex',
            description: 'Native DEX market data and orderbook',
          },
          {
            name: 'Distribution',
            value: 'distribution',
            description: 'Staking rewards and distributions',
          },
          {
            name: 'EVM',
            value: 'evm',
            description: 'Ethereum-compatible operations',
          },
          {
            name: 'Governance',
            value: 'governance',
            description: 'Proposals, voting, and governance',
          },
          {
            name: 'IBC',
            value: 'ibc',
            description: 'Inter-Blockchain Communication transfers',
          },
          {
            name: 'Oracle',
            value: 'oracle',
            description: 'Price feeds and exchange rates',
          },
          {
            name: 'Order',
            value: 'order',
            description: 'DEX order management',
          },
          {
            name: 'Pointer',
            value: 'pointer',
            description: 'CW/ERC token interoperability',
          },
          {
            name: 'Staking',
            value: 'staking',
            description: 'Delegate, undelegate, and redelegate SEI',
          },
          {
            name: 'Token Factory',
            value: 'tokenFactory',
            description: 'Create and manage native tokens',
          },
          {
            name: 'Transaction',
            value: 'transaction',
            description: 'Send tokens and manage transactions',
          },
          {
            name: 'Utility',
            value: 'utility',
            description: 'Address conversion, unit conversion, validation',
          },
          {
            name: 'WASM',
            value: 'wasm',
            description: 'CosmWasm smart contract interactions',
          },
        ],
        default: 'account',
      },
      // Account operations and fields
      ...accountOperations,
      ...accountFields,
      // Transaction operations and fields
      ...transactionOperations,
      ...transactionFields,
      // Bank operations and fields
      ...bankOperations,
      ...bankFields,
      // Staking operations and fields
      ...stakingOperations,
      ...stakingFields,
      // Distribution operations and fields
      ...distributionOperations,
      ...distributionFields,
      // Governance operations and fields
      ...governanceOperations,
      ...governanceFields,
      // DEX operations and fields
      ...dexOperations,
      ...dexFields,
      // Order operations and fields
      ...orderOperations,
      ...orderFields,
      // Oracle operations and fields
      ...oracleOperations,
      ...oracleFields,
      // Token Factory operations and fields
      ...tokenFactoryOperations,
      ...tokenFactoryFields,
      // IBC operations and fields
      ...ibcOperations,
      ...ibcFields,
      // WASM operations and fields
      ...wasmOperations,
      ...wasmFields,
      // EVM operations and fields
      ...evmOperations,
      ...evmFields,
      // Pointer operations and fields
      ...pointerOperations,
      ...pointerFields,
      // Block operations and fields
      ...blockOperations,
      ...blockFields,
      // Utility operations and fields
      ...utilityOperations,
      ...utilityFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: unknown;

        switch (resource) {
          case 'account':
            result = await executeAccountOperation.call(this, i, operation);
            break;
          case 'transaction':
            result = await executeTransactionOperation.call(this, i, operation);
            break;
          case 'bank':
            result = await executeBankOperation.call(this, i, operation);
            break;
          case 'staking':
            result = await executeStakingOperation.call(this, i, operation);
            break;
          case 'distribution':
            result = await executeDistributionOperation.call(this, i, operation);
            break;
          case 'governance':
            result = await executeGovernanceOperation.call(this, i, operation);
            break;
          case 'dex':
            result = await executeDexOperation.call(this, i, operation);
            break;
          case 'order':
            result = await executeOrderOperation.call(this, i, operation);
            break;
          case 'oracle':
            result = await executeOracleOperation.call(this, i, operation);
            break;
          case 'tokenFactory':
            result = await executeTokenFactoryOperation.call(this, i, operation);
            break;
          case 'ibc':
            result = await executeIbcOperation.call(this, i, operation);
            break;
          case 'wasm':
            result = await executeWasmOperation.call(this, i, operation);
            break;
          case 'evm':
            result = await executeEvmOperation.call(this, i, operation);
            break;
          case 'pointer':
            result = await executePointerOperation.call(this, i, operation);
            break;
          case 'block':
            result = await executeBlockOperation.call(this, i, operation);
            break;
          case 'utility':
            result = await executeUtilityOperation.call(this, i, operation);
            break;
          default:
            throw new Error(`Unknown resource: ${resource}`);
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(result as Record<string, unknown>),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          const executionData = this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray({
              error: error instanceof Error ? error.message : 'Unknown error',
            }),
            { itemData: { item: i } },
          );
          returnData.push(...executionData);
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
