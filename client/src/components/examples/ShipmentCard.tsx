import ShipmentCard from '../ShipmentCard';

export default function ShipmentCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <ShipmentCard
        id="1"
        containerNumber="MSCU1234567"
        bolNumber="BOL-2024-001"
        status="in_transit"
        origin="Port of Shanghai"
        destination="Port of Los Angeles"
        eta="Jan 15, 2024"
      />
      <ShipmentCard
        id="2"
        containerNumber="TEMU9876543"
        bolNumber="BOL-2024-002"
        status="at_port"
        origin="Port of Singapore"
        destination="Port of Rotterdam"
        eta="Jan 18, 2024"
      />
      <ShipmentCard
        id="3"
        containerNumber="CMAU5555555"
        bolNumber="BOL-2024-003"
        status="customs_clearance"
        origin="Port of Dubai"
        destination="Port of Hamburg"
        eta="Jan 20, 2024"
      />
    </div>
  );
}
