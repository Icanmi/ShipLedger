import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileCheck, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import type { CustomsClearance } from '@shared/schema';
import BlockchainStatus from '@/components/BlockchainStatus';

export default function CustomsDashboard() {
  const { data: clearances = [], isLoading, error } = useQuery<CustomsClearance[]>({
    queryKey: ['/api/customs/clearances'],
  });

  const pending = clearances.filter(c => c.status === 'pending');
  const approved = clearances.filter(c => c.status === 'approved');
  const rejected = clearances.filter(c => c.status === 'rejected');
  const approvedToday = approved.filter(c => {
    if (!c.approvedAt) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const approvedDate = new Date(c.approvedAt).setHours(0, 0, 0, 0);
    return today === approvedDate;
  });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Customs Authority Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load clearances. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Customs Authority Dashboard</h1>
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
            Customs Authority Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review documentation, approve clearances, and verify shipment compliance
          </p>
        </div>
        <Link href="/customs/clearances">
          <Button className="gap-2" data-testid="button-view-all-clearances">
            <FileCheck className="h-4 w-4" />
            View All Clearances
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Pending Review</div>
            <div className="text-2xl font-bold" data-testid="text-pending-clearances">
              {pending.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Approved Today</div>
            <div className="text-2xl font-bold" data-testid="text-approved-today">
              {approvedToday.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Rejected</div>
            <div className="text-2xl font-bold" data-testid="text-rejected-clearances">
              {rejected.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total This Month</div>
            <div className="text-2xl font-bold" data-testid="text-total-clearances">
              {clearances.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <BlockchainStatus />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold">Documents Awaiting Clearance</h3>
          <Link href="/customs/clearances">
            <Button variant="outline" size="sm" data-testid="button-view-pending">
              View All Pending
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending clearances to review.
            </div>
          ) : (
            pending.slice(0, 10).map((clearance) => (
              <div
                key={clearance.id}
                className="p-4 border rounded-md hover-elevate cursor-pointer"
                data-testid={`card-clearance-${clearance.id}`}
              >
                <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                  <div>
                    <div className="font-mono text-sm font-semibold mb-1" data-testid={`text-clearance-id-${clearance.id}`}>
                      {clearance.clearanceId}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Declaration Type: {clearance.declarationType}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/customs/clearances/${clearance.id}`}>
                      <Button size="sm" variant="default" className="gap-1" data-testid={`button-review-${clearance.id}`}>
                        <FileCheck className="h-3 w-3" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Recent Approvals</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {approved.slice(0, 5).map((clearance) => (
              <div key={clearance.id} className="p-3 border rounded-md" data-testid={`card-approved-${clearance.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold">{clearance.clearanceId}</span>
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {clearance.declarationType}
                </div>
              </div>
            ))}
            {approved.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No approvals yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Recent Rejections</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {rejected.slice(0, 5).map((clearance) => (
              <div key={clearance.id} className="p-3 border rounded-md" data-testid={`card-rejected-${clearance.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold">{clearance.clearanceId}</span>
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Rejected
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {clearance.declarationType}
                </div>
              </div>
            ))}
            {rejected.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No rejections yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
