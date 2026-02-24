export type ReportType = "CTR" | "STR";
export type DecisionType = "ACCEPT" | "RETURN" | "REJECT";

export interface QueueFilters {
  reportType?: ReportType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  assignedToMe?: boolean;
}

export interface QueueItem {
  submission_id: string;
  reference_number: string;
  report_type: ReportType;
  entity_name: string;
  submitted_at: string;
  entered_queue_at?: string;
  transaction_count?: number;
  total_amount?: number;
}

export interface QueueResponse {
  items: QueueItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Transaction {
  id: string | number;
  date: string;
  type: string;
  amount: number | string;
  name: string;
  details?: string;
}

export interface ReportContentResponse {
  submission_id: string;
  reference_number: string;
  report_type: ReportType;
  submission_method?: string;
  entity: { id: string; name: string; entity_type?: string };
  submitted_by: { id: string; username: string };
  submitted_at: string;
  metadata?: Record<string, unknown>;
  transactions: Transaction[];
  validation_status: string;
  automated_validation_passed_at?: string;
}

export interface SubmitDecisionRequest {
  decision: DecisionType;
  reason?: string;
}

export interface SubmitDecisionResponse {
  submission_id: string;
  reference_number: string;
  decision: DecisionType;
  decided_at: string;
  routed_to_queue?: string;
  message: string;
}

export interface AuditLogFilters {
  decision?: DecisionType;
  dateFrom?: string;
  dateTo?: string;
  decidedBy?: string;
  submissionReference?: string;
}

export interface AuditLogItem {
  id: string;
  submission_id: string;
  reference_number: string;
  decision: DecisionType;
  decided_by: string;
  decided_at: string;
  reason?: string;
}

export interface AuditLogResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
