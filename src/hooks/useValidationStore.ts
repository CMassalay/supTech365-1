import { create } from "zustand";
import type { AuditLogFilters, ManualDecisionType, QueueFilters } from "@/types/manualValidation";

interface ValidationStore {
  queueFilters: QueueFilters;
  setQueueFilters: (filters: Partial<QueueFilters>) => void;
  resetQueueFilters: () => void;

  auditLogFilters: AuditLogFilters;
  setAuditLogFilters: (filters: Partial<AuditLogFilters>) => void;
  resetAuditLogFilters: () => void;

  decisionModalOpen: boolean;
  selectedDecisionType: ManualDecisionType | null;
  openDecisionModal: (type: ManualDecisionType) => void;
  closeDecisionModal: () => void;

  selectedSubmissionId: string | null;
  setSelectedSubmission: (id: string | null) => void;
}

const initialQueueFilters: QueueFilters = {};
const initialAuditFilters: AuditLogFilters = {};

export const useValidationStore = create<ValidationStore>()((set) => ({
  queueFilters: initialQueueFilters,
  setQueueFilters: (filters) => set((state) => ({ queueFilters: { ...state.queueFilters, ...filters } })),
  resetQueueFilters: () => set({ queueFilters: initialQueueFilters }),

  auditLogFilters: initialAuditFilters,
  setAuditLogFilters: (filters) => set((state) => ({ auditLogFilters: { ...state.auditLogFilters, ...filters } })),
  resetAuditLogFilters: () => set({ auditLogFilters: initialAuditFilters }),

  decisionModalOpen: false,
  selectedDecisionType: null,
  openDecisionModal: (type) => set({ decisionModalOpen: true, selectedDecisionType: type }),
  closeDecisionModal: () => set({ decisionModalOpen: false, selectedDecisionType: null }),

  selectedSubmissionId: null,
  setSelectedSubmission: (id) => set({ selectedSubmissionId: id }),
}));
