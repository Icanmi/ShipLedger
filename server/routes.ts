import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import { blockchainService } from "./blockchain";
import {
  insertShippingInstructionSchema,
  insertBillOfLadingSchema,
  insertShipmentEventSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // ========================================
  // Auth routes
  // ========================================
  
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/user/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!["shipper", "carrier", "customs", "port"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.upsertUser({
        id: userId,
        role,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // ========================================
  // Shipping Instructions API (v1)
  // ========================================

  // Create shipping instruction (shipper only)
  app.post('/api/v1/instructions', isAuthenticated, requireRole("shipper"), async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const validatedData = insertShippingInstructionSchema.parse({
        ...req.body,
        shipperId: userId,
      });

      // Create instruction
      const instruction = await storage.createShippingInstruction(validatedData);

      // Record on blockchain
      const blockchainResult = await blockchainService.recordDocument(
        "instruction",
        instruction.id,
        instruction,
        userId,
        "Shipping Instructions Uploaded"
      );

      // Update with blockchain info
      const updatedInstruction = await storage.updateShippingInstruction(instruction.id, {
        blockchainTxHash: blockchainResult.txHash,
        blockchainVerified: true,
        documentHash: blockchainResult.documentHash,
        status: "submitted",
      });

      res.status(201).json(updatedInstruction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating shipping instruction:", error);
      res.status(500).json({ message: "Failed to create shipping instruction" });
    }
  });

  // Get all shipping instructions (filtered by role)
  app.get('/api/v1/instructions', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      let instructions;

      if (user.role === "shipper") {
        instructions = await storage.getShippingInstructionsByShipper(user.id);
      } else if (user.role === "carrier") {
        // Carriers see submitted instructions
        instructions = (await storage.getAllShippingInstructions())
          .filter(i => i.status === "submitted");
      } else {
        // Customs and ports see all
        instructions = await storage.getAllShippingInstructions();
      }

      res.json(instructions);
    } catch (error) {
      console.error("Error fetching instructions:", error);
      res.status(500).json({ message: "Failed to fetch instructions" });
    }
  });

  // Get single instruction
  app.get('/api/v1/instructions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const instruction = await storage.getShippingInstruction(req.params.id);
      if (!instruction) {
        return res.status(404).json({ message: "Instruction not found" });
      }
      res.json(instruction);
    } catch (error) {
      console.error("Error fetching instruction:", error);
      res.status(500).json({ message: "Failed to fetch instruction" });
    }
  });

  // ========================================
  // Bills of Lading API (v1)
  // ========================================

  // Create Bill of Lading (carrier only)
  app.post('/api/v1/bills-of-lading', isAuthenticated, requireRole("carrier"), async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const validatedData = insertBillOfLadingSchema.parse({
        ...req.body,
        carrierId: userId,
        status: "draft",
      });

      const bol = await storage.createBillOfLading(validatedData);
      res.status(201).json(bol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating BoL:", error);
      res.status(500).json({ message: "Failed to create Bill of Lading" });
    }
  });

  // Finalize and share Bill of Lading (carrier only)
  app.post('/api/v1/bills-of-lading/:id/finalize', isAuthenticated, requireRole("carrier"), async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const bol = await storage.getBillOfLading(req.params.id);
      
      if (!bol) {
        return res.status(404).json({ message: "BoL not found" });
      }

      if (bol.carrierId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Record on blockchain
      const blockchainResult = await blockchainService.recordDocument(
        "bol",
        bol.id,
        bol,
        userId,
        "Bill of Lading Created"
      );

      // Update BoL with blockchain info and share with customs/port
      const updatedBol = await storage.updateBillOfLading(bol.id, {
        blockchainTxHash: blockchainResult.txHash,
        blockchainVerified: true,
        documentHash: blockchainResult.documentHash,
        status: "finalized",
        sharedWithCustoms: true,
        sharedWithPort: true,
      });

      // Create shipment record if doesn't exist
      const existingShipment = await storage.getShipmentByContainer(bol.containerNumber);
      if (!existingShipment) {
        await storage.createShipment({
          containerNumber: bol.containerNumber,
          bolId: bol.id,
          instructionId: bol.instructionId,
          status: "in_transit",
          origin: bol.origin,
          destination: bol.destination,
          eta: null,
          currentLocation: bol.origin,
        });
      }

      res.json(updatedBol);
    } catch (error) {
      console.error("Error finalizing BoL:", error);
      res.status(500).json({ message: "Failed to finalize BoL" });
    }
  });

  // Get all Bills of Lading (filtered by role)
  app.get('/api/v1/bills-of-lading', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.dbUser;
      let bols;

      if (user.role === "carrier") {
        bols = await storage.getBillsOfLadingByCarrier(user.id);
      } else if (user.role === "shipper") {
        // Shippers see BoLs for their instructions
        const instructions = await storage.getShippingInstructionsByShipper(user.id);
        const instructionIds = instructions.map(i => i.id);
        const allBols = await storage.getAllBillsOfLading();
        bols = allBols.filter(b => b.instructionId && instructionIds.includes(b.instructionId));
      } else {
        // Customs and ports see shared BoLs
        const allBols = await storage.getAllBillsOfLading();
        bols = user.role === "customs" 
          ? allBols.filter(b => b.sharedWithCustoms)
          : allBols.filter(b => b.sharedWithPort);
      }

      res.json(bols);
    } catch (error) {
      console.error("Error fetching BoLs:", error);
      res.status(500).json({ message: "Failed to fetch Bills of Lading" });
    }
  });

  // ========================================
  // Shipments API (v1)
  // ========================================

  app.get('/api/v1/shipments', isAuthenticated, async (req: any, res) => {
    try {
      const shipments = await storage.getAllShipments();
      res.json(shipments);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      res.status(500).json({ message: "Failed to fetch shipments" });
    }
  });

  app.get('/api/v1/shipments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const shipment = await storage.getShipment(req.params.id);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      res.json(shipment);
    } catch (error) {
      console.error("Error fetching shipment:", error);
      res.status(500).json({ message: "Failed to fetch shipment" });
    }
  });

  // Get shipment events
  app.get('/api/v1/shipments/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getShipmentEvents(req.params.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching shipment events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Add shipment event
  app.post('/api/v1/shipments/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.dbUser.id;
      const validatedData = insertShipmentEventSchema.parse({
        ...req.body,
        shipmentId: req.params.id,
        performedBy: userId,
      });

      const event = await storage.createShipmentEvent(validatedData);

      // Optionally record major events on blockchain
      if (["Departed Port", "Arrived at Port", "Customs Cleared", "Delivered"].includes(event.eventType)) {
        const blockchainResult = await blockchainService.recordDocument(
          "event",
          event.id,
          event,
          userId,
          `Shipment Event: ${event.eventType}`
        );

        // Store blockchain tx hash in event (note: we'd need to update the event record)
      }

      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // ========================================
  // Blockchain API (v1)
  // ========================================

  app.get('/api/v1/blockchain/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const transactions = await storage.getAllBlockchainTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching blockchain transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/v1/blockchain/status', isAuthenticated, async (req: any, res) => {
    try {
      const status = await blockchainService.getNetworkStatus();
      const transactions = await storage.getAllBlockchainTransactions();
      
      res.json({
        ...status,
        totalTransactions: transactions.length,
        demoMode: process.env.DEMO_MODE === "true",
      });
    } catch (error) {
      console.error("Error fetching blockchain status:", error);
      res.status(500).json({ message: "Failed to fetch blockchain status" });
    }
  });

  // ========================================
  // Activity Feed API (v1)
  // ========================================

  app.get('/api/v1/activity', isAuthenticated, async (req: any, res) => {
    try {
      // Combine recent blockchain transactions into activity feed
      const transactions = await storage.getAllBlockchainTransactions();
      
      // Sort by timestamp descending and limit to 50
      const recentActivity = transactions
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50)
        .map(tx => ({
          id: tx.id,
          actor: "System", // In real app, fetch user name
          action: tx.eventType.toLowerCase(),
          target: tx.entityId,
          timestamp: tx.timestamp,
          txHash: tx.txHash,
          type: tx.eventType.includes("Instruction") ? "upload" : 
                tx.eventType.includes("BoL") ? "draft" : "share",
        }));

      res.json(recentActivity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
