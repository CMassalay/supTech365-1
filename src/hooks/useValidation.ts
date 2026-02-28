import { useQuery } from "@tanstack/react-query";
import { validationApi } from "@/lib/validationApi";

export function useValidationResult(submissionId: string) {
  return useQuery({
    queryKey: ["validationResult", submissionId],
    queryFn: () => validationApi.getValidationResult(submissionId),
    enabled: !!submissionId,
  });
}

export function useValidationErrors(submissionId: string) {
  return useQuery({
    queryKey: ["validationErrors", submissionId],
    queryFn: () => validationApi.getValidationErrors(submissionId),
    enabled: !!submissionId,
  });
}
