import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BarChart3, Download } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Statistics() {
  const [periodFilter, setPeriodFilter] = useState("thismonth");
  const [fromDate, setFromDate] = useState("Jan 2026");
  const [toDate, setToDate] = useState("Jan 2026");

  const breadcrumbItems = [
    { label: "Reporting Entity Workspace", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Submission Statistics" },
  ];

  return (
    <MainLayout>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Submission Statistics</h1>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Period Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Period:</span>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thismonth">This Month</SelectItem>
                    <SelectItem value="lastmonth">Last Month</SelectItem>
                    <SelectItem value="thisquarter">This Quarter</SelectItem>
                    <SelectItem value="lastquarter">Last Quarter</SelectItem>
                    <SelectItem value="thisyear">This Year</SelectItem>
                    <SelectItem value="lastyear">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {periodFilter === "custom" && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">From:</span>
                    <Select value={fromDate} onValueChange={setFromDate}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jan 2026">Jan 2026</SelectItem>
                        <SelectItem value="Dec 2025">Dec 2025</SelectItem>
                        <SelectItem value="Nov 2025">Nov 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">To:</span>
                    <Select value={toDate} onValueChange={setToDate}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jan 2026">Jan 2026</SelectItem>
                        <SelectItem value="Dec 2025">Dec 2025</SelectItem>
                        <SelectItem value="Nov 2025">Nov 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overview KPI Cards */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Overview (January 2026)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <KPICard
                title="Total Submitted"
                value="156"
                subtitle="↑ 12% vs last month"
                trend={{ value: 12, direction: "up" }}
                icon={<FileText className="h-6 w-6" />}
              />
              <KPICard
                title="Acceptance Rate"
                value="87.2%"
                subtitle="↑ 3.5% vs last month"
                trend={{ value: 3.5, direction: "up" }}
                icon={<CheckCircle2 className="h-6 w-6" />}
              />
              <KPICard
                title="Average Time to Validation"
                value="18 hours"
                subtitle="↓ 4h vs last month"
                trend={{ value: -4, direction: "down" }}
                icon={<Clock className="h-6 w-6" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submission Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Submission Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* By Report Type */}
            <div>
              <h3 className="font-medium mb-4">By Report Type:</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">STR</span>
                    <span className="text-sm text-muted-foreground">94 (60.3%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-blue-600 h-4 rounded-full" style={{ width: "60.3%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">CTR</span>
                    <span className="text-sm text-muted-foreground">62 (39.7%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-green-600 h-4 rounded-full" style={{ width: "39.7%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* By Status */}
            <div>
              <h3 className="font-medium mb-4">By Status:</h3>
              <div className="space-y-3">
                {[
                  { label: "Validated", value: 98, percentage: 62.8, color: "bg-green-600" },
                  { label: "Under Review", value: 38, percentage: 24.4, color: "bg-yellow-600" },
                  { label: "Submitted", value: 12, percentage: 7.7, color: "bg-blue-600" },
                  { label: "Returned", value: 5, percentage: 3.2, color: "bg-orange-600" },
                  { label: "Rejected", value: 3, percentage: 1.9, color: "bg-red-600" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.value} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className={`${item.color} h-4 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Submission Method */}
            <div>
              <h3 className="font-medium mb-4">By Submission Method:</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">API</span>
                    <span className="text-sm text-muted-foreground">127 (81.4%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-purple-600 h-4 rounded-full" style={{ width: "81.4%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Excel Upload</span>
                    <span className="text-sm text-muted-foreground">29 (18.6%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-indigo-600 h-4 rounded-full" style={{ width: "18.6%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Submissions by Month (Last 6 Months):</p>
            <div className="space-y-2">
              {[
                { month: "Aug 2025", value: 85, height: 42.5 },
                { month: "Sep 2025", value: 110, height: 55 },
                { month: "Oct 2025", value: 130, height: 65 },
                { month: "Nov 2025", value: 145, height: 72.5 },
                { month: "Dec 2025", value: 158, height: 79 },
                { month: "Jan 2026", value: 156, height: 78 },
              ].map((item, index) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-20 text-xs text-muted-foreground">{item.month}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1 bg-gray-200 rounded h-6">
                      <div
                        className="bg-primary h-6 rounded"
                        style={{ width: `${item.height}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                        {item.value}
                      </span>
                    </div>
                    {index === 5 && <span className="text-xs">●</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Processing Performance */}
        <Card>
          <CardHeader>
            <CardTitle>⏱️ Processing Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-4">Validation Times (Average):</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm">Automated Validation:</span>
                  <span className="font-medium">12 seconds</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm">Manual Validation:</span>
                  <span className="font-medium">14 hours</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm">Combined (Total):</span>
                  <span className="font-medium">18 hours</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Best Performance:</span>
                <p className="text-base">6 hours (total)</p>
              </div>
              <div>
                <span className="text-sm font-medium">Slowest Performance:</span>
                <p className="text-base">48 hours (total)</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm">
                ℹ️ "Average Time to Validation" is the combined time from submission to validation completion (automated + manual validation).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quality Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">First-Time Acceptance Rate:</span>
                <p className="text-2xl font-bold">87.2%</p>
              </div>
              <div>
                <span className="text-sm font-medium">Rejection Rate:</span>
                <p className="text-2xl font-bold">1.9%</p>
              </div>
              <div>
                <span className="text-sm font-medium">Return Rate:</span>
                <p className="text-2xl font-bold">3.2%</p>
              </div>
              <div>
                <span className="text-sm font-medium">Resubmission Success Rate:</span>
                <p className="text-2xl font-bold">96.0%</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Common Issues:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm">1. Date format inconsistencies</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm">2. Missing subject identification</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <span className="text-sm">3. Incomplete transaction narratives</span>
                  <span className="font-medium">25%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}