import BillOfLadingCard from '@/components/BillOfLadingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import { Link } from 'wouter';
import { mockBillsOfLading } from '@/lib/mockData';
import { useState } from 'react';

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = mockBillsOfLading.filter(bol =>
    bol.blNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bol.shipper.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bol.consignee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Bills of Lading</h1>
          <p className="text-muted-foreground">
            Manage and track all your shipping documents
          </p>
        </div>
        <Link href="/create">
          <Button className="gap-2" data-testid="button-create-bol">
            <PlusCircle className="h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by B/L number, shipper, or consignee..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-documents"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((bol) => (
          <BillOfLadingCard
            key={bol.id}
            blNumber={bol.blNumber}
            shipper={bol.shipper}
            consignee={bol.consignee}
            vesselName={bol.vesselName}
            portOfLoading={bol.portOfLoading}
            portOfDischarge={bol.portOfDischarge}
            status={bol.status}
            blockchainStatus={bol.blockchainStatus}
            blockchainHash={bol.blockchainHash}
            cargoDescription={bol.cargoDescription}
            onView={() => console.log('View details:', bol.blNumber)}
          />
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No documents found matching your search.</p>
        </div>
      )}
    </div>
  );
}
