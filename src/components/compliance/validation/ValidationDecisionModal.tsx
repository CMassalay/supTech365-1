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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { DecisionType } from "@/types/manualValidation";

interface ValidationDecisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenceNumber: string;
  reportType: "CTR" | "STR";
  decisionType: DecisionType | null;
  isSubmitting?: boolean;
  onSubmit: (payload: { decision: DecisionType; reason?: string }) => void;
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
    defaultValues: { decision: "ACCEPT", reason: "" },
  });

  useEffect(() => {
    if (decisionType) {
      form.reset({ decision: decisionType, reason: "" });
    }
  }, [decisionType, form]);

  if (!decisionType) return null;

  const requiresReason = decisionType === "RETURN" || decisionType === "REJECT";

  const titleByDecision: Record<DecisionType, string> = {
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
            onSubmit={form.handleSubmit((data) =>
              onSubmit({
                decision: data.decision,
                reason: data.reason?.trim() || undefined,
              })
            )}
            className="space-y-4"
          >
            {!requiresReason && (
              <Alert>
                <AlertDescription>
                  This report will be accepted and routed to the next queue.
                </AlertDescription>
              </Alert>
            )}

            {requiresReason && (
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
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Submitting..."
                  : decisionType === "ACCEPT"
                    ? "Confirm Accept"
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
