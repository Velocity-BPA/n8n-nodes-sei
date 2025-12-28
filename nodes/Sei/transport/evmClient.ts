/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  JsonRpcProvider,
  Wallet,
  Contract,
  TransactionResponse,
  TransactionReceipt,
  Block,
  Log,
  Interface,
  ContractFactory,
  parseEther,
  formatEther,
  parseUnits,
  formatUnits,
} from 'ethers';
import { getNetworkConfig, SeiNetworkConfig } from '../constants/networks';
import { ERC20_ABI, ERC721_ABI } from '../utils/evmUtils';

/**
 * Sei EVM Client - Transport layer for EVM-side operations
 *
 * Sei supports full EVM compatibility with its interoperable design.
 * This client handles all Ethereum-style transactions and contract interactions.
 */

export interface EvmClientConfig {
  network: string;
  evmRpcEndpoint?: string;
  privateKey?: string;
}

export interface EvmTransactionResult {
  hash: string;
  blockNumber: number | null;
  blockHash: string | null;
  from: string;
  to: string | null;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: number;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
}

export interface Erc20Info {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface Erc721Info {
  address: string;
  name: string;
  symbol: string;
}

export class EvmClient {
  private config: EvmClientConfig;
  private networkConfig: SeiNetworkConfig;
  private provider: JsonRpcProvider;
  private wallet: Wallet | null = null;

  constructor(config: EvmClientConfig) {
    this.config = config;

    const networkConf = getNetworkConfig(config.network);
    if (!networkConf && config.network !== 'custom') {
      throw new Error(`Unknown network: ${config.network}`);
    }

    this.networkConfig = networkConf || {
      name: 'Custom',
      chainId: 'custom',
      evmChainId: 0,
      rpcEndpoint: '',
      restEndpoint: '',
      evmRpcEndpoint: config.evmRpcEndpoint || '',
      wsEndpoint: '',
      explorerUrl: '',
      bech32Prefix: 'sei',
      nativeDenom: 'usei',
      coinDecimals: 6,
      coinGeckoId: 'sei-network',
      gasPrice: '0.1usei',
      isTestnet: false,
    };

    if (config.evmRpcEndpoint) {
      this.networkConfig.evmRpcEndpoint = config.evmRpcEndpoint;
    }

    this.provider = new JsonRpcProvider(this.networkConfig.evmRpcEndpoint);

    if (config.privateKey) {
      this.wallet = new Wallet(config.privateKey, this.provider);
    }
  }

  getAddress(): string {
    if (!this.wallet) throw new Error('Wallet not initialized');
    return this.wallet.address;
  }

  getProvider(): JsonRpcProvider {
    return this.provider;
  }

  getNetworkConfig(): SeiNetworkConfig {
    return this.networkConfig;
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return formatEther(balance);
  }

  async getBalanceWei(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return balance.toString();
  }

  async sendTransaction(
    to: string,
    value: string,
    data?: string,
    gasLimit?: bigint,
    gasPrice?: bigint,
  ): Promise<EvmTransactionResult> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const tx: {
      to: string;
      value: bigint;
      data?: string;
      gasLimit?: bigint;
      gasPrice?: bigint;
    } = {
      to,
      value: parseEther(value),
    };

    if (data) tx.data = data;
    if (gasLimit) tx.gasLimit = gasLimit;
    if (gasPrice) tx.gasPrice = gasPrice;

    const response: TransactionResponse = await this.wallet.sendTransaction(tx);
    const receipt = await response.wait();

    if (!receipt) throw new Error('Transaction failed - no receipt');

    return this.formatTxResult(receipt);
  }

  async getTransaction(hash: string): Promise<TransactionResponse | null> {
    return this.provider.getTransaction(hash);
  }

  async getTransactionReceipt(hash: string): Promise<TransactionReceipt | null> {
    return this.provider.getTransactionReceipt(hash);
  }

