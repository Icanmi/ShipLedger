import CreateBillOfLadingForm from '@/components/CreateBillOfLadingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function CreateDocument() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/documents">
          <Button variant="ghost" className="gap-2 mb-4" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Button>
        </Link>
        <h1 className="text-3xl font-semibold mb-2">Create Bill of Lading</h1>
        <p className="text-muted-foreground">
          Create a new digital Bill of Lading and submit to blockchain
        </p>
      </div>

      <CreateBillOfLadingForm />
    </div>
  );
}
