import { useState } from 'react';
import RoleSelector, { UserRole } from '../RoleSelector';

export default function RoleSelectorExample() {
  const [role, setRole] = useState<UserRole>('shipper');
  
  return (
    <div className="p-4">
      <RoleSelector 
        currentRole={role} 
        onRoleChange={(newRole) => {
          console.log('Role changed to:', newRole);
          setRole(newRole);
        }} 
      />
    </div>
  );
}
