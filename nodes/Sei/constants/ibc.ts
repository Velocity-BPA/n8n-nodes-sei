/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Sei IBC (Inter-Blockchain Communication) Configuration
 *
 * Sei is connected to the Cosmos ecosystem via IBC,
 * allowing seamless token transfers between chains.
 */

export interface IbcChannel {
  chainId: string;
  chainName: string;
  channelId: string;
  portId: string;
  connectionId: string;
  clientId: string;
  counterpartyChannelId: string;
  counterpartyPortId: string;
  state: string;
  ordering: string;
}

/**
 * Known IBC channels on Sei mainnet
 */
export const SEI_IBC_CHANNELS: Record<string, IbcChannel> = {
  osmosis: {
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    channelId: 'channel-0',
    portId: 'transfer',
    connectionId: 'connection-0',
    clientId: '07-tendermint-0',
    counterpartyChannelId: 'channel-782',
    counterpartyPortId: 'transfer',
    state: 'STATE_OPEN',
    ordering: 'ORDER_UNORDERED',
  },
  cosmosHub: {
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    channelId: 'channel-1',
    portId: 'transfer',
    connectionId: 'connection-1',
    clientId: '07-tendermint-1',
    counterpartyChannelId: 'channel-584',
    counterpartyPortId: 'transfer',
    state: 'STATE_OPEN',
    ordering: 'ORDER_UNORDERED',
  },
  noble: {
    chainId: 'noble-1',
    chainName: 'Noble',
    channelId: 'channel-45',
    portId: 'transfer',
    connectionId: 'connection-45',
    clientId: '07-tendermint-45',
    counterpartyChannelId: 'channel-39',
    counterpartyPortId: 'transfer',
    state: 'STATE_OPEN',
    ordering: 'ORDER_UNORDERED',
  },
  axelar: {
    chainId: 'axelar-dojo-1',
    chainName: 'Axelar',
    channelId: 'channel-2',
    portId: 'transfer',
    connectionId: 'connection-2',
    clientId: '07-tendermint-2',
    counterpartyChannelId: 'channel-103',
    counterpartyPortId: 'transfer',
    state: 'STATE_OPEN',
    ordering: 'ORDER_UNORDERED',
  },
};

/**
 * IBC query endpoints
 */
export const IBC_QUERY_ENDPOINTS = {
  CHANNELS: '/ibc/core/channel/v1/channels',
  CHANNEL: '/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}',
  CONNECTIONS: '/ibc/core/connection/v1/connections',
  CONNECTION: '/ibc/core/connection/v1/connections/{connection_id}',
  CLIENTS: '/ibc/core/client/v1/client_states',
  CLIENT: '/ibc/core/client/v1/client_states/{client_id}',
  DENOM_TRACE: '/ibc/apps/transfer/v1/denom_traces/{hash}',
  DENOM_TRACES: '/ibc/apps/transfer/v1/denom_traces',
  DENOM_HASH: '/ibc/apps/transfer/v1/denom_hashes/{trace}',
  PARAMS: '/ibc/apps/transfer/v1/params',
  ESCROW_ADDRESS: '/ibc/apps/transfer/v1/channels/{channel_id}/ports/{port_id}/escrow_address',
};

/**
 * IBC message types
 */
export const IBC_MSG_TYPES = {
  TRANSFER: '/ibc.applications.transfer.v1.MsgTransfer',
  UPDATE_CLIENT: '/ibc.core.client.v1.MsgUpdateClient',
  CHANNEL_OPEN_INIT: '/ibc.core.channel.v1.MsgChannelOpenInit',
  CHANNEL_OPEN_TRY: '/ibc.core.channel.v1.MsgChannelOpenTry',
  CHANNEL_OPEN_ACK: '/ibc.core.channel.v1.MsgChannelOpenAck',
  CHANNEL_OPEN_CONFIRM: '/ibc.core.channel.v1.MsgChannelOpenConfirm',
  RECV_PACKET: '/ibc.core.channel.v1.MsgRecvPacket',
  TIMEOUT: '/ibc.core.channel.v1.MsgTimeout',
  ACKNOWLEDGEMENT: '/ibc.core.channel.v1.MsgAcknowledgement',
};

/**
 * IBC transfer default timeout (in nanoseconds)
 * Default: 10 minutes
 */
export const DEFAULT_IBC_TIMEOUT_NS = 600_000_000_000;

/**
 * IBC channel states
 */
export enum ChannelState {
  UNINITIALIZED = 'STATE_UNINITIALIZED_UNSPECIFIED',
  INIT = 'STATE_INIT',
  TRYOPEN = 'STATE_TRYOPEN',
  OPEN = 'STATE_OPEN',
  CLOSED = 'STATE_CLOSED',
}

/**
 * IBC channel ordering
 */
export enum ChannelOrdering {
  NONE = 'ORDER_NONE_UNSPECIFIED',
  UNORDERED = 'ORDER_UNORDERED',
  ORDERED = 'ORDER_ORDERED',
}

/**
 * Destination chain options for n8n
 */
export const DESTINATION_CHAIN_OPTIONS = [
  { name: 'Osmosis', value: 'osmosis' },
  { name: 'Cosmos Hub', value: 'cosmosHub' },
  { name: 'Noble (USDC)', value: 'noble' },
  { name: 'Axelar', value: 'axelar' },
  { name: 'Custom Channel', value: 'custom' },
];

/**
 * IBC denom trace interface
 */
export interface DenomTrace {
  path: string;
  baseDenom: string;
}

/**
 * Calculate IBC denom hash
 */
export function calculateIbcDenomHash(path: string, baseDenom: string): string {
  // In practice, this would use SHA256 hashing
  // For now, return the format
  return `ibc/${path}/${baseDenom}`;
}

/**
 * Parse IBC denom to get trace
 */
export function parseIbcDenom(denom: string): DenomTrace | null {
  if (!denom.startsWith('ibc/')) {
    return null;
  }

  // The hash after ibc/ needs to be looked up via the denom_traces endpoint
  return {
    path: '',
    baseDenom: denom,
  };
}

/**
 * Get timeout timestamp for IBC transfer
 */
export function getIbcTimeoutTimestamp(
  timeoutMinutes: number = 10,
): { timeoutTimestamp: string } {
  const now = Date.now();
  const timeoutNs = (now + timeoutMinutes * 60 * 1000) * 1_000_000;
  return {
    timeoutTimestamp: timeoutNs.toString(),
  };
}
