import ShippingInstructionsForm from "@/components/ShippingInstructionsForm";
import DocumentCard from "@/components/DocumentCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function ShipperView() {
  const [showForm, setShowForm] = useState(false);

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
      shipperName: 'Global Logistics Co.',
      status: 'pending_approval' as const,
      date: 'Jan 12, 2024',
      isBlockchainVerified: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-shipper">Shipper Portal</h1>
          <p className="text-muted-foreground mt-1">
            Upload shipping instructions and track your shipments
          </p>
        </div>
        <Button 
          onClick={() => {
            console.log('New instruction button clicked');
            setShowForm(!showForm);
          }}
          data-testid="button-new-instruction"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Shipping Instruction
        </Button>
      </div>

      {showForm && (
        <ShippingInstructionsForm 
          onSubmit={(data) => {
            console.log('Shipping instructions submitted:', data);
            alert('Shipping instructions submitted successfully! Transaction recorded on blockchain.');
            setShowForm(false);
          }}
        />
      )}

      {!showForm && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
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
