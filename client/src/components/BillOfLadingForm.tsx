import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface BillOfLadingFormProps {
  instructionsData?: any;
  onDraft?: (data: BillOfLadingData) => void;
  onFinalize?: (data: BillOfLadingData) => void;
}

export interface BillOfLadingData {
  bolNumber: string;
  vesselName: string;
  voyageNumber: string;
  shipperName: string;
  consigneeName: string;
  notifyParty: string;
  origin: string;
  destination: string;
  containerNumber: string;
  sealNumber: string;
  packageCount: string;
  weight: string;
  cargoDescription: string;
  freightTerms: string;
}

export default function BillOfLadingForm({ instructionsData, onDraft, onFinalize }: BillOfLadingFormProps) {
  const [formData, setFormData] = useState<BillOfLadingData>({
    bolNumber: `BOL-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    vesselName: '',
    voyageNumber: '',
    shipperName: instructionsData?.shipperName || '',
    consigneeName: instructionsData?.consigneeName || '',
    notifyParty: '',
    origin: instructionsData?.origin || '',
    destination: instructionsData?.destination || '',
    containerNumber: instructionsData?.containerNumber || '',
    sealNumber: '',
    packageCount: '',
    weight: instructionsData?.weight || '',
    cargoDescription: instructionsData?.cargoDescription || '',
    freightTerms: 'prepaid',
  });

  const handleDraft = () => {
    console.log('Bill of Lading draft saved:', formData);
    onDraft?.(formData);
  };

  const handleFinalize = () => {
    console.log('Bill of Lading finalized:', formData);
    onFinalize?.(formData);
  };

  return (
    <Card data-testid="card-bol-form">
      <CardHeader>
        <CardTitle>Draft Bill of Lading</CardTitle>
        <CardDescription>
          Create a Bill of Lading based on shipping instructions. All changes are recorded on the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bolNumber">BoL Number</Label>
              <Input
                id="bolNumber"
                value={formData.bolNumber}
                onChange={(e) => setFormData({ ...formData, bolNumber: e.target.value })}
                className="font-mono"
                data-testid="input-bol-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name</Label>
              <Input
                id="vesselName"
                placeholder="e.g., MSC Oscar"
                value={formData.vesselName}
                onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                data-testid="input-vessel-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voyageNumber">Voyage Number</Label>
              <Input
                id="voyageNumber"
                placeholder="e.g., V001"
                value={formData.voyageNumber}
                onChange={(e) => setFormData({ ...formData, voyageNumber: e.target.value })}
                data-testid="input-voyage-number"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border border-border rounded-md">
            <h3 className="font-semibold text-sm">Party Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shipperName">Shipper</Label>
                <Input
                  id="shipperName"
                  value={formData.shipperName}
                  onChange={(e) => setFormData({ ...formData, shipperName: e.target.value })}
                  data-testid="input-bol-shipper"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consigneeName">Consignee</Label>
                <Input
                  id="consigneeName"
                  value={formData.consigneeName}
                  onChange={(e) => setFormData({ ...formData, consigneeName: e.target.value })}
                  data-testid="input-bol-consignee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifyParty">Notify Party</Label>
                <Input
                  id="notifyParty"
                  placeholder="Party to notify"
                  value={formData.notifyParty}
                  onChange={(e) => setFormData({ ...formData, notifyParty: e.target.value })}
                  data-testid="input-notify-party"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 border border-border rounded-md">
            <h3 className="font-semibold text-sm">Route & Container</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Port of Loading</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  data-testid="input-bol-origin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Port of Discharge</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  data-testid="input-bol-destination"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="containerNumber">Container Number</Label>
                <Input
                  id="containerNumber"
                  value={formData.containerNumber}
                  onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                  className="font-mono"
                  data-testid="input-bol-container"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sealNumber">Seal Number</Label>
                <Input
                  id="sealNumber"
                  placeholder="e.g., SL123456"
                  value={formData.sealNumber}
                  onChange={(e) => setFormData({ ...formData, sealNumber: e.target.value })}
                  data-testid="input-seal-number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 border border-border rounded-md">
            <h3 className="font-semibold text-sm">Cargo Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageCount">Number of Packages</Label>
                <Input
                  id="packageCount"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.packageCount}
                  onChange={(e) => setFormData({ ...formData, packageCount: e.target.value })}
                  data-testid="input-package-count"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Gross Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  data-testid="input-bol-weight"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freightTerms">Freight Terms</Label>
                <Select 
                  value={formData.freightTerms} 
                  onValueChange={(value) => setFormData({ ...formData, freightTerms: value })}
                >
                  <SelectTrigger id="freightTerms" data-testid="select-freight-terms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="collect">Collect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargoDescription">Cargo Description</Label>
              <Textarea
                id="cargoDescription"
                value={formData.cargoDescription}
                onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                className="min-h-[80px]"
                data-testid="input-bol-cargo-description"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={handleDraft}
              data-testid="button-draft-bol"
            >
              Save Draft
            </Button>
            <Button 
              type="button" 
              className="flex-1"
              onClick={handleFinalize}
              data-testid="button-finalize-bol"
            >
              Finalize & Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
