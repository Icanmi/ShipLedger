import TransactionList from '../TransactionList';
import { mockTransactions } from '@/lib/mockData';

export default function TransactionListExample() {
  return (
    <div className="max-w-2xl p-6">
      <TransactionList transactions={mockTransactions} />
    </div>
  );
}
