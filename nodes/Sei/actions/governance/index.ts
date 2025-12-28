/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const governanceOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['governance'] } },
    options: [
      { name: 'Get Proposals', value: 'getProposals', description: 'Get all governance proposals', action: 'Get proposals' },
      { name: 'Get Proposal', value: 'getProposal', description: 'Get specific proposal by ID', action: 'Get proposal' },
      { name: 'Get Proposal Votes', value: 'getProposalVotes', description: 'Get votes on a proposal', action: 'Get proposal votes' },
      { name: 'Get Proposal Tally', value: 'getProposalTally', description: 'Get vote tally for proposal', action: 'Get proposal tally' },
      { name: 'Vote on Proposal', value: 'vote', description: 'Cast a vote on a proposal', action: 'Vote on proposal' },
      { name: 'Deposit to Proposal', value: 'deposit', description: 'Deposit tokens to a proposal', action: 'Deposit to proposal' },
      { name: 'Get Governance Params', value: 'getGovernanceParams', description: 'Get governance parameters', action: 'Get governance params' },
    ],
    default: 'getProposals',
  },
];

export const governanceFields: INodeProperties[] = [
  {
    displayName: 'Proposal ID',
    name: 'proposalId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1',
    displayOptions: { show: { resource: ['governance'], operation: ['getProposal', 'getProposalVotes', 'getProposalTally', 'vote', 'deposit'] } },
  },
  {
    displayName: 'Vote Option',
    name: 'voteOption',
    type: 'options',
    options: [
      { name: 'Yes', value: 'VOTE_OPTION_YES' },
      { name: 'No', value: 'VOTE_OPTION_NO' },
      { name: 'Abstain', value: 'VOTE_OPTION_ABSTAIN' },
      { name: 'No With Veto', value: 'VOTE_OPTION_NO_WITH_VETO' },
    ],
    default: 'VOTE_OPTION_YES',
    displayOptions: { show: { resource: ['governance'], operation: ['vote'] } },
  },
  {
    displayName: 'Deposit Amount (SEI)',
    name: 'depositAmount',
    type: 'string',
    default: '',
    placeholder: '100',
    displayOptions: { show: { resource: ['governance'], operation: ['deposit'] } },
  },
  {
    displayName: 'Proposal Status',
    name: 'proposalStatus',
    type: 'options',
    options: [
      { name: 'All', value: '' },
      { name: 'Deposit Period', value: 'PROPOSAL_STATUS_DEPOSIT_PERIOD' },
      { name: 'Voting Period', value: 'PROPOSAL_STATUS_VOTING_PERIOD' },
      { name: 'Passed', value: 'PROPOSAL_STATUS_PASSED' },
      { name: 'Rejected', value: 'PROPOSAL_STATUS_REJECTED' },
      { name: 'Failed', value: 'PROPOSAL_STATUS_FAILED' },
    ],
    default: '',
    displayOptions: { show: { resource: ['governance'], operation: ['getProposals'] } },
  },
];
