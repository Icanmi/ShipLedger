import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Ship, Package, MapPin, Save, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function CreateBillOfLadingForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    blNumber: '',
    shipper: '',
    consignee: '',
    notifyParty: '',
    vesselName: '',
    voyageNumber: '',
    portOfLoading: '',
    portOfDischarge: '',
    cargoDescription: '',
    containerNumbers: '',
    grossWeight: '',
    numberOfPackages: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const createBolMutation = useMutation({
    mutationFn: async (data: typeof formData & { status: string }) => {
      const res = await apiRequest('POST', '/api/bills-of-lading', {
        blNumber: data.blNumber,
        shipper: data.shipper,
        consignee: data.consignee,
        notifyParty: data.notifyParty || null,
        vesselName: data.vesselName,
        voyageNumber: data.voyageNumber,
        portOfLoading: data.portOfLoading,
        portOfDischarge: data.portOfDischarge,
        cargoDescription: data.cargoDescription,
        containerNumbers: data.containerNumbers || null,
        numberOfPackages: data.numberOfPackages ? parseInt(data.numberOfPackages) : null,
        grossWeight: data.grossWeight || null,
        status: data.status,
      });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bills-of-lading'] });
      toast({
        title: 'Success',
        description: `Bill of Lading ${data.blNumber} created successfully`,
      });
      setLocation('/documents');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create Bill of Lading',
        variant: 'destructive',
      });
    },
  });

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    createBolMutation.mutate({ ...formData, status: 'draft' });
  };

  const handleSubmitToBlockchain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.blNumber || !formData.shipper || !formData.consignee || 
        !formData.vesselName || !formData.voyageNumber || !formData.portOfLoading || 
        !formData.portOfDischarge || !formData.cargoDescription) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createBolMutation.mutate({ ...formData, status: 'submitted' });
  };

  return (
    <Card data-testid="form-create-bol">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Create Bill of Lading</h2>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="blNumber">B/L Number *</Label>
              <Input
                id="blNumber"
                name="blNumber"
                value={formData.blNumber}
                onChange={handleChange}
                placeholder="BL-2024-XXX"
                required
                data-testid="input-bl-number"
              />
            </div>
            <div>
              <Label htmlFor="voyageNumber">Voyage Number *</Label>
              <Input
                id="voyageNumber"
                name="voyageNumber"
                value={formData.voyageNumber}
                onChange={handleChange}
                placeholder="V425E"
                required
                data-testid="input-voyage-number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Parties Information</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipper">Shipper *</Label>
                <Input
                  id="shipper"
                  name="shipper"
                  value={formData.shipper}
                  onChange={handleChange}
                  placeholder="Company Name & Address"
                  required
                  data-testid="input-shipper"
                />
              </div>
              <div>
                <Label htmlFor="consignee">Consignee *</Label>
                <Input
                  id="consignee"
                  name="consignee"
                  value={formData.consignee}
                  onChange={handleChange}
                  placeholder="Company Name & Address"
                  required
                  data-testid="input-consignee"
                />
              </div>
              <div className="lg:col-span-2">
                <Label htmlFor="notifyParty">Notify Party</Label>
                <Input
                  id="notifyParty"
                  name="notifyParty"
                  value={formData.notifyParty}
                  onChange={handleChange}
                  placeholder="Company Name & Address"
                  data-testid="input-notify-party"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Ship className="h-4 w-4" />
              <span>Vessel & Route</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vesselName">Vessel Name *</Label>
                <Input
                  id="vesselName"
                  name="vesselName"
                  value={formData.vesselName}
                  onChange={handleChange}
                  placeholder="MSC GÜLSÜN"
                  required
                  data-testid="input-vessel-name"
                />
              </div>
              <div>
                <Label htmlFor="portOfLoading">Port of Loading *</Label>
                <Input
                  id="portOfLoading"
                  name="portOfLoading"
                  value={formData.portOfLoading}
                  onChange={handleChange}
                  placeholder="Shanghai, China"
                  required
                  data-testid="input-port-loading"
                />
              </div>
              <div className="lg:col-span-2">
                <Label htmlFor="portOfDischarge">Port of Discharge *</Label>
                <Input
                  id="portOfDischarge"
                  name="portOfDischarge"
                  value={formData.portOfDischarge}
                  onChange={handleChange}
                  placeholder="Rotterdam, Netherlands"
                  required
                  data-testid="input-port-discharge"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Cargo Details</span>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cargoDescription">Cargo Description *</Label>
                <Textarea
                  id="cargoDescription"
                  name="cargoDescription"
                  value={formData.cargoDescription}
                  onChange={handleChange}
                  placeholder="Electronic Components - 500 cartons"
                  rows={3}
                  required
                  data-testid="input-cargo-description"
                />
              </div>
              <div className="grid lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="containerNumbers">Container Numbers</Label>
                  <Input
                    id="containerNumbers"
                    name="containerNumbers"
                    value={formData.containerNumbers}
                    onChange={handleChange}
                    placeholder="MSCU1234567, MSCU7654321"
                    data-testid="input-container-numbers"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfPackages">Number of Packages</Label>
                  <Input
                    id="numberOfPackages"
                    name="numberOfPackages"
                    type="number"
                    value={formData.numberOfPackages}
                    onChange={handleChange}
                    placeholder="500"
                    data-testid="input-packages"
                  />
                </div>
                <div>
                  <Label htmlFor="grossWeight">Gross Weight (kg)</Label>
                  <Input
                    id="grossWeight"
                    name="grossWeight"
                    value={formData.grossWeight}
                    onChange={handleChange}
                    placeholder="12500"
                    data-testid="input-weight"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              className="gap-2"
              onClick={handleSaveDraft}
              disabled={createBolMutation.isPending}
              data-testid="button-save-draft"
            >
              {createBolMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>
            <Button 
              type="button" 
              variant="default" 
              className="gap-2"
              onClick={handleSubmitToBlockchain}
              disabled={createBolMutation.isPending}
              data-testid="button-submit-blockchain"
            >
              {createBolMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit to Blockchain
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
