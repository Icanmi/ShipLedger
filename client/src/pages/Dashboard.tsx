import DashboardStats from '@/components/DashboardStats';
import BlockchainStatus from '@/components/BlockchainStatus';
import BillOfLadingCard from '@/components/BillOfLadingCard';
import ShipmentTracker from '@/components/ShipmentTracker';
import TradeFinancePanel from '@/components/TradeFinancePanel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter, Package, Ship, FileCheck, Building2, Anchor, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import { mockBillsOfLading, mockShipmentEvents, mockTradeFinance } from '@/lib/mockData';

interface DashboardProps {
  currentRole: string;
}

export default function Dashboard({ currentRole }: DashboardProps) {
  const getRoleInfo = () => {
    const roleMap = {
      shipper: {
        title: 'Shipper Dashboard',
        description: 'Manage your Bills of Lading, track shipments, and monitor blockchain transactions',
        icon: Package,
      },
      carrier: {
        title: 'Carrier Dashboard',
        description: 'Manage vessel operations, update shipment status, and handle Bills of Lading',
        icon: Ship,
      },
      freight_forwarder: {
        title: 'Freight Forwarder Dashboard',
        description: 'Coordinate shipments, manage documentation, and track cargo movements',
        icon: Truck,
      },
      customs: {
        title: 'Customs Authority Dashboard',
        description: 'Review documentation, approve clearances, and verify shipment compliance',
        icon: FileCheck,
      },
      bank: {
        title: 'Trade Finance Bank Dashboard',
        description: 'Manage Letters of Credit, process payments, and verify trade documents',
        icon: Building2,
      },
      port_authority: {
        title: 'Port Authority Dashboard',
        description: 'Monitor vessel arrivals, manage berth allocations, and track cargo movements',
        icon: Anchor,
      },
    };
    return roleMap[currentRole as keyof typeof roleMap] || roleMap.shipper;
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  // Shipper-specific dashboard
  if (currentRole === 'shipper') {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <RoleIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold mb-2">{roleInfo.title}</h1>
            <p className="text-muted-foreground">{roleInfo.description}</p>
          </div>
        </div>

        <DashboardStats />
        <BlockchainStatus />

        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">My Bills of Lading</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-filter">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Link href="/create">
              <Button size="sm" className="gap-2" data-testid="button-create-new">
                <PlusCircle className="h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              onView={() => console.log('View details:', bol.blNumber)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Carrier-specific dashboard
  if (currentRole === 'carrier') {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <RoleIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold mb-2">{roleInfo.title}</h1>
            <p className="text-muted-foreground">{roleInfo.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Active Vessels</div>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">In Transit</div>
              <div className="text-2xl font-bold">18</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">At Port</div>
              <div className="text-2xl font-bold">7</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Delivered</div>
              <div className="text-2xl font-bold">124</div>
            </CardContent>
          </Card>
        </div>

        <BlockchainStatus />

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
              <h3 className="font-semibold">Active Bills of Lading</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockBillsOfLading.slice(0, 3).map((bol) => (
                <div key={bol.id} className="p-3 border rounded-md hover-elevate cursor-pointer">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-sm font-semibold">{bol.blNumber}</span>
                    <Badge variant="secondary">{bol.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bol.portOfLoading} → {bol.portOfDischarge}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Customs Authority dashboard
  if (currentRole === 'customs') {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <RoleIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold mb-2">{roleInfo.title}</h1>
            <p className="text-muted-foreground">{roleInfo.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Pending Review</div>
              <div className="text-2xl font-bold">23</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Approved Today</div>
              <div className="text-2xl font-bold">41</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Flagged</div>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Total This Month</div>
              <div className="text-2xl font-bold">847</div>
            </CardContent>
          </Card>
        </div>

        <BlockchainStatus />

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Documents Awaiting Clearance</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockBillsOfLading.map((bol) => (
              <div key={bol.id} className="p-4 border rounded-md hover-elevate cursor-pointer">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="font-mono text-sm font-semibold mb-1">{bol.blNumber}</div>
                    <div className="text-sm text-muted-foreground">{bol.cargoDescription}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Flag
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Shipper:</span> {bol.shipper}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vessel:</span> {bol.vesselName}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Trade Finance Bank dashboard
  if (currentRole === 'bank') {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <RoleIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold mb-2">{roleInfo.title}</h1>
            <p className="text-muted-foreground">{roleInfo.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Active L/Cs</div>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Total Value</div>
              <div className="text-2xl font-bold">$2.4M</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Pending Payments</div>
              <div className="text-2xl font-bold">$420K</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Documents Review</div>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>
        </div>

        <BlockchainStatus />

        <TradeFinancePanel {...mockTradeFinance} />

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Recent Letters of Credit</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-md hover-elevate cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold">LC-2024-SH-001</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="text-sm">Amount: USD 125,000</div>
              <div className="text-xs text-muted-foreground">HSBC → Shanghai Exports Ltd.</div>
            </div>
            <div className="p-3 border rounded-md hover-elevate cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold">LC-2024-DB-002</span>
                <Badge variant="secondary">Documents Received</Badge>
              </div>
              <div className="text-sm">Amount: USD 89,500</div>
              <div className="text-xs text-muted-foreground">Standard Chartered → Dubai Trade Corp</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Port Authority dashboard
  if (currentRole === 'port_authority') {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <RoleIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold mb-2">{roleInfo.title}</h1>
            <p className="text-muted-foreground">{roleInfo.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Vessels in Port</div>
              <div className="text-2xl font-bold">14</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Scheduled Arrivals</div>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Berths Occupied</div>
              <div className="text-2xl font-bold">12/18</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Containers Today</div>
              <div className="text-2xl font-bold">2,341</div>
            </CardContent>
          </Card>
        </div>

        <BlockchainStatus />

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Vessel Movements</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">MSC GÜLSÜN</span>
                <Badge variant="default">Arriving</Badge>
              </div>
              <div className="text-sm text-muted-foreground">ETA: Feb 5, 14:30 • Berth 7</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">EVER GIVEN</span>
                <Badge variant="secondary">Docked</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Berth 3 • Loading in progress</div>
            </div>
            <div className="p-4 border rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">CMA CGM BENJAMIN FRANKLIN</span>
                <Badge variant="default">Departing</Badge>
              </div>
              <div className="text-sm text-muted-foreground">ETD: Today 18:00 • Berth 12</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Freight Forwarder dashboard (default fallback)
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-md">
          <RoleIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold mb-2">{roleInfo.title}</h1>
          <p className="text-muted-foreground">{roleInfo.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Active Shipments</div>
            <div className="text-2xl font-bold">34</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Pending Documents</div>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">In Transit</div>
            <div className="text-2xl font-bold">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-bold">156</div>
          </CardContent>
        </Card>
      </div>

      <BlockchainStatus />

      <div className="grid md:grid-cols-2 gap-4">
        {mockBillsOfLading.slice(0, 4).map((bol) => (
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
    </div>
  );
}
