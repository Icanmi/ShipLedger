import BlockchainStatus from '../BlockchainStatus';

export default function BlockchainStatusExample() {
  return (
    <div className="space-y-4 p-6">
      <BlockchainStatus />
      <div className="pt-4">
        <BlockchainStatus compact />
      </div>
    </div>
  );
}
