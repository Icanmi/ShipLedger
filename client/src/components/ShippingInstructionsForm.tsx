import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useState } from "react";

interface ShippingInstructionsFormProps {
  onSubmit?: (data: ShippingInstructionsData) => void;
}

export interface ShippingInstructionsData {
  shipperName: string;
  consigneeName: string;
  origin: string;
  destination: string;
  containerNumber: string;
  cargoDescription: string;
  weight: string;
}

export default function ShippingInstructionsForm({ onSubmit }: ShippingInstructionsFormProps) {
  const [formData, setFormData] = useState<ShippingInstructionsData>({
    shipperName: '',
    consigneeName: '',
    origin: '',
    destination: '',
    containerNumber: '',
    cargoDescription: '',
    weight: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Shipping instructions submitted:', formData);
    onSubmit?.(formData);
  };

  return (
    <Card data-testid="card-shipping-instructions-form">
      <CardHeader>
        <CardTitle>Upload Shipping Instructions</CardTitle>
        <CardDescription>
          Provide details for your shipment. This information will be recorded on the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipperName">Shipper Name</Label>
              <Input
                id="shipperName"
                placeholder="Enter shipper name"
                value={formData.shipperName}
                onChange={(e) => setFormData({ ...formData, shipperName: e.target.value })}
                data-testid="input-shipper-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consigneeName">Consignee Name</Label>
              <Input
                id="consigneeName"
                placeholder="Enter consignee name"
                value={formData.consigneeName}
                onChange={(e) => setFormData({ ...formData, consigneeName: e.target.value })}
                data-testid="input-consignee-name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Port of Origin</Label>
              <Input
                id="origin"
                placeholder="e.g., Port of Shanghai"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                data-testid="input-origin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Port of Destination</Label>
              <Input
                id="destination"
                placeholder="e.g., Port of Los Angeles"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                data-testid="input-destination"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="containerNumber">Container Number</Label>
              <Input
                id="containerNumber"
                placeholder="e.g., MSCU1234567"
                value={formData.containerNumber}
                onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                data-testid="input-container-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 25000"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                data-testid="input-weight"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargoDescription">Cargo Description</Label>
            <Textarea
              id="cargoDescription"
              placeholder="Describe the cargo contents..."
              value={formData.cargoDescription}
              onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
              className="min-h-[100px]"
              data-testid="input-cargo-description"
            />
          </div>

          <div className="border-2 border-dashed border-border rounded-md p-8 text-center hover-elevate">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted formats: .pdf, .xml, .json
            </p>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.xml,.json"
              data-testid="input-file-upload"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              data-testid="button-save-draft"
              onClick={() => console.log('Save draft clicked')}
            >
              Save Draft
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              data-testid="button-submit-instructions"
            >
              Submit Instructions
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
