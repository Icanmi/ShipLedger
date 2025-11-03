import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlockchainVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txHash?: string | null;
  blockNumber?: number | null;
  timestamp?: Date | string;
  documentHash?: string | null;
  verified?: boolean;
  entityType?: string;
  entityId?: string;
}

export default function BlockchainVerificationModal({
  open,
  onOpenChange,
  txHash,
  blockNumber,
  timestamp,
  documentHash,
  verified = false,
  entityType = "Document",
  entityId,
}: BlockchainVerificationModalProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatTimestamp = (ts?: Date | string) => {
    if (!ts) return "N/A";
    const date = typeof ts === "string" ? new Date(ts) : ts;
    return date.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="modal-blockchain-verification">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {verified ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
            )}
            Blockchain Verification
          </DialogTitle>
          <DialogDescription>
            {entityType} {entityId ? `#${entityId}` : ""} - BlockDAG Testnet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-md">
            <div>
              <p className="text-sm font-medium">Verification Status</p>
              <p className="text-xs text-muted-foreground mt-1">
                {verified ? "Verified and immutable on blockchain" : "Pending verification"}
              </p>
            </div>
            <Badge variant={verified ? "default" : "outline"}>
              {verified ? "✓ Verified" : "⏳ Pending"}
            </Badge>
          </div>

          {/* Transaction Hash */}
          {txHash && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Hash</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-xs break-all">
                <span className="flex-1">{txHash}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(txHash, "Transaction hash")}
                  data-testid="button-copy-tx-hash"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(`https://explorer.blockdag.network/tx/${txHash}`, '_blank')}
                  data-testid="button-view-explorer"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Block Number */}
          {blockNumber && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Block Number</label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {blockNumber.toLocaleString()}
              </div>
            </div>
          )}

          {/* Timestamp */}
          {timestamp && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Timestamp</label>
              <div className="p-3 bg-muted rounded-md text-sm">
                {formatTimestamp(timestamp)}
              </div>
            </div>
          )}

          {/* Document Hash */}
          {documentHash && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Hash (SHA-256)</label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-xs break-all">
                <span className="flex-1">{documentHash}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(documentHash, "Document hash")}
                  data-testid="button-copy-doc-hash"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This cryptographic hash ensures document integrity and prevents tampering
              </p>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
            <p className="text-sm text-muted-foreground">
              All transactions are recorded on the BlockDAG testnet, ensuring complete transparency 
              and immutability. This verification can be independently verified on the BlockDAG explorer.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-modal">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
