import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, FileText, Ship, CheckCircle, AlertCircle } from "lucide-react";

interface Activity {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  txHash?: string;
  type: "upload" | "draft" | "approve" | "share" | "issue";
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  upload: FileText,
  draft: FileText,
  approve: CheckCircle,
  share: Ship,
  issue: AlertCircle,
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card data-testid="card-activity-feed">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <div key={activity.id} className="flex gap-4 border-l-2 border-border pl-4" data-testid={`activity-${activity.id}`}>
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="text-xs">
                      {activity.actor.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start gap-2">
                      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.actor}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                        </div>
                        {activity.txHash && (
                          <p className="text-xs font-mono text-muted-foreground mt-1" title={activity.txHash}>
                            Tx: {activity.txHash.substring(0, 10)}...{activity.txHash.substring(activity.txHash.length - 8)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
