import { Building2, Package, Ship, Truck, FileCheck, Anchor, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const roles = [
  { value: 'shipper', label: 'Shipper', icon: Package },
  { value: 'carrier', label: 'Carrier', icon: Ship },
  { value: 'freight_forwarder', label: 'Freight Forwarder', icon: Truck },
  { value: 'customs', label: 'Customs Authority', icon: FileCheck },
  { value: 'bank', label: 'Trade Finance Bank', icon: Building2 },
  { value: 'port_authority', label: 'Port Authority', icon: Anchor },
  { value: 'insurance', label: 'Insurance Company', icon: Shield },
];

interface StakeholderSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export default function StakeholderSelector({ currentRole, onRoleChange }: StakeholderSelectorProps) {
  const selectedRole = roles.find(r => r.value === currentRole) || roles[0];
  const Icon = selectedRole.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" data-testid="button-role-selector">
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{selectedRole.label}</span>
          <Badge variant="secondary" className="ml-1">Role</Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {roles.map((role) => {
          const RoleIcon = role.icon;
          return (
            <DropdownMenuItem
              key={role.value}
              onClick={() => onRoleChange(role.value)}
              className="gap-2"
              data-testid={`role-${role.value}`}
            >
              <RoleIcon className="h-4 w-4" />
              <span>{role.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
