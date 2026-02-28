import { useQuery } from "@tanstack/react-query";
import * as reviewApi from "@/lib/reviewApi";

export function useReviewQueue(page = 1, pageSize = 20, filters: { report_type?: string } = {}) {
  return useQuery({
    queryKey: ["reviewQueue", page, pageSize, filters],
    queryFn: () => reviewApi.fetchReviewQueue(page, pageSize, filters),
  });
}

export function useReviewHistory(page = 1, pageSize = 20, filters: { report_type?: string } = {}) {
  return useQuery({
    queryKey: ["reviewHistory", page, pageSize, filters],
    queryFn: () => reviewApi.fetchReviewHistory(page, pageSize, filters),
  });
}

export function useEscalatedReports(page = 1, pageSize = 20, filters: { report_type?: string } = {}) {
  return useQuery({
    queryKey: ["escalatedReports", page, pageSize, filters],
    queryFn: () => reviewApi.fetchEscalatedReports(page, pageSize, filters),
  });
}

export function useFlaggedReports(page = 1, pageSize = 20, filters: { report_type?: string } = {}) {
  return useQuery({
    queryKey: ["flaggedReports", page, pageSize, filters],
    queryFn: () => reviewApi.fetchFlaggedReports(page, pageSize, filters),
  });
}

export function useMonitoredReports(page = 1, pageSize = 20, filters: { report_type?: string } = {}) {
  return useQuery({
    queryKey: ["monitoredReports", page, pageSize, filters],
    queryFn: () => reviewApi.fetchMonitoredReports(page, pageSize, filters),
  });
}

export function useArchivedReports(page = 1, pageSize = 20, filters: { report_type?: string } = {}) {
  return useQuery({
    queryKey: ["archivedReports", page, pageSize, filters],
    queryFn: () => reviewApi.fetchArchivedReports(page, pageSize, filters),
  });
}

export function useOverdueReports(page = 1, pageSize = 20, filters: { report_type?: string } = {}) {
  return useQuery({
    queryKey: ["overdueReports", page, pageSize, filters],
    queryFn: () => reviewApi.fetchOverdueReports(page, pageSize, filters),
  });
}

export function useAllReviewReports(page = 1, pageSize = 20, filters: { report_type?: string; review_status?: string } = {}) {
  return useQuery({
    queryKey: ["allReviewReports", page, pageSize, filters],
    queryFn: () => reviewApi.fetchAllReviewReports(page, pageSize, filters),
  });
}

export function useCTRReviewDetail(submissionId: string) {
  return useQuery({
    queryKey: ["ctrReviewDetail", submissionId],
    queryFn: () => reviewApi.fetchCTRReviewDetail(submissionId),
    enabled: !!submissionId,
  });
}
