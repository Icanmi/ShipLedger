import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import {
  insertBillOfLadingSchema,
  insertShipmentSchema,
  insertTradeFinanceSchema,
  insertTransactionSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/bills-of-lading', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const bols = user?.role === 'admin' 
        ? await storage.getBillsOfLading()
        : await storage.getBillsOfLading(userId);
      
      res.json(bols);
    } catch (error) {
      console.error("Error fetching bills of lading:", error);
      res.status(500).json({ message: "Failed to fetch bills of lading" });
    }
  });

  app.get('/api/bills-of-lading/:id', isAuthenticated, async (req, res) => {
    try {
      const bol = await storage.getBillOfLadingById(req.params.id);
      if (!bol) {
        return res.status(404).json({ message: "Bill of Lading not found" });
      }
      res.json(bol);
    } catch (error) {
      console.error("Error fetching bill of lading:", error);
      res.status(500).json({ message: "Failed to fetch bill of lading" });
    }
  });

  app.post('/api/bills-of-lading', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertBillOfLadingSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const bol = await storage.createBillOfLading(validatedData);

      await storage.createTransaction({
        type: 'bol_created',
        userId,
        details: `Created B/L ${bol.blNumber}`,
        relatedId: bol.id,
      });

      res.status(201).json(bol);
    } catch (error: any) {
      console.error("Error creating bill of lading:", error);
      res.status(400).json({ message: error.message || "Failed to create bill of lading" });
    }
  });

  app.patch('/api/bills-of-lading/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status, blockchainHash } = req.body;
      const userId = req.user.claims.sub;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updated = await storage.updateBillOfLadingStatus(
        req.params.id,
        status,
        blockchainHash
      );

      if (!updated) {
        return res.status(404).json({ message: "Bill of Lading not found" });
      }

      await storage.createTransaction({
        type: 'bol_status_updated',
        userId,
        details: `Updated B/L ${updated.blNumber} status to ${status}`,
        relatedId: updated.id,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating bill of lading status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.post('/api/shipments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertShipmentSchema.parse(req.body);
      const shipment = await storage.createShipment(validatedData);

      await storage.createTransaction({
        type: 'shipment_created',
        userId,
        details: `Created shipment for B/L ${validatedData.blId}`,
        relatedId: shipment.id,
      });

      res.status(201).json(shipment);
    } catch (error: any) {
      console.error("Error creating shipment:", error);
      res.status(400).json({ message: error.message || "Failed to create shipment" });
    }
  });

  app.get('/api/shipments/:blId', isAuthenticated, async (req, res) => {
    try {
      const shipment = await storage.getShipmentByBlId(req.params.blId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }
      res.json(shipment);
    } catch (error) {
      console.error("Error fetching shipment:", error);
      res.status(500).json({ message: "Failed to fetch shipment" });
    }
  });

  app.patch('/api/shipments/:id/tracking', isAuthenticated, async (req: any, res) => {
    try {
      const { currentLocation, estimatedArrival, events } = req.body;
      const userId = req.user.claims.sub;
      
      const updateData: any = {};
      if (currentLocation) updateData.currentLocation = currentLocation;
      if (estimatedArrival) updateData.estimatedArrival = new Date(estimatedArrival);
      if (events) updateData.events = events;

      const updated = await storage.updateShipment(req.params.id, updateData);

      if (!updated) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      await storage.createTransaction({
        type: 'shipment_updated',
        userId,
        details: `Updated shipment tracking`,
        relatedId: updated.id,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating shipment:", error);
      res.status(500).json({ message: "Failed to update shipment" });
    }
  });

  app.post('/api/trade-finance', isAuthenticated, requireRole('shipper', 'bank'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertTradeFinanceSchema.parse(req.body);
      const tf = await storage.createTradeFinance(validatedData);

      await storage.createTransaction({
        type: 'trade_finance_created',
        userId,
        details: `Created trade finance for B/L ${validatedData.blId}`,
        relatedId: tf.id,
      });

      res.status(201).json(tf);
    } catch (error: any) {
      console.error("Error creating trade finance:", error);
      res.status(400).json({ message: error.message || "Failed to create trade finance" });
    }
  });

  app.get('/api/trade-finance/:blId', isAuthenticated, async (req, res) => {
    try {
      const tf = await storage.getTradeFinanceByBlId(req.params.blId);
      if (!tf) {
        return res.status(404).json({ message: "Trade finance not found" });
      }
      res.json(tf);
    } catch (error) {
      console.error("Error fetching trade finance:", error);
      res.status(500).json({ message: "Failed to fetch trade finance" });
    }
  });

  app.patch('/api/trade-finance/:id/status', isAuthenticated, requireRole('bank'), async (req: any, res) => {
    try {
      const { status } = req.body;
      const userId = req.user.claims.sub;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updated = await storage.updateTradeFinanceStatus(req.params.id, status);

      if (!updated) {
        return res.status(404).json({ message: "Trade finance not found" });
      }

      await storage.createTransaction({
        type: 'trade_finance_updated',
        userId,
        details: `Updated trade finance status to ${status}`,
        relatedId: updated.id,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating trade finance status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const transactions = await storage.getTransactions(limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
