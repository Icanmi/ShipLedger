import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, FileText, Search, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { InsuranceClaim } from '@shared/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ClaimsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  const { data: claims = [], isLoading, error } = useQuery<InsuranceClaim[]>({
    queryKey: ['/api/insurance/claims'],
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiRequest('PATCH', `/api/insurance/claims/${id}/status`, { status: 'approved', notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims'] });
      toast({
        title: 'Success',
        description: 'Claim approved successfully',
      });
      setSelectedClaim(null);
      setReviewNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve claim',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiRequest('PATCH', `/api/insurance/claims/${id}/status`, { status: 'rejected', notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/claims'] });
      toast({
        title: 'Success',
        description: 'Claim rejected',
      });
      setSelectedClaim(null);
      setReviewNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject claim',
        variant: 'destructive',
      });
    },
  });

  const filteredClaims = claims.filter(
    (claim) =>
      claim.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.incidentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Claims Management</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">
          Claims Management
        </h1>
        <p className="text-muted-foreground">Review and process insurance claims</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load claims. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by claim ID or incident type..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-claims"
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading claims...</p>
            </CardContent>
          </Card>
        ) : filteredClaims.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No claims found matching your search.' : 'No claims to review.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClaims.map((claim) => (
            <Card key={claim.id} data-testid={`card-claim-${claim.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold" data-testid={`text-claim-id-${claim.id}`}>
                        {claim.claimId}
                      </span>
                      <Badge variant={getStatusVariant(claim.status)} data-testid={`badge-claim-status-${claim.id}`}>
                        {claim.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Incident Type:</span>{' '}
                        <span className="text-sm text-muted-foreground">{claim.incidentType}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Claim Amount:</span>{' '}
                        <span className="text-sm text-muted-foreground">${claim.claimAmount}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Description:</span>{' '}
                        <span className="text-sm text-muted-foreground">{claim.description}</span>
                      </div>
                      {claim.submittedAt && (
                        <div>
                          <span className="text-sm font-medium">Submitted:</span>{' '}
                          <span className="text-sm text-muted-foreground">
                            {new Date(claim.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {claim.status === 'submitted' && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            onClick={() => setSelectedClaim(claim)}
                            data-testid={`button-approve-claim-${claim.id}`}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve Claim</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                You are approving claim <strong>{selectedClaim?.claimId}</strong>
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Review Notes (Optional)
                              </label>
                              <Textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add any notes about this approval..."
                                rows={4}
                                data-testid="textarea-approve-notes"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  if (selectedClaim) {
                                    approveMutation.mutate({
                                      id: selectedClaim.id,
                                      notes: reviewNotes,
                                    });
                                  }
                                }}
                                disabled={approveMutation.isPending}
                                data-testid="button-confirm-approve"
                              >
                                Confirm Approval
                              </Button>
                              <DialogTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogTrigger>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => setSelectedClaim(claim)}
                            data-testid={`button-reject-claim-${claim.id}`}
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Claim</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                You are rejecting claim <strong>{selectedClaim?.claimId}</strong>
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Rejection Reason (Optional)
                              </label>
                              <Textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Explain why this claim is being rejected..."
                                rows={4}
                                data-testid="textarea-reject-notes"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (selectedClaim) {
                                    rejectMutation.mutate({
                                      id: selectedClaim.id,
                                      notes: reviewNotes,
                                    });
                                  }
                                }}
                                disabled={rejectMutation.isPending}
                                data-testid="button-confirm-reject"
                              >
                                Confirm Rejection
                              </Button>
                              <DialogTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogTrigger>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
