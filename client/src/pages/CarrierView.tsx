import BillOfLadingForm from "@/components/BillOfLadingForm";
import DocumentCard from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function CarrierView() {
  const [showForm, setShowForm] = useState(false);

  const mockPendingInstructions = {
    shipperName: 'Global Logistics Co.',
    consigneeName: 'Pacific Imports Ltd.',
    origin: 'Port of Shanghai',
    destination: 'Port of Los Angeles',
    containerNumber: 'MSCU1234567',
    weight: '25000',
    cargoDescription: 'Electronics components - 100 pallets',
  };

  const mockDocuments = [
    {
      id: '1',
      bolNumber: 'BOL-2024-001',
      shipperName: 'Global Logistics Co.',
      status: 'in_transit' as const,
      date: 'Jan 10, 2024',
      isBlockchainVerified: true,
    },
    {
      id: '2',
      bolNumber: 'BOL-2024-002',
      shipperName: 'Ocean Freight Ltd.',
      status: 'draft' as const,
      date: 'Jan 12, 2024',
      isBlockchainVerified: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-carrier">Carrier Portal</h1>
          <p className="text-muted-foreground mt-1">
            Draft and manage Bills of Lading for shipping instructions
          </p>
        </div>
        <Button 
          onClick={() => {
            console.log('Draft BoL button clicked');
            setShowForm(!showForm);
          }}
          data-testid="button-draft-bol-main"
        >
          <Plus className="h-4 w-4 mr-2" />
          Draft Bill of Lading
        </Button>
      </div>

      {showForm && (
        <BillOfLadingForm 
          instructionsData={mockPendingInstructions}
          onDraft={(data) => {
            console.log('BoL draft saved:', data);
            alert('Bill of Lading draft saved successfully!');
          }}
          onFinalize={(data) => {
            console.log('BoL finalized:', data);
            alert('Bill of Lading finalized and shared with customs and port authorities! Transaction recorded on blockchain.');
            setShowForm(false);
          }}
        />
      )}

      {!showForm && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Bills of Lading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDocuments.map((doc) => (
              <DocumentCard key={doc.id} {...doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
