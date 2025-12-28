/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  SigningCosmWasmClient,
  CosmWasmClient,
  ExecuteResult,
  InstantiateResult,
  UploadResult,
  MigrateResult,
} from '@cosmjs/cosmwasm-stargate';
import { DirectSecp256k1HdWallet, OfflineSigner } from '@cosmjs/proto-signing';
import { GasPrice, StdFee, calculateFee } from '@cosmjs/stargate';
import { Coin } from '@cosmjs/amino';
import axios, { AxiosInstance } from 'axios';
import { getNetworkConfig, SeiNetworkConfig, DERIVATION_PATHS } from '../constants/networks';

/**
 * Sei WASM Client - Transport layer for CosmWasm smart contract operations
 *
 * Sei supports CosmWasm smart contracts alongside native modules and EVM.
 * This client handles all contract-related operations.
 */

export interface WasmClientConfig {
  network: string;
  rpcEndpoint?: string;
  restEndpoint?: string;
  mnemonic?: string;
  derivationPath?: string;
  gasPrice?: string;
}

export interface ContractInfo {
  address: string;
  codeId: number;
  creator: string;
  admin: string | null;
  label: string;
  created: {
    blockHeight: number;
    txIndex: number;
  } | null;
  ibcPortId: string | null;
}

export interface CodeInfo {
  codeId: number;
  creator: string;
  dataHash: string;
  instantiatePermission: {
    permission: string;
    address: string;
    addresses: string[];
  };
}

export interface WasmTransactionResult {
  transactionHash: string;
  height: number;
  gasUsed: string;
  gasWanted: string;
  logs: unknown[];
  events: Array<{
    type: string;
    attributes: Array<{ key: string; value: string }>;
  }>;
}

export class WasmClient {
  private config: WasmClientConfig;
  private networkConfig: SeiNetworkConfig;
  private client: CosmWasmClient | null = null;
  private signingClient: SigningCosmWasmClient | null = null;
  private restClient: AxiosInstance;
  private wallet: DirectSecp256k1HdWallet | null = null;
  private address: string | null = null;

  constructor(config: WasmClientConfig) {
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
    this.client = await CosmWasmClient.connect(this.networkConfig.rpcEndpoint);

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

    this.signingClient = await SigningCosmWasmClient.connectWithSigner(
      this.networkConfig.rpcEndpoint,
      this.wallet as OfflineSigner,
      { gasPrice },
    );
  }

  getAddress(): string {
    if (!this.address) throw new Error('Wallet not initialized');
    return this.address;
  }

  async getContractInfo(contractAddress: string): Promise<ContractInfo> {
    if (!this.client) throw new Error('Client not connected');

    const info = await this.client.getContract(contractAddress);
    return {
      address: info.address,
      codeId: info.codeId,
      creator: info.creator,
      admin: info.admin || null,
      label: info.label,
      created: info.created || null,
      ibcPortId: info.ibcPortId || null,
    };
  }

  async queryContract<T>(contractAddress: string, queryMsg: Record<string, unknown>): Promise<T> {
    if (!this.client) throw new Error('Client not connected');
    return this.client.queryContractSmart(contractAddress, queryMsg) as Promise<T>;
  }

  async queryContractRaw(contractAddress: string, key: Uint8Array): Promise<Uint8Array | null> {
    if (!this.client) throw new Error('Client not connected');
    return this.client.queryContractRaw(contractAddress, key);
  }

  async executeContract(
    contractAddress: string,
    msg: Record<string, unknown>,
    memo: string = '',
    funds: Coin[] = [],
    fee?: StdFee,
  ): Promise<WasmTransactionResult> {
    if (!this.signingClient || !this.address) {
      throw new Error('Signing client not initialized');
    }

    const txFee = fee || calculateFee(500000, this.networkConfig.gasPrice);

    const result: ExecuteResult = await this.signingClient.execute(
      this.address,
      contractAddress,
      msg,
      txFee,
      memo,
      funds,
    );

    return this.formatWasmResult(result);
  }

  async instantiateContract(
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
    funds: Coin[] = [],
    fee?: StdFee,
  ): Promise<{ contractAddress: string; result: WasmTransactionResult }> {
    if (!this.signingClient || !this.address) {
      throw new Error('Signing client not initialized');
    }

    const txFee = fee || calculateFee(500000, this.networkConfig.gasPrice);

    const result: InstantiateResult = await this.signingClient.instantiate(
      this.address,
      codeId,
      initMsg,
      label,
      txFee,
      { admin, funds },
    );

    return {
      contractAddress: result.contractAddress,
      result: this.formatWasmResult(result),
    };
  }

