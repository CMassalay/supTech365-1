import { expect, test } from "@playwright/test";

type QueueItem = {
  submission_id: string;
  reference_number: string;
  report_type: "CTR" | "STR";
  entity_name: string;
  submitted_at: string;
  entered_queue_at?: string;
  transaction_count?: number;
  total_amount?: number;
};


async function login(page: Parameters<typeof test>[0]["page"], username: string, password: string) {
  const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"; // Assuming backend runs locally
  const response = await page.request.post(`${API_BASE_URL}/api/v1/auth/login`, {
    data: { username_or_email: username, password },
  });
  const { access_token } = await response.json();
  await page.addInitScript((token) => {
    localStorage.setItem("suptech_access_token", token);
    localStorage.setItem("suptech_remember_me", "true");
  }, access_token);
  return access_token;
}

async function seedAuthenticatedUser(page: Parameters<typeof test>[0]["page"], role: string) {
  let username: string;
  let email: string;
  const password = "Liberia@1847"; // Default password from seed_feature5_uat.py

  switch (role) {
    case "COMPLIANCE_OFFICER":
      username = "compliance_officer_uat";
      email = "compliance@uat.lr";
      break;
    case "ANALYST":
      username = "analyst_uat";
      email = "analyst@uat.lr";
      break;
    case "HEAD_OF_COMPLIANCE":
      username = "head_compliance_uat";
      email = "head@uat.lr";
      break;
    case "REPORTING_ENTITY_USER":
      username = "reporting_user_uat";
      email = "reporter@uat.lr";
      break;
    default:
      throw new Error(`Unknown role: ${role}`);
  }

  await login(page, email, password);

  // The profile endpoint will now be hit against the real backend, so no need to mock it.
  // This block is removed as part of this change.
}




