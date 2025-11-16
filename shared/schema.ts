import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - merged with Replit Auth requirements
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default('shipper'),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const billsOfLading = pgTable("bills_of_lading", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blNumber: text("bl_number").notNull().unique(),
  shipper: text("shipper").notNull(),
  consignee: text("consignee").notNull(),
  notifyParty: text("notify_party"),
  vesselName: text("vessel_name").notNull(),
  voyageNumber: text("voyage_number").notNull(),
  portOfLoading: text("port_of_loading").notNull(),
  portOfDischarge: text("port_of_discharge").notNull(),
  placeOfReceipt: text("place_of_receipt"),
  placeOfDelivery: text("place_of_delivery"),
  cargoDescription: text("cargo_description").notNull(),
  containerNumbers: text("container_numbers"),
  grossWeight: text("gross_weight"),
  measurement: text("measurement"),
  numberOfPackages: integer("number_of_packages"),
  freightTerms: text("freight_terms"),
  status: text("status").notNull(),
  blockchainHash: text("blockchain_hash"),
  blockchainStatus: text("blockchain_status"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  issuedDate: timestamp("issued_date"),
});

export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blId: varchar("bl_id").references(() => billsOfLading.id),
  currentLocation: text("current_location"),
  currentStatus: text("current_status").notNull(),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  progress: integer("progress"),
  events: json("events"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradeFinance = pgTable("trade_finance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blId: varchar("bl_id").references(() => billsOfLading.id),
  lcNumber: text("lc_number"),
  bank: text("bank"),
  amount: text("amount"),
  currency: text("currency"),
  paymentStatus: text("payment_status").notNull(),
  milestones: json("milestones"),
  smartContractAddress: text("smart_contract_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionHash: text("transaction_hash").unique(),
  blockNumber: text("block_number"),
  from: text("from"),
  to: text("to"),
  gasUsed: text("gas_used"),
  status: text("status"),
  type: text("type").notNull(),
  userId: varchar("user_id").references(() => users.id),
  details: text("details"),
  relatedId: varchar("related_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBillOfLadingSchema = createInsertSchema(billsOfLading).omit({ id: true, createdAt: true });
export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, updatedAt: true });
export const insertTradeFinanceSchema = createInsertSchema(tradeFinance).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true });

export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBillOfLading = z.infer<typeof insertBillOfLadingSchema>;
export type BillOfLading = typeof billsOfLading.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertTradeFinance = z.infer<typeof insertTradeFinanceSchema>;
export type TradeFinance = typeof tradeFinance.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
