import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  label: string;
  status: "completed" | "active" | "pending";
  timestamp?: string;
}

interface ShipmentTimelineProps {
  currentStatus: string;
  origin?: string;
  destination?: string;
}

const statusToSteps: Record<string, string[]> = {
  created: ["Created"],
  in_transit: ["Created", "In Transit"],
  at_port: ["Created", "In Transit", "At Port"],
  customs_clearance: ["Created", "In Transit", "At Port", "Customs Clearance"],
  delivered: ["Created", "In Transit", "At Port", "Customs Clearance", "Delivered"],
};

export default function ShipmentTimeline({ currentStatus, origin, destination }: ShipmentTimelineProps) {
  const completedSteps = statusToSteps[currentStatus] || ["Created"];
  const currentStep = completedSteps[completedSteps.length - 1];

  const allSteps: TimelineStep[] = [
    {
      label: `Created${origin ? ` at ${origin}` : ""}`,
      status: "completed",
    },
    {
      label: "In Transit",
      status: completedSteps.includes("In Transit") ? 
        (currentStep === "In Transit" ? "active" : "completed") : "pending",
    },
    {
      label: "At Port",
      status: completedSteps.includes("At Port") ? 
        (currentStep === "At Port" ? "active" : "completed") : "pending",
    },
    {
      label: "Customs Clearance",
      status: completedSteps.includes("Customs Clearance") ? 
        (currentStep === "Customs Clearance" ? "active" : "completed") : "pending",
    },
    {
      label: `Delivered${destination ? ` to ${destination}` : ""}`,
      status: completedSteps.includes("Delivered") ? "active" : "pending",
    },
  ];

  return (
    <Card data-testid="card-shipment-timeline">
      <CardHeader>
        <CardTitle className="text-lg">Shipment Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            {allSteps.map((step, index) => (
              <div key={index} className="relative flex items-start gap-4" data-testid={`timeline-step-${index}`}>
                {/* Step indicator */}
                <div className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                  step.status === "completed" && "bg-primary border-primary text-primary-foreground",
                  step.status === "active" && "bg-primary/20 border-primary text-primary animate-pulse",
                  step.status === "pending" && "bg-background border-border text-muted-foreground"
                )}>
                  {step.status === "completed" && <Check className="h-4 w-4" />}
                  {step.status === "active" && <Clock className="h-4 w-4" />}
                  {step.status === "pending" && <Circle className="h-4 w-4" />}
                </div>

                {/* Step content */}
                <div className="flex-1 pt-0.5">
                  <p className={cn(
                    "font-medium",
                    step.status === "completed" && "text-foreground",
                    step.status === "active" && "text-primary",
                    step.status === "pending" && "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">{step.timestamp}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
