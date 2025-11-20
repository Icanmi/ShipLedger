import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { insertPortOperationSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Anchor } from 'lucide-react';
import { Link } from 'wouter';
import type { BillOfLading } from '@shared/schema';

const operationFormSchema = insertPortOperationSchema.extend({
  operationId: z.string().min(1, 'Operation ID is required'),
  operationType: z.string().min(1, 'Operation type is required'),
  status: z.string().min(1, 'Status is required'),
});

type OperationFormData = z.infer<typeof operationFormSchema>;

export default function CreateOperation() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: bills = [] } = useQuery<BillOfLading[]>({
    queryKey: ['/api/bills-of-lading'],
  });

  const form = useForm<OperationFormData>({
    resolver: zodResolver(operationFormSchema),
    defaultValues: {
      operationId: `PORT-${Date.now()}`,
      blId: undefined,
      shipmentId: undefined,
      operationType: 'vessel_arrival',
      berthNumber: undefined,
      status: 'pending',
      notes: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: OperationFormData) => apiRequest('POST', '/api/port/operations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/port/operations'] });
      toast({
        title: 'Success',
        description: 'Port operation recorded successfully',
      });
      navigate('/port');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record operation',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: OperationFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/port">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">
            Record Port Operation
          </h1>
          <p className="text-muted-foreground">
            Record a new port operation or vessel activity
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 flex-wrap">
          <div className="p-2 bg-primary/10 rounded-md">
            <Anchor className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Operation Details</h3>
            <p className="text-sm text-muted-foreground">
              Enter the port operation information
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="operationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PORT-12345" data-testid="input-operation-id" />
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
                name="operationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-operation-type">
                          <SelectValue placeholder="Select operation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vessel_arrival">Vessel Arrival</SelectItem>
                        <SelectItem value="vessel_departure">Vessel Departure</SelectItem>
                        <SelectItem value="berth_allocation">Berth Allocation</SelectItem>
                        <SelectItem value="terminal_update">Terminal Update</SelectItem>
                        <SelectItem value="cargo_handling">Cargo Handling</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="berthNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Berth Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="B-7" data-testid="input-berth-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ''} rows={4} placeholder="Additional notes about this operation..." data-testid="textarea-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-create-operation"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Record Operation
                </Button>
                <Link href="/port">
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
