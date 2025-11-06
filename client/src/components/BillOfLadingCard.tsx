import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, Package, MapPin, CheckCircle2, Clock, FileText, Copy } from 'lucide-react';
import { formatAddress } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

interface BillOfLadingCardProps {
  blNumber: string;
  shipper: string;
  consignee: string;
  vesselName: string;
  portOfLoading: string;
  portOfDischarge: string;
  status: string;
  blockchainStatus?: string | null;
  blockchainHash?: string | null;
  cargoDescription: string;
  onView?: () => void;
}

export default function BillOfLadingCard({
  blNumber,
  shipper,
  consignee,
  vesselName,
  portOfLoading,
  portOfDischarge,
  status,
  blockchainStatus,
  blockchainHash,
  cargoDescription,
  onView,
}: BillOfLadingCardProps) {
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'Draft': 'secondary',
      'In Transit': 'default',
      'At Port': 'default',
      'Customs Clearance': 'default',
      'Delivered': 'default',
    };
    return statusMap[status] || 'secondary';
  };

  const handleCopyHash = () => {
    if (blockchainHash) {
      navigator.clipboard.writeText(blockchainHash);
      toast({ description: 'Transaction hash copied to clipboard' });
    }
  };

  return (
    <Card className="hover-elevate cursor-pointer transition-all" data-testid={`card-bol-${blNumber}`} onClick={onView}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-primary flex-shrink-0" />
              <h3 className="font-semibold font-mono text-sm" data-testid={`text-bl-number-${blNumber}`}>
                {blNumber}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground truncate">{cargoDescription}</p>
          </div>
          <Badge variant={getStatusColor(status)} className="flex-shrink-0">
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Shipper</div>
            <div className="font-medium truncate" title={shipper}>{shipper}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Consignee</div>
            <div className="font-medium truncate" title={consignee}>{consignee}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Ship className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="font-medium truncate">{vesselName}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{portOfLoading}</span>
          <span className="text-muted-foreground flex-shrink-0">→</span>
          <span className="truncate">{portOfDischarge}</span>
        </div>

        {blockchainHash && (
          <div className="pt-2 border-t flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {blockchainStatus === 'Confirmed' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-yellow-600 flex-shrink-0" />
              )}
              <span className="text-xs font-mono truncate" title={blockchainHash}>
                {formatAddress(blockchainHash)}
              </span>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyHash();
              }}
              data-testid="button-copy-hash"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
