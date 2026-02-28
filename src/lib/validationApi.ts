import { apiClient } from "./api-client";

export interface ValidationError {
  field: string;
  message: string;
  row?: string;
}

export interface ValidationResult {
  submission_id: string;
  reference_number: string;
  report_type: string;
  submitted_at: string;
  validation_status: string;
  error_count: number;
  errors: ValidationError[];
}

export const validationApi = {
  getValidationResult: async (submissionId: string): Promise<ValidationResult> => {
    const response = await apiClient.get<ValidationResult>(`/api/v1/validation/${submissionId}`);
    return response.data;
  },

  getValidationErrors: async (submissionId: string): Promise<ValidationError[]> => {
    const response = await apiClient.get<{ errors: ValidationError[] }>(`/api/v1/validation/${submissionId}/errors`);
    return response.data.errors;
  }
};
