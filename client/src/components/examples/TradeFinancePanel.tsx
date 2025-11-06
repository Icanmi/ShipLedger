import TradeFinancePanel from '../TradeFinancePanel';
import { mockTradeFinance } from '@/lib/mockData';

export default function TradeFinancePanelExample() {
  return (
    <div className="max-w-2xl p-6">
      <TradeFinancePanel {...mockTradeFinance} />
    </div>
  );
}
