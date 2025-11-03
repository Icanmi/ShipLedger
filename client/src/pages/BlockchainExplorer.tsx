import BlockchainTransactionLog from "@/components/BlockchainTransactionLog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Database } from "lucide-react";

export default function BlockchainExplorer() {
  const mockTransactions = [
    {
      id: '1',
      txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
      eventType: 'Shipping Instructions Uploaded',
      timestamp: '2024-01-10 14:32:18',
      blockNumber: 12345678,
      gasUsed: '21,000',
    },
    {
      id: '2',
      txHash: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a0z9y8x7w6v5u4t',
      eventType: 'Bill of Lading Created',
      timestamp: '2024-01-10 15:45:22',
      blockNumber: 12345690,
      gasUsed: '35,000',
    },
    {
      id: '3',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcd',
      eventType: 'Document Shared with Customs',
      timestamp: '2024-01-10 16:12:05',
      blockNumber: 12345702,
      gasUsed: '28,500',
    },
    {
      id: '4',
      txHash: '0x567890abcdef1234567890abcdef1234567890abcdef12345678',
      eventType: 'Port Access Granted',
      timestamp: '2024-01-10 17:20:33',
      blockNumber: 12345715,
      gasUsed: '22,800',
    },
    {
      id: '5',
      txHash: '0xfedcba9876543210fedcba9876543210fedcba9876543210fedc',
      eventType: 'Shipment Status Updated',
      timestamp: '2024-01-11 09:15:44',
      blockNumber: 12345730,
      gasUsed: '19,200',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-blockchain">Blockchain Explorer</h1>
        <p className="text-muted-foreground mt-1">
          View all transactions recorded on the BlockDAG testnet
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Network Status</p>
            <Database className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <Badge variant="outline">Connected</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">BlockDAG Testnet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <p className="text-xs text-muted-foreground mt-1">All verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Latest Block</p>
            <Database className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,345,730</div>
            <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
          </CardContent>
        </Card>
      </div>

      <BlockchainTransactionLog transactions={mockTransactions} />
    </div>
  );
}
