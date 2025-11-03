import MetricCard from '../MetricCard';
import { Ship, FileText, Database, Clock } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Active Shipments" 
        value={24} 
        icon={Ship} 
        trend="+12% from last month"
        testId="metric-shipments"
      />
      <MetricCard 
        title="Pending Documents" 
        value={8} 
        icon={FileText} 
        trend="3 need approval"
        testId="metric-documents"
      />
      <MetricCard 
        title="Blockchain Transactions" 
        value={156} 
        icon={Database} 
        trend="All verified"
        testId="metric-blockchain"
      />
      <MetricCard 
        title="Avg. Processing Time" 
        value="2.4h" 
        icon={Clock} 
        trend="-18% improvement"
        testId="metric-time"
      />
    </div>
  );
}
