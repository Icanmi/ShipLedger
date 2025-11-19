import {
  users,
  billsOfLading,
  shipments,
  tradeFinance,
  transactions,
  insurancePolicies,
  insuranceClaims,
  customsClearances,
  portOperations,
  freightForwarderCoordination,
  type User,
  type UpsertUser,
  type InsertBillOfLading,
  type BillOfLading,
  type InsertShipment,
  type Shipment,
  type InsertTradeFinance,
  type TradeFinance,
  type InsertTransaction,
  type Transaction,
  type InsertInsurancePolicy,
  type InsurancePolicy,
  type InsertInsuranceClaim,
  type InsuranceClaim,
  type InsertCustomsClearance,
  type CustomsClearance,
  type InsertPortOperation,
  type PortOperation,
  type InsertFreightForwarderCoordination,
  type FreightForwarderCoordination,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  createBillOfLading(bol: InsertBillOfLading): Promise<BillOfLading>;
  getBillsOfLading(userId?: string): Promise<BillOfLading[]>;
  getBillOfLadingById(id: string): Promise<BillOfLading | undefined>;
  updateBillOfLadingStatus(id: string, status: string, blockchainHash?: string): Promise<BillOfLading | undefined>;
  
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  getShipmentByBlId(blId: string): Promise<Shipment | undefined>;
  updateShipment(id: string, data: Partial<InsertShipment>): Promise<Shipment | undefined>;
  
  createTradeFinance(tf: InsertTradeFinance): Promise<TradeFinance>;
  getTradeFinanceByBlId(blId: string): Promise<TradeFinance | undefined>;
  updateTradeFinanceStatus(id: string, status: string): Promise<TradeFinance | undefined>;
  
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  getTransactions(limit?: number): Promise<Transaction[]>;
  
  createInsurancePolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy>;
  getInsurancePolicies(userId?: string): Promise<InsurancePolicy[]>;
  getInsurancePolicyById(id: string): Promise<InsurancePolicy | undefined>;
  updateInsurancePolicyStatus(id: string, status: string): Promise<InsurancePolicy | undefined>;
  
  createInsuranceClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim>;
  getInsuranceClaims(policyId?: string): Promise<InsuranceClaim[]>;
  getInsuranceClaimById(id: string): Promise<InsuranceClaim | undefined>;
  updateInsuranceClaimStatus(id: string, status: string, processedBy?: string, resolutionNotes?: string): Promise<InsuranceClaim | undefined>;
  
  createCustomsClearance(clearance: InsertCustomsClearance): Promise<CustomsClearance>;
  getCustomsClearances(shipmentId?: string): Promise<CustomsClearance[]>;
  getCustomsClearanceById(id: string): Promise<CustomsClearance | undefined>;
  updateCustomsClearanceStatus(id: string, status: string, notes?: string, customsAuthority?: string): Promise<CustomsClearance | undefined>;
  
  createPortOperation(operation: InsertPortOperation): Promise<PortOperation>;
  getPortOperations(shipmentId?: string): Promise<PortOperation[]>;
  getPortOperationById(id: string): Promise<PortOperation | undefined>;
  
  createFreightForwarderCoordination(coordination: InsertFreightForwarderCoordination): Promise<FreightForwarderCoordination>;
  getFreightForwarderCoordinations(blId?: string, userId?: string): Promise<FreightForwarderCoordination[]>;
  getFreightForwarderCoordinationById(id: string): Promise<FreightForwarderCoordination | undefined>;
  updateFreightForwarderCoordinationStatus(id: string, status: string): Promise<FreightForwarderCoordination | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createBillOfLading(bol: InsertBillOfLading): Promise<BillOfLading> {
    const [billOfLading] = await db
      .insert(billsOfLading)
      .values(bol)
      .returning();
    return billOfLading;
  }

  async getBillsOfLading(userId?: string): Promise<BillOfLading[]> {
    if (userId) {
      return await db
        .select()
        .from(billsOfLading)
        .where(eq(billsOfLading.createdBy, userId))
        .orderBy(desc(billsOfLading.createdAt));
    }
    return await db
      .select()
      .from(billsOfLading)
      .orderBy(desc(billsOfLading.createdAt))
      .limit(100);
  }

  async getBillOfLadingById(id: string): Promise<BillOfLading | undefined> {
    const [bol] = await db
      .select()
      .from(billsOfLading)
      .where(eq(billsOfLading.id, id));
    return bol;
  }

  async updateBillOfLadingStatus(
    id: string,
    status: string,
    blockchainHash?: string
  ): Promise<BillOfLading | undefined> {
    const updates: any = { status };
    if (blockchainHash) {
      updates.blockchainHash = blockchainHash;
      updates.blockchainStatus = 'confirmed';
    }
    
    const [updated] = await db
      .update(billsOfLading)
      .set(updates)
      .where(eq(billsOfLading.id, id))
      .returning();
    return updated;
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const [created] = await db
      .insert(shipments)
      .values(shipment)
      .returning();
    return created;
  }

  async getShipmentByBlId(blId: string): Promise<Shipment | undefined> {
    const [shipment] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.blId, blId));
    return shipment;
  }

  async updateShipment(
    id: string,
    data: Partial<InsertShipment>
  ): Promise<Shipment | undefined> {
    const [updated] = await db
      .update(shipments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shipments.id, id))
      .returning();
    return updated;
  }

  async createTradeFinance(tf: InsertTradeFinance): Promise<TradeFinance> {
    const [created] = await db
      .insert(tradeFinance)
      .values(tf)
      .returning();
    return created;
  }

  async getTradeFinanceByBlId(blId: string): Promise<TradeFinance | undefined> {
    const [tf] = await db
      .select()
      .from(tradeFinance)
      .where(eq(tradeFinance.blId, blId));
    return tf;
  }

  async updateTradeFinanceStatus(
    id: string,
    status: string
  ): Promise<TradeFinance | undefined> {
    const [updated] = await db
      .update(tradeFinance)
      .set({ paymentStatus: status })
      .where(eq(tradeFinance.id, id))
      .returning();
    return updated;
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [created] = await db
      .insert(transactions)
      .values(tx)
      .returning();
    return created;
  }

  async getTransactions(limit: number = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.timestamp))
      .limit(limit);
  }

  async createInsurancePolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy> {
    const [created] = await db
      .insert(insurancePolicies)
      .values(policy)
      .returning();
    return created;
  }

  async getInsurancePolicies(userId?: string): Promise<InsurancePolicy[]> {
    if (userId) {
      return await db
        .select()
        .from(insurancePolicies)
        .where(eq(insurancePolicies.insurer, userId))
        .orderBy(desc(insurancePolicies.createdAt));
    }
    return await db
      .select()
      .from(insurancePolicies)
      .orderBy(desc(insurancePolicies.createdAt))
      .limit(100);
  }

  async getInsurancePolicyById(id: string): Promise<InsurancePolicy | undefined> {
    const [policy] = await db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.id, id));
    return policy;
  }

  async updateInsurancePolicyStatus(id: string, status: string): Promise<InsurancePolicy | undefined> {
    const [updated] = await db
      .update(insurancePolicies)
      .set({ status })
      .where(eq(insurancePolicies.id, id))
      .returning();
    return updated;
  }

  async createInsuranceClaim(claim: InsertInsuranceClaim): Promise<InsuranceClaim> {
    const [created] = await db
      .insert(insuranceClaims)
      .values(claim)
      .returning();
    return created;
  }

  async getInsuranceClaims(policyId?: string): Promise<InsuranceClaim[]> {
    if (policyId) {
      return await db
        .select()
        .from(insuranceClaims)
        .where(eq(insuranceClaims.policyId, policyId))
        .orderBy(desc(insuranceClaims.submittedAt));
    }
    return await db
      .select()
      .from(insuranceClaims)
      .orderBy(desc(insuranceClaims.submittedAt))
      .limit(100);
  }

  async getInsuranceClaimById(id: string): Promise<InsuranceClaim | undefined> {
    const [claim] = await db
      .select()
      .from(insuranceClaims)
      .where(eq(insuranceClaims.id, id));
    return claim;
  }

  async updateInsuranceClaimStatus(
    id: string,
    status: string,
    processedBy?: string,
    resolutionNotes?: string
  ): Promise<InsuranceClaim | undefined> {
    const updates: any = { status };
    if (processedBy) updates.processedBy = processedBy;
    if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
    if (status === 'approved' || status === 'rejected') {
      updates.processedAt = new Date();
    }

    const [updated] = await db
      .update(insuranceClaims)
      .set(updates)
      .where(eq(insuranceClaims.id, id))
      .returning();
    return updated;
  }

  async createCustomsClearance(clearance: InsertCustomsClearance): Promise<CustomsClearance> {
    const [created] = await db
      .insert(customsClearances)
      .values(clearance)
      .returning();
    return created;
  }

  async getCustomsClearances(shipmentId?: string): Promise<CustomsClearance[]> {
    if (shipmentId) {
      return await db
        .select()
        .from(customsClearances)
        .where(eq(customsClearances.shipmentId, shipmentId))
        .orderBy(desc(customsClearances.requestedAt));
    }
    return await db
      .select()
      .from(customsClearances)
      .orderBy(desc(customsClearances.requestedAt))
      .limit(100);
  }

  async getCustomsClearanceById(id: string): Promise<CustomsClearance | undefined> {
    const [clearance] = await db
      .select()
      .from(customsClearances)
      .where(eq(customsClearances.id, id));
    return clearance;
  }

  async updateCustomsClearanceStatus(
    id: string,
    status: string,
    notes?: string,
    customsAuthority?: string
  ): Promise<CustomsClearance | undefined> {
    const updates: any = { status };
    if (notes) updates.notes = notes;
    if (customsAuthority) updates.customsAuthority = customsAuthority;
    if (status === 'approved') {
      updates.approvedAt = new Date();
    }

    const [updated] = await db
      .update(customsClearances)
      .set(updates)
      .where(eq(customsClearances.id, id))
      .returning();
    return updated;
  }

  async createPortOperation(operation: InsertPortOperation): Promise<PortOperation> {
    const [created] = await db
      .insert(portOperations)
      .values(operation)
      .returning();
    return created;
  }

  async getPortOperations(shipmentId?: string): Promise<PortOperation[]> {
    if (shipmentId) {
      return await db
        .select()
        .from(portOperations)
        .where(eq(portOperations.shipmentId, shipmentId))
        .orderBy(desc(portOperations.timestamp));
    }
    return await db
      .select()
      .from(portOperations)
      .orderBy(desc(portOperations.timestamp))
      .limit(100);
  }

  async getPortOperationById(id: string): Promise<PortOperation | undefined> {
    const [operation] = await db
      .select()
      .from(portOperations)
      .where(eq(portOperations.id, id));
    return operation;
  }

  async createFreightForwarderCoordination(coordination: InsertFreightForwarderCoordination): Promise<FreightForwarderCoordination> {
    const [created] = await db
      .insert(freightForwarderCoordination)
      .values(coordination)
      .returning();
    return created;
  }

  async getFreightForwarderCoordinations(blId?: string, userId?: string): Promise<FreightForwarderCoordination[]> {
    if (blId) {
      return await db
        .select()
        .from(freightForwarderCoordination)
        .where(eq(freightForwarderCoordination.blId, blId))
        .orderBy(desc(freightForwarderCoordination.createdAt));
    }
    if (userId) {
      return await db
        .select()
        .from(freightForwarderCoordination)
        .where(eq(freightForwarderCoordination.freightForwarder, userId))
        .orderBy(desc(freightForwarderCoordination.createdAt));
    }
    return await db
      .select()
      .from(freightForwarderCoordination)
      .orderBy(desc(freightForwarderCoordination.createdAt))
      .limit(100);
  }

  async getFreightForwarderCoordinationById(id: string): Promise<FreightForwarderCoordination | undefined> {
    const [coordination] = await db
      .select()
      .from(freightForwarderCoordination)
      .where(eq(freightForwarderCoordination.id, id));
    return coordination;
  }

  async updateFreightForwarderCoordinationStatus(id: string, status: string): Promise<FreightForwarderCoordination | undefined> {
    const [updated] = await db
      .update(freightForwarderCoordination)
      .set({ status, updatedAt: new Date() })
      .where(eq(freightForwarderCoordination.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
