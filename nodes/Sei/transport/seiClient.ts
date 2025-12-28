/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  SigningStargateClient,
  StargateClient,
  GasPrice,
  DeliverTxResponse,
  StdFee,
  calculateFee,
} from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing';
import { Coin } from '@cosmjs/amino';
import axios, { AxiosInstance } from 'axios';
import { getNetworkConfig, SeiNetworkConfig, DERIVATION_PATHS } from '../constants/networks';

/**
 * Sei Client - Main transport layer for Cosmos-side operations
 */

// Emit licensing notice once on module load
const LICENSING_NOTICE_EMITTED = Symbol.for('sei.licensing.notice');
if (!(global as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED]) {
  console.warn(`
[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
`);
  (global as Record<symbol, boolean>)[LICENSING_NOTICE_EMITTED] = true;
}

export interface SeiClientConfig {
  network: string;
  rpcEndpoint?: string;
  restEndpoint?: string;
  mnemonic?: string;
  derivationPath?: string;
  gasPrice?: string;
}

export interface SeiTransactionResult {
  transactionHash: string;
  height: number;
  gasUsed: string;
  gasWanted: string;
  code: number;
  rawLog: string;
  events: Array<{
    type: string;
    attributes: Array<{ key: string; value: string }>;
  }>;
}

export interface SeiAccountInfo {
  address: string;
  accountNumber: number;
  sequence: number;
  pubkey: string | null;
}

export interface SeiBalance {
  denom: string;
  amount: string;
}

export interface SeiDelegation {
  delegatorAddress: string;
  validatorAddress: string;
  shares: string;
  balance: Coin;
}

export interface SeiValidator {
  operatorAddress: string;
  consensusPubkey: string;
  jailed: boolean;
  status: string;
  tokens: string;
  delegatorShares: string;
  description: {
    moniker: string;
    identity: string;
    website: string;
    details: string;
  };
  commission: {
    rate: string;
    maxRate: string;
    maxChangeRate: string;
  };
}

export class SeiClient {
  private config: SeiClientConfig;
  private networkConfig: SeiNetworkConfig;
  private rpcClient: StargateClient | null = null;
  private signingClient: SigningStargateClient | null = null;
  private restClient: AxiosInstance;
  private wallet: DirectSecp256k1HdWallet | null = null;
  private address: string | null = null;

