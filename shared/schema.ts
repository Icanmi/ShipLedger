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

export const insurancePolicies = pgTable("insurance_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  policyId: text("policy_id").notNull().unique(),
  blId: varchar("bl_id").references(() => billsOfLading.id),
  insurer: varchar("insurer").references(() => users.id),
  insured: varchar("insured").references(() => users.id),
  coverageAmount: text("coverage_amount").notNull(),
  premium: text("premium").notNull(),
  coverageType: text("coverage_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default('draft'),
  smartContractAddress: text("smart_contract_address"),
  blockchainHash: text("blockchain_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insuranceClaims = pgTable("insurance_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: text("claim_id").notNull().unique(),
  policyId: varchar("policy_id").references(() => insurancePolicies.id),
  blId: varchar("bl_id").references(() => billsOfLading.id),
  claimant: varchar("claimant").references(() => users.id),
  claimAmount: text("claim_amount").notNull(),
  incidentType: text("incident_type").notNull(),
  description: text("description").notNull(),
  supportingDocuments: json("supporting_documents"),
  status: text("status").notNull().default('submitted'),
  submittedAt: timestamp("submitted_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  blockchainHash: text("blockchain_hash"),
});

export const customsClearances = pgTable("customs_clearances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clearanceId: text("clearance_id").notNull().unique(),
  shipmentId: varchar("shipment_id").references(() => shipments.id),
  blId: varchar("bl_id").references(() => billsOfLading.id),
  customsAuthority: varchar("customs_authority").references(() => users.id),
  declarationType: text("declaration_type").notNull(),
  documentHash: text("document_hash"),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  status: text("status").notNull().default('submitted'),
  notes: text("notes"),
  blockchainHash: text("blockchain_hash"),
});

export const portOperations = pgTable("port_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operationId: text("operation_id").notNull().unique(),
  shipmentId: varchar("shipment_id").references(() => shipments.id),
  blId: varchar("bl_id").references(() => billsOfLading.id),
  portAuthority: varchar("port_authority").references(() => users.id),
  operationType: text("operation_type").notNull(),
  berthNumber: text("berth_number"),
  status: text("status").notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
  blockchainHash: text("blockchain_hash"),
});

export const freightForwarderCoordination = pgTable("freight_forwarder_coordination", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coordinationId: text("coordination_id").notNull().unique(),
  blId: varchar("bl_id").references(() => billsOfLading.id),
  freightForwarder: varchar("freight_forwarder").references(() => users.id),
  shipper: varchar("shipper").references(() => users.id),
  status: text("status").notNull().default('pending'),
  services: json("services"),
  documentHash: text("document_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  blockchainHash: text("blockchain_hash"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBillOfLadingSchema = createInsertSchema(billsOfLading).omit({ id: true, createdAt: true });
export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true, updatedAt: true });
export const insertTradeFinanceSchema = createInsertSchema(tradeFinance).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true });
export const insertInsurancePolicySchema = createInsertSchema(insurancePolicies).omit({ id: true, createdAt: true });
export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({ id: true, submittedAt: true });
export const insertCustomsClearanceSchema = createInsertSchema(customsClearances).omit({ id: true, requestedAt: true });
export const insertPortOperationSchema = createInsertSchema(portOperations).omit({ id: true, timestamp: true });
export const insertFreightForwarderCoordinationSchema = createInsertSchema(freightForwarderCoordination).omit({ id: true, createdAt: true, updatedAt: true });

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
export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;
export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;
export type InsertCustomsClearance = z.infer<typeof insertCustomsClearanceSchema>;
export type CustomsClearance = typeof customsClearances.$inferSelect;
export type InsertPortOperation = z.infer<typeof insertPortOperationSchema>;
export type PortOperation = typeof portOperations.$inferSelect;
export type InsertFreightForwarderCoordination = z.infer<typeof insertFreightForwarderCoordinationSchema>;
export type FreightForwarderCoordination = typeof freightForwarderCoordination.$inferSelect;
