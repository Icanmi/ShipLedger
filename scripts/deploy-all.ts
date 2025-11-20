import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Main deployment script for all ShipLedger smart contracts
 * Deploys to BlockDAG testnet and saves contract addresses
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("==========================================");
  console.log("ShipLedger Smart Contract Deployment");
  console.log("==========================================");
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BDAG");
  
  if (balance === 0n) {
    console.error("\n❌ Error: Account has zero balance!");
    console.error("Please get testnet tokens from BlockDAG faucet:");
    console.error("Visit: https://bdagscan.com\n");
    process.exit(1);
  }

  const deployedContracts: Record<string, string> = {};

  // 1. Deploy BillOfLading Contract
  console.log("\n📄 Deploying BillOfLading contract...");
  const BillOfLading = await ethers.getContractFactory("BillOfLading");
  const billOfLading = await BillOfLading.deploy();
  await billOfLading.waitForDeployment();
  const bolAddress = await billOfLading.getAddress();
  deployedContracts.BillOfLading = bolAddress;
  console.log("✅ BillOfLading deployed to:", bolAddress);

  // 2. Deploy ShipmentTracking Contract
  console.log("\n📦 Deploying ShipmentTracking contract...");
  const ShipmentTracking = await ethers.getContractFactory("ShipmentTracking");
  const shipmentTracking = await ShipmentTracking.deploy();
  await shipmentTracking.waitForDeployment();
  const stAddress = await shipmentTracking.getAddress();
  deployedContracts.ShipmentTracking = stAddress;
  console.log("✅ ShipmentTracking deployed to:", stAddress);

  // 3. Deploy TradeFinance Contract
  console.log("\n💰 Deploying TradeFinance contract...");
  const TradeFinance = await ethers.getContractFactory("TradeFinance");
  const tradeFinance = await TradeFinance.deploy();
  await tradeFinance.waitForDeployment();
  const tfAddress = await tradeFinance.getAddress();
  deployedContracts.TradeFinance = tfAddress;
  console.log("✅ TradeFinance deployed to:", tfAddress);

  // 4. Deploy Insurance Contract
  console.log("\n🛡️  Deploying Insurance contract...");
  const Insurance = await ethers.getContractFactory("Insurance");
  const insurance = await Insurance.deploy();
  await insurance.waitForDeployment();
  const insAddress = await insurance.getAddress();
  deployedContracts.Insurance = insAddress;
  console.log("✅ Insurance deployed to:", insAddress);

  // Save deployment information
  const deploymentInfo = {
    network: "BlockDAG Testnet",
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    contracts: deployedContracts,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, "blockdag-testnet.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n==========================================");
  console.log("✅ All Contracts Deployed Successfully!");
  console.log("==========================================");
  console.log("\nDeployed Contract Addresses:");
  console.log("----------------------------");
  Object.entries(deployedContracts).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
  
  console.log("\n📝 Deployment info saved to:", deploymentFile);
  console.log("\n🔍 View contracts on BlockDAG Explorer:");
  console.log(`https://bdagscan.com/address/${bolAddress}`);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Update your .env file with these contract addresses");
  console.log("2. Update server/blockchain.ts with the deployed addresses");
  console.log("3. Set DEMO_MODE=false in .env to use real blockchain");
  console.log("4. Test the integration with your application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
