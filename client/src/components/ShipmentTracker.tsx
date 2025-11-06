import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Ship, CheckCircle, Clock, Package } from 'lucide-react';
import { format } from 'date-fns';

interface ShipmentEvent {
  timestamp: Date;
  location: string;
  status: string;
  description: string;
}

interface ShipmentTrackerProps {
  vesselName: string;
  currentLocation: string;
  currentStatus: string;
  progress: number;
  estimatedArrival?: Date;
  events: ShipmentEvent[];
}

export default function ShipmentTracker({
  vesselName,
  currentLocation,
  currentStatus,
  progress,
  estimatedArrival,
  events,
}: ShipmentTrackerProps) {
  return (
    <Card data-testid="card-shipment-tracker">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Ship className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{vesselName}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{currentLocation}</span>
            </div>
          </div>
          <Badge variant="default">{currentStatus}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Shipment Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          {estimatedArrival && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>ETA: {format(estimatedArrival, 'MMM dd, yyyy HH:mm')}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Tracking History</h4>
          <div className="space-y-3">
            {events.map((event, index) => (
              <div 
                key={index} 
                className="flex gap-3"
                data-testid={`event-${index}`}
              >
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-1 ${index === 0 ? 'bg-primary' : 'bg-muted'}`}>
                    {index === 0 ? (
                      <Package className="h-3 w-3 text-primary-foreground" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-px h-full bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <span className="font-medium text-sm">{event.status}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {format(event.timestamp, 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-0.5">{event.location}</div>
                  <div className="text-xs">{event.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
