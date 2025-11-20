import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Anchor, Ship, PlusCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import type { PortOperation } from '@shared/schema';
import BlockchainStatus from '@/components/BlockchainStatus';

export default function PortDashboard() {
  const { data: operations = [], isLoading, error } = useQuery<PortOperation[]>({
    queryKey: ['/api/port/operations'],
  });

  const berthAllocations = operations.filter(op => op.operationType === 'berth_allocation');
  const vesselArrivals = operations.filter(op => op.operationType === 'vessel_arrival');
  const terminalUpdates = operations.filter(op => op.operationType === 'terminal_update');
  const todayOps = operations.filter(op => {
    if (!op.timestamp) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const opDate = new Date(op.timestamp).setHours(0, 0, 0, 0);
    return today === opDate;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Port Authority Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load port operations. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Port Authority Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-dashboard-title">
            Port Authority Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor vessel arrivals, manage berth allocations, and track cargo movements
          </p>
        </div>
        <Link href="/port/operations/new">
          <Button className="gap-2" data-testid="button-create-operation">
            <PlusCircle className="h-4 w-4" />
            Record Operation
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Vessels in Port</div>
            <div className="text-2xl font-bold" data-testid="text-vessels-in-port">
              {vesselArrivals.filter(v => v.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Berth Allocations</div>
            <div className="text-2xl font-bold" data-testid="text-berth-allocations">
              {berthAllocations.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Terminal Updates</div>
            <div className="text-2xl font-bold" data-testid="text-terminal-updates">
              {terminalUpdates.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Operations Today</div>
            <div className="text-2xl font-bold" data-testid="text-operations-today">
              {todayOps.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <BlockchainStatus />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold">Recent Port Operations</h3>
          <Link href="/port/operations">
            <Button variant="outline" size="sm" data-testid="button-view-all-operations">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : operations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No operations recorded yet.
            </div>
          ) : (
            operations.slice(0, 10).map((operation) => (
              <div
                key={operation.id}
                className="p-4 border rounded-md hover-elevate cursor-pointer"
                data-testid={`card-operation-${operation.id}`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    {operation.operationType === 'vessel_arrival' ? (
                      <Ship className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Anchor className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-mono text-sm font-semibold" data-testid={`text-operation-id-${operation.id}`}>
                      {operation.operationId}
                    </span>
                  </div>
                  <Badge variant={operation.status === 'completed' ? 'default' : 'secondary'} data-testid={`badge-operation-status-${operation.id}`}>
                    {operation.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Type: {operation.operationType.replace('_', ' ').toUpperCase()}
                </div>
                {operation.berthNumber && (
                  <div className="text-sm text-muted-foreground">
                    Berth: {operation.berthNumber}
                  </div>
                )}
                {operation.timestamp && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(operation.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
