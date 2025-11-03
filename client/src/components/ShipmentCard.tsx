import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge, { ShipmentStatus } from "./StatusBadge";
import { ArrowRight, Eye, MapPin } from "lucide-react";

interface ShipmentCardProps {
  id: string;
  containerNumber: string;
  bolNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  eta: string;
  onViewDetails?: () => void;
  onTrack?: () => void;
}

export default function ShipmentCard({
  id,
  containerNumber,
  bolNumber,
  status,
  origin,
  destination,
  eta,
  onViewDetails,
  onTrack,
}: ShipmentCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-shipment-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">{containerNumber}</CardTitle>
            <p className="text-sm font-mono text-muted-foreground mt-1">{bolNumber}</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="truncate">{origin}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{destination}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          ETA: {eta}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1" 
            onClick={() => {
              console.log('View details clicked for', id);
              onViewDetails?.();
            }}
            data-testid={`button-view-${id}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              console.log('Track clicked for', id);
              onTrack?.();
            }}
            data-testid={`button-track-${id}`}
          >
            Track
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