  async getBlock(blockNumber?: number): Promise<Block | null> {
    return blockNumber !== undefined
      ? this.provider.getBlock(blockNumber)
      : this.provider.getBlock('latest');
  }

  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getGasPrice(): Promise<string> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice?.toString() || '0';
  }

  async estimateGas(tx: {
    to: string;
    value?: string;
    data?: string;
    from?: string;
  }): Promise<string> {
    const estimate = await this.provider.estimateGas({
      to: tx.to,
      value: tx.value ? parseEther(tx.value) : undefined,
      data: tx.data,
      from: tx.from,
    });
    return estimate.toString();
  }

  async getNonce(address?: string): Promise<number> {
    const addr = address || (this.wallet ? this.wallet.address : undefined);
    if (!addr) throw new Error('Address required');
    return this.provider.getTransactionCount(addr);
  }

  async callContract(
    contractAddress: string,
    abi: string[],
    method: string,
    args: unknown[] = [],
  ): Promise<unknown> {
    const contract = new Contract(contractAddress, abi, this.provider);
    return contract[method](...args);
  }

  async executeContract(
    contractAddress: string,
    abi: string[],
    method: string,
    args: unknown[] = [],
    value?: string,
  ): Promise<EvmTransactionResult> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const contract = new Contract(contractAddress, abi, this.wallet);
    const options = value ? { value: parseEther(value) } : {};
    const tx: TransactionResponse = await contract[method](...args, options);
    const receipt = await tx.wait();

    if (!receipt) throw new Error('Transaction failed - no receipt');

    return this.formatTxResult(receipt);
  }

  async deployContract(
    abi: string[],
    bytecode: string,
    args: unknown[] = [],
  ): Promise<{ address: string; transactionHash: string }> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const factory = new ContractFactory(abi, bytecode, this.wallet);
    const contract = await factory.deploy(...args);
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    return {
      address,
      transactionHash: contract.deploymentTransaction()?.hash || '',
    };
  }

  async getCode(address: string): Promise<string> {
    return this.provider.getCode(address);
  }

  async getLogs(filter: {
    address?: string;
    topics?: (string | null)[];
    fromBlock?: number;
    toBlock?: number;
  }): Promise<Log[]> {
    return this.provider.getLogs({
      address: filter.address,
      topics: filter.topics,
      fromBlock: filter.fromBlock,
      toBlock: filter.toBlock || 'latest',
    });
  }

  async getErc20Info(tokenAddress: string): Promise<Erc20Info> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name() as Promise<string>,
      contract.symbol() as Promise<string>,
      contract.decimals() as Promise<bigint>,
      contract.totalSupply() as Promise<bigint>,
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: totalSupply.toString(),
    };
  }

  async getErc20Balance(tokenAddress: string, accountAddress: string): Promise<string> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = (await contract.balanceOf(accountAddress)) as bigint;
    const decimals = (await contract.decimals()) as bigint;
    return formatUnits(balance, Number(decimals));
  }

  async transferErc20(
    tokenAddress: string,
    to: string,
    amount: string,
    decimals?: number,
  ): Promise<EvmTransactionResult> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
    const tokenDecimals = decimals ?? Number((await contract.decimals()) as bigint);
    const amountWei = parseUnits(amount, tokenDecimals);

    const tx: TransactionResponse = await contract.transfer(to, amountWei);
    const receipt = await tx.wait();

    if (!receipt) throw new Error('Transaction failed - no receipt');

    return this.formatTxResult(receipt);
  }

  async approveErc20(
    tokenAddress: string,
    spender: string,
    amount: string,
    decimals?: number,
  ): Promise<EvmTransactionResult> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const contract = new Contract(tokenAddress, ERC20_ABI, this.wallet);
    const tokenDecimals = decimals ?? Number((await contract.decimals()) as bigint);
    const amountWei = parseUnits(amount, tokenDecimals);

    const tx: TransactionResponse = await contract.approve(spender, amountWei);
    const receipt = await tx.wait();

    if (!receipt) throw new Error('Transaction failed - no receipt');

    return this.formatTxResult(receipt);
  }

  async getErc721Info(tokenAddress: string): Promise<Erc721Info> {
    const contract = new Contract(tokenAddress, ERC721_ABI, this.provider);

    const [name, symbol] = await Promise.all([
      contract.name() as Promise<string>,
      contract.symbol() as Promise<string>,
    ]);

    return { address: tokenAddress, name, symbol };
  }

  async getErc721Owner(tokenAddress: string, tokenId: string): Promise<string> {
    const contract = new Contract(tokenAddress, ERC721_ABI, this.provider);
    return contract.ownerOf(tokenId) as Promise<string>;
  }

  async transferErc721(
    tokenAddress: string,
    to: string,
    tokenId: string,
  ): Promise<EvmTransactionResult> {
    if (!this.wallet) throw new Error('Wallet not initialized');

    const contract = new Contract(tokenAddress, ERC721_ABI, this.wallet);
    const tx: TransactionResponse = await contract.transferFrom(
      this.wallet.address,
      to,
      tokenId,
    );
    const receipt = await tx.wait();

    if (!receipt) throw new Error('Transaction failed - no receipt');

    return this.formatTxResult(receipt);
  }

  async signMessage(message: string): Promise<string> {
    if (!this.wallet) throw new Error('Wallet not initialized');
    return this.wallet.signMessage(message);
  }

  parseEventLogs(receipt: TransactionReceipt, abi: string[]): Array<{
    name: string;
    args: Record<string, unknown>;
    address: string;
  }> {
    const iface = new Interface(abi);
    const events: Array<{ name: string; args: Record<string, unknown>; address: string }> = [];

    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
        if (parsed) {
          const args: Record<string, unknown> = {};
          for (let i = 0; i < parsed.fragment.inputs.length; i++) {
            const input = parsed.fragment.inputs[i];
            if (input) args[input.name] = parsed.args[i];
          }
          events.push({ name: parsed.name, args, address: log.address });
        }
      } catch {
        // Log doesn't match ABI
      }
    }

    return events;
  }

  private formatTxResult(receipt: TransactionReceipt): EvmTransactionResult {
    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      from: receipt.from,
      to: receipt.to,
      value: '0',
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.gasPrice?.toString() || '0',
      status: receipt.status ?? 0,
      logs: receipt.logs.map((log) => ({
        address: log.address,
        topics: [...log.topics],
        data: log.data,
      })),
    };
  }
}
