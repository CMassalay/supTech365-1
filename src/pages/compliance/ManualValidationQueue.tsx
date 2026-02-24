import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Inbox, RefreshCw } from "lucide-react";
import { useValidationStore } from "@/hooks/useValidationStore";
import { useValidationQueue } from "@/hooks/useManualValidation";
import { ValidationQueueFilters } from "@/components/compliance/validation/ValidationQueueFilters";
import { ValidationQueueTable } from "@/components/compliance/validation/ValidationQueueTable";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { QueueFilters, ReportType } from "@/types/manualValidation";

export default function ManualValidationQueue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { queueFilters, setQueueFilters, resetQueueFilters } = useValidationStore();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const roleDefaults = useMemo<Partial<QueueFilters>>(() => {
    switch (user?.role) {
      case "head_of_compliance":
        return { reportType: "CTR" };
      case "head_of_analysis":
        return { reportType: "STR" };
      case "compliance_officer":
        return { reportType: "CTR", assignedToMe: true };
      case "analyst":
        return { reportType: "STR", assignedToMe: true };
      default:
        return {};
    }
  }, [user?.role]);

  const effectiveFilters = useMemo<QueueFilters>(
    () => ({ ...queueFilters, ...roleDefaults }),
    [queueFilters, roleDefaults]
  );

  useEffect(() => {
    const normalizedFilters: Partial<QueueFilters> = {};
    if (roleDefaults.reportType && queueFilters.reportType !== roleDefaults.reportType) {
      normalizedFilters.reportType = roleDefaults.reportType as ReportType;
    }
    if (roleDefaults.assignedToMe && queueFilters.assignedToMe !== true) {
      normalizedFilters.assignedToMe = true;
    }
    if (Object.keys(normalizedFilters).length > 0) {
      setQueueFilters(normalizedFilters);
    }
  }, [queueFilters.assignedToMe, queueFilters.reportType, roleDefaults, setQueueFilters]);

  const { data, isLoading, refetch } = useValidationQueue(effectiveFilters, page, pageSize);
  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const isPersonalQueue = user?.role === "compliance_officer" || user?.role === "analyst";
  const pageTitle = isPersonalQueue ? "My Validation Queue" : "Manual Validation Queue";

  const breadcrumbItems = [
    { label: "Compliance", href: "/compliance/validation-queue" },
    { label: pageTitle, href: "/compliance/validation-queue" },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6" />
            {pageTitle}
          </h1>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <p className="text-muted-foreground">Pending Reviews: {total}</p>

        <Card>
          <CardContent className="pt-6">
            <ValidationQueueFilters
              filters={effectiveFilters}
              onChange={(filters) => {
                setPage(1);
                setQueueFilters({ ...filters, ...roleDefaults });
              }}
              onReset={() => {
                setPage(1);
                resetQueueFilters();
                if (Object.keys(roleDefaults).length > 0) {
                  setQueueFilters(roleDefaults);
                }
              }}
            />

            <div className="mt-4">
              {isLoading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">Loading queue...</div>
              ) : (
                <ValidationQueueTable
                  items={items}
                  onViewDetails={(submissionId) => navigate(`/compliance/validation-queue/${submissionId}`)}
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {items.length ? (page - 1) * pageSize + 1 : 0}-{(page - 1) * pageSize + items.length} of {total}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">{page}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const maxPage = Math.max(1, Math.ceil(total / pageSize));
                        setPage((p) => Math.min(maxPage, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
