import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { RiskBadge, RiskLevel } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Alert {
  id: string;
  title: string;
  description: string;
  risk_level: RiskLevel;
  report_ref: string;
  timestamp: string;
}

interface AlertsPanelProps {
  data?: Alert[];
  isLoading?: boolean;
}

export function AlertsPanel({ data, isLoading }: AlertsPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const alerts = data || [];

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-risk-critical" />
          <h3 className="font-semibold">Active Alerts</h3>
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-risk-critical text-[11px] font-bold text-white">
            {alerts.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="divide-y">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No active alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                alert.risk_level === "critical" && "border-l-4 border-l-risk-critical"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <RiskBadge level={alert.risk_level} />
                    <span className="font-mono-ref text-xs text-primary">{alert.report_ref}</span>
                  </div>
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {alert.timestamp}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
