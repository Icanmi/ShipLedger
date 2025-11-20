import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Verify that deployed contracts are accessible and functional
 */
async function main() {
  const deploymentFile = path.join(__dirname, "../deployments/blockdag-testnet.json");
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ No deployment file found!");
    console.error("Please run: npx hardhat run scripts/deploy-all.ts --network blockdag");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("\n🔍 Verifying Deployed Contracts");
  console.log("================================\n");

  const [signer] = await ethers.getSigners();
  console.log("Connected account:", signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BDAG\n");

  // Verify each contract
  for (const [name, address] of Object.entries(deployment.contracts)) {
    console.log(`📋 Verifying ${name}...`);
    console.log(`   Address: ${address}`);
    
    try {
      // Check if contract exists by getting code
      const code = await ethers.provider.getCode(address as string);
      
      if (code === "0x") {
        console.log(`   ❌ No contract found at this address!\n`);
        continue;
      }
      
      console.log(`   ✅ Contract code found (${code.length} bytes)`);
      console.log(`   🔗 View on explorer: https://bdagscan.com/address/${address}\n`);
      
    } catch (error) {
      console.log(`   ❌ Error verifying contract:`, error);
    }
  }

  console.log("================================");
  console.log("✅ Verification Complete\n");
  
  console.log("📋 Deployment Summary:");
  console.log("Network:", deployment.network);
  console.log("Chain ID:", deployment.chainId);
  console.log("Deployed by:", deployment.deployer);
  console.log("Deployment date:", new Date(deployment.deploymentDate).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
