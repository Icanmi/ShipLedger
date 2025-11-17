# ShipLedger Smart Contracts

## 📌 Purpose

ShipLedger's smart contracts provide a decentralized, immutable infrastructure for global maritime trade operations on the BlockDAG network. These contracts automate critical logistics workflows including digital Bills of Lading (eBL) management, real-time shipment tracking, and trade finance settlement. By leveraging blockchain technology, ShipLedger eliminates paper-based inefficiencies, reduces fraud, enables instant verification, and creates a trusted collaborative environment for shippers, carriers, customs authorities, banks, and consignees.

## 📄 Contract Summary

### BillOfLading.sol (349 lines)
**Core Functionality**: Manages the complete lifecycle of digital Bills of Lading with cryptographic ownership transfer and status tracking.

**Key Functions**:
- `createBillOfLading()` - Initialize new eBL with shipper, consignee, carrier, vessel, and cargo details
- `issueBillOfLading()` - Transition from Draft to Issued status (shipper-only)
- `updateStatus()` - Progress document through shipment lifecycle
- `transferOwnership()` - Transfer eBL ownership to new party with authorization trail
- `surrenderBillOfLading()` - Final surrender upon cargo delivery
- `authorizeParty()` - Grant access permissions to third parties
- `getBillOfLading()` - Retrieve document details (authorized parties only)
- `verifyBillOfLading()` - Cryptographic verification of document authenticity

**Modifiers**: `onlyShipper`, `onlyOwner`, `onlyAuthorized`, `bolExists`

**Events**: `BillOfLadingCreated`, `BillOfLadingIssued`, `StatusUpdated`, `OwnershipTransferred`, `PartyAuthorized`

**Status Flow**: Draft → Issued → InTransit → AtPort → CustomsClearance → Delivered → Surrendered

---

### ShipmentTracking.sol (345 lines)
**Core Functionality**: Provides immutable, timestamped recording of cargo movements and shipment events with multi-party verification.

**Key Functions**:
- `createShipment()` - Initialize shipment tracking with BL reference and container details
- `recordEvent()` - Log shipment events (loading, departure, arrival, customs) with location and timestamp
- `updateStatus()` - Update overall shipment status (unidirectional progression only)
- `authorizeRecorder()` - Grant event recording permissions to ports, carriers, customs
- `verifyEvent()` - Third-party verification of recorded events
- `getShipmentEvents()` - Retrieve complete event history for audit trail
- `getLatestEvent()` - Query most recent shipment update

**Modifiers**: `onlyShipper`, `onlyAuthorizedRecorder`, `shipmentExists`

**Events**: `ShipmentCreated`, `EventRecorded`, `StatusUpdated`, `RecorderAuthorized`, `EventVerified`

**Status Flow**: Created → Loaded → InTransit → AtPort → CustomsClearance → OutForDelivery → Delivered

---

### TradeFinance.sol (401 lines)
**Core Functionality**: Automates Letter of Credit workflows with escrow-based milestone payments and document-driven settlement.

**Key Functions**:
- `issueLetterOfCredit()` - Create L/C with escrowed funds, beneficiary, expiry date
- `addMilestone()` - Define payment milestones with percentage-based releases
- `presentDocuments()` - Beneficiary submits shipping documents for payment
- `acceptDocuments()` - Bank/issuer approves presented documents
- `completeMilestone()` - Trigger automatic payment release upon milestone completion
- `cancelLetterOfCredit()` - Cancel L/C with automatic refund (if no payments released)
- `markAsExpired()` - Handle expiry with automatic refund of unreleased funds

**Modifiers**: `onlyIssuer`, `onlyBeneficiary`, `lcExists`, `notExpired`

**Events**: `LetterOfCreditIssued`, `DocumentsPresented`, `LCStatusUpdated`, `MilestoneCompleted`, `PaymentReleased`, `LCExpired`

**Payment Flow**: Issued → DocumentsPresented → UnderReview → Accepted → Milestones Completed → Paid

## 🔑 Key Features

