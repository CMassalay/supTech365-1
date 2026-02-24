import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as manualValidationApi from "@/lib/manualValidationApi";
import type { AuditLogFilters, QueueFilters, SubmitDecisionRequest } from "@/types/manualValidation";

export function useValidationQueue(filters: QueueFilters, page: number, pageSize: number) {
  return useQuery({
    queryKey: ["validationQueue", filters, page, pageSize],
    queryFn: () => manualValidationApi.fetchValidationQueue(filters, page, pageSize),
    staleTime: 30 * 1000,
  });
}

export function useReportContent(submissionId: string) {
  return useQuery({
    queryKey: ["reportContent", submissionId],
    queryFn: () => manualValidationApi.fetchReportContent(submissionId),
    enabled: Boolean(submissionId),
  });
}

export function useAuditLogs(filters: AuditLogFilters, page: number, pageSize: number) {
  return useQuery({
    queryKey: ["auditLogs", filters, page, pageSize],
    queryFn: () => manualValidationApi.fetchAuditLogs(filters, page, pageSize),
    staleTime: 30 * 1000,
  });
}

export function useSubmitDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { submissionId: string; data: SubmitDecisionRequest }) =>
      manualValidationApi.submitValidationDecision(args.submissionId, args.data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["validationQueue"] }),
        queryClient.invalidateQueries({ queryKey: ["auditLogs"] }),
      ]);
      toast.success("Decision submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit decision. Please try again.");
    },
  });
}
