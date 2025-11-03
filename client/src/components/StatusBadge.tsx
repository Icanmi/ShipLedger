import { Badge } from "@/components/ui/badge";

export type ShipmentStatus = 
  | "draft" 
  | "pending_approval" 
  | "in_transit" 
  | "at_port" 
  | "customs_clearance"
  | "delivered" 
  | "issue"
  | "blockchain_verified";

interface StatusBadgeProps {
  status: ShipmentStatus;
  className?: string;
}

const statusConfig: Record<ShipmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending_approval: { label: "Pending Approval", variant: "outline" },
  in_transit: { label: "In Transit", variant: "default" },
  at_port: { label: "At Port", variant: "default" },
  customs_clearance: { label: "Customs Clearance", variant: "outline" },
  delivered: { label: "Delivered", variant: "default" },
  issue: { label: "Issue", variant: "destructive" },
  blockchain_verified: { label: "Blockchain Verified", variant: "default" },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={className} data-testid={`badge-status-${status}`}>
      {config.label}
    </Badge>
  );
}
