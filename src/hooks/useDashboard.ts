import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useDashboardStatistics() {
  return useQuery({
    queryKey: ["dashboard-statistics"],
    queryFn: async () => {
      const response = await apiClient.get("/dashboard/statistics");
      return response.data;
    },
  });
}

export function useValidationWorkloadDistribution() {
  return useQuery({
    queryKey: ["validation-workload-distribution"],
    queryFn: async () => {
      const response = await apiClient.get("/tasks/workload/validation-distribution");
      return response.data;
    },
  });
}

export function useCTRWorkloadDistribution() {
  return useQuery({
    queryKey: ["ctr-workload-distribution"],
    queryFn: async () => {
      const response = await apiClient.get("/tasks/workload/ctr-distribution");
      return response.data;
    },
  });
}

export function useEscalationMetrics() {
  return useQuery({
    queryKey: ["escalation-metrics"],
    queryFn: async () => {
      const response = await apiClient.get("/tasks/workload/escalation-metrics");
      return response.data;
    },
  });
}

export function useEntityPerformance() {
  return useQuery({
    queryKey: ["entity-performance"],
    queryFn: async () => {
      const response = await apiClient.get("/entities/performance");
      return response.data;
    },
  });
}
