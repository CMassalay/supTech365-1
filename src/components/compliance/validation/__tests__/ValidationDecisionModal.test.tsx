import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidationDecisionModal } from "../ValidationDecisionModal";

describe("ValidationDecisionModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Return for Correction with reason field", () => {
    render(
      <ValidationDecisionModal
        open={true}
        onOpenChange={mockOnOpenChange}
        referenceNumber="FIA-001"
        reportType="CTR"
        decisionType="RETURN"
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText("Return Report for Correction")).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason for Return/i)).toBeInTheDocument();
  });

  it("validates mandatory reason for Return decision", async () => {
    render(
      <ValidationDecisionModal
        open={true}
        onOpenChange={mockOnOpenChange}
        referenceNumber="FIA-001"
        reportType="CTR"
        decisionType="RETURN"
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole("button", { name: /confirm return/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Reason is mandatory/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates minimum length for reason", async () => {
    render(
      <ValidationDecisionModal
        open={true}
        onOpenChange={mockOnOpenChange}
        referenceNumber="FIA-001"
        reportType="CTR"
        decisionType="RETURN"
        onSubmit={mockOnSubmit}
      />
    );

    const textarea = screen.getByLabelText(/Reason for Return/i);
    fireEvent.change(textarea, { target: { value: "Short" } });

    const submitButton = screen.getByRole("button", { name: /confirm return/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Minimum 10 characters/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("submits the form with a valid reason", async () => {
    render(
      <ValidationDecisionModal
        open={true}
        onOpenChange={mockOnOpenChange}
        referenceNumber="FIA-001"
        reportType="CTR"
        decisionType="RETURN"
        onSubmit={mockOnSubmit}
      />
    );

    const textarea = screen.getByLabelText(/Reason for Return/i);
    fireEvent.change(textarea, { target: { value: "This is a valid reason with more than 10 characters." } });

    const submitButton = screen.getByRole("button", { name: /confirm return/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        decision: "RETURN",
        reason: "This is a valid reason with more than 10 characters.",
      });
    });
  });
});
