import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, FileText, Search, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { CustomsClearance } from '@shared/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ClearanceReview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClearance, setSelectedClearance] = useState<CustomsClearance | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  const { data: clearances = [], isLoading, error } = useQuery<CustomsClearance[]>({
    queryKey: ['/api/customs/clearances'],
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiRequest('PATCH', `/api/customs/clearances/${id}/approve`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customs/clearances'] });
      toast({
        title: 'Success',
        description: 'Clearance approved successfully',
      });
      setSelectedClearance(null);
      setReviewNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve clearance',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiRequest('PATCH', `/api/customs/clearances/${id}/reject`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customs/clearances'] });
      toast({
        title: 'Success',
        description: 'Clearance rejected',
      });
      setSelectedClearance(null);
      setReviewNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject clearance',
        variant: 'destructive',
      });
    },
  });

  const filteredClearances = clearances.filter(
    (clearance) =>
      clearance.clearanceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clearance.declarationType.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">
          Customs Clearance Review
        </h1>
        <p className="text-muted-foreground">Review and process customs clearance requests</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load clearances. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by clearance ID or declaration type..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-clearances"
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading clearances...</p>
            </CardContent>
          </Card>
        ) : filteredClearances.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No clearances found matching your search.' : 'No clearances to review.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClearances.map((clearance) => (
            <Card key={clearance.id} data-testid={`card-clearance-${clearance.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold" data-testid={`text-clearance-id-${clearance.id}`}>
                        {clearance.clearanceId}
                      </span>
                      <Badge variant={getStatusVariant(clearance.status)} data-testid={`badge-clearance-status-${clearance.id}`}>
                        {clearance.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Declaration Type:</span>{' '}
                        <span className="text-sm text-muted-foreground">{clearance.declarationType}</span>
                      </div>
                      {clearance.documentHash && (
                        <div>
                          <span className="text-sm font-medium">Document Hash:</span>{' '}
                          <span className="text-sm text-muted-foreground font-mono text-xs">
                            {clearance.documentHash.substring(0, 16)}...
                          </span>
                        </div>
                      )}
                      {clearance.requestedAt && (
                        <div>
                          <span className="text-sm font-medium">Requested:</span>{' '}
                          <span className="text-sm text-muted-foreground">
                            {new Date(clearance.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {clearance.notes && (
                        <div>
                          <span className="text-sm font-medium">Notes:</span>{' '}
                          <span className="text-sm text-muted-foreground">{clearance.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {clearance.status === 'pending' && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            onClick={() => setSelectedClearance(clearance)}
                            data-testid={`button-approve-${clearance.id}`}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve Customs Clearance</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                You are approving clearance <strong>{selectedClearance?.clearanceId}</strong>
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
                                  if (selectedClearance) {
                                    approveMutation.mutate({
                                      id: selectedClearance.id,
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
                            onClick={() => setSelectedClearance(clearance)}
                            data-testid={`button-reject-${clearance.id}`}
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Customs Clearance</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                You are rejecting clearance <strong>{selectedClearance?.clearanceId}</strong>
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Rejection Reason (Optional)
                              </label>
                              <Textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Explain why this clearance is being rejected..."
                                rows={4}
                                data-testid="textarea-reject-notes"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  if (selectedClearance) {
                                    rejectMutation.mutate({
                                      id: selectedClearance.id,
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
