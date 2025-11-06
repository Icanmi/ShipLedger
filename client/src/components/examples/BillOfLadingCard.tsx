import BillOfLadingCard from '../BillOfLadingCard';
import { mockBillsOfLading } from '@/lib/mockData';

export default function BillOfLadingCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {mockBillsOfLading.map((bol) => (
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
          onView={() => console.log('View BoL:', bol.blNumber)}
        />
      ))}
    </div>
  );
}
