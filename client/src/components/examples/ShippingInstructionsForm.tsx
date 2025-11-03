import ShippingInstructionsForm from '../ShippingInstructionsForm';

export default function ShippingInstructionsFormExample() {
  return (
    <div className="max-w-4xl">
      <ShippingInstructionsForm 
        onSubmit={(data) => {
          console.log('Form submitted with data:', data);
          alert('Shipping instructions submitted successfully!');
        }}
      />
    </div>
  );
}
