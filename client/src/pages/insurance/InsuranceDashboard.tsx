import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { Link } from 'wouter';
import type { InsurancePolicy, InsuranceClaim } from '@shared/schema';
import BlockchainStatus from '@/components/BlockchainStatus';

export default function InsuranceDashboard() {
  const { data: policies = [], isLoading: policiesLoading } = useQuery<InsurancePolicy[]>({
    queryKey: ['/api/insurance/policies'],
  });

  const { data: claims = [], isLoading: claimsLoading } = useQuery<InsuranceClaim[]>({
    queryKey: ['/api/insurance/claims'],
  });

  const activePolicies = policies.filter(p => p.status === 'active');
  const pendingClaims = claims.filter(c => c.status === 'submitted');
  const approvedClaims = claims.filter(c => c.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-dashboard-title">
            Insurance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage insurance policies and process claims
          </p>
        </div>
        <Link href="/insurance/policies/new">
          <Button className="gap-2" data-testid="button-create-policy">
            <PlusCircle className="h-4 w-4" />
            Create Policy
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Active Policies</div>
            <div className="text-2xl font-bold" data-testid="text-active-policies">
              {activePolicies.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Pending Claims</div>
            <div className="text-2xl font-bold" data-testid="text-pending-claims">
              {pendingClaims.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Approved Today</div>
            <div className="text-2xl font-bold" data-testid="text-approved-claims">
              {approvedClaims.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Policies</div>
            <div className="text-2xl font-bold" data-testid="text-total-policies">
              {policies.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <BlockchainStatus />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold">Recent Policies</h3>
            <Link href="/insurance/policies">
              <Button variant="outline" size="sm" data-testid="button-view-all-policies">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {policiesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : policies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No policies yet. Create your first policy to get started.
              </div>
            ) : (
              policies.slice(0, 5).map((policy) => (
                <div
                  key={policy.id}
                  className="p-4 border rounded-md hover-elevate cursor-pointer"
                  data-testid={`card-policy-${policy.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-sm font-semibold" data-testid={`text-policy-id-${policy.id}`}>
                      {policy.policyId}
                    </span>
                    <Badge
                      variant={policy.status === 'active' ? 'default' : 'secondary'}
                      data-testid={`badge-policy-status-${policy.id}`}
                    >
                      {policy.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Coverage: ${policy.coverageAmount} • {policy.coverageType}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Premium: ${policy.premium}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold">Pending Claims</h3>
            <Link href="/insurance/claims">
              <Button variant="outline" size="sm" data-testid="button-view-all-claims">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {claimsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pendingClaims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending claims to review.
              </div>
            ) : (
              pendingClaims.slice(0, 5).map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 border rounded-md hover-elevate cursor-pointer"
                  data-testid={`card-claim-${claim.id}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-sm font-semibold" data-testid={`text-claim-id-${claim.id}`}>
                      {claim.claimId}
                    </span>
                    <Badge variant="secondary" data-testid={`badge-claim-status-${claim.id}`}>
                      {claim.status}
                    </Badge>
                  </div>
                  <div className="text-sm mb-1">{claim.incidentType}</div>
                  <div className="text-sm text-muted-foreground">
                    Amount: ${claim.claimAmount}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/insurance/claims/${claim.id}`}>
                      <Button size="sm" variant="default" className="gap-1" data-testid={`button-review-claim-${claim.id}`}>
                        <FileText className="h-3 w-3" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
