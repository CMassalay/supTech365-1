import { z } from "zod";

export const validationDecisionSchema = z
  .object({
    decision: z.enum(["ACCEPT", "RETURN", "REJECT"]),
    reason: z.string().trim().max(2000, "Reason cannot exceed 2000 characters").optional(),
  })
  .superRefine((value, ctx) => {
    if ((value.decision === "RETURN" || value.decision === "REJECT") && (!value.reason || value.reason.length < 10)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Reason is mandatory for Return/Reject decisions",
        path: ["reason"],
      });
    }
  });

export type ValidationDecisionFormData = z.infer<typeof validationDecisionSchema>;
