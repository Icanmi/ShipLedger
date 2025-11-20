import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, PlusCircle, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import type { FreightForwarderCoordination } from '@shared/schema';
import BlockchainStatus from '@/components/BlockchainStatus';

export default function ForwarderDashboard() {
  const { data: coordinations = [], isLoading, error } = useQuery<FreightForwarderCoordination[]>({
    queryKey: ['/api/freight-forwarder/coordination'],
  });

  const pending = coordinations.filter(c => c.status === 'pending');
  const inProgress = coordinations.filter(c => c.status === 'in_progress');
  const completed = coordinations.filter(c => c.status === 'completed');
  const todayCoordinations = coordinations.filter(c => {
    if (!c.createdAt) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const coordDate = new Date(c.createdAt).setHours(0, 0, 0, 0);
    return today === coordDate;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Freight Forwarder Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load coordinations. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Freight Forwarder Dashboard</h1>
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
            Freight Forwarder Dashboard
          </h1>
          <p className="text-muted-foreground">
            Coordinate shipments, manage documentation, and track cargo movements
          </p>
        </div>
        <Link href="/forwarder/coordination/new">
          <Button className="gap-2" data-testid="button-create-coordination">
            <PlusCircle className="h-4 w-4" />
            New Coordination
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Pending</div>
            <div className="text-2xl font-bold" data-testid="text-pending-coordinations">
              {pending.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">In Progress</div>
            <div className="text-2xl font-bold" data-testid="text-in-progress-coordinations">
              {inProgress.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-bold" data-testid="text-completed-coordinations">
              {completed.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Today</div>
            <div className="text-2xl font-bold" data-testid="text-today-coordinations">
              {todayCoordinations.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <BlockchainStatus />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold">Active Coordinations</h3>
          <Link href="/forwarder/coordination">
            <Button variant="outline" size="sm" data-testid="button-view-all-coordinations">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : coordinations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No coordinations yet. Create your first coordination to get started.
            </div>
          ) : (
            coordinations.slice(0, 10).map((coordination) => (
              <div
                key={coordination.id}
                className="p-4 border rounded-md hover-elevate cursor-pointer"
                data-testid={`card-coordination-${coordination.id}`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-semibold" data-testid={`text-coordination-id-${coordination.id}`}>
                      {coordination.coordinationId}
                    </span>
                  </div>
                  <Badge 
                    variant={coordination.status === 'completed' ? 'default' : 'secondary'} 
                    data-testid={`badge-coordination-status-${coordination.id}`}
                  >
                    {coordination.status}
                  </Badge>
                </div>
                {coordination.documentHash && (
                  <div className="text-sm text-muted-foreground">
                    Doc Hash: {coordination.documentHash.substring(0, 16)}...
                  </div>
                )}
                {coordination.createdAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(coordination.createdAt).toLocaleDateString()}
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <Link href={`/forwarder/coordination/${coordination.id}`}>
                    <Button size="sm" variant="outline" className="gap-1" data-testid={`button-view-${coordination.id}`}>
                      <FileText className="h-3 w-3" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
