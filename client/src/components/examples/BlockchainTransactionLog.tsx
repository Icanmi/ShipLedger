import BlockchainTransactionLog from '../BlockchainTransactionLog';

export default function BlockchainTransactionLogExample() {
  const mockTransactions = [
    {
      id: '1',
      txHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
      eventType: 'Shipping Instructions Uploaded',
      timestamp: '2024-01-10 14:32:18',
      blockNumber: 12345678,
      gasUsed: '21,000',
    },
    {
      id: '2',
      txHash: '0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a0z9y8x7w6v5u4t',
      eventType: 'Bill of Lading Created',
      timestamp: '2024-01-10 15:45:22',
      blockNumber: 12345690,
      gasUsed: '35,000',
    },
    {
      id: '3',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcd',
      eventType: 'Document Shared with Customs',
      timestamp: '2024-01-10 16:12:05',
      blockNumber: 12345702,
      gasUsed: '28,500',
    },
    {
      id: '4',
      txHash: '0x567890abcdef1234567890abcdef1234567890abcdef12345678',
      eventType: 'Port Access Granted',
      timestamp: '2024-01-10 17:20:33',
      blockNumber: 12345715,
      gasUsed: '22,800',
    },
  ];

  return <BlockchainTransactionLog transactions={mockTransactions} />;
}
