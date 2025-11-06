import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, ExternalLink, Copy, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { formatAddress } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  transactionHash: string;
  blockNumber: string;
  from: string;
  to: string;
  gasUsed: string;
  status: string;
  type: string;
  timestamp: Date;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: 'Copied to clipboard' });
  };

  return (
    <Card data-testid="card-transaction-list">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Blockchain Transactions</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className="p-3 border rounded-md hover-elevate"
              data-testid={`transaction-${index}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {tx.type}
                    </Badge>
                    {tx.status === 'Confirmed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Clock className="h-3.5 w-3.5 text-yellow-600" />
                    )}
                    <span className="text-xs text-muted-foreground">{tx.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs truncate" title={tx.transactionHash}>
                      {formatAddress(tx.transactionHash)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => handleCopy(tx.transactionHash)}
                      data-testid="button-copy-tx"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {format(tx.timestamp, 'MMM dd, HH:mm')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Block: </span>
                  <span className="font-mono">#{tx.blockNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gas: </span>
                  <span className="font-mono">{parseInt(tx.gasUsed).toLocaleString()}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">From: </span>
                  <span className="font-mono">{formatAddress(tx.from)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">To: </span>
                  <span className="font-mono">{formatAddress(tx.to)}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  data-testid="button-view-explorer"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on BlockDAG Explorer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
