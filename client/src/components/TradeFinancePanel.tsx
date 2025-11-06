import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Milestone {
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  date?: string | null;
  amount: number;
}

interface TradeFinancePanelProps {
  lcNumber: string;
  bank: string;
  amount: string;
  currency: string;
  paymentStatus: string;
  milestones: Milestone[];
}

export default function TradeFinancePanel({
  lcNumber,
  bank,
  amount,
  currency,
  paymentStatus,
  milestones,
}: TradeFinancePanelProps) {
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progress = (completedMilestones / milestones.length) * 100;
  const totalAmount = parseFloat(amount.replace(/,/g, ''));

  return (
    <Card data-testid="card-trade-finance">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Trade Finance</h3>
            </div>
            <p className="text-sm text-muted-foreground">{bank}</p>
          </div>
          <Badge variant="default">{paymentStatus}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between p-3 bg-muted rounded-md">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Letter of Credit</div>
            <div className="font-mono font-semibold">{lcNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Total Amount</div>
            <div className="text-xl font-bold">
              {currency} {amount}
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-semibold">{completedMilestones}/{milestones.length} Milestones</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Payment Milestones</h4>
          <div className="space-y-2">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-2 rounded-md hover-elevate"
                data-testid={`milestone-${index}`}
              >
                <div className="mt-0.5">
                  {milestone.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : milestone.status === 'in_progress' ? (
                    <Clock className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <span className="font-medium text-sm">{milestone.name}</span>
                    {milestone.amount > 0 && (
                      <span className="text-sm font-semibold flex-shrink-0">
                        {currency} {milestone.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {milestone.date && (
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(milestone.date), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Remaining</span>
            <span className="font-semibold">
              {currency} {milestones.reduce((acc, m) => acc + m.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
