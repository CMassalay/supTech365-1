import { AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { RiskBadge, RiskLevel } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  reportRef: string;
  timestamp: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Structuring Pattern Detected",
    description: "Multiple transactions just below reporting threshold",
    riskLevel: "critical",
    reportRef: "FIA-2026-0234",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    title: "PEP Transaction Flag",
    description: "Transaction involving politically exposed person",
    riskLevel: "high",
    reportRef: "FIA-2026-0232",
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    title: "Unusual Volume Spike",
    description: "Entity reporting 300% above average this month",
    riskLevel: "medium",
    reportRef: "FIA-2026-0228",
    timestamp: "6 hours ago",
  },
];

export function AlertsPanel() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-risk-critical" />
          <h3 className="font-semibold">Active Alerts</h3>
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-risk-critical text-[11px] font-bold text-white">
            {mockAlerts.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <div className="divide-y">
        {mockAlerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
              alert.riskLevel === "critical" && "border-l-4 border-l-risk-critical"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <RiskBadge level={alert.riskLevel} />
                  <span className="font-mono-ref text-xs text-primary">{alert.reportRef}</span>
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
        ))}
      </div>
    </div>
  );
}
