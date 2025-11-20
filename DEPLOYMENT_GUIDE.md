# ShipLedger Smart Contract Deployment Guide

## Overview
This guide walks you through deploying ShipLedger's smart contracts to the BlockDAG testnet, a critical step in moving from demo mode to production-ready blockchain integration.

## Prerequisites

### 1. Install MetaMask
- Install MetaMask browser extension: https://metamask.io/download/
- Create a new wallet or import an existing one
- **IMPORTANT**: Save your seed phrase securely!

### 2. Add BlockDAG Network to MetaMask

**Option A: Automatic Setup**
1. Visit https://bdagscan.com
2. Click "Add BlockDAG Network" button

**Option B: Manual Setup**
1. Open MetaMask
2. Click Networks dropdown → "Add Network" → "Add a network manually"
3. Enter the following details:
   - **Network Name**: BlockDAG Testnet
   - **RPC URL**: `https://relay.awakening.bdagscan.com`
   - **Chain ID**: `1043`
   - **Currency Symbol**: `BDAG`
   - **Block Explorer**: `https://bdagscan.com`
4. Click "Save"

### 3. Get Test BDAG Tokens
1. Copy your MetaMask wallet address
2. Visit https://bdagscan.com
3. Navigate to the Faucet section
4. Paste your wallet address
5. Request testnet tokens (up to 100 BDAG per request)
6. Wait for confirmation (usually 10-30 seconds)

**Verify tokens received:**
- Check your MetaMask balance
- Should show BDAG tokens

## Deployment Process

### Step 1: Export Your Private Key

**⚠️ SECURITY WARNING**: Never share your private key or commit it to version control!

1. Open MetaMask
2. Click the three dots menu → Account Details
3. Click "Show Private Key"
4. Enter your password
5. Copy the private key

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your private key:
   ```bash
   # BlockDAG Network Configuration
   BLOCKDAG_RPC_URL=https://relay.awakening.bdagscan.com
   BLOCKCHAIN_PRIVATE_KEY=your_actual_private_key_here
   
   # Set to false when contracts are deployed
   DEMO_MODE=true
   ```

3. **IMPORTANT**: Add `.env` to `.gitignore` (already done in this project)

### Step 3: Compile Smart Contracts

Compile all Solidity contracts:

```bash
npx hardhat compile
```

**Expected output:**
```
Compiled 4 Solidity files successfully
```

**If you see errors:**
- Check Solidity version compatibility (0.8.20)
- Ensure all contract dependencies are correct

### Step 4: Test Compilation Locally (Optional but Recommended)

Test deployment on local Hardhat network first:

```bash
# In terminal 1: Start local node
npx hardhat node

# In terminal 2: Deploy to local network
npx hardhat run scripts/deploy-all.ts --network hardhat
```

This helps catch errors before spending testnet gas.

### Step 5: Deploy to BlockDAG Testnet

**Deploy all contracts:**

```bash
npx hardhat run scripts/deploy-all.ts --network blockdag
```

**What happens during deployment:**
1. Connects to BlockDAG testnet
2. Checks your account balance
3. Deploys BillOfLading contract
4. Deploys ShipmentTracking contract
5. Deploys TradeFinance contract
6. Deploys Insurance contract
7. Saves deployment info to `deployments/blockdag-testnet.json`

**Expected output:**
```
==========================================
ShipLedger Smart Contract Deployment
==========================================
Deploying contracts with account: 0x...
Account balance: 100.0 BDAG

📄 Deploying BillOfLading contract...
✅ BillOfLading deployed to: 0xABC123...

📦 Deploying ShipmentTracking contract...
✅ ShipmentTracking deployed to: 0xDEF456...

💰 Deploying TradeFinance contract...
✅ TradeFinance deployed to: 0xGHI789...

🛡️  Deploying Insurance contract...
✅ Insurance deployed to: 0xJKL012...

==========================================
✅ All Contracts Deployed Successfully!
==========================================
```

**Time estimate:** 2-5 minutes (depending on network congestion)

**Gas costs:** Approximately 5-10 BDAG total for all contracts

### Step 6: Verify Deployment

1. Check the `deployments/blockdag-testnet.json` file:
   ```json
   {
     "network": "BlockDAG Testnet",
     "chainId": "1043",
     "deployer": "0x...",
     "deploymentDate": "2025-11-20T...",
     "contracts": {
       "BillOfLading": "0xABC123...",
       "ShipmentTracking": "0xDEF456...",
       "TradeFinance": "0xGHI789...",
       "Insurance": "0xJKL012..."
     }
   }
   ```

2. Verify on BlockDAG Explorer:
   - Visit https://bdagscan.com
   - Search for each contract address
   - Confirm successful deployment
   - Check transaction details

### Step 7: Update Application Configuration

1. **Update .env with deployed addresses:**
   ```bash
   CONTRACT_BILL_OF_LADING=0xABC123...
   CONTRACT_SHIPMENT_TRACKING=0xDEF456...
   CONTRACT_TRADE_FINANCE=0xGHI789...
   CONTRACT_INSURANCE=0xJKL012...
   
   # Switch to production mode
   DEMO_MODE=false
   ```

2. **Update server/blockchain.ts** (instructions in next section)

### Step 8: Verify Contract Source Code (Optional)

Verify your contracts on the BlockDAG explorer for transparency:

1. Visit https://bdagscan.com/address/YOUR_CONTRACT_ADDRESS
2. Click "Verify & Publish"
3. Upload contract source code
4. Confirm contract parameters match deployment

## Troubleshooting

### Error: "Insufficient funds"
- **Solution**: Get more testnet BDAG from faucet
- You need approximately 10 BDAG for all deployments

### Error: "Nonce too high" or "Nonce too low"
- **Solution**: Reset MetaMask account
  1. Settings → Advanced → Clear activity tab data
  2. Retry deployment

### Error: "Cannot connect to network"
- **Solution**: Check RPC URL and network configuration
- Verify you're connected to BlockDAG testnet in MetaMask

### Deployment hangs or times out
- **Solution**: BlockDAG network may be congested
- Wait a few minutes and retry
- Check https://bdagscan.com for network status

### Error: "Contract already deployed"
- **Solution**: This is normal if retrying
- Check `deployments/` folder for existing addresses
- Use those addresses instead of redeploying

## Security Best Practices

### Development Environment
- ✅ Use testnet for all testing
- ✅ Never use mainnet private keys in development
- ✅ Keep `.env` in `.gitignore`
- ✅ Use environment variables, never hardcode keys

### Production Environment (Future)
- [ ] Use hardware wallet for mainnet deployments
- [ ] Implement multi-signature wallets for contract ownership
- [ ] Conduct security audit before mainnet deployment
- [ ] Use separate deployer accounts for different contracts

## Next Steps After Deployment

1. **Update backend integration** (see server/blockchain.ts)
2. **Run integration tests** with real blockchain calls
3. **Monitor gas costs** and optimize if needed
4. **Document contract addresses** for team reference
5. **Set up monitoring** for contract events
6. **Plan pilot program** with anchor partners

## Helpful Commands

```bash
# Compile contracts
npx hardhat compile

# Deploy to BlockDAG testnet
npx hardhat run scripts/deploy-all.ts --network blockdag

# Test locally
npx hardhat node
npx hardhat run scripts/deploy-all.ts --network localhost

# Check Hardhat version
npx hardhat --version

# Clean artifacts
npx hardhat clean
```

## Resources

- **BlockDAG Testnet Explorer**: https://bdagscan.com
- **BlockDAG Documentation**: https://docs.blockdagnetwork.io
- **BlockDAG Developer Hub**: https://blockdag.network/developer-hub
- **Hardhat Documentation**: https://hardhat.org/docs
- **Ethers.js Documentation**: https://docs.ethers.org

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review Hardhat and BlockDAG documentation
3. Contact BlockDAG support: support@blockdagnetwork.io
4. Join BlockDAG Discord community

---

**Remember**: You're deploying to testnet, so there's no risk to real funds. Experiment freely and learn!
