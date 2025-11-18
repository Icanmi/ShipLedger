import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import ShipmentTracker from '@/components/ShipmentTracker';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Package, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { BillOfLading, Shipment } from '@shared/schema';

export default function Tracking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBlNumber, setActiveBlNumber] = useState<string | null>(null);
  const [previousBlNumber, setPreviousBlNumber] = useState<string | null>(null);

  const { data: bills, isLoading: billsLoading, error: billsError } = useQuery<BillOfLading[]>({
    queryKey: ['/api/bills-of-lading'],
  });

  const { data: shipment, isLoading: shipmentLoading, error: shipmentError } = useQuery<Shipment>({
    queryKey: ['/api/shipments', activeBlNumber],
    enabled: !!activeBlNumber && activeBlNumber !== 'not-found',
    gcTime: 0,
    staleTime: 0,
  });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setActiveBlNumber(null);
    } else if (activeBlNumber === 'not-found') {
      setActiveBlNumber(null);
    }
  }, [searchQuery, activeBlNumber]);

  useEffect(() => {
    if (activeBlNumber !== previousBlNumber && previousBlNumber && previousBlNumber !== 'not-found') {
      queryClient.removeQueries({ queryKey: ['/api/shipments', previousBlNumber] });
    }
    setPreviousBlNumber(activeBlNumber);
  }, [activeBlNumber, previousBlNumber]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setActiveBlNumber(null);
      return;
    }
    
    if (billsLoading || billsError) {
      return;
    }
    
    const foundBill = bills?.find(
      (bill) => 
        bill.blNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.containerNumbers?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundBill) {
      setActiveBlNumber(foundBill.id);
    } else {
      setActiveBlNumber('not-found');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (billsError) {
      setActiveBlNumber(null);
    }
  }, [billsError]);

  const activeBill = bills?.find(bill => bill.id === activeBlNumber);
  const isSearching = billsLoading || shipmentLoading;
  const notFound = activeBlNumber === 'not-found';
  const hasBillsError = !!billsError;
  const hasShipmentError = !!shipmentError && !notFound && !!activeBill;
  const hasNoTrackingData = activeBill && !shipment && !shipmentLoading && !shipmentError && activeBlNumber !== 'not-found';
  const canShowShipment = activeBill && shipment && !shipmentError && !hasBillsError;

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                data-testid="input-search-tracking"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              data-testid="button-track-shipment"
            >
              {isSearching ? 'Searching...' : 'Track Shipment'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasBillsError && (
        <Alert variant="destructive" data-testid="alert-bills-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading bills of lading. Please try again later or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      )}

      {notFound && !hasBillsError && (
        <Alert data-testid="alert-not-found">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No shipment found with B/L number or container number "{searchQuery}". Please check your input and try again.
          </AlertDescription>
        </Alert>
      )}

      {hasShipmentError && (
        <Alert variant="destructive" data-testid="alert-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading tracking information. Please try again later or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      )}

      {hasNoTrackingData && (
        <Alert data-testid="alert-no-tracking">
          <Package className="h-4 w-4" />
          <AlertDescription>
            Bill of Lading found, but no tracking information is available yet. Tracking data will be updated once the shipment is in transit.
          </AlertDescription>
        </Alert>
      )}

      {canShowShipment && (
        <div className="grid lg:grid-cols-2 gap-6">
          <ShipmentTracker
            vesselName={activeBill.vesselName}
            currentLocation={shipment.currentLocation || 'Location pending'}
            currentStatus={shipment.currentStatus}
            progress={shipment.progress || 0}
            estimatedArrival={shipment.estimatedArrival ? new Date(shipment.estimatedArrival) : undefined}
            events={Array.isArray(shipment.events) ? shipment.events.map((event: any) => ({
              ...event,
              timestamp: new Date(event.timestamp)
            })) : []}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Shipment Details</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">B/L Number</span>
                  <span className="font-medium">{activeBill.blNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vessel</span>
                  <span className="font-medium">{activeBill.vesselName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voyage</span>
                  <span className="font-medium">{activeBill.voyageNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-medium">{activeBill.portOfLoading}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium">{activeBill.portOfDischarge}</span>
                </div>
                {activeBill.containerNumbers && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Container</span>
                    <span className="font-medium">{activeBill.containerNumbers}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cargo</span>
                  <span className="font-medium">{activeBill.cargoDescription}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!activeBlNumber && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Track Your Shipment</h3>
            <p className="text-muted-foreground">
              Enter a B/L number or container number above to view real-time tracking information
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
