import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, CheckCircle2 } from "lucide-react";
import StatusBadge, { ShipmentStatus } from "./StatusBadge";

interface DocumentCardProps {
  id: string;
  bolNumber: string;
  shipperName: string;
  status: ShipmentStatus;
  date: string;
  isBlockchainVerified?: boolean;
  onView?: () => void;
  onDownload?: () => void;
}

export default function DocumentCard({
  id,
  bolNumber,
  shipperName,
  status,
  date,
  isBlockchainVerified,
  onView,
  onDownload,
}: DocumentCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-document-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold font-mono text-sm truncate">{bolNumber}</p>
            <p className="text-sm text-muted-foreground truncate">{shipperName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <StatusBadge status={status} />
          {isBlockchainVerified && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              <span>Verified</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{date}</p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              console.log('View document clicked for', id);
              onView?.();
            }}
            data-testid={`button-view-doc-${id}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('Download document clicked for', id);
              onDownload?.();
            }}
            data-testid={`button-download-doc-${id}`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
