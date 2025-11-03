import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users with Replit Auth integration + ShipLedger roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("shipper"), // shipper, carrier, customs, port
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Shipping Instructions (created by shipper)
export const shippingInstructions = pgTable("shipping_instructions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shipperId: varchar("shipper_id").notNull().references(() => users.id),
  shipperName: text("shipper_name").notNull(),
  consigneeName: text("consignee_name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  containerNumber: text("container_number").notNull(),
  cargoDescription: text("cargo_description").notNull(),
  weight: text("weight").notNull(),
  status: text("status").notNull().default("draft"), // draft, submitted, approved
  blockchainTxHash: text("blockchain_tx_hash"),
  blockchainVerified: boolean("blockchain_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertShippingInstructionSchema = createInsertSchema(shippingInstructions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  blockchainTxHash: true,
  blockchainVerified: true,
});

export type InsertShippingInstruction = z.infer<typeof insertShippingInstructionSchema>;
export type ShippingInstruction = typeof shippingInstructions.$inferSelect;

// Bills of Lading (created by carrier)
export const billsOfLading = pgTable("bills_of_lading", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bolNumber: text("bol_number").notNull().unique(),
  instructionId: varchar("instruction_id").references(() => shippingInstructions.id),
  carrierId: varchar("carrier_id").notNull().references(() => users.id),
  vesselName: text("vessel_name").notNull(),
  voyageNumber: text("voyage_number").notNull(),
  shipperName: text("shipper_name").notNull(),
  consigneeName: text("consignee_name").notNull(),
  notifyParty: text("notify_party"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  containerNumber: text("container_number").notNull(),
  sealNumber: text("seal_number"),
  packageCount: text("package_count"),
  weight: text("weight").notNull(),
  cargoDescription: text("cargo_description").notNull(),
  freightTerms: text("freight_terms").notNull(), // prepaid, collect
  status: text("status").notNull().default("draft"), // draft, finalized, shared, delivered
  blockchainTxHash: text("blockchain_tx_hash"),
  blockchainVerified: boolean("blockchain_verified").default(false),
  documentHash: text("document_hash"), // SHA-256 hash of document content
  sharedWithCustoms: boolean("shared_with_customs").default(false),
  sharedWithPort: boolean("shared_with_port").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBillOfLadingSchema = createInsertSchema(billsOfLading).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  blockchainTxHash: true,
  blockchainVerified: true,
  documentHash: true,
  sharedWithCustoms: true,
  sharedWithPort: true,
});

export type InsertBillOfLading = z.infer<typeof insertBillOfLadingSchema>;
export type BillOfLading = typeof billsOfLading.$inferSelect;

// Shipments (master record tracking overall shipment)
export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  containerNumber: text("container_number").notNull().unique(),
  bolId: varchar("bol_id").references(() => billsOfLading.id),
  instructionId: varchar("instruction_id").references(() => shippingInstructions.id),
  status: text("status").notNull().default("created"), // created, in_transit, at_port, customs_clearance, delivered
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  eta: text("eta"),
  currentLocation: text("current_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;

// Shipment Events (the 120+ trackable events)
export const shipmentEvents = pgTable("shipment_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentId: varchar("shipment_id").notNull().references(() => shipments.id),
  eventType: text("event_type").notNull(), // e.g., "Container Loaded", "Departed Port", "Customs Inspection"
  eventCategory: text("event_category").notNull(), // planned, estimated, actual
  description: text("description").notNull(),
  location: text("location"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  performedBy: varchar("performed_by").references(() => users.id),
  metadata: jsonb("metadata"), // Additional event-specific data
  blockchainTxHash: text("blockchain_tx_hash"),
});

export const insertShipmentEventSchema = createInsertSchema(shipmentEvents).omit({
  id: true,
  timestamp: true,
  blockchainTxHash: true,
});

export type InsertShipmentEvent = z.infer<typeof insertShipmentEventSchema>;
export type ShipmentEvent = typeof shipmentEvents.$inferSelect;

// Blockchain Transactions (all blockchain activity)
export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  txHash: text("tx_hash").notNull().unique(),
  eventType: text("event_type").notNull(), // e.g., "Shipping Instructions Uploaded", "BoL Created"
  entityType: text("entity_type").notNull(), // instruction, bol, shipment, event
  entityId: varchar("entity_id").notNull(), // Reference to the entity
  blockNumber: integer("block_number"),
  gasUsed: text("gas_used"),
  documentHash: text("document_hash"), // SHA-256 hash stored on chain
  participantId: varchar("participant_id").references(() => users.id),
  metadata: jsonb("metadata"), // Additional blockchain-specific data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  verified: boolean("verified").default(false),
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).omit({
  id: true,
  timestamp: true,
});

export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;

// Document Access Permissions (who can view what)
export const documentPermissions = pgTable("document_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentType: text("document_type").notNull(), // instruction, bol
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  permissionLevel: text("permission_level").notNull(), // view, edit, approve
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  grantedBy: varchar("granted_by").references(() => users.id),
});

export const insertDocumentPermissionSchema = createInsertSchema(documentPermissions).omit({
  id: true,
  grantedAt: true,
});

export type InsertDocumentPermission = z.infer<typeof insertDocumentPermissionSchema>;
export type DocumentPermission = typeof documentPermissions.$inferSelect;