  async uploadCode(wasmCode: Uint8Array, fee?: StdFee): Promise<{
    codeId: number;
    result: WasmTransactionResult;
  }> {
    if (!this.signingClient || !this.address) {
      throw new Error('Signing client not initialized');
    }

    const txFee = fee || calculateFee(2000000, this.networkConfig.gasPrice);

    const result: UploadResult = await this.signingClient.upload(
      this.address,
      wasmCode,
      txFee,
    );

    return {
      codeId: result.codeId,
      result: this.formatWasmResult(result),
    };
  }

  async migrateContract(
    contractAddress: string,
    newCodeId: number,
    migrateMsg: Record<string, unknown>,
    fee?: StdFee,
  ): Promise<WasmTransactionResult> {
    if (!this.signingClient || !this.address) {
      throw new Error('Signing client not initialized');
    }

    const txFee = fee || calculateFee(500000, this.networkConfig.gasPrice);

    const result: MigrateResult = await this.signingClient.migrate(
      this.address,
      contractAddress,
      newCodeId,
      migrateMsg,
      txFee,
    );

    return this.formatWasmResult(result);
  }

  async updateAdmin(
    contractAddress: string,
    newAdmin: string,
    fee?: StdFee,
  ): Promise<WasmTransactionResult> {
    if (!this.signingClient || !this.address) {
      throw new Error('Signing client not initialized');
    }

    const txFee = fee || calculateFee(200000, this.networkConfig.gasPrice);

    const result = await this.signingClient.updateAdmin(
      this.address,
      contractAddress,
      newAdmin,
      txFee,
    );

    return {
      transactionHash: result.transactionHash,
      height: result.height,
      gasUsed: result.gasUsed.toString(),
      gasWanted: result.gasWanted.toString(),
      logs: [],
      events: result.events.map((e) => ({
        type: e.type,
        attributes: e.attributes.map((a) => ({ key: a.key, value: a.value })),
      })),
    };
  }

  async clearAdmin(contractAddress: string, fee?: StdFee): Promise<WasmTransactionResult> {
    if (!this.signingClient || !this.address) {
      throw new Error('Signing client not initialized');
    }

    const txFee = fee || calculateFee(200000, this.networkConfig.gasPrice);

    const result = await this.signingClient.clearAdmin(
      this.address,
      contractAddress,
      txFee,
    );

    return {
      transactionHash: result.transactionHash,
      height: result.height,
      gasUsed: result.gasUsed.toString(),
      gasWanted: result.gasWanted.toString(),
      logs: [],
      events: result.events.map((e) => ({
        type: e.type,
        attributes: e.attributes.map((a) => ({ key: a.key, value: a.value })),
      })),
    };
  }

  async getCodeInfo(codeId: number): Promise<CodeInfo> {
    const response = await this.restClient.get(`/cosmwasm/wasm/v1/code/${codeId}`);
    const info = response.data.code_info;

    return {
      codeId: parseInt(info.code_id, 10),
      creator: info.creator,
      dataHash: info.data_hash,
      instantiatePermission: {
        permission: info.instantiate_permission?.permission || '',
        address: info.instantiate_permission?.address || '',
        addresses: info.instantiate_permission?.addresses || [],
      },
    };
  }

  async getCodes(): Promise<CodeInfo[]> {
    const response = await this.restClient.get('/cosmwasm/wasm/v1/code');
    return response.data.code_infos.map((info: {
      code_id: string;
      creator: string;
      data_hash: string;
      instantiate_permission?: { permission: string; address: string; addresses: string[] };
    }) => ({
      codeId: parseInt(info.code_id, 10),
      creator: info.creator,
      dataHash: info.data_hash,
      instantiatePermission: {
        permission: info.instantiate_permission?.permission || '',
        address: info.instantiate_permission?.address || '',
        addresses: info.instantiate_permission?.addresses || [],
      },
    }));
  }

  async getContractsByCode(codeId: number): Promise<string[]> {
    if (!this.client) throw new Error('Client not connected');
    return this.client.getContracts(codeId);
  }

  private formatWasmResult(
    result: ExecuteResult | InstantiateResult | UploadResult | MigrateResult,
  ): WasmTransactionResult {
    return {
      transactionHash: result.transactionHash,
      height: result.height,
      gasUsed: result.gasUsed.toString(),
      gasWanted: result.gasWanted.toString(),
      logs: result.logs,
      events: result.events.map((e) => ({
        type: e.type,
        attributes: e.attributes.map((a) => ({ key: a.key, value: a.value })),
      })),
    };
  }

  disconnect(): void {
    this.client = null;
    this.signingClient = null;
    this.wallet = null;
    this.address = null;
  }
}