- **Immutable Document Registry**: All Bills of Lading and shipment events permanently recorded on BlockDAG with cryptographic verification
- **Role-Based Access Control**: Granular permissions ensure only authorized parties can create, update, or transfer documents
- **Automated Trade Finance**: Smart contract-driven Letter of Credit settlements eliminate manual bank processing delays
- **Multi-Party Verification**: Customs authorities, port operators, and carriers can independently verify and attest to shipment events
- **Ownership Transfer Trail**: Complete audit trail of eBL ownership transfers with timestamp and party identification
- **Escrow & Payment Automation**: Funds locked in smart contract with milestone-based releases tied to document presentation
- **Fraud Prevention**: Blockchain immutability prevents document forgery, double-financing, and unauthorized modifications
- **Real-Time Transparency**: All stakeholders access synchronized shipment status without information asymmetry
- **Compliance Ready**: Event logs and status transitions provide regulatory authorities with complete trade documentation
- **Cost Efficiency**: Eliminates courier costs for physical documents and reduces processing time from days to minutes

## 👥 Actors & Access Control

| Role | Permission Level | Contracts | Notes |
|------|------------------|-----------|-------|
| **Shipper** | Document Creator | BillOfLading, ShipmentTracking | Creates eBLs, initiates shipments, authorizes third parties |
| **Consignee** | Document Recipient | BillOfLading | Receives ownership upon transfer, can surrender eBL upon delivery |
| **Carrier** | Event Recorder | ShipmentTracking, BillOfLading | Records loading/transit/delivery events, updates shipment status |
| **Port Authority** | Event Validator | ShipmentTracking | Records port arrival/departure events, verifies container movements |
| **Customs** | Regulatory Validator | ShipmentTracking | Verifies events, records customs clearance status |
| **Bank (Issuer)** | L/C Administrator | TradeFinance | Issues Letters of Credit, accepts documents, releases milestone payments |
| **Beneficiary (Seller)** | Payment Recipient | TradeFinance | Presents shipping documents, receives automated payments |
| **Applicant (Buyer)** | L/C Requestor | TradeFinance | Referenced in L/C structure, receives refunds on cancellation |
| **Current Owner** | Transfer Authority | BillOfLading | Can transfer eBL ownership, surrender document upon delivery |
| **Authorized Parties** | Limited Access | BillOfLading, ShipmentTracking | View-only or conditional update access granted by shipper |

## 🔁 Workflow & State Logic

### Bill of Lading Lifecycle
```
┌─────────┐   Shipper Creates eBL   ┌────────┐   Shipper Issues   ┌────────┐
│  Draft  │ ───────────────────────> │ Issued │ ─────────────────> │ Transit│
└─────────┘                           └────────┘                    └────────┘
                                                                         │
                                                                         v
┌────────────┐   Cargo Delivered   ┌────────────┐   Port Entry  ┌─────────┐
│ Surrendered│ <─────────────────  │  Delivered │ <───────────  │ At Port │
└────────────┘                      └────────────┘               └─────────┘
                                          ^                            │
                                          │      Customs Clearance     v
                                    ┌─────────────┐            ┌──────────────┐
                                    │ Out Delivery│            │   Customs    │
                                    └─────────────┘            └──────────────┘
```

### Shipment Tracking Event Flow
```
Created → Carrier Loads Container → Vessel Departs → In Transit
   ↓                                                        ↓
Authorized Recorders Added                    Real-time Event Recording
   ↓                                                        ↓
Port Arrival → Customs Clearance → Out for Delivery → Delivered
```

### Letter of Credit Settlement Process
```
┌──────────┐   Bank Issues L/C    ┌────────┐   Seller Ships   ┌───────────────┐
│   Draft  │ ──────────────────> │ Issued │ ──────────────> │ Docs Presented│
└──────────┘   (Funds Escrowed)   └────────┘                  └───────────────┘
                                                                      │
                                                                      v
┌────────┐   All Milestones      ┌──────────┐   Bank Accepts  ┌─────────────┐
│  Paid  │ <──────────────────  │ Accepted │ <────────────── │ Under Review│
└────────┘   Complete + Released └──────────┘                  └─────────────┘
                                       │
                                       v
                              Milestone 1 Complete → 30% Payment
                              Milestone 2 Complete → 40% Payment  
                              Milestone 3 Complete → 30% Payment
```

### State Transition Rules
- **Unidirectional Progression**: Shipment and eBL statuses can only advance forward, never regress
- **Authorization Gates**: Status updates require role-specific permissions (shipper, carrier, customs)
- **Immutable Events**: Once recorded, shipment events cannot be deleted or modified, only verified
- **Expiry Handling**: L/Cs automatically refund unreleased funds to issuer upon expiration
- **Ownership Atomicity**: eBL ownership transfers are atomic transactions with event emission

