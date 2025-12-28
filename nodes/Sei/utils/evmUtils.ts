/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers, Interface, TransactionReceipt, Log, TransactionResponse } from 'ethers';

/**
 * EVM Utilities for Sei
 *
 * Sei supports full EVM compatibility, allowing Ethereum-style
 * transactions and smart contracts alongside native Cosmos operations.
 */

/**
 * Common ERC20 ABI
 */
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

/**
 * Common ERC721 ABI
 */
export const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool approved)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
];

/**
 * Sei Pointer Precompile ABI
 */
export const SEI_POINTER_ABI = [
  'function getPointer(string memory addressType, string memory pointeeAddress) view returns (address, uint16, bool)',
];

/**
 * Sei Address Precompile ABI
 */
export const SEI_ADDRESS_ABI = [
  'function getSeiAddress(address evmAddress) view returns (string)',
  'function getEvmAddress(string memory seiAddress) view returns (address)',
];

/**
 * Transaction status interface
 */
export interface EvmTransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber: number | null;
  confirmations: number;
  gasUsed: string | null;
  effectiveGasPrice: string | null;
  from: string;
  to: string | null;
  value: string;
}

/**
 * ERC20 token info interface
 */
export interface Erc20TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

/**
 * Parse EVM transaction receipt
 */
export function parseTransactionReceipt(receipt: TransactionReceipt): EvmTransactionStatus {
  return {
    hash: receipt.hash,
    status: receipt.status === 1 ? 'confirmed' : 'failed',
    blockNumber: receipt.blockNumber,
    confirmations: 1, // Receipt means at least 1 confirmation
    gasUsed: receipt.gasUsed.toString(),
    effectiveGasPrice: receipt.gasPrice?.toString() || null,
    from: receipt.from,
    to: receipt.to,
    value: '0', // Value not in receipt, would need tx
  };
}

/**
 * Parse EVM transaction response
 */
export function parseTransactionResponse(tx: TransactionResponse): EvmTransactionStatus {
  return {
    hash: tx.hash,
    status: 'pending',
    blockNumber: tx.blockNumber,
    confirmations: 0,
    gasUsed: null,
    effectiveGasPrice: tx.gasPrice?.toString() || null,
    from: tx.from,
    to: tx.to,
    value: tx.value.toString(),
  };
}

/**
 * Decode ERC20 transfer event
 */
export function decodeErc20Transfer(log: Log): {
  from: string;
  to: string;
  value: string;
} | null {
  try {
    const iface = new Interface(ERC20_ABI);
    const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });

    if (parsed && parsed.name === 'Transfer') {
      return {
        from: parsed.args[0] as string,
        to: parsed.args[1] as string,
        value: (parsed.args[2] as bigint).toString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Decode ERC721 transfer event
 */
export function decodeErc721Transfer(log: Log): {
  from: string;
  to: string;
  tokenId: string;
} | null {
  try {
    const iface = new Interface(ERC721_ABI);
    const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });

    if (parsed && parsed.name === 'Transfer') {
      return {
        from: parsed.args[0] as string,
        to: parsed.args[1] as string,
        tokenId: (parsed.args[2] as bigint).toString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Encode function call data
 */
export function encodeFunctionCall(
  abi: string[],
  functionName: string,
  args: unknown[],
): string {
  const iface = new Interface(abi);
  return iface.encodeFunctionData(functionName, args);
}

/**
 * Decode function result
 */
export function decodeFunctionResult(
  abi: string[],
  functionName: string,
  data: string,
): unknown {
  const iface = new Interface(abi);
  return iface.decodeFunctionResult(functionName, data);
}

/**
 * Estimate gas with buffer
 */
export function addGasBuffer(estimatedGas: bigint, bufferPercentage: number = 20): bigint {
  const buffer = (estimatedGas * BigInt(bufferPercentage)) / BigInt(100);
  return estimatedGas + buffer;
}

/**
 * Format gas price for display
 */
export function formatGasPrice(gasPrice: bigint): string {
  const gwei = ethers.formatUnits(gasPrice, 'gwei');
  return `${parseFloat(gwei).toFixed(2)} Gwei`;
}

/**
 * Calculate transaction cost
 */
export function calculateTransactionCost(
  gasLimit: bigint,
  gasPrice: bigint,
): { wei: string; sei: string } {
  const costWei = gasLimit * gasPrice;
  return {
    wei: costWei.toString(),
    sei: ethers.formatEther(costWei),
  };
}

/**
 * Validate contract bytecode
 */
export function isValidBytecode(bytecode: string): boolean {
  if (!bytecode.startsWith('0x')) return false;
  const hex = bytecode.slice(2);
  return hex.length > 0 && /^[0-9a-fA-F]+$/.test(hex);
}

/**
 * Extract contract address from deployment receipt
 */
export function getDeployedContractAddress(receipt: TransactionReceipt): string | null {
  return receipt.contractAddress;
}

/**
 * Parse event logs from receipt
 */
export function parseEventLogs(
  receipt: TransactionReceipt,
  abi: string[],
): Array<{
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
          if (input) {
            args[input.name] = parsed.args[i];
          }
        }
        events.push({
          name: parsed.name,
          args,
          address: log.address,
        });
      }
    } catch {
      // Log doesn't match ABI, skip
    }
  }

  return events;
}

/**
 * Create ERC20 transfer data
 */
export function createErc20TransferData(to: string, amount: bigint): string {
  const iface = new Interface(ERC20_ABI);
  return iface.encodeFunctionData('transfer', [to, amount]);
}

/**
 * Create ERC20 approve data
 */
export function createErc20ApproveData(spender: string, amount: bigint): string {
  const iface = new Interface(ERC20_ABI);
  return iface.encodeFunctionData('approve', [spender, amount]);
}

/**
 * Validate function selector
 */
export function isValidFunctionSelector(selector: string): boolean {
  return /^0x[0-9a-fA-F]{8}$/.test(selector);
}

/**
 * Get function selector from signature
 */
export function getFunctionSelector(signature: string): string {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(signature));
  return hash.slice(0, 10);
}
