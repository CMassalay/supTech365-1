import type { QueueItem, ReportContentResponse } from "@/types/manualValidation";

export const mockQueueItems: QueueItem[] = [
  {
    submission_id: "uuid-1",
    reference_number: "FIA-2026-001234",
    report_type: "CTR",
    entity_name: "First Bank",
    submitted_at: "2026-02-03T10:30:00Z",
    entered_queue_at: "2026-02-03T10:31:00Z",
    transaction_count: 5,
    total_amount: 150000,
  },
  {
    submission_id: "uuid-2",
    reference_number: "FIA-2026-001235",
    report_type: "STR",
    entity_name: "Unity Corp",
    submitted_at: "2026-02-03T11:00:00Z",
    entered_queue_at: "2026-02-03T11:01:00Z",
    transaction_count: 1,
    total_amount: 50000,
  },
];

export const mockReportContent: ReportContentResponse = {
  submission_id: "uuid-1",
  reference_number: "FIA-2026-001234",
  report_type: "CTR",
  submission_method: "EXCEL",
  entity: { id: "ent-1", name: "First Bank", entity_type: "BANK" },
  submitted_by: { id: "user-1", username: "compliance_officer_1" },
  submitted_at: "2026-02-03T10:30:00Z",
  metadata: { reportingPeriod: "Jan 1-31, 2026" },
  transactions: [
    {
      id: "tx-1",
      date: "2026-01-15",
      type: "DEPOSIT",
      amount: 25000,
      name: "John Doe",
    },
  ],
  validation_status: "PENDING_MANUAL_VALIDATION",
  automated_validation_passed_at: "2026-02-03T10:31:00Z",
};
