import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Rule {
  uuid: string;
  name: string;
  description?: string;
  domain: string;
  risk_level: string;
  is_active: boolean;
  alert_count: number;
}

export interface Alert {
  uuid: string;
  report_reference: string;
  report_type: string;
  entity_name: string;
  risk_level: string;
  disposition: string;
  generated_at: string;
  rule_name: string;
}

export function useAlertRules() {
  return useQuery({
    queryKey: ["alertRules"],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Rule[] }>("/rules");
      return response.data.items;
    },
  });
}

export function useAlerts(filters: { domain?: string; risk_level?: string; disposition?: string } = {}) {
  return useQuery({
    queryKey: ["alerts", filters],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Alert[] }>("/rules/alert");
      return response.data.items;
    },
  });
}
