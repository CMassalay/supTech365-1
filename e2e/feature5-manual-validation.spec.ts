import { expect, test } from "@playwright/test";

test.describe("Feature 5 manual validation", () => {
  test("compliance officer can open assigned queue item and submit RETURN decision", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("suptech_access_token", "e2e-token");
      localStorage.setItem("suptech_remember_me", "true");
    });

    await page.route("**/api/v1/auth/user/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-1",
          username: "compliance.e2e",
          email: "compliance.e2e@test.local",
          role: "COMPLIANCE_OFFICER",
          account_status: "ACTIVE",
          entity_id: null,
          entity_name: null,
          last_login: null,
          created_at: new Date().toISOString(),
        }),
      });
    });

    await page.route("**/api/v1/validation/manual-validation/queue**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              submission_id: "sub-1",
              reference_number: "FIA-2026-0001",
              report_type: "CTR",
              entity_name: "First Bank",
              submitted_at: "2026-02-03T10:30:00Z",
              entered_queue_at: "2026-02-03T10:31:00Z",
              transaction_count: 2,
              total_amount: 150000,
            },
          ],
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        }),
      });
    });

    await page.route("**/api/v1/validation/manual-validation/reports/sub-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          submission_id: "sub-1",
          reference_number: "FIA-2026-0001",
          report_type: "CTR",
          entity: { id: "ent-1", name: "First Bank", entity_type: "BANK" },
          submitted_by: { id: "user-x", username: "reporter.one" },
          submitted_at: "2026-02-03T10:30:00Z",
          metadata: { reportingPeriod: "2026-01" },
          transactions: [
            { id: 1, date: "2026-01-10", type: "Deposit", amount: 60000, name: "John Doe", details: "Cash deposit" },
            { id: 2, date: "2026-01-11", type: "Deposit", amount: 90000, name: "Jane Doe", details: "Counter deposit" },
          ],
          validation_status: "PENDING",
          automated_validation_passed_at: "2026-02-03T10:31:00Z",
        }),
      });
    });

    let decisionPayload: { decision?: string; reason?: string; return_reason?: string } | null = null;
    await page.route("**/api/v1/validation/manual-validation/reports/sub-1/decision", async (route) => {
      const payload = route.request().postDataJSON() as {
        decision?: string;
        reason?: string;
        return_reason?: string;
      };
      decisionPayload = payload;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          submission_id: "sub-1",
          reference_number: "FIA-2026-0001",
          decision: "RETURN",
          decided_at: new Date().toISOString(),
          message: "Report returned successfully",
        }),
      });
    });

    await page.goto("/compliance/validation-queue");

    await expect(page.getByRole("heading", { name: /My Assigned Validations/i })).toBeVisible();
    await expect(page.getByText("First Bank")).toBeVisible();
    await page.waitForTimeout(1000); // Slow down for visibility

    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.getByRole("heading", { name: /Report Review:/i })).toBeVisible();
    await page.waitForTimeout(1000); // Slow down for visibility

    await page.getByRole("button", { name: "Return for Correction" }).click();
    await page.waitForTimeout(500); // Slow down for visibility
    await page.getByLabel(/Reason for Return/i).fill("Missing beneficiary details in the submitted rows.");
    await page.waitForTimeout(1000); // Slow down for visibility
    await page.getByRole("button", { name: "Confirm Return" }).click();

    await expect(page).toHaveURL(/\/compliance\/validation-queue$/);
    await page.waitForTimeout(1000); // Slow down for visibility
    expect(decisionPayload).not.toBeNull();
    expect(decisionPayload).toMatchObject({
      decision: "RETURN",
    });
    expect(
      decisionPayload?.return_reason ?? decisionPayload?.reason
    ).toBe("Missing beneficiary details in the submitted rows.");
  });
});
