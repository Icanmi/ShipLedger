import { ethers } from "ethers";
import { storage } from "./storage";
import crypto from "crypto";

// Demo mode toggle - set to true to mock blockchain calls
const DEMO_MODE = process.env.DEMO_MODE === "true";

// BlockDAG testnet configuration
const BLOCKDAG_RPC_URL = process.env.BLOCKDAG_RPC_URL || "https://testnet-rpc.blockdag.network";
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;

// Simple smart contract ABI for storing document hashes
const SHIPLEDGER_CONTRACT_ABI = [
  "function recordDocument(string memory docType, string memory docId, string memory docHash, address participant) public returns (bool)",
  "function getDocument(string memory docId) public view returns (string memory docType, string memory docHash, address participant, uint256 timestamp)",
  "event DocumentRecorded(string indexed docType, string indexed docId, string docHash, address participant, uint256 timestamp)"
];

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"; // Placeholder

class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;

  constructor() {
    if (!DEMO_MODE && PRIVATE_KEY) {
      try {
        this.provider = new ethers.JsonRpcProvider(BLOCKDAG_RPC_URL);
        this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, SHIPLEDGER_CONTRACT_ABI, this.wallet);
      } catch (error) {
        console.error("Failed to initialize blockchain connection:", error);
      }
    }
  }

  /**
   * Generate a SHA-256 hash of document content
   */
  generateDocumentHash(data: any): string {
    const content = JSON.stringify(data);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Record a document on the blockchain
   */
  async recordDocument(
    docType: string,
    docId: string,
    data: any,
    participantId: string,
    eventType: string
  ): Promise<{ txHash: string; blockNumber?: number; gasUsed?: string; documentHash: string }> {
    const documentHash = this.generateDocumentHash(data);

    // Demo mode - generate mock transaction
    if (DEMO_MODE || !this.contract) {
      const mockTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      const mockBlockNumber = Math.floor(Math.random() * 1000000) + 12345000;
      const mockGasUsed = (Math.floor(Math.random() * 30000) + 20000).toString();

      console.log(`[DEMO MODE] Simulated blockchain transaction:`, {
        txHash: mockTxHash,
        blockNumber: mockBlockNumber,
        gasUsed: mockGasUsed,
        documentHash
      });

      // Store in database
      await storage.createBlockchainTransaction({
        txHash: mockTxHash,
        eventType,
        entityType: docType,
        entityId: docId,
        blockNumber: mockBlockNumber,
        gasUsed: mockGasUsed,
        documentHash,
        participantId,
        metadata: { demoMode: true },
        verified: true,
      });

      return {
        txHash: mockTxHash,
        blockNumber: mockBlockNumber,
        gasUsed: mockGasUsed,
        documentHash
      };
    }

    // Real blockchain transaction
    try {
      const participantAddress = this.wallet!.address; // In production, map user ID to blockchain address
      
      const tx = await this.contract.recordDocument(
        docType,
        docId,
        documentHash,
        participantAddress
      );

      console.log(`Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();

      const blockNumber = receipt.blockNumber;
      const gasUsed = receipt.gasUsed.toString();

      // Store in database
      await storage.createBlockchainTransaction({
        txHash: tx.hash,
        eventType,
        entityType: docType,
        entityId: docId,
        blockNumber,
        gasUsed,
        documentHash,
        participantId,
        metadata: { contractAddress: CONTRACT_ADDRESS },
        verified: true,
      });

      return {
        txHash: tx.hash,
        blockNumber,
        gasUsed,
        documentHash
      };
    } catch (error) {
      console.error("Blockchain transaction failed:", error);
      throw new Error(`Failed to record on blockchain: ${error}`);
    }
  }

  /**
   * Verify a document exists on the blockchain
   */
  async verifyDocument(docId: string): Promise<boolean> {
    if (DEMO_MODE || !this.contract) {
      // In demo mode, check if transaction exists in database
      const transactions = await storage.getBlockchainTransactionsByEntity("instruction", docId);
      return transactions.length > 0;
    }

    try {
      const result = await this.contract.getDocument(docId);
      return result.docHash !== "";
    } catch (error) {
      console.error("Verification failed:", error);
      return false;
    }
  }

  /**
   * Get blockchain network status
   */
  async getNetworkStatus(): Promise<{ connected: boolean; blockNumber?: number; chainId?: number }> {
    if (DEMO_MODE || !this.provider) {
      return {
        connected: true,
        blockNumber: Math.floor(Math.random() * 1000000) + 12345000,
        chainId: 999, // Mock chain ID
      };
    }

    try {
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      return {
        connected: true,
        blockNumber,
        chainId: Number(network.chainId),
      };
    } catch (error) {
      console.error("Failed to get network status:", error);
      return { connected: false };
    }
  }
}

export const blockchainService = new BlockchainService();