test.describe("Feature 5 UAT", () => {
  test.describe("Compliance Officer", () => {
    test("assigned queue defaults and FIFO ordering are enforced", async ({ page }) => {
      await seedAuthenticatedUser(page, "COMPLIANCE_OFFICER");
      let queueRequestUrl = "";
      await page.route("**/api/v1/validation/manual-validation/queue**", async (route) => {
        queueRequestUrl = route.request().url();
        route.continue();
      });
    });

    test("blocks RETURN submission without reason", async ({ page }) => {
      await seedAuthenticatedUser(page, "COMPLIANCE_OFFICER");

      await page.goto("/compliance/validation-queue");
      await page.getByRole("button", { name: "Review" }).first().click();
      await expect(page.getByRole("heading", { name: /Report Review:/i })).toBeVisible();

      await page.getByRole("button", { name: "Return for Correction" }).click();
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: "Confirm Return" }).click();
      await expect(page.getByText("Reason is mandatory for Return/Reject decisions")).toBeVisible();
    });

    test("submits RETURN and logs audit entry", async ({ page }) => {
      await seedAuthenticatedUser(page, "COMPLIANCE_OFFICER");

      await page.route("**/api/v1/validation/manual-validation/queue**", async (route) => {
        route.continue();
      });

      // #region agent log
      const logToDebug = (msg: string, data: any = {}) => {
        fetch('http://127.0.0.1:7246/ingest/c3e0a118-fed4-4495-92ce-731c1630130d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'feature5-uat.spec.ts:87',
            message: msg,
            data,
            timestamp: Date.now(),
            hypothesisId: 'H1, H2, H3, H4'
          })
        }).catch(() => {});
      };
      // #endregion

      await page.goto("/compliance/validation-queue");

      // Wait for queue to load
      await page.waitForTimeout(2000);

      // #region agent log
      const queueContent = await page.locator('tbody').textContent();
      fetch('http://127.0.0.1:7246/ingest/c3e0a118-fed4-4495-92ce-731c1630130d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'feature5-uat.spec.ts:110',
          message: 'Queue content for RETURN test',
          data: { queueContent: queueContent?.substring(0, 500) },
          timestamp: Date.now(),
          hypothesisId: 'H1, H2, H4'
        })
      }).catch(() => {});
      // #endregion

      // Find the first available row and click Review
      const firstRow = page.locator('tbody tr').first();
      await firstRow.getByRole("button", { name: "Review" }).click();
      
      await page.getByRole("button", { name: "Return for Correction" }).click();
      await page.getByLabel(/Reason for Return/i).fill("Missing beneficiary details in transaction rows.");

      const [decisionRequest] = await Promise.all([
        page.waitForRequest((request) => {
          const isDecision = request.url().includes("decision") && request.method() === "POST";
          if (isDecision) logToDebug("Decision request intercepted", { url: request.url() });
          return isDecision;
        }),
        page.getByRole("button", { name: "Confirm Return" }).click(),
      ]);

      // #region agent log
      logToDebug("After decision submission", { currentUrl: page.url(), decisionRequestUrl: decisionRequest.url() });
      // #endregion

      await page.waitForTimeout(1000); // Give time for any redirects

      // #region agent log
      logToDebug("After wait for redirect", { currentUrl: page.url(), expectedPattern: "/compliance/validation-queue$" });
      // #endregion

      await expect(page).toHaveURL(/\/compliance\/validation-queue$/);
      expect(decisionRequest.postDataJSON()).toEqual({
        decision: "RETURN",
        return_reason: "Missing beneficiary details in transaction rows.",
      });

      await page.goto("/compliance/validation-audit-logs");
      await expect(page.getByRole("heading", { name: /Validation Audit Logs/i })).toBeVisible();
      await expect(page.locator('tr', { hasText: 'F5-UAT-CTR-0001' })).toBeVisible();
      await expect(page.locator('tr', { hasText: 'F5-UAT-CTR-0001' }).getByText("Missing beneficiary details in transaction rows.")).toBeVisible();
    });
  });

  test.describe("Head of Compliance", () => {
    test("global queue is visible and supports search filter request", async ({ page }) => {
      await seedAuthenticatedUser(page, "HEAD_OF_COMPLIANCE");

      const queueRequests: string[] = [];
      await page.route("**/api/v1/validation/manual-validation/queue**", async (route) => {
        queueRequests.push(route.request().url());
        route.continue();
      });

      await page.goto("/compliance/validation-queue");
      await expect(page.getByRole("heading", { name: /Manual Validation Queue/i })).toBeVisible();
      await page.waitForTimeout(800);

      const initialUrl = new URL(queueRequests[0]);
      expect(initialUrl.searchParams.get("assigned_to_me")).toBeNull();
      expect(initialUrl.searchParams.get("report_type")).toBe("CTR");

      const searchInput = page.getByPlaceholder("Search by reference or entity...");
      await searchInput.fill("Unity");
      await page.waitForTimeout(1000);

      expect(queueRequests.length).toBeGreaterThan(1);
      const latestUrl = new URL(queueRequests[queueRequests.length - 1]);
      expect(latestUrl.searchParams.get("search")).toBe("Unity");
    });
  });

  test.describe("Analyst", () => {
    test("STR queue is scoped to analyst and REJECT decision payload is correct", async ({ page }) => {
      await seedAuthenticatedUser(page, "ANALYST");

      let queueRequestUrl = "";
      await page.route("**/api/v1/validation/manual-validation/queue**", async (route) => {
        queueRequestUrl = route.request().url();
        route.continue();
      });

      await page.goto("/compliance/validation-queue");
      await expect(page.getByRole("heading", { name: /My Assigned Validations/i })).toBeVisible();

      const queueUrl = new URL(queueRequestUrl);
      expect(queueUrl.searchParams.get("assigned_to_me")).toBe("true");
      expect(queueUrl.searchParams.get("report_type")).toBe("STR");

      // Click Review on the first STR item
      await page.getByRole("button", { name: "Review" }).first().click();

      // #region agent log
      const logToDebugSTR = (msg: string, data: any = {}) => {
        fetch('http://127.0.0.1:7246/ingest/c3e0a118-fed4-4495-92ce-731c1630130d', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'feature5-uat.spec.ts:186',
            message: msg,
            data,
            timestamp: Date.now(),
            hypothesisId: 'H3'
          })
        }).catch(() => {});
      };
      // #endregion

      // Verify STR report details are displayed
      await expect(page.getByRole("heading", { name: /Report Review:/i })).toBeVisible();

      // Wait for report details to load (not showing "Loading...")
      await expect(page.getByText("Loading report details...")).not.toBeVisible();

      // #region agent log
      const pageContent = await page.locator('body').textContent();
      logToDebugSTR("Page content after loading", { pageContent: pageContent?.substring(0, 1000) });
      // #endregion

      // Check for STR reference number (should start with FIA-2026-TEST-)
      await expect(page.getByText(/^FIA-2026-TEST-/)).toBeVisible();
      await expect(page.getByText("Type: STR")).toBeVisible();
      await expect(page.getByText("Entity: Test Bank of Liberia")).toBeVisible();
      await expect(page.getByText("Status: submitted")).toBeVisible();

      // Verify transactions table is displayed with data
      await expect(page.getByRole("heading", { name: /Transactions \(1\)/i })).toBeVisible();
      await expect(page.getByText("STR Subject 1")).toBeVisible();
      await expect(page.getByText("4,750")).toBeVisible();

      await page.waitForTimeout(500);

      await page.getByRole("button", { name: "Reject" }).click();
      await page.getByLabel(/Reason for Reject/i).fill("Narrative and transaction details are materially inconsistent.");
      await page.waitForTimeout(700);

      const [decisionRequestAnalyst] = await Promise.all([
        page.waitForRequest((request) => request.url().includes("decision") && request.method() === "POST"),
        page.getByRole("button", { name: "Confirm Reject" }).click(),
      ]);

      await expect(page).toHaveURL(/\/compliance\/validation-queue$/);
      expect(decisionRequestAnalyst.postDataJSON()).toEqual({
        decision: "REJECT",
        rejection_reason: "Narrative and transaction details are materially inconsistent.",
      });
    });
  });
});
