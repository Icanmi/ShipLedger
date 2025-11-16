import {
  users,
  billsOfLading,
  shipments,
  tradeFinance,
  transactions,
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
}

export const storage = new DatabaseStorage();
