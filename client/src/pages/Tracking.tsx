import ShipmentTracker from '@/components/ShipmentTracker';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { mockShipmentEvents } from '@/lib/mockData';
import heroImage from '@assets/generated_images/Cargo_ship_illustration_ee9cca94.png';

export default function Tracking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Shipment Tracking</h1>
        <p className="text-muted-foreground">
          Real-time tracking of cargo and vessel movements
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter B/L number or container number..."
                className="pl-9"
                data-testid="input-search-tracking"
              />
            </div>
            <Button data-testid="button-track-shipment">Track Shipment</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <ShipmentTracker
          vesselName="MSC GÜLSÜN"
          currentLocation="Mediterranean Sea"
          currentStatus="In Transit"
          progress={65}
          estimatedArrival={new Date('2024-02-05T14:30:00')}
          events={mockShipmentEvents}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Vessel Location</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
              <img 
                src={heroImage} 
                alt="Cargo vessel" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="text-sm font-medium">Current Position</p>
                  <p className="text-xs opacity-90">35.8994° N, 14.5146° E</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Speed</span>
                <span className="font-medium">18.5 knots</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heading</span>
                <span className="font-medium">295° NW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Port</span>
                <span className="font-medium">Rotterdam, Netherlands</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
