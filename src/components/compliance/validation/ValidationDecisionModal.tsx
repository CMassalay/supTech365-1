import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { validationDecisionSchema, type ValidationDecisionFormData } from "@/lib/validationSchema";
import type { ManualDecisionType } from "@/types/manualValidation";

interface ValidationDecisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenceNumber: string;
  reportType: "CTR" | "STR";
  decisionType: ManualDecisionType | null;
  isSubmitting?: boolean;
  onSubmit: (payload: {
    decision: ManualDecisionType;
    reason?: string;
    return_reason?: string;
    rejection_reason?: string;
  }) => void;
}

export function ValidationDecisionModal({
  open,
  onOpenChange,
  referenceNumber,
  reportType,
  decisionType,
  isSubmitting = false,
  onSubmit,
}: ValidationDecisionModalProps) {
  const form = useForm<ValidationDecisionFormData>({
    resolver: zodResolver(validationDecisionSchema),
    defaultValues: { decision: "RETURN", reason: "" },
  });

  useEffect(() => {
    if (decisionType) {
      form.reset({ decision: decisionType, reason: "" });
    }
  }, [decisionType, form]);

  if (!decisionType) return null;

  const titleByDecision: Record<ManualDecisionType, string> = {
    ACCEPT: "Accept Report",
    RETURN: "Return Report for Correction",
    REJECT: "Reject Report",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titleByDecision[decisionType]}</DialogTitle>
          <DialogDescription>
            Reference: {referenceNumber} | Report Type: {reportType}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              const payload: any = {
                decision: data.decision,
              };
              if (data.decision === "RETURN") {
                payload.return_reason = data.reason?.trim();
              } else if (data.decision === "REJECT") {
                payload.rejection_reason = data.reason?.trim();
              } else {
                payload.reason = data.reason?.trim();
              }
              onSubmit(payload);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for {decisionType === "RETURN" ? "Return" : "Reject"} *</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} placeholder="Please provide a clear reason..." />
                  </FormControl>
                  <FormDescription>Minimum 10 characters, maximum 2000 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Submitting..."
                  : decisionType === "RETURN"
                    ? "Confirm Return"
                    : "Confirm Reject"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
