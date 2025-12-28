/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { SeiClient } from '../../transport/seiClient';

export async function executeGovernanceOperation(
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
      case 'getProposals': {
        const proposalStatus = this.getNodeParameter('proposalStatus', itemIndex, '') as string;
        const params: Record<string, string> = {};
        if (proposalStatus) params.proposal_status = proposalStatus;
        const proposals = await client.restQuery('/cosmos/gov/v1/proposals', params);
        return { success: true, data: proposals };
      }
      case 'getProposal': {
        const proposalId = this.getNodeParameter('proposalId', itemIndex) as string;
        const proposal = await client.restQuery(`/cosmos/gov/v1/proposals/${proposalId}`);
        return { success: true, data: proposal };
      }
      case 'getProposalVotes': {
        const proposalId = this.getNodeParameter('proposalId', itemIndex) as string;
        const votes = await client.restQuery(`/cosmos/gov/v1/proposals/${proposalId}/votes`);
        return { success: true, data: votes };
      }
      case 'getProposalTally': {
        const proposalId = this.getNodeParameter('proposalId', itemIndex) as string;
        const tally = await client.restQuery(`/cosmos/gov/v1/proposals/${proposalId}/tally`);
        return { success: true, data: tally };
      }
      case 'vote': {
        const proposalId = this.getNodeParameter('proposalId', itemIndex) as string;
        const voteOption = this.getNodeParameter('voteOption', itemIndex) as string;
        return { success: true, data: { message: 'Vote requires signing transaction', proposalId, voteOption } };
      }
      case 'deposit': {
        const proposalId = this.getNodeParameter('proposalId', itemIndex) as string;
        const depositAmount = this.getNodeParameter('depositAmount', itemIndex) as string;
        return { success: true, data: { message: 'Deposit requires signing transaction', proposalId, depositAmount } };
      }
      case 'getGovernanceParams': {
        const params = await client.restQuery('/cosmos/gov/v1/params/tallying');
        return { success: true, data: params };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  } finally {
    client.disconnect();
  }
}