## 🛠 Deployment Notes

### Solidity Configuration
- **Compiler Version**: `^0.8.20` (Solidity 0.8.20 or higher)
- **License**: MIT
- **EVM Compatibility**: Standard EVM opcodes, no experimental features
- **Optimization**: Enabled (200 runs recommended for deployment efficiency)

### Dependencies
- **No External Libraries**: Contracts are self-contained with no OpenZeppelin or third-party dependencies
- **Standard Library**: Uses native Solidity types, mappings, structs, and events
- **Gas Considerations**: String storage and dynamic arrays used intentionally for human readability

### Testing & Migration Tools

#### Hardhat (Recommended)
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network blockdag
```

**Sample hardhat.config.js**:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    blockdag_testnet: {
      url: "https://ide.awakening.bdagscan.com/",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1 // Update with actual BlockDAG chain ID
    }
  }
};
```

#### Remix IDE (Quick Testing)
1. Navigate to https://remix.ethereum.org/
2. Load `.sol` files into Remix workspace
3. Compile with Solidity `0.8.20`
4. Deploy using Injected Provider (MetaMask connected to BlockDAG)

#### Foundry (Advanced)
```bash
forge build
forge test
forge script script/Deploy.s.sol --rpc-url $BLOCKDAG_RPC_URL --broadcast
```

### Recommended Test Network Settings

**BlockDAG Testnet**:
- **Network Name**: BlockDAG Testnet
- **RPC URL**: `https://ide.awakening.bdagscan.com/`
- **Chain ID**: Contact BlockDAG documentation
- **Currency Symbol**: BDAG
- **Block Explorer**: https://bdagscan.com/

**Required Environment Variables**:
```bash
BLOCKDAG_RPC_URL=https://ide.awakening.bdagscan.com/
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS_BILL_OF_LADING=0x...
CONTRACT_ADDRESS_SHIPMENT_TRACKING=0x...
CONTRACT_ADDRESS_TRADE_FINANCE=0x...
```

### Deployment Checklist
- [ ] Compile contracts with Solidity 0.8.20
- [ ] Run unit tests for all contract functions
- [ ] Deploy to BlockDAG testnet
- [ ] Verify contract source code on block explorer
- [ ] Test contract interactions via frontend
- [ ] Document deployed contract addresses
- [ ] Update backend configuration with ABIs and addresses
- [ ] Perform end-to-end integration testing
- [ ] Security audit (recommended for mainnet)
- [ ] Deploy to BlockDAG mainnet

## ⚙️ BlockDAG Compatibility Assessment

### Current Compatibility: ✅ FULL COMPATIBILITY

**EVM Support**: BlockDAG is fully EVM-compatible. All three contracts use standard Solidity 0.8.20 features and opcodes that execute identically on BlockDAG as on Ethereum.

**Gas Model**: BlockDAG implements standard EVM gas metering. Gas costs for SSTORE, SLOAD, CREATE, and CALL operations remain consistent.

**Finality & Consensus**: BlockDAG's DAG-based consensus provides faster finality than traditional blockchain while maintaining EVM compatibility. Contract logic is unaffected by the underlying consensus mechanism.

**Storage Compatibility**: Standard EVM storage mechanisms (mappings, arrays, structs) work without modification on BlockDAG.

**Block Properties**: `block.timestamp`, `block.number`, `msg.sender`, and `tx.origin` behave identically to standard EVM chains.

### Required Modifications: ✅ NONE

**Zero Breaking Changes**: Contracts are deployment-ready for BlockDAG without any code modifications.

**Already Configured**: 
- Backend service (`server/blockchain.ts`) already configured with BlockDAG RPC endpoint
- Frontend utilities (`client/src/lib/web3.ts`) configured for BlockDAG network
- Demo mode implemented for testing without blockchain connectivity

### Supportive Networks

**Primary Target**: BlockDAG Network
- Testnet: https://ide.awakening.bdagscan.com/
- Mainnet: (TBD - check BlockDAG documentation)

