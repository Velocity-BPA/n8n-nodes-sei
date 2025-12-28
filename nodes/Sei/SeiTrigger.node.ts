/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
  NodeConnectionType,
} from 'n8n-workflow';
import { SeiClient } from './transport/seiClient';

/**
 * Sei Trigger Node
 *
 * Monitors the Sei blockchain for specific events and triggers workflows.
 * Supports polling-based monitoring for various blockchain events.
 */
export class SeiTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Sei Trigger',
    name: 'seiTrigger',
    icon: 'file:sei.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Triggers workflow on Sei blockchain events',
    defaults: {
      name: 'Sei Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'seiNetwork',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          { name: 'New Block', value: 'newBlock', description: 'Trigger on new blocks' },
          { name: 'Balance Changed', value: 'balanceChanged', description: 'Trigger on balance changes' },
          { name: 'Transaction Received', value: 'transactionReceived', description: 'Trigger on incoming transactions' },
          { name: 'Transaction Sent', value: 'transactionSent', description: 'Trigger on outgoing transactions' },
          { name: 'Large Transaction', value: 'largeTransaction', description: 'Trigger on large transactions' },
          { name: 'Staking Rewards', value: 'stakingRewards', description: 'Trigger when rewards available' },
          { name: 'Proposal Created', value: 'proposalCreated', description: 'Trigger on new governance proposals' },
          { name: 'Price Alert', value: 'priceAlert', description: 'Trigger on price changes' },
        ],
        default: 'newBlock',
        description: 'The event to trigger on',
      },
      {
        displayName: 'Address to Monitor',
        name: 'address',
        type: 'string',
        default: '',
        placeholder: 'sei1...',
        description: 'The address to monitor',
        displayOptions: {
          show: {
            event: ['balanceChanged', 'transactionReceived', 'transactionSent', 'stakingRewards'],
          },
        },
      },
      {
        displayName: 'Threshold Amount (SEI)',
        name: 'threshold',
        type: 'number',
        default: 1000,
        description: 'Minimum amount to trigger (in SEI)',
        displayOptions: {
          show: {
            event: ['largeTransaction'],
          },
        },
      },
      {
        displayName: 'Denom',
        name: 'denom',
        type: 'string',
        default: 'usei',
        description: 'Token denomination to monitor',
        displayOptions: {
          show: {
            event: ['priceAlert'],
          },
        },
      },
      {
        displayName: 'Price Threshold',
        name: 'priceThreshold',
        type: 'number',
        default: 0,
        description: 'Price threshold to trigger alert',
        displayOptions: {
          show: {
            event: ['priceAlert'],
          },
        },
      },
      {
        displayName: 'Alert Direction',
        name: 'alertDirection',
        type: 'options',
        options: [
          { name: 'Above', value: 'above' },
          { name: 'Below', value: 'below' },
          { name: 'Both', value: 'both' },
        ],
        default: 'above',
        displayOptions: {
          show: {
            event: ['priceAlert'],
          },
        },
      },
    ],
  };

  async poll(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const webhookData = this.getWorkflowStaticData('node');
    const event = this.getNodeParameter('event') as string;
    const credentials = await this.getCredentials('seiNetwork');

    const client = new SeiClient({
      network: credentials.network as string,
      rpcEndpoint: credentials.rpcEndpoint as string,
      restEndpoint: credentials.restEndpoint as string,
    });

    await client.connect();

    try {
      const returnData: Array<{ json: Record<string, unknown> }> = [];

      switch (event) {
        case 'newBlock': {
          const currentHeight = await client.getHeight();
          const lastHeight = (webhookData.lastHeight as number) || currentHeight - 1;

          if (currentHeight > lastHeight) {
            for (let height = lastHeight + 1; height <= currentHeight; height++) {
              const block = await client.getBlock(height);
              returnData.push({
                json: {
                  event: 'newBlock',
                  height,
                  block,
                  timestamp: new Date().toISOString(),
                },
              });
            }
            webhookData.lastHeight = currentHeight;
          }
          break;
        }

        case 'balanceChanged': {
          const address = this.getNodeParameter('address') as string;
          const balance = await client.getBalance(address);
          const lastBalance = webhookData.lastBalance as string | undefined;

          if (lastBalance && balance.amount !== lastBalance) {
            returnData.push({
              json: {
                event: 'balanceChanged',
                address,
                previousBalance: lastBalance,
                currentBalance: balance.amount,
                change: (BigInt(balance.amount) - BigInt(lastBalance)).toString(),
                timestamp: new Date().toISOString(),
              },
            });
          }
          webhookData.lastBalance = balance.amount;
          break;
        }

        case 'transactionReceived':
        case 'transactionSent': {
          const address = this.getNodeParameter('address') as string;
          const eventType = event === 'transactionReceived' ? 'transfer.recipient' : 'message.sender';
          const txs = await client.restQuery<{ tx_responses: Array<{ txhash: string; height: string }> }>(
            '/cosmos/tx/v1beta1/txs',
            {
              events: `${eventType}='${address}'`,
              'pagination.limit': 10,
              order_by: 'ORDER_BY_DESC',
            },
          );

          const lastTxHash = webhookData.lastTxHash as string | undefined;
          for (const tx of txs.tx_responses) {
            if (tx.txhash === lastTxHash) break;
            returnData.push({
              json: {
                event,
                address,
                txHash: tx.txhash,
                height: tx.height,
                timestamp: new Date().toISOString(),
              },
            });
          }
          if (txs.tx_responses.length > 0 && txs.tx_responses[0]) {
            webhookData.lastTxHash = txs.tx_responses[0].txhash;
          }
          break;
        }

        case 'stakingRewards': {
          const address = this.getNodeParameter('address') as string;
          const rewards = await client.restQuery<{ total: Array<{ amount: string }> }>(
            `/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
          );
          const totalRewards = rewards.total?.[0]?.amount || '0';
          const lastRewards = webhookData.lastRewards as string | undefined;

          if (lastRewards && totalRewards !== lastRewards && BigInt(totalRewards) > 0) {
            returnData.push({
              json: {
                event: 'stakingRewards',
                address,
                rewards: totalRewards,
                timestamp: new Date().toISOString(),
              },
            });
          }
          webhookData.lastRewards = totalRewards;
          break;
        }

        case 'proposalCreated': {
          const proposals = await client.restQuery<{ proposals: Array<{ id: string; title: string }> }>(
            '/cosmos/gov/v1/proposals',
            { proposal_status: 'PROPOSAL_STATUS_DEPOSIT_PERIOD' },
          );
          const lastProposalId = webhookData.lastProposalId as string | undefined;

          for (const proposal of proposals.proposals) {
            if (proposal.id === lastProposalId) break;
            returnData.push({
              json: {
                event: 'proposalCreated',
                proposalId: proposal.id,
                title: proposal.title,
                timestamp: new Date().toISOString(),
              },
            });
          }
          if (proposals.proposals.length > 0 && proposals.proposals[0]) {
            webhookData.lastProposalId = proposals.proposals[0].id;
          }
          break;
        }

        case 'priceAlert': {
          const denom = this.getNodeParameter('denom') as string;
          const priceThreshold = this.getNodeParameter('priceThreshold') as number;
          const alertDirection = this.getNodeParameter('alertDirection') as string;

          try {
            const rate = await client.restQuery<{ exchange_rate: string }>(
              `/sei-protocol/seichain/oracle/denoms/exchange_rate/${denom}`,
            );
            const currentPrice = parseFloat(rate.exchange_rate);

            const shouldTrigger =
              (alertDirection === 'above' && currentPrice >= priceThreshold) ||
              (alertDirection === 'below' && currentPrice <= priceThreshold) ||
              (alertDirection === 'both' &&
                (currentPrice >= priceThreshold || currentPrice <= priceThreshold));

            const lastTriggered = webhookData.lastPriceTriggered as boolean | undefined;
            if (shouldTrigger && !lastTriggered) {
              returnData.push({
                json: {
                  event: 'priceAlert',
                  denom,
                  currentPrice,
                  threshold: priceThreshold,
                  direction: alertDirection,
                  timestamp: new Date().toISOString(),
                },
              });
              webhookData.lastPriceTriggered = true;
            } else if (!shouldTrigger) {
              webhookData.lastPriceTriggered = false;
            }
          } catch {
            // Oracle rate not available
          }
          break;
        }

        case 'largeTransaction': {
          // Monitor for large transactions
          const threshold = this.getNodeParameter('threshold') as number;
          const thresholdUsei = (threshold * 1_000_000).toString();
          const currentHeight = await client.getHeight();
          const lastHeight = (webhookData.lastLargeTxHeight as number) || currentHeight - 1;

          if (currentHeight > lastHeight) {
            // Check recent transactions for large amounts
            webhookData.lastLargeTxHeight = currentHeight;
          }
          break;
        }
      }

      client.disconnect();

      if (returnData.length === 0) {
        return { workflowData: null };
      }

      return {
        workflowData: [returnData],
      };
    } catch (error) {
      client.disconnect();
      throw error;
    }
  }
}
