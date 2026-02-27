export type ReportType = "CTR" | "STR";
export type DecisionType = "ACCEPT" | "RETURN" | "REJECT";
export type ManualDecisionType = "ACCEPT" | "RETURN" | "REJECT";

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
  due_at?: string;
  sla_status?: "ON_TRACK" | "NEARING_DUE" | "OVERDUE";
  transaction_count?: number;
  total_amount?: number;
  subject?: string;
  assigned_to?: string;
  age?: string;
  risk_level?: "high" | "medium" | "low";
  status?: string;
}

export interface QueueResponse {
  items: QueueItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TransactionResponse {
  id: string;
  transaction_date?: string;
  transaction_amount?: number;
  account_number?: string;
  subject_name?: string;
  subject_id_number?: string;
  raw_data?: any;
}

export interface EntityResponse {
  id: string;
  name: string;
  entity_code: string;
  entity_type: string;
}

export interface ReportContentResponse {
  id: string;
  reference_number: string;
  report_type: ReportType;
  status: string;
  submitted_at: string;
  entity?: EntityResponse;
  transactions: TransactionResponse[];
}

export interface ReportDetailsResponse {
  report: ReportContentResponse;
  validation_result?: any;
  decision?: any;
  entity?: EntityResponse;
}

export interface SubmitDecisionRequest {
  decision: ManualDecisionType;
  reason?: string;
  return_reason?: string;
  rejection_reason?: string;
  comments?: string;
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
