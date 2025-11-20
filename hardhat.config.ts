import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// BlockDAG testnet configuration
const BLOCKDAG_RPC_URL = process.env.BLOCKDAG_RPC_URL || "https://relay.awakening.bdagscan.com";

// Validate private key is set for BlockDAG network deployments
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
if (!PRIVATE_KEY && process.argv.includes("--network") && process.argv.includes("blockdag")) {
  console.error("\n❌ Error: BLOCKCHAIN_PRIVATE_KEY environment variable is not set!");
  console.error("\nPlease follow these steps:");
  console.error("1. Copy .env.example to .env");
  console.error("2. Add your BlockDAG private key to the .env file");
  console.error("3. Run the deployment command again\n");
  console.error("See DEPLOYMENT_GUIDE.md for detailed instructions.\n");
  process.exit(1);
}

const PRIVATE_KEY_VALUE = PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    blockdag: {
      url: BLOCKDAG_RPC_URL,
      accounts: [PRIVATE_KEY_VALUE],
      chainId: 1043,
      gasPrice: 2000000000, // 2 gwei
    },
    // Local Hardhat node for testing
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