**Alternative EVM-Compatible DAG Networks** (contracts are portable):
- Fantom Opera (DAG-based, EVM-compatible)
- Avalanche C-Chain (DAG consensus, EVM execution)
- Hedera Hashgraph (with EVM compatibility layer)
- Any standard EVM chain (Ethereum, Polygon, BSC, Arbitrum, Optimism)

### Performance Advantages on BlockDAG

1. **Parallel Transaction Processing**: DAG structure allows multiple shipment events to be recorded simultaneously
2. **Higher Throughput**: Faster block times improve user experience for real-time tracking updates
3. **Lower Gas Fees**: DAG efficiency typically results in 10-100x lower transaction costs
4. **Improved Finality**: Faster confirmation times for time-sensitive trade finance operations

### Upgrade Plan

**Phase 1 - Testnet Deployment** (Current):
- Deploy all three contracts to BlockDAG testnet
- Integrate with existing frontend and backend services
- Conduct end-to-end testing with demo data

**Phase 2 - Security Hardening**:
- External security audit
- Add OpenZeppelin ReentrancyGuard to payment functions
- Implement Pausable pattern for emergency circuit breaker
- Add AccessControl for more granular role management

**Phase 3 - Mainnet Launch**:
- Deploy to BlockDAG mainnet
- Establish monitoring and alerting for contract events
- Document gas optimization improvements
- Create upgrade proxy pattern for future enhancements

**Phase 4 - Cross-Chain Expansion**:
- Deploy to complementary networks (Polygon for L2 scaling, Ethereum for maximum security)
- Implement cross-chain messaging for multi-network interoperability

## 📌 Backlog / Next Upgrade

### Tokenization of Logistics Assets
- **Fractional Ownership**: Tokenize high-value cargo for fractional investment (e.g., ERC-1155 for cargo shares)
- **NFT-Based eBLs**: Mint each Bill of Lading as a unique NFT (ERC-721) for enhanced transferability
- **Cargo-Backed Stablecoins**: Issue tokens backed by in-transit cargo value for instant liquidity
- **Warehouse Receipts**: Tokenize stored goods for commodities trading on-chain

### Off-Chain/On-Chain Hybrid Optimization
- **Layer 2 Integration**: Move high-frequency event recording to Polygon/Optimism rollups, anchor to BlockDAG
- **IPFS Document Storage**: Store large PDF/image attachments on IPFS, record content hash on-chain
- **State Channels**: Enable real-time carrier updates via state channels with periodic blockchain settlement
- **Selective On-Chain Anchoring**: Record only critical status changes on-chain, maintain full event log off-chain

### Oracle & IoT Verification Integration
- **GPS Oracle Integration**: Chainlink/Band Protocol oracles verify container location against reported events
- **IoT Sensor Feeds**: Temperature, humidity, shock sensors automatically trigger status updates and insurance claims
- **Weather Data Oracle**: Cross-verify shipment delays against actual weather conditions
- **Port Authority APIs**: Automated vessel arrival/departure confirmation via trusted oracles
- **Customs API Integration**: Real-time customs clearance status updates from government systems

### Gas Optimization Refactor
- **String → Bytes32**: Replace string identifiers with bytes32 for 50%+ gas reduction
- **Struct Packing**: Reorganize struct members for optimal storage slot usage
- **Mapping Over Arrays**: Eliminate dynamic arrays where possible for predictable gas costs
- **Event Emission Optimization**: Remove redundant event parameters, use indexed fields strategically
- **View Function Caching**: Implement client-side caching for frequently queried read functions

### Advanced Features Roadmap
- **Multi-Signature Approvals**: Require 2-of-3 or 3-of-5 signatures for high-value L/C releases
- **Automated Dispute Resolution**: Smart contract arbitration system with staked validator voting
- **Insurance Integration**: Parametric insurance triggers based on verified delay/damage events
- **Carbon Credit Tracking**: Record and tokenize carbon emissions for sustainability reporting
- **Regulatory Compliance Modules**: Built-in AML/KYC verification for cross-border transactions
- **Dynamic Pricing Oracles**: Real-time freight rate adjustments based on market conditions
- **Reputation System**: On-chain scoring for carriers, shippers, and service providers
- **Intermodal Tracking**: Extend beyond maritime to rail, trucking, air freight with unified contract interface

---

**Contract Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintainer**: ShipLedger Development Team  
**Network**: BlockDAG (EVM-Compatible)
