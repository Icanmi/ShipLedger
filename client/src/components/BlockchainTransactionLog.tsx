import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlockchainTransaction {
  id: string;
  txHash: string;
  eventType: string;
  timestamp: string;
  blockNumber: number;
  gasUsed: string;
}

interface BlockchainTransactionLogProps {
  transactions: BlockchainTransaction[];
}

export default function BlockchainTransactionLog({ transactions }: BlockchainTransactionLogProps) {
  return (
    <Card data-testid="card-blockchain-log">
      <CardHeader>
        <CardTitle className="text-lg">Blockchain Transaction Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="border border-border rounded-md p-3 space-y-2 hover-elevate"
                data-testid={`tx-${tx.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">{tx.eventType}</p>
                    <p className="text-xs font-mono text-foreground break-all" title={tx.txHash}>
                      {tx.txHash}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      console.log('View on explorer:', tx.txHash);
                      window.open(`https://explorer.blockdag.network/tx/${tx.txHash}`, '_blank');
                    }}
                    data-testid={`button-explorer-${tx.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tx.timestamp}</span>
                  <span>Block #{tx.blockNumber}</span>
                  <span>{tx.gasUsed} gas</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
