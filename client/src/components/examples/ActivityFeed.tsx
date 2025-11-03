import ActivityFeed from '../ActivityFeed';

export default function ActivityFeedExample() {
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
    {
      id: '5',
      actor: 'System',
      action: 'flagged potential delay for',
      target: 'Container MSCU7654321',
      timestamp: '5 hours ago',
      type: 'issue' as const,
    },
  ];

  return <ActivityFeed activities={mockActivities} />;
}