  constructor(config: SeiClientConfig) {
    this.config = config;

    const networkConf = getNetworkConfig(config.network);
    if (!networkConf && config.network !== 'custom') {
      throw new Error(`Unknown network: ${config.network}`);
    }

    this.networkConfig = networkConf || {
      name: 'Custom',
      chainId: 'custom',
      evmChainId: 0,
      rpcEndpoint: config.rpcEndpoint || '',
      restEndpoint: config.restEndpoint || '',
      evmRpcEndpoint: '',
      wsEndpoint: '',
      explorerUrl: '',
      bech32Prefix: 'sei',
      nativeDenom: 'usei',
      coinDecimals: 6,
      coinGeckoId: 'sei-network',
      gasPrice: config.gasPrice || '0.1usei',
      isTestnet: false,
    };

    if (config.rpcEndpoint) {
      this.networkConfig.rpcEndpoint = config.rpcEndpoint;
    }
    if (config.restEndpoint) {
      this.networkConfig.restEndpoint = config.restEndpoint;
    }

    this.restClient = axios.create({
      baseURL: this.networkConfig.restEndpoint,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async connect(): Promise<void> {
    const tmClient = await Tendermint37Client.connect(this.networkConfig.rpcEndpoint);
    this.rpcClient = await StargateClient.create(tmClient);

    if (this.config.mnemonic) {
      await this.initializeWallet();
    }
  }

  private async initializeWallet(): Promise<void> {
    if (!this.config.mnemonic) {
      throw new Error('Mnemonic not provided');
    }

    const derivationPath = this.config.derivationPath || DERIVATION_PATHS.sei;

    this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(this.config.mnemonic, {
      prefix: this.networkConfig.bech32Prefix,
      hdPaths: [{ toString: () => derivationPath } as unknown as import('@cosmjs/crypto').HdPath],
    });

    const accounts = await this.wallet.getAccounts();
    if (accounts.length > 0 && accounts[0]) {
      this.address = accounts[0].address;
    }

    const gasPrice = GasPrice.fromString(this.config.gasPrice || this.networkConfig.gasPrice);

    this.signingClient = await SigningStargateClient.connectWithSigner(
      this.networkConfig.rpcEndpoint,
      this.wallet as OfflineSigner,
      { gasPrice },
    );
  }

  getAddress(): string {
    if (!this.address) throw new Error('Wallet not initialized');
    return this.address;
  }

  getNetworkConfig(): SeiNetworkConfig {
    return this.networkConfig;
  }

  async getAccountInfo(address: string): Promise<SeiAccountInfo> {
    const response = await this.restClient.get(`/cosmos/auth/v1beta1/accounts/${address}`);
    const account = response.data.account;
    return {
      address: account.address,
      accountNumber: parseInt(account.account_number, 10),
      sequence: parseInt(account.sequence, 10),
      pubkey: account.pub_key?.key || null,
    };
  }

  async getBalance(address: string, denom: string = 'usei'): Promise<SeiBalance> {
    if (!this.rpcClient) throw new Error('Client not connected');
    const balance = await this.rpcClient.getBalance(address, denom);
    return { denom: balance.denom, amount: balance.amount };
  }

  async getAllBalances(address: string): Promise<SeiBalance[]> {
    if (!this.rpcClient) throw new Error('Client not connected');
    const balances = await this.rpcClient.getAllBalances(address);
    return balances.map((b) => ({ denom: b.denom, amount: b.amount }));
  }

  async sendTokens(
    recipient: string,
    amount: Coin[],
    memo: string = '',
    fee?: StdFee,
  ): Promise<SeiTransactionResult> {
    if (!this.signingClient || !this.address) throw new Error('Signing client not initialized');
    const txFee = fee || calculateFee(200000, this.networkConfig.gasPrice);
    const result: DeliverTxResponse = await this.signingClient.sendTokens(
      this.address,
      recipient,
      amount,
      txFee,
      memo,
    );
    return this.formatTxResult(result);
  }

  async delegate(
    validatorAddress: string,
    amount: Coin,
    memo: string = '',
    fee?: StdFee,
  ): Promise<SeiTransactionResult> {
    if (!this.signingClient || !this.address) throw new Error('Signing client not initialized');
    const txFee = fee || calculateFee(250000, this.networkConfig.gasPrice);
    const result = await this.signingClient.delegateTokens(
      this.address,
      validatorAddress,
      amount,
      txFee,
      memo,
    );
    return this.formatTxResult(result);
  }

  async undelegate(
    validatorAddress: string,
    amount: Coin,
    memo: string = '',
    fee?: StdFee,
  ): Promise<SeiTransactionResult> {
    if (!this.signingClient || !this.address) throw new Error('Signing client not initialized');
    const txFee = fee || calculateFee(250000, this.networkConfig.gasPrice);
    const result = await this.signingClient.undelegateTokens(
      this.address,
      validatorAddress,
      amount,
      txFee,
      memo,
    );
    return this.formatTxResult(result);
  }

  async getDelegations(delegatorAddress: string): Promise<SeiDelegation[]> {
    const response = await this.restClient.get(
      `/cosmos/staking/v1beta1/delegations/${delegatorAddress}`,
    );
    return response.data.delegation_responses.map(
      (d: { delegation: { delegator_address: string; validator_address: string; shares: string }; balance: Coin }) => ({
        delegatorAddress: d.delegation.delegator_address,
        validatorAddress: d.delegation.validator_address,
        shares: d.delegation.shares,
        balance: d.balance,
      }),
    );
  }

  async getValidators(status?: string): Promise<SeiValidator[]> {
    const params = status ? { status } : {};
    const response = await this.restClient.get('/cosmos/staking/v1beta1/validators', { params });
    return response.data.validators.map((v: {
      operator_address: string;
      consensus_pubkey: string;
      jailed: boolean;
      status: string;
      tokens: string;
      delegator_shares: string;
      description: { moniker: string; identity: string; website: string; details: string };
      commission: { commission_rates: { rate: string; max_rate: string; max_change_rate: string } };
    }) => ({
      operatorAddress: v.operator_address,
      consensusPubkey: v.consensus_pubkey,
      jailed: v.jailed,
      status: v.status,
      tokens: v.tokens,
      delegatorShares: v.delegator_shares,
      description: {
        moniker: v.description.moniker,
        identity: v.description.identity,
        website: v.description.website,
        details: v.description.details,
      },
      commission: {
        rate: v.commission.commission_rates.rate,
        maxRate: v.commission.commission_rates.max_rate,
        maxChangeRate: v.commission.commission_rates.max_change_rate,
      },
    }));
  }

  async getTransaction(hash: string): Promise<unknown> {
    if (!this.rpcClient) throw new Error('Client not connected');
    return this.rpcClient.getTx(hash);
  }

  async getBlock(height?: number): Promise<unknown> {
    if (!this.rpcClient) throw new Error('Client not connected');
    return height ? this.rpcClient.getBlock(height) : this.rpcClient.getBlock();
  }

  async getChainId(): Promise<string> {
    if (!this.rpcClient) throw new Error('Client not connected');
    return this.rpcClient.getChainId();
  }

  async getHeight(): Promise<number> {
    if (!this.rpcClient) throw new Error('Client not connected');
    return this.rpcClient.getHeight();
  }

  async simulate(
    signerAddress: string,
    messages: unknown[],
    memo?: string,
  ): Promise<{ gasUsed: number; gasWanted: number }> {
    if (!this.signingClient) throw new Error('Signing client not initialized');
    const gas = await this.signingClient.simulate(
      signerAddress,
      messages as import('@cosmjs/stargate').EncodeObject[],
      memo,
    );
    return { gasUsed: gas, gasWanted: Math.ceil(gas * 1.3) };
  }

  async restQuery<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.restClient.get(endpoint, { params });
    return response.data as T;
  }

  async restPost<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await this.restClient.post(endpoint, data);
    return response.data as T;
  }

  private formatTxResult(result: DeliverTxResponse): SeiTransactionResult {
    return {
      transactionHash: result.transactionHash,
      height: result.height,
      gasUsed: result.gasUsed.toString(),
      gasWanted: result.gasWanted.toString(),
      code: result.code,
      rawLog: result.rawLog || '',
      events: result.events.map((e) => ({
        type: e.type,
        attributes: e.attributes.map((a) => ({ key: a.key, value: a.value })),
      })),
    };
  }

  disconnect(): void {
    this.rpcClient = null;
    this.signingClient = null;
    this.wallet = null;
    this.address = null;
  }
}
