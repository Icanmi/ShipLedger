export const mockBillsOfLading = [
  {
    id: '1',
    blNumber: 'BL-2024-001',
    shipper: 'Shanghai Exports Ltd.',
    consignee: 'Rotterdam Imports BV',
    vesselName: 'MSC GÜLSÜN',
    voyageNumber: 'V425E',
    portOfLoading: 'Shanghai, China',
    portOfDischarge: 'Rotterdam, Netherlands',
    cargoDescription: 'Electronic Components - 500 cartons',
    status: 'In Transit',
    blockchainStatus: 'Confirmed',
    blockchainHash: '0x7f8a3c2b9e5d1f4a6c8b2d9e3f1a5c7b8d4e6f2a9c3b5d7e1f4a6c8b2d9e3f1a',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    blNumber: 'BL-2024-002',
    shipper: 'Dubai Trade Corp',
    consignee: 'Singapore Logistics Pte Ltd',
    vesselName: 'EVER GIVEN',
    voyageNumber: 'V318W',
    portOfLoading: 'Jebel Ali, UAE',
    portOfDischarge: 'Singapore',
    cargoDescription: 'Automotive Parts - 300 pallets',
    status: 'At Port',
    blockchainStatus: 'Pending',
    blockchainHash: null,
    createdAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    blNumber: 'BL-2024-003',
    shipper: 'Los Angeles Exports Inc',
    consignee: 'Tokyo Trading Co',
    vesselName: 'CMA CGM BENJAMIN FRANKLIN',
    voyageNumber: 'V520P',
    portOfLoading: 'Los Angeles, USA',
    portOfDischarge: 'Tokyo, Japan',
    cargoDescription: 'Agricultural Machinery - 50 units',
    status: 'Delivered',
    blockchainStatus: 'Confirmed',
    blockchainHash: '0x2a4b6c8d9e1f3a5c7b9d2e4f6a8c1d3e5f7a9b2c4d6e8f1a3c5b7d9e2f4a6c8',
    createdAt: new Date('2024-01-10'),
  },
];

export const mockShipmentEvents = [
  {
    timestamp: new Date('2024-01-15T08:00:00'),
    location: 'Shanghai Port, China',
    status: 'Container Loaded',
    description: 'Container loaded onto vessel',
  },
  {
    timestamp: new Date('2024-01-16T14:30:00'),
    location: 'East China Sea',
    status: 'Departed',
    description: 'Vessel departed from Shanghai',
  },
  {
    timestamp: new Date('2024-01-22T10:15:00'),
    location: 'Singapore Strait',
    status: 'In Transit',
    description: 'Passed through Singapore Strait',
  },
  {
    timestamp: new Date('2024-01-28T16:45:00'),
    location: 'Suez Canal',
    status: 'In Transit',
    description: 'Transiting Suez Canal',
  },
];

export const mockTransactions = [
  {
    id: '1',
    transactionHash: '0x7f8a3c2b9e5d1f4a6c8b2d9e3f1a5c7b8d4e6f2a9c3b5d7e1f4a6c8b2d9e3f1a',
    blockNumber: '15420845',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
    to: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    gasUsed: '125000',
    status: 'Confirmed',
    type: 'Document Verification',
    timestamp: new Date('2024-01-15T08:30:00'),
  },
  {
    id: '2',
    transactionHash: '0x2a4b6c8d9e1f3a5c7b9d2e4f6a8c1d3e5f7a9b2c4d6e8f1a3c5b7d9e2f4a6c8',
    blockNumber: '15420920',
    from: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    to: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    gasUsed: '98000',
    status: 'Pending',
    type: 'Ownership Transfer',
    timestamp: new Date('2024-01-18T12:15:00'),
  },
];

export const mockTradeFinance = {
  lcNumber: 'LC-2024-SH-001',
  bank: 'HSBC Trade Finance',
  amount: '125,000',
  currency: 'USD',
  paymentStatus: 'Letter of Credit Issued',
  milestones: [
    { name: 'LC Issued', status: 'completed', date: '2024-01-10', amount: 0 },
    { name: 'Goods Shipped', status: 'completed', date: '2024-01-15', amount: 0 },
    { name: 'Documents Presented', status: 'in_progress', date: null, amount: 31250 },
    { name: 'Payment Released', status: 'pending', date: null, amount: 93750 },
  ],
};

export const STAKEHOLDER_ROLES = [
  { value: 'shipper', label: 'Shipper', icon: 'Package' },
  { value: 'carrier', label: 'Carrier', icon: 'Ship' },
  { value: 'freight_forwarder', label: 'Freight Forwarder', icon: 'Truck' },
  { value: 'customs', label: 'Customs Authority', icon: 'FileCheck' },
  { value: 'bank', label: 'Trade Finance Bank', icon: 'Building2' },
  { value: 'port_authority', label: 'Port Authority', icon: 'Anchor' },
];

export const DOCUMENT_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'pending', label: 'Pending Approval', color: 'bg-yellow-500' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-blue-500' },
  { value: 'at_port', label: 'At Port', color: 'bg-purple-500' },
  { value: 'customs_clearance', label: 'Customs Clearance', color: 'bg-orange-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
];
