import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AlertTriangle, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlertRules, useAlerts } from "@/hooks/useAlerts";
import { format } from "date-fns";

export default function AlertRuleType() {
  const { data: rules, isLoading: rulesLoading, refetch: refetchRules } = useAlertRules();
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useAlerts();

  const breadcrumbItems = [
    { label: "Compliance Workspace", icon: <AlertTriangle className="h-5 w-5" /> },
    { label: "Compliance Alerts", link: "/compliance-alerts" },
    { label: "By Rule Type" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            Compliance Alerts by Rule Type
          </h1>
          <Button variant="outline" size="sm" onClick={() => { refetchRules(); refetchAlerts(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>RULE PERFORMANCE SUMMARY</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rulesLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No rules found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rules?.map((rule) => (
                      <TableRow key={rule.uuid} className="data-table-row">
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.alert_count}</TableCell>
                        <TableCell>{rule.domain}</TableCell>
                        <TableCell>{rule.risk_level}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {rule.is_active ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-orange-600" />
                            )}
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts ({alerts?.length || 0} items)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {alertsLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="data-table-header">
                    <TableHead>Priority</TableHead>
                    <TableHead>Report</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No alerts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts?.map((alert) => (
                      <TableRow key={alert.uuid} className="data-table-row">
                        <TableCell>
                          <Badge variant={alert.risk_level === "CRITICAL" ? "destructive" : "outline"}>
                            {alert.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-primary">{alert.report_reference}</TableCell>
                        <TableCell>{alert.entity_name}</TableCell>
                        <TableCell className="text-sm">{alert.rule_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(alert.generated_at), "MMM dd HH:mm")}
                        </TableCell>
                        <TableCell>{alert.disposition}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

        <div className="flex gap-2">
          <Button variant="outline" size="sm">View All Alerts</Button>
          <Button variant="outline" size="sm">Rule Performance Details</Button>
        </div>
      </div>
    </MainLayout>
  );
}