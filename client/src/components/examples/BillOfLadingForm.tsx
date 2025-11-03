import BillOfLadingForm from '../BillOfLadingForm';

export default function BillOfLadingFormExample() {
  const mockInstructions = {
    shipperName: 'Global Logistics Co.',
    consigneeName: 'Pacific Imports Ltd.',
    origin: 'Port of Shanghai',
    destination: 'Port of Los Angeles',
    containerNumber: 'MSCU1234567',
    weight: '25000',
    cargoDescription: 'Electronics components - 100 pallets',
  };

  return (
    <div className="max-w-5xl">
      <BillOfLadingForm 
        instructionsData={mockInstructions}
        onDraft={(data) => {
          console.log('BoL draft saved:', data);
          alert('Bill of Lading draft saved successfully!');
        }}
        onFinalize={(data) => {
          console.log('BoL finalized:', data);
          alert('Bill of Lading finalized and shared with authorized parties!');
        }}
      />
    </div>
  );
}
