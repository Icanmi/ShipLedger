# ShipLedger Smart Contracts

This directory contains the Solidity smart contracts for the ShipLedger blockchain-powered maritime shipping platform, designed to run on the BlockDAG network.

## Contracts Overview

### 1. BillOfLading.sol
Main contract for managing digital Bills of Lading (eBL).

**Key Features:**
- Create and issue digital Bills of Lading
- Transfer ownership between parties
- Track document status throughout shipment lifecycle
- Permission-based access control
- Document verification and authentication

**Main Functions:**
- `createBillOfLading()` - Create a new BoL
- `issueBillOfLading()` - Issue the BoL (move from draft to issued)
- `transferOwnership()` - Transfer BoL to new owner
- `updateStatus()` - Update shipment status
- `surrenderBillOfLading()` - Final surrender upon delivery

**Status Flow:**
Draft → Issued → In Transit → At Port → Customs Clearance → Delivered → Surrendered

### 2. TradeFinance.sol
Smart contract for automated trade finance workflows and Letter of Credit management.

**Key Features:**
- Issue and manage Letters of Credit (L/C)
- Define payment milestones with percentages
- Automate payment releases based on milestone completion
- Handle document presentation and acceptance
- Expiry and cancellation management

**Main Functions:**
- `issueLetterOfCredit()` - Issue new L/C with escrow
- `addMilestone()` - Define payment milestones
- `presentDocuments()` - Beneficiary presents documents
- `acceptDocuments()` - Bank accepts documents
- `completeMilestone()` - Trigger automatic payment
- `markAsExpired()` - Handle L/C expiration

**Payment Flow:**
Issued → Documents Presented → Under Review → Accepted → Milestones Completed → Paid

### 3. ShipmentTracking.sol
Contract for immutable recording of shipment events and cargo movements.

**Key Features:**
- Record real-time shipment events on blockchain
- Verify events by authorized parties
- Track container movements and status
- Authorize multiple recorders (carriers, ports, customs)
- Maintain immutable audit trail

**Main Functions:**
- `createShipment()` - Initialize new shipment tracking
- `recordEvent()` - Record shipment event (location, status)
- `updateStatus()` - Update overall shipment status
- `verifyEvent()` - Verify recorded events
- `authorizeRecorder()` - Grant event recording permissions

**Tracking Flow:**
Created → Loaded → In Transit → At Port → Customs Clearance → Out for Delivery → Delivered

## Deployment on BlockDAG Network

### Prerequisites
1. BlockDAG wallet with testnet tokens
2. Truffle, Hardhat, or Remix IDE
3. BlockDAG RPC endpoint: `https://ide.awakening.bdagscan.com/`

### Using Remix IDE (Recommended for BlockDAG)

1. **Open Remix**: Navigate to https://remix.ethereum.org/
2. **Load Contracts**: Copy the `.sol` files to Remix
3. **Compile**: 
   - Select Solidity compiler version `0.8.20` or higher
   - Click "Compile BillOfLading.sol" (repeat for other contracts)
4. **Deploy**:
   - Switch to "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - Connect MetaMask to BlockDAG network:
     - Network Name: BlockDAG Testnet
     - RPC URL: `https://ide.awakening.bdagscan.com/`
     - Chain ID: (Check BlockDAG documentation)
   - Deploy contracts one by one

### Using Hardhat

1. Install dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Create `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    blockdag: {
      url: "https://ide.awakening.bdagscan.com/",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

3. Create deployment script `scripts/deploy.js`:
```javascript
async function main() {
  // Deploy BillOfLading
  const BillOfLading = await ethers.getContractFactory("BillOfLading");
  const bol = await BillOfLading.deploy();
  await bol.deployed();
  console.log("BillOfLading deployed to:", bol.address);

  // Deploy TradeFinance
  const TradeFinance = await ethers.getContractFactory("TradeFinance");
  const tf = await TradeFinance.deploy();
  await tf.deployed();
  console.log("TradeFinance deployed to:", tf.address);

  // Deploy ShipmentTracking
  const ShipmentTracking = await ethers.getContractFactory("ShipmentTracking");
  const st = await ShipmentTracking.deploy();
  await st.deployed();
  console.log("ShipmentTracking deployed to:", st.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

4. Deploy:
```bash
npx hardhat run scripts/deploy.js --network blockdag
```

## Integration with Frontend

After deploying contracts, update the frontend with:

1. **Contract Addresses**: Save deployed addresses
2. **ABIs**: Copy contract ABIs from Remix or Hardhat artifacts
3. **Update Web3 Configuration**: 

```typescript
// client/src/lib/contracts.ts
export const CONTRACTS = {
  BillOfLading: {
    address: '0x...', // Your deployed address
    abi: [...] // Contract ABI
  },
  TradeFinance: {
    address: '0x...',
    abi: [...]
  },
  ShipmentTracking: {
    address: '0x...',
    abi: [...]
  }
};
```

## Smart Contract Interactions

### Create Bill of Lading
```javascript
const contract = new web3.eth.Contract(BillOfLading.abi, BillOfLading.address);
await contract.methods.createBillOfLading(
  "BL-2024-001",
  consigneeAddress,
  carrierAddress,
  "MSC GÜLSÜN",
  "V425E",
  "Shanghai, China",
  "Rotterdam, Netherlands",
  "Electronic Components"
).send({ from: shipperAddress });
```

### Issue Letter of Credit
```javascript
const contract = new web3.eth.Contract(TradeFinance.abi, TradeFinance.address);
await contract.methods.issueLetterOfCredit(
  "LC-2024-001",
  beneficiaryAddress,
  applicantAddress,
  web3.utils.toWei("125000", "ether"),
  expiryTimestamp
).send({ 
  from: bankAddress,
  value: web3.utils.toWei("125000", "ether")
});
```

### Record Shipment Event
```javascript
const contract = new web3.eth.Contract(ShipmentTracking.abi, ShipmentTracking.address);
await contract.methods.recordEvent(
  "SHIP-2024-001",
  "Container Loaded",
  "Shanghai Port, China",
  "Container loaded onto vessel MSC GÜLSÜN"
).send({ from: carrierAddress });
```

## Security Considerations

1. **Access Control**: All contracts implement role-based access control
2. **Reentrancy Protection**: Payment functions use checks-effects-interactions pattern
3. **Input Validation**: All inputs are validated for correctness
4. **Event Logging**: All critical actions emit events for transparency
5. **Status Progression**: Status can only move forward, not backward

## Gas Optimization

- Use `string memory` for temporary strings
- Pack struct variables efficiently
- Use events instead of storage when possible
- Minimize storage writes

## Testing

Create test files in `test/` directory:

```bash
npx hardhat test
```

## License

MIT License - See individual contract files for details.

## Support

For BlockDAG-specific questions:
- BlockDAG Documentation: https://blockdag.network/docs
- BlockDAG Explorer: https://bdagscan.com/
- IDE: https://ide.awakening.bdagscan.com/
