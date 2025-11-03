import {
  type User,
  type UpsertUser,
  type ShippingInstruction,
  type InsertShippingInstruction,
  type BillOfLading,
  type InsertBillOfLading,
  type Shipment,
  type InsertShipment,
  type ShipmentEvent,
  type InsertShipmentEvent,
  type BlockchainTransaction,
  type InsertBlockchainTransaction,
  type DocumentPermission,
  type InsertDocumentPermission,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for ShipLedger
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;

  // Shipping Instructions operations
  getShippingInstruction(id: string): Promise<ShippingInstruction | undefined>;
  getShippingInstructionsByShipper(shipperId: string): Promise<ShippingInstruction[]>;
  getAllShippingInstructions(): Promise<ShippingInstruction[]>;
  createShippingInstruction(instruction: InsertShippingInstruction): Promise<ShippingInstruction>;
  updateShippingInstruction(id: string, data: Partial<ShippingInstruction>): Promise<ShippingInstruction | undefined>;

  // Bill of Lading operations
  getBillOfLading(id: string): Promise<BillOfLading | undefined>;
  getBillOfLadingByNumber(bolNumber: string): Promise<BillOfLading | undefined>;
  getBillsOfLadingByCarrier(carrierId: string): Promise<BillOfLading[]>;
  getAllBillsOfLading(): Promise<BillOfLading[]>;
  createBillOfLading(bol: InsertBillOfLading): Promise<BillOfLading>;
  updateBillOfLading(id: string, data: Partial<BillOfLading>): Promise<BillOfLading | undefined>;

  // Shipment operations
  getShipment(id: string): Promise<Shipment | undefined>;
  getShipmentByContainer(containerNumber: string): Promise<Shipment | undefined>;
  getAllShipments(): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment | undefined>;

  // Shipment Event operations
  getShipmentEvents(shipmentId: string): Promise<ShipmentEvent[]>;
  createShipmentEvent(event: InsertShipmentEvent): Promise<ShipmentEvent>;

  // Blockchain Transaction operations
  getBlockchainTransaction(txHash: string): Promise<BlockchainTransaction | undefined>;
  getAllBlockchainTransactions(): Promise<BlockchainTransaction[]>;
  getBlockchainTransactionsByEntity(entityType: string, entityId: string): Promise<BlockchainTransaction[]>;
  createBlockchainTransaction(tx: InsertBlockchainTransaction): Promise<BlockchainTransaction>;
  updateBlockchainTransaction(txHash: string, data: Partial<BlockchainTransaction>): Promise<BlockchainTransaction | undefined>;

  // Document Permission operations
  getDocumentPermissions(documentType: string, documentId: string): Promise<DocumentPermission[]>;
  getUserDocumentPermissions(userId: string): Promise<DocumentPermission[]>;
  createDocumentPermission(permission: InsertDocumentPermission): Promise<DocumentPermission>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private shippingInstructions: Map<string, ShippingInstruction>;
  private billsOfLading: Map<string, BillOfLading>;
  private shipments: Map<string, Shipment>;
  private shipmentEvents: Map<string, ShipmentEvent[]>;
  private blockchainTransactions: Map<string, BlockchainTransaction>;
  private documentPermissions: Map<string, DocumentPermission[]>;

  constructor() {
    this.users = new Map();
    this.shippingInstructions = new Map();
    this.billsOfLading = new Map();
    this.shipments = new Map();
    this.shipmentEvents = new Map();
    this.blockchainTransactions = new Map();
    this.documentPermissions = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const now = new Date();
    
    const user: User = {
      ...userData,
      id: userData.id || randomUUID(),
      role: userData.role || "shipper",
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      companyName: userData.companyName || null,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.role === role);
  }

  // Shipping Instructions operations
  async getShippingInstruction(id: string): Promise<ShippingInstruction | undefined> {
    return this.shippingInstructions.get(id);
  }

  async getShippingInstructionsByShipper(shipperId: string): Promise<ShippingInstruction[]> {
    return Array.from(this.shippingInstructions.values()).filter(
      (instruction) => instruction.shipperId === shipperId
    );
  }

  async getAllShippingInstructions(): Promise<ShippingInstruction[]> {
    return Array.from(this.shippingInstructions.values());
  }

  async createShippingInstruction(insertInstruction: InsertShippingInstruction): Promise<ShippingInstruction> {
    const id = randomUUID();
    const now = new Date();
    const instruction: ShippingInstruction = {
      ...insertInstruction,
      id,
      blockchainTxHash: null,
      blockchainVerified: false,
      createdAt: now,
      updatedAt: now,
    };
    this.shippingInstructions.set(id, instruction);
    return instruction;
  }

  async updateShippingInstruction(id: string, data: Partial<ShippingInstruction>): Promise<ShippingInstruction | undefined> {
    const instruction = this.shippingInstructions.get(id);
    if (!instruction) return undefined;
    
    const updated: ShippingInstruction = {
      ...instruction,
      ...data,
      updatedAt: new Date(),
    };
    this.shippingInstructions.set(id, updated);
    return updated;
  }

  // Bill of Lading operations
  async getBillOfLading(id: string): Promise<BillOfLading | undefined> {
    return this.billsOfLading.get(id);
  }

  async getBillOfLadingByNumber(bolNumber: string): Promise<BillOfLading | undefined> {
    return Array.from(this.billsOfLading.values()).find((bol) => bol.bolNumber === bolNumber);
  }

  async getBillsOfLadingByCarrier(carrierId: string): Promise<BillOfLading[]> {
    return Array.from(this.billsOfLading.values()).filter((bol) => bol.carrierId === carrierId);
  }

  async getAllBillsOfLading(): Promise<BillOfLading[]> {
    return Array.from(this.billsOfLading.values());
  }

  async createBillOfLading(insertBol: InsertBillOfLading): Promise<BillOfLading> {
    const id = randomUUID();
    const now = new Date();
    const bol: BillOfLading = {
      ...insertBol,
      id,
      blockchainTxHash: null,
      blockchainVerified: false,
      documentHash: null,
      sharedWithCustoms: false,
      sharedWithPort: false,
      createdAt: now,
      updatedAt: now,
    };
    this.billsOfLading.set(id, bol);
    return bol;
  }

  async updateBillOfLading(id: string, data: Partial<BillOfLading>): Promise<BillOfLading | undefined> {
    const bol = this.billsOfLading.get(id);
    if (!bol) return undefined;
    
    const updated: BillOfLading = {
      ...bol,
      ...data,
      updatedAt: new Date(),
    };
    this.billsOfLading.set(id, updated);
    return updated;
  }

  // Shipment operations
  async getShipment(id: string): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }

  async getShipmentByContainer(containerNumber: string): Promise<Shipment | undefined> {
    return Array.from(this.shipments.values()).find((shipment) => shipment.containerNumber === containerNumber);
  }

  async getAllShipments(): Promise<Shipment[]> {
    return Array.from(this.shipments.values());
  }

  async createShipment(insertShipment: InsertShipment): Promise<Shipment> {
    const id = randomUUID();
    const now = new Date();
    const shipment: Shipment = {
      ...insertShipment,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.shipments.set(id, shipment);
    return shipment;
  }

  async updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment | undefined> {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;
    
    const updated: Shipment = {
      ...shipment,
      ...data,
      updatedAt: new Date(),
    };
    this.shipments.set(id, updated);
    return updated;
  }

  // Shipment Event operations
  async getShipmentEvents(shipmentId: string): Promise<ShipmentEvent[]> {
    return this.shipmentEvents.get(shipmentId) || [];
  }

  async createShipmentEvent(insertEvent: InsertShipmentEvent): Promise<ShipmentEvent> {
    const id = randomUUID();
    const event: ShipmentEvent = {
      ...insertEvent,
      id,
      timestamp: new Date(),
      blockchainTxHash: null,
    };
    
    const events = this.shipmentEvents.get(event.shipmentId) || [];
    events.push(event);
    this.shipmentEvents.set(event.shipmentId, events);
    
    return event;
  }

  // Blockchain Transaction operations
  async getBlockchainTransaction(txHash: string): Promise<BlockchainTransaction | undefined> {
    return this.blockchainTransactions.get(txHash);
  }

  async getAllBlockchainTransactions(): Promise<BlockchainTransaction[]> {
    return Array.from(this.blockchainTransactions.values());
  }

  async getBlockchainTransactionsByEntity(entityType: string, entityId: string): Promise<BlockchainTransaction[]> {
    return Array.from(this.blockchainTransactions.values()).filter(
      (tx) => tx.entityType === entityType && tx.entityId === entityId
    );
  }

  async createBlockchainTransaction(insertTx: InsertBlockchainTransaction): Promise<BlockchainTransaction> {
    const id = randomUUID();
    const tx: BlockchainTransaction = {
      ...insertTx,
      id,
      timestamp: new Date(),
    };
    this.blockchainTransactions.set(tx.txHash, tx);
    return tx;
  }

  async updateBlockchainTransaction(txHash: string, data: Partial<BlockchainTransaction>): Promise<BlockchainTransaction | undefined> {
    const tx = this.blockchainTransactions.get(txHash);
    if (!tx) return undefined;
    
    const updated: BlockchainTransaction = {
      ...tx,
      ...data,
    };
    this.blockchainTransactions.set(txHash, updated);
    return updated;
  }

  // Document Permission operations
  async getDocumentPermissions(documentType: string, documentId: string): Promise<DocumentPermission[]> {
    const key = `${documentType}:${documentId}`;
    return this.documentPermissions.get(key) || [];
  }

  async getUserDocumentPermissions(userId: string): Promise<DocumentPermission[]> {
    return Array.from(this.documentPermissions.values())
      .flat()
      .filter((perm) => perm.userId === userId);
  }

  async createDocumentPermission(insertPermission: InsertDocumentPermission): Promise<DocumentPermission> {
    const id = randomUUID();
    const permission: DocumentPermission = {
      ...insertPermission,
      id,
      grantedAt: new Date(),
    };
    
    const key = `${permission.documentType}:${permission.documentId}`;
    const permissions = this.documentPermissions.get(key) || [];
    permissions.push(permission);
    this.documentPermissions.set(key, permissions);
    
    return permission;
  }
}

export const storage = new MemStorage();
