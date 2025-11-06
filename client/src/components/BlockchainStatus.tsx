import { Activity, Database, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface BlockchainStatusProps {
  compact?: boolean;
}

export default function BlockchainStatus({ compact = false }: BlockchainStatusProps) {
  const [status, setStatus] = useState({
    connected: true,
    blockNumber: '15,420,845',
    gasPrice: '12.5',
    tps: '2,450',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        blockNumber: (parseInt(prev.blockNumber.replace(/,/g, '')) + 1).toLocaleString(),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2" data-testid="blockchain-status-compact">
        <Badge variant={status.connected ? "default" : "destructive"} className="gap-1">
          <Activity className="h-3 w-3" />
          BlockDAG
        </Badge>
        <span className="text-xs text-muted-foreground font-mono">
          Block #{status.blockNumber}
        </span>
      </div>
    );
  }

  return (
    <Card className="p-4" data-testid="blockchain-status-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Database className="h-4 w-4" />
          BlockDAG Network Status
        </h3>
        <Badge variant={status.connected ? "default" : "destructive"}>
          {status.connected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Current Block</div>
          <div className="font-mono font-semibold" data-testid="text-block-number">#{status.blockNumber}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Gas Price</div>
          <div className="font-mono font-semibold flex items-center gap-1">
            {status.gasPrice} <span className="text-xs text-muted-foreground">gwei</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Throughput</div>
          <div className="font-mono font-semibold flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            {status.tps} TPS
          </div>
        </div>
      </div>
    </Card>
  );
}
