import ShipmentTracker from '../ShipmentTracker';
import { mockShipmentEvents } from '@/lib/mockData';

export default function ShipmentTrackerExample() {
  return (
    <div className="max-w-2xl p-6">
      <ShipmentTracker
        vesselName="MSC GÜLSÜN"
        currentLocation="Mediterranean Sea"
        currentStatus="In Transit"
        progress={65}
        estimatedArrival={new Date('2024-02-05T14:30:00')}
        events={mockShipmentEvents}
      />
    </div>
  );
}
