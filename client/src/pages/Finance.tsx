import TradeFinancePanel from '@/components/TradeFinancePanel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingDown } from 'lucide-react';
import { mockTradeFinance } from '@/lib/mockData';

export default function Finance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Trade Finance</h1>
        <p className="text-muted-foreground">
          Manage payment workflows and smart contract automation
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trade Value</p>
                <p className="text-2xl font-bold">$2.4M</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingDown className="h-3 w-3 rotate-180" />
              <span>+15% from last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active L/Cs</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Across 5 banks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-md">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Savings</p>
                <p className="text-2xl font-bold">$42K</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">6% vs traditional methods</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TradeFinancePanel {...mockTradeFinance} />

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Smart Contract Automation</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Automated Payment Triggers</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Document verification completed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Goods loaded and vessel departed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">○</span>
                  <span>Customs clearance approved</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">○</span>
                  <span>Delivery confirmed</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Smart Contract Address</span>
              </div>
              <div className="p-3 bg-muted rounded-md">
                <code className="text-xs font-mono">
                  0x7f8a3c...2d9e3f1a
                </code>
              </div>
            </div>

            <Button className="w-full" variant="outline" data-testid="button-view-contract">
              View on BlockDAG Explorer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
