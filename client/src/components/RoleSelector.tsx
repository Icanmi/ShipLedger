import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type UserRole = "shipper" | "carrier" | "customs" | "port";

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roleLabels: Record<UserRole, string> = {
  shipper: "Shipper",
  carrier: "Carrier",
  customs: "Customs",
  port: "Port Authority",
};

export default function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Viewing as:</span>
      <Select value={currentRole} onValueChange={(value) => onRoleChange(value as UserRole)}>
        <SelectTrigger className="w-[180px]" data-testid="select-role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="shipper" data-testid="role-option-shipper">Shipper</SelectItem>
          <SelectItem value="carrier" data-testid="role-option-carrier">Carrier</SelectItem>
          <SelectItem value="customs" data-testid="role-option-customs">Customs</SelectItem>
          <SelectItem value="port" data-testid="role-option-port">Port Authority</SelectItem>
        </SelectContent>
      </Select>
      <Badge variant="outline" data-testid="badge-current-role">
        {roleLabels[currentRole]}
      </Badge>
    </div>
  );
}
