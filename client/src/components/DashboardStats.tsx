import { Card, CardContent } from '@/components/ui/card';
import { FileText, Ship, DollarSign, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">{change}</span>
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-md">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="dashboard-stats">
      <StatCard
        title="Total Bills of Lading"
        value="42"
        change="+12% this month"
        icon={<FileText className="h-5 w-5 text-primary" />}
      />
      <StatCard
        title="Active Shipments"
        value="18"
        change="+8% this week"
        icon={<Ship className="h-5 w-5 text-primary" />}
      />
      <StatCard
        title="Trade Value"
        value="$2.4M"
        change="+15% this quarter"
        icon={<DollarSign className="h-5 w-5 text-primary" />}
      />
      <StatCard
        title="Cost Savings"
        value="$42K"
        change="+6% vs traditional"
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
      />
    </div>
  );
}
