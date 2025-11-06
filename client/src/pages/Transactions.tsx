import TransactionList from '@/components/TransactionList';
import BlockchainStatus from '@/components/BlockchainStatus';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Zap, Database } from 'lucide-react';
import { mockTransactions } from '@/lib/mockData';

export default function Transactions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Blockchain Transactions</h1>
        <p className="text-muted-foreground">
          Monitor all blockchain activities and transaction history
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">All-time on BlockDAG</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Confirmation</p>
                <p className="text-2xl font-bold">2.3s</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">BlockDAG speed advantage</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gas Saved</p>
                <p className="text-2xl font-bold">$8.2K</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">vs Ethereum mainnet</p>
          </CardContent>
        </Card>
      </div>

      <BlockchainStatus />

      <TransactionList transactions={mockTransactions} />

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">BlockDAG Network Integration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All transactions are processed on BlockDAG's EVM-compatible network with superior speed and lower fees
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-md text-sm">
              <span className="text-muted-foreground">RPC Endpoint:</span>
              <code className="font-mono">https://ide.awakening.bdagscan.com/</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
