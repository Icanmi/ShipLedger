import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { insertFreightForwarderCoordinationSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Truck } from 'lucide-react';
import { Link } from 'wouter';
import type { BillOfLading } from '@shared/schema';

const coordinationFormSchema = insertFreightForwarderCoordinationSchema.extend({
  coordinationId: z.string().min(1, 'Coordination ID is required'),
  status: z.string().min(1, 'Status is required'),
});

type CoordinationFormData = z.infer<typeof coordinationFormSchema>;

export default function CreateCoordination() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: bills = [] } = useQuery<BillOfLading[]>({
    queryKey: ['/api/bills-of-lading'],
  });

  const form = useForm<CoordinationFormData>({
    resolver: zodResolver(coordinationFormSchema),
    defaultValues: {
      coordinationId: `FF-${Date.now()}`,
      blId: undefined,
      shipper: undefined,
      status: 'pending',
      services: undefined,
      documentHash: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CoordinationFormData) => apiRequest('POST', '/api/freight-forwarder/coordination', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/freight-forwarder/coordination'] });
      toast({
        title: 'Success',
        description: 'Coordination created successfully',
      });
      navigate('/forwarder');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create coordination',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CoordinationFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/forwarder">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-page-title">
            Create Coordination
          </h1>
          <p className="text-muted-foreground">
            Create a new freight forwarding coordination
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 flex-wrap">
          <div className="p-2 bg-primary/10 rounded-md">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Coordination Details</h3>
            <p className="text-sm text-muted-foreground">
              Enter the coordination information
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="coordinationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coordination ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="FF-12345" data-testid="input-coordination-id" />
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
                name="shipper"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipper ID (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="Shipper user ID" data-testid="input-shipper" />
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
                name="documentHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Hash (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="0x..." data-testid="input-document-hash" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-create-coordination"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Coordination
                </Button>
                <Link href="/forwarder">
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
