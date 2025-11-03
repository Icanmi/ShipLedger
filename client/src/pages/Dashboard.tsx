import { useState } from "react";
import MetricCard from "@/components/MetricCard";
import ShipmentCard from "@/components/ShipmentCard";
import ActivityFeed from "@/components/ActivityFeed";
import { Ship, FileText, Database, Clock } from "lucide-react";

export default function Dashboard() {
  const mockShipments = [
    {
      id: '1',
      containerNumber: 'MSCU1234567',
      bolNumber: 'BOL-2024-001',
      status: 'in_transit' as const,
      origin: 'Port of Shanghai',
      destination: 'Port of Los Angeles',
      eta: 'Jan 15, 2024',
    },
    {
      id: '2',
      containerNumber: 'TEMU9876543',
      bolNumber: 'BOL-2024-002',
      status: 'at_port' as const,
      origin: 'Port of Singapore',
      destination: 'Port of Rotterdam',
      eta: 'Jan 18, 2024',
    },
    {
      id: '3',
      containerNumber: 'CMAU5555555',
      bolNumber: 'BOL-2024-003',
      status: 'customs_clearance' as const,
      origin: 'Port of Dubai',
      destination: 'Port of Hamburg',
      eta: 'Jan 20, 2024',
    },
  ];

  const mockActivities = [
    {
      id: '1',
      actor: 'Global Logistics Co.',
      action: 'uploaded shipping instructions for',
      target: 'BOL-2024-001',
      timestamp: '2 minutes ago',
      txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
      type: 'upload' as const,
    },
    {
      id: '2',
      actor: 'Ocean Freight Ltd.',
      action: 'drafted Bill of Lading for',
      target: 'Container MSCU1234567',
      timestamp: '15 minutes ago',
      txHash: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a',
      type: 'draft' as const,
    },
    {
      id: '3',
      actor: 'Port of Singapore',
      action: 'approved document access for',
      target: 'BOL-2024-002',
      timestamp: '1 hour ago',
      type: 'approve' as const,
    },
    {
      id: '4',
      actor: 'Customs Agency',
      action: 'shared clearance status for',
      target: 'Shipment SH-45678',
      timestamp: '3 hours ago',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      type: 'share' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-dashboard">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your shipping operations and blockchain activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Active Shipments" 
          value={24} 
          icon={Ship} 
          trend="+12% from last month"
          testId="metric-shipments"
        />
        <MetricCard 
          title="Pending Documents" 
          value={8} 
          icon={FileText} 
          trend="3 need approval"
          testId="metric-documents"
        />
        <MetricCard 
          title="Blockchain Transactions" 
          value={156} 
          icon={Database} 
          trend="All verified"
          testId="metric-blockchain"
        />
        <MetricCard 
          title="Avg. Processing Time" 
          value="2.4h" 
          icon={Clock} 
          trend="-18% improvement"
          testId="metric-time"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Shipments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockShipments.map((shipment) => (
              <ShipmentCard key={shipment.id} {...shipment} />
            ))}
          </div>
        </div>

        <div>
          <ActivityFeed activities={mockActivities} />
        </div>
      </div>
    </div>
  );
}
