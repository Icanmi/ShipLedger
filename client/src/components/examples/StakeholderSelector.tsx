import { useState } from 'react';
import StakeholderSelector from '../StakeholderSelector';

export default function StakeholderSelectorExample() {
  const [role, setRole] = useState('shipper');

  return (
    <div className="p-6">
      <StakeholderSelector 
        currentRole={role} 
        onRoleChange={(newRole) => {
          setRole(newRole);
          console.log('Role changed to:', newRole);
        }} 
      />
    </div>
  );
}
