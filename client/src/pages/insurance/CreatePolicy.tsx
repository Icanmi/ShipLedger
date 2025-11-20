import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { insertInsurancePolicySchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import { Link } from 'wouter';
import type { BillOfLading } from '@shared/schema';

const policyFormSchema = insertInsurancePolicySchema.extend({
  coverageAmount: z.string().min(1, 'Coverage amount is required'),
  premium: z.string().min(1, 'Premium is required'),
  coverageType: z.string().min(1, 'Coverage type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  policyId: z.string().min(1, 'Policy ID is required'),
});

type PolicyFormData = z.infer<typeof policyFormSchema>;

export default function CreatePolicy() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: bills = [] } = useQuery<BillOfLading[]>({
    queryKey: ['/api/bills-of-lading'],
  });

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policyFormSchema),
    defaultValues: {
      policyId: `POL-${Date.now()}`,
      blId: undefined,
      insured: undefined,
      coverageAmount: '',
      premium: '',
      coverageType: 'cargo',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'draft',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PolicyFormData) => apiRequest('POST', '/api/insurance/policies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/policies'] });
      toast({
        title: 'Success',
        description: 'Insurance policy created successfully',
      });
      navigate('/insurance');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create policy',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: PolicyFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/insurance">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">
            Create Insurance Policy
          </h1>
          <p className="text-muted-foreground">
            Create a new insurance policy for shipment coverage
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 flex-wrap">
          <div className="p-2 bg-primary/10 rounded-md">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Policy Details</h3>
            <p className="text-sm text-muted-foreground">
              Enter the insurance policy information
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="policyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="POL-12345" data-testid="input-policy-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="blId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill of Lading (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-bill-of-lading">
                          <SelectValue placeholder="Select a bill of lading" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bills.map((bill) => (
                          <SelectItem key={bill.id} value={bill.id}>
                            {bill.blNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insured"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insured Party ID (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="User ID" data-testid="input-insured" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="coverageAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage Amount ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="100000" data-testid="input-coverage-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="premium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="2500" data-testid="input-premium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coverageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coverage Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-coverage-type">
                          <SelectValue placeholder="Select coverage type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cargo">Cargo Insurance</SelectItem>
                        <SelectItem value="hull">Hull Insurance</SelectItem>
                        <SelectItem value="liability">Liability Insurance</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-create-policy"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Policy
                </Button>
                <Link href="/insurance">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
