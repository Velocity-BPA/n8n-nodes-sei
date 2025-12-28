/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodeProperties } from 'n8n-workflow';

export const oracleOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['oracle'] } },
    options: [
      { name: 'Get Exchange Rate', value: 'getExchangeRate', description: 'Get exchange rate for a denom', action: 'Get exchange rate' },
      { name: 'Get All Exchange Rates', value: 'getAllExchangeRates', description: 'Get all exchange rates', action: 'Get all exchange rates' },
      { name: 'Get TWAP', value: 'getTwap', description: 'Get time-weighted average price', action: 'Get TWAP' },
      { name: 'Get Vote Targets', value: 'getVoteTargets', description: 'Get oracle vote targets', action: 'Get vote targets' },
      { name: 'Get Oracle Params', value: 'getOracleParams', description: 'Get oracle parameters', action: 'Get oracle params' },
    ],
    default: 'getAllExchangeRates',
  },
];

export const oracleFields: INodeProperties[] = [
  {
    displayName: 'Denom',
    name: 'denom',
    type: 'string',
    required: true,
    default: 'usei',
    placeholder: 'usei',
    displayOptions: { show: { resource: ['oracle'], operation: ['getExchangeRate', 'getTwap'] } },
  },
  {
    displayName: 'Lookback Seconds',
    name: 'lookbackSeconds',
    type: 'number',
    default: 3600,
    description: 'TWAP lookback period in seconds',
    displayOptions: { show: { resource: ['oracle'], operation: ['getTwap'] } },
  },
];
