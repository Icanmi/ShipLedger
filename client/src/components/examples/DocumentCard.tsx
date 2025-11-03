import DocumentCard from '../DocumentCard';

export default function DocumentCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <DocumentCard
        id="1"
        bolNumber="BOL-2024-001"
        shipperName="Global Logistics Co."
        status="in_transit"
        date="Jan 10, 2024"
        isBlockchainVerified
      />
      <DocumentCard
        id="2"
        bolNumber="BOL-2024-002"
        shipperName="Ocean Freight Ltd."
        status="pending_approval"
        date="Jan 12, 2024"
        isBlockchainVerified={false}
      />
      <DocumentCard
        id="3"
        bolNumber="BOL-2024-003"
        shipperName="International Shipping Inc."
        status="delivered"
        date="Jan 8, 2024"
        isBlockchainVerified
      />
    </div>
  );
}
