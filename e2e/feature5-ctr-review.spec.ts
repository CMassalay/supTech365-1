import { expect, test } from "@playwright/test";

test.describe("Feature 5 CTR Review", () => {
  test("loads queue, opens detail, and submits ESCALATED decision", async ({ page }) => {
    const submissionId = "11111111-1111-1111-1111-111111111111";

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
          username: "head.compliance",
          email: "head.compliance@test.local",
          role: "HEAD_OF_COMPLIANCE",
          account_status: "ACTIVE",
          entity_id: null,
          entity_name: null,
          last_login: null,
          created_at: new Date().toISOString(),
        }),
      });
    });

    await page.route("**/api/v1/review/queue**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              submission_id: submissionId,
              reference_number: "FIA-CTR-0001",
              report_type: "CTR",
              entity_id: "22222222-2222-2222-2222-222222222222",
              submitted_at: "2026-02-01T10:30:00Z",
              entered_queue_at: "2026-02-01T10:35:00Z",
              manual_validation_status: "ACCEPTED",
              review_status: "NOT_REVIEWED",
              transaction_count: 2,
              total_amount: 125000,
            },
          ],
          total: 1,
          page: 1,
          page_size: 100,
          total_pages: 1,
        }),
      });
    });

    await page.route(`**/api/v1/review/reports/${submissionId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          report: {
            id: submissionId,
            reference_number: "FIA-CTR-0001",
            report_type: "CTR",
            entity_id: "22222222-2222-2222-2222-222222222222",
            submitted_at: "2026-02-01T10:30:00Z",
            manual_validation_status: "ACCEPTED",
            review_status: "NOT_REVIEWED",
            status: "SUBMITTED",
            alerts: [],
            transactions: [
              {
                id: "tx-1",
                transaction_date: "2026-01-30T00:00:00Z",
                transaction_amount: 70000,
                account_number: "ACC-001",
                subject_name: "John Doe",
              },
              {
                id: "tx-2",
                transaction_date: "2026-01-31T00:00:00Z",
                transaction_amount: 55000,
                account_number: "ACC-002",
                subject_name: "Jane Doe",
              },
            ],
          },
          validation_result: {
            validation_status: "PASSED",
            validated_at: "2026-02-01T10:31:00Z",
          },
          review_decision: null,
          entity: {
            id: "22222222-2222-2222-2222-222222222222",
            name: "Test Bank",
            entity_type: "Bank",
          },
        }),
      });
    });

    let decisionPayload: any = null;
    await page.route(`**/api/v1/review/reports/${submissionId}/decision`, async (route) => {
      decisionPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          submission_id: submissionId,
          reference_number: "FIA-CTR-0001",
          decision: "ESCALATED",
          decided_at: new Date().toISOString(),
          message: "Report review completed successfully",
        }),
      });
    });

    await page.goto("/compliance/ctr-review");
    await expect(page.getByText("FIA-CTR-0001")).toBeVisible();

    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.getByRole("heading", { name: /CTR FIA-CTR-0001/i })).toBeVisible();

    await page.getByLabel(/Flag for Escalation/i).click();
    await page.getByLabel(/Escalation Justification/i).fill("Pattern requires enhanced investigation.");
    await page.getByRole("button", { name: "Submit Decision" }).click();

    await expect(page).toHaveURL(/\/compliance\/ctr-review$/);
    expect(decisionPayload).toEqual({
      decision: "ESCALATED",
      escalation_reason: "Pattern requires enhanced investigation.",
    });
  });
});
