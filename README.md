# n8n-nodes-sei

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the **Sei blockchain** - a Layer 1 blockchain optimized for trading with Twin Turbo consensus, parallel execution, and native DEX support.

![n8n](https://img.shields.io/badge/n8n-community%20node-ff6d5a)
![Sei](https://img.shields.io/badge/Sei-blockchain-9945FF)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

## Features

- **16 Resource Categories** with 100+ operations
- **Full EVM Compatibility** - Ethereum-style transactions and contracts
- **Native DEX Support** - Order placement, market data, and trading
- **CosmWasm Integration** - Smart contract queries and execution
- **IBC Transfers** - Cross-chain token transfers
- **Oracle Module** - Price feeds and TWAP queries
- **Token Factory** - Create and manage native tokens
- **Staking & Governance** - Delegate, vote, and earn rewards
- **Trigger Node** - Real-time blockchain event monitoring
- **Address Interoperability** - Sei ↔ EVM address conversion

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in n8n
2. Select **Install**
3. Enter `n8n-nodes-sei`
4. Agree to the risks and click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-sei
```

### Development Installation

```bash
# Clone and build
git clone https://github.com/Velocity-BPA/n8n-nodes-sei.git
cd n8n-nodes-sei
npm install
npm run build

# Link to n8n
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-sei

# Restart n8n
n8n start
```

## Credentials Setup

### Sei Network Credentials

| Field | Description |
|-------|-------------|
| Network | Select network (Mainnet, Testnet, Devnet, Custom) |
| RPC Endpoint | RPC URL (auto-populated for known networks) |
| REST Endpoint | REST/LCD URL (auto-populated for known networks) |
| EVM RPC Endpoint | EVM JSON-RPC URL |
| Mnemonic Phrase | 24-word recovery phrase for signing transactions |
| HD Derivation Path | Default: m/44'/118'/0'/0/0 |
| EVM Private Key | Optional Ethereum-format private key |
| Gas Price | Default: 0.1usei |

### Sei EVM Credentials

| Field | Description |
|-------|-------------|
| Network | Select network with EVM Chain ID |
| EVM RPC URL | EVM JSON-RPC endpoint |
| Chain ID | Auto-populated (1329 for mainnet) |
| Private Key | Ethereum-format private key (0x...) |

## Resources & Operations

### Account
- Get Account Info, SEI Balance, All Balances
- Get Delegations, Rewards, Unbonding Delegations
- Validate Address, Convert Sei ↔ EVM Address
- Get Account Transactions

### Transaction
- Send SEI, Send Token
- Get Transaction, Get Transaction Status
- Simulate Transaction, Multi-Send

### Bank
- Get Balance, Get All Balances
- Get Total Supply, Get Supply of Denom
- Get Denom Metadata, Get Spendable Balances

### Staking
- Get Validators, Get Validator Info
- Delegate SEI, Undelegate SEI, Redelegate SEI
- Get Delegations, Get Staking Pool/Params

### Distribution
- Get Delegation Rewards, Get All Rewards
- Withdraw Rewards, Withdraw All Rewards
- Get Community Pool, Get Distribution Params

### Governance
- Get Proposals, Get Proposal by ID
- Get Proposal Votes/Tally
- Vote on Proposal, Deposit to Proposal
- Get Governance Params

### DEX (Native Order Book)
- Get Markets, Get Orderbook
- Get Price, Get Mid Price, Get Spread
- Get Trade History, Get 24h Volume
- Get Market Stats

### Order
- Place Limit/Market Order
- Cancel Order, Cancel All Orders
- Get Order, Get Orders by Account
- Get Open Orders, Batch Operations

### Oracle
- Get Exchange Rate, Get All Exchange Rates
- Get TWAP (Time-Weighted Average Price)
- Get Vote Targets, Get Oracle Params

### Token Factory
- Create Denom, Mint Tokens, Burn Tokens
- Change Admin, Get Denom Info
- Get Denoms by Creator, Get Authority Metadata

### IBC
- IBC Transfer to connected chains
- Get IBC Channels, Connections, Clients
- Get Channel Info, Denom Trace
- Get IBC Params, Escrow Address

### WASM (CosmWasm)
- Get Contract Info, Query Contract
- Execute Contract, Instantiate Contract
- Get Code Info, Get Codes
- Get Contracts by Code

### EVM
- Get EVM Balance, Send EVM Transaction
- Get Transaction Receipt
- Call Contract (read), Execute Contract (write)
- Deploy Contract, Get Gas Price
- Estimate Gas, Get Block, Get Logs
- Get Nonce, Sign Message
- Get ERC20 Balance, Transfer ERC20

### Pointer (Interoperability)
- Get CW20/CW721 Pointer
- Get ERC20/ERC721 Pointer
- Get Native Pointer
- Check Pointer Exists

### Block
- Get Latest Block, Get Block by Height
- Get Block Results, Get Validator Set
- Get Node Info, Get Syncing Status
- Health Check

### Utility
- Convert Units (SEI ↔ usei ↔ wei)
- Convert Address (Sei ↔ EVM)
- Validate Address
- Get Chain ID, Get Network Status

## Trigger Node

The **Sei Trigger** node monitors blockchain events:

- **New Block** - Trigger on new blocks
- **Balance Changed** - Monitor address balance changes
- **Transaction Received/Sent** - Track incoming/outgoing transactions
- **Large Transaction** - Alert on large transfers
- **Staking Rewards** - Notify when rewards are available
- **Proposal Created** - Track new governance proposals
- **Price Alert** - Monitor price thresholds

## Usage Examples

### Send SEI Tokens

```
Resource: Transaction
Operation: Send SEI
Recipient: sei1abc...
Amount: 10.5
Memo: Payment for services
```

### Query Account Balance

```
Resource: Account
Operation: Get All Balances
Address: sei1xyz...
```

### Place Limit Order on Native DEX

```
Resource: Order
Operation: Place Limit Order
Contract Address: sei1dex...
Price: 1.25
Quantity: 100
Side: Buy
Price Denom: usei
Asset Denom: factory/sei1.../mytoken
```

### Execute CosmWasm Contract

```
Resource: WASM
Operation: Execute Contract
Contract Address: sei1contract...
Execute Message: {"transfer": {"recipient": "sei1...", "amount": "1000"}}
Funds: [{"denom": "usei", "amount": "1000000"}]
```

### IBC Transfer to Osmosis

```
Resource: IBC
Operation: IBC Transfer
Destination Chain: Osmosis
Recipient: osmo1...
Amount: 1000000
Token Denom: usei
```

### Convert Sei Address to EVM

```
Resource: Utility
Operation: Convert Address
Address: sei1abc123...
```

## Sei Blockchain Concepts

| Concept | Description |
|---------|-------------|
| **SEI** | Native token of the Sei network |
| **usei** | Smallest unit (1 SEI = 1,000,000 usei) |
| **Twin Turbo Consensus** | Fast finality (~400ms block times) |
| **Parallel Execution** | Concurrent transaction processing (12,500+ TPS) |
| **Native DEX** | Built-in order book exchange |
| **Pointer System** | CW ↔ ERC token interoperability |
| **Oracle Module** | Decentralized price feeds |
| **Token Factory** | Create native tokens without smart contracts |

## Networks

| Network | Chain ID | EVM Chain ID | Type |
|---------|----------|--------------|------|
| Pacific-1 | pacific-1 | 1329 | Mainnet |
| Atlantic-2 | atlantic-2 | 1328 | Testnet |
| Devnet | sei-devnet-3 | 713715 | Development |

## Error Handling

The node provides descriptive error messages for:
- Invalid addresses (Sei and EVM formats)
- Insufficient balances
- Failed transactions
- Network connectivity issues
- Invalid parameters

## Security Best Practices

1. **Never share your mnemonic** - Store securely in n8n credentials
2. **Use testnet first** - Test workflows before mainnet
3. **Validate addresses** - Use the Validate Address operation
4. **Monitor gas costs** - Check gas prices before large operations
5. **Secure your n8n instance** - Use proper authentication

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Test
npm test

# Test with coverage
npm run test:coverage
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

- [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-sei/issues)
- [Sei Documentation](https://docs.sei.io/)
- [n8n Community](https://community.n8n.io/)

## Acknowledgments

- [Sei Network](https://sei.io/) - The fastest Layer 1 blockchain
- [n8n](https://n8n.io/) - Workflow automation platform
- [CosmJS](https://github.com/cosmos/cosmjs) - Cosmos SDK JavaScript library
- [ethers.js](https://ethers.org/) - Ethereum library
