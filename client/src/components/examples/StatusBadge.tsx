import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="draft" />
      <StatusBadge status="pending_approval" />
      <StatusBadge status="in_transit" />
      <StatusBadge status="at_port" />
      <StatusBadge status="customs_clearance" />
      <StatusBadge status="delivered" />
      <StatusBadge status="issue" />
      <StatusBadge status="blockchain_verified" />
    </div>
  );
}
