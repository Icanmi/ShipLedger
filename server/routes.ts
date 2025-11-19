import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";
import {
  insertBillOfLadingSchema,
  insertShipmentSchema,
  insertTradeFinanceSchema,
  insertTransactionSchema,
  insertInsurancePolicySchema,
  insertInsuranceClaimSchema,
  insertCustomsClearanceSchema,
  insertPortOperationSchema,
  insertFreightForwarderCoordinationSchema,
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

  app.post('/api/insurance/policies', isAuthenticated, requireRole('insurance'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertInsurancePolicySchema.parse({
        ...req.body,
        insurer: userId,
      });

      const policy = await storage.createInsurancePolicy(validatedData);

      await storage.createTransaction({
        type: 'insurance_policy_created',
        userId,
        details: `Created insurance policy ${policy.policyId}`,
        relatedId: policy.id,
      });

      res.status(201).json(policy);
    } catch (error: any) {
      console.error("Error creating insurance policy:", error);
      res.status(400).json({ message: error.message || "Failed to create insurance policy" });
    }
  });

  app.get('/api/insurance/policies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const policies = user?.role === 'admin' || user?.role === 'insurance'
        ? await storage.getInsurancePolicies()
        : await storage.getInsurancePolicies(userId);
      
      res.json(policies);
    } catch (error) {
      console.error("Error fetching insurance policies:", error);
      res.status(500).json({ message: "Failed to fetch insurance policies" });
    }
  });

  app.get('/api/insurance/policies/:id', isAuthenticated, async (req, res) => {
    try {
      const policy = await storage.getInsurancePolicyById(req.params.id);
      if (!policy) {
        return res.status(404).json({ message: "Insurance policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error fetching insurance policy:", error);
      res.status(500).json({ message: "Failed to fetch insurance policy" });
    }
  });

  app.patch('/api/insurance/policies/:id/status', isAuthenticated, requireRole('insurance'), async (req: any, res) => {
    try {
      const { status } = req.body;
      const userId = req.user.claims.sub;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updated = await storage.updateInsurancePolicyStatus(req.params.id, status);

      if (!updated) {
        return res.status(404).json({ message: "Insurance policy not found" });
      }

      await storage.createTransaction({
        type: 'insurance_policy_updated',
        userId,
        details: `Updated insurance policy status to ${status}`,
        relatedId: updated.id,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating insurance policy status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.post('/api/insurance/claims', isAuthenticated, requireRole('shipper', 'carrier', 'consignee'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertInsuranceClaimSchema.parse({
        ...req.body,
        claimant: userId,
      });

      const claim = await storage.createInsuranceClaim(validatedData);

      await storage.createTransaction({
        type: 'insurance_claim_submitted',
        userId,
        details: `Submitted insurance claim ${claim.claimId}`,
        relatedId: claim.id,
      });

      res.status(201).json(claim);
    } catch (error: any) {
      console.error("Error creating insurance claim:", error);
      res.status(400).json({ message: error.message || "Failed to create insurance claim" });
    }
  });

  app.get('/api/insurance/claims', isAuthenticated, async (req: any, res) => {
    try {
      const policyId = req.query.policyId as string | undefined;
      const claims = await storage.getInsuranceClaims(policyId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching insurance claims:", error);
      res.status(500).json({ message: "Failed to fetch insurance claims" });
    }
  });

  app.patch('/api/insurance/claims/:id/status', isAuthenticated, requireRole('insurance'), async (req: any, res) => {
    try {
      const { status, resolutionNotes } = req.body;
      const userId = req.user.claims.sub;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updated = await storage.updateInsuranceClaimStatus(
        req.params.id,
        status,
        userId,
        resolutionNotes
      );

      if (!updated) {
        return res.status(404).json({ message: "Insurance claim not found" });
      }

      await storage.createTransaction({
        type: 'insurance_claim_updated',
        userId,
        details: `Updated insurance claim status to ${status}`,
        relatedId: updated.id,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating insurance claim status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.post('/api/customs/clearances', isAuthenticated, requireRole('shipper', 'freight_forwarder'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertCustomsClearanceSchema.parse(req.body);

      const clearance = await storage.createCustomsClearance(validatedData);

      await storage.createTransaction({
        type: 'customs_clearance_requested',
        userId,
        details: `Submitted customs clearance ${clearance.clearanceId}`,
        relatedId: clearance.id,
      });

      res.status(201).json(clearance);
    } catch (error: any) {
      console.error("Error creating customs clearance:", error);
      res.status(400).json({ message: error.message || "Failed to create customs clearance" });
    }
  });

  app.get('/api/customs/clearances', isAuthenticated, async (req: any, res) => {
    try {
      const shipmentId = req.query.shipmentId as string | undefined;
      const clearances = await storage.getCustomsClearances(shipmentId);
      res.json(clearances);
    } catch (error) {
      console.error("Error fetching customs clearances:", error);
      res.status(500).json({ message: "Failed to fetch customs clearances" });
    }
  });

  app.patch('/api/customs/clearances/:id/approve', isAuthenticated, requireRole('customs'), async (req: any, res) => {
    try {
      const { notes } = req.body;
      const userId = req.user.claims.sub;

      const updated = await storage.updateCustomsClearanceStatus(
        req.params.id,
        'approved',
        notes,
        userId
      );

      if (!updated) {
        return res.status(404).json({ message: "Customs clearance not found" });
      }

      await storage.createTransaction({
        type: 'customs_clearance_approved',
        userId,
        details: `Approved customs clearance ${updated.clearanceId}`,
        relatedId: updated.id,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error approving customs clearance:", error);
      res.status(500).json({ message: "Failed to approve clearance" });
    }
  });

  app.patch('/api/customs/clearances/:id/reject', isAuthenticated, requireRole('customs'), async (req: any, res) => {
    try {
      const { notes } = req.body;
      const userId = req.user.claims.sub;

      const updated = await storage.updateCustomsClearanceStatus(
        req.params.id,
        'rejected',
        notes,
        userId
      );

      if (!updated) {
        return res.status(404).json({ message: "Customs clearance not found" });
      }

      await storage.createTransaction({
        type: 'customs_clearance_rejected',
        userId,
        details: `Rejected customs clearance ${updated.clearanceId}`,
        relatedId: updated.id,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error rejecting customs clearance:", error);
      res.status(500).json({ message: "Failed to reject clearance" });
    }
  });

  app.post('/api/port/operations', isAuthenticated, requireRole('port_authority'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertPortOperationSchema.parse({
        ...req.body,
        portAuthority: userId,
      });

      const operation = await storage.createPortOperation(validatedData);

      await storage.createTransaction({
        type: 'port_operation_recorded',
        userId,
        details: `Recorded port operation ${operation.operationType}`,
        relatedId: operation.id,
      });

      res.status(201).json(operation);
    } catch (error: any) {
      console.error("Error creating port operation:", error);
      res.status(400).json({ message: error.message || "Failed to create port operation" });
    }
  });

  app.get('/api/port/operations', isAuthenticated, async (req: any, res) => {
    try {
      const shipmentId = req.query.shipmentId as string | undefined;
      const operations = await storage.getPortOperations(shipmentId);
      res.json(operations);
    } catch (error) {
      console.error("Error fetching port operations:", error);
      res.status(500).json({ message: "Failed to fetch port operations" });
    }
  });

  app.post('/api/freight-forwarder/coordination', isAuthenticated, requireRole('freight_forwarder'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertFreightForwarderCoordinationSchema.parse({
        ...req.body,
        freightForwarder: userId,
      });

      const coordination = await storage.createFreightForwarderCoordination(validatedData);

      await storage.createTransaction({
        type: 'freight_forwarder_coordination_created',
        userId,
        details: `Created freight forwarder coordination ${coordination.coordinationId}`,
        relatedId: coordination.id,
      });

      res.status(201).json(coordination);
    } catch (error: any) {
      console.error("Error creating freight forwarder coordination:", error);
      res.status(400).json({ message: error.message || "Failed to create coordination" });
    }
  });

  app.get('/api/freight-forwarder/coordination', isAuthenticated, async (req: any, res) => {
    try {
      const blId = req.query.blId as string | undefined;
      const userId = req.query.userId as string | undefined;
      const coordinations = await storage.getFreightForwarderCoordinations(blId, userId);
      res.json(coordinations);
    } catch (error) {
      console.error("Error fetching freight forwarder coordinations:", error);
      res.status(500).json({ message: "Failed to fetch coordinations" });
    }
  });

  app.patch('/api/freight-forwarder/coordination/:id/status', isAuthenticated, requireRole('freight_forwarder'), async (req: any, res) => {
    try {
      const { status } = req.body;
      const userId = req.user.claims.sub;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updated = await storage.updateFreightForwarderCoordinationStatus(req.params.id, status);

      if (!updated) {
        return res.status(404).json({ message: "Coordination not found" });
      }

      await storage.createTransaction({
        type: 'freight_forwarder_coordination_updated',
        userId,
        details: `Updated coordination status to ${status}`,
        relatedId: updated.id,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating freight forwarder coordination status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
