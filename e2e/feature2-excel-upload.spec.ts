import { expect, test } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

test.describe("Feature 2: Excel Report Submission Portal", () => {
  test("reporting entity user can upload STR Excel report successfully", async ({ page }) => {
    // Setup authentication for lcb_user (Liberia Commercial Bank user)
    await page.addInitScript(() => {
      localStorage.setItem("suptech_access_token", "e2e-token-lcb-user");
      localStorage.setItem("suptech_remember_me", "true");
    });

    // Mock the user profile API to return lcb_user details
    await page.route("**/api/v1/auth/user/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "lcb-user-id",
          username: "lcb_user",
          email: "aml@lcb.com.lr",
          role: "REPORTING_ENTITY_USER",
          account_status: "Active",
          entity_id: "lcb-entity-id",
          entity_name: "Liberia Commercial Bank",
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }),
      });
    });

    // Navigate to the application
    await page.goto("/");
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Navigate to Excel upload page (assuming it's under submissions or reports)
    await page.getByRole("link", { name: /excel|upload|submission/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify we're on the Excel upload page
    await expect(page.getByRole("heading", { name: /excel.*upload|upload.*excel|submit.*report/i })).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Download STR template
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /download.*template|template.*download/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("STR");
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Mock the Excel upload API endpoint
    let uploadPayload: any = null;
    await page.route("**/api/v1/submission/excel", async (route) => {
      if (route.request().method() === "POST") {
        // Capture the upload payload for verification
        const formData = await route.request().postData();
        uploadPayload = {
          method: "POST",
          hasFile: formData?.includes("file") || false,
          timestamp: new Date().toISOString()
        };

        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            status: "Accepted",
            reference: "REP-2026-999",
            entity_report_id: "STR-LCB-E2E-001",
            timestamp: new Date().toISOString(),
            message: "Report submitted successfully and is being processed"
          }),
        });
      }
    });

    // Create a simple Excel file for testing (in a real scenario, this would be a properly filled template)
    // For this test, we'll simulate file selection
    const testFilePath = join(process.cwd(), "test-files", "sample_str_report.xlsx");

    // If the file doesn't exist, we'll create a basic one for testing
    // In a real test, you would have pre-prepared Excel files with proper data

    // Click file upload button
    await page.locator('input[type="file"]').setInputFiles({
      name: "STR_Test_Report.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("Mock Excel Content") // In real test, use actual Excel file content
    });
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Select report type
    await page.getByLabel(/report.*type|type.*report/i).selectOption("STR");
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Enter entity reference (optional)
    await page.getByLabel(/entity.*reference|reference.*entity/i).fill("STR-E2E-TEST-001");
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Click upload button
    await page.getByRole("button", { name: /upload|submit|send/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify success message
    await expect(page.getByText(/success|submitted|accepted/i)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify reference number is displayed
    await expect(page.getByText(/REP-2026-999/)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Navigate to submission status/history page
    await page.getByRole("link", { name: /status|history|submissions/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify the submission appears in the list
    await expect(page.getByText("REP-2026-999")).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    await expect(page.getByText("STR")).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    await expect(page.getByText("Liberia Commercial Bank")).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify upload payload was captured
    expect(uploadPayload).not.toBeNull();
    expect(uploadPayload.hasFile).toBe(true);
  });

  test("reporting entity user can upload CTR Excel report successfully", async ({ page }) => {
    // Setup authentication for ecobank_user
    await page.addInitScript(() => {
      localStorage.setItem("suptech_access_token", "e2e-token-ecobank-user");
      localStorage.setItem("suptech_remember_me", "true");
    });

    // Mock the user profile API to return ecobank_user details
    await page.route("**/api/v1/auth/user/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "ecobank-user-id",
          username: "ecobank_user",
          email: "compliance@ecobank.lr",
          role: "REPORTING_ENTITY_USER",
          account_status: "Active",
          entity_id: "ecobank-entity-id",
          entity_name: "Ecobank Liberia",
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }),
      });
    });

    // Navigate to the application
    await page.goto("/");
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Navigate to Excel upload page
    await page.getByRole("link", { name: /excel|upload|submission/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Mock the Excel upload API endpoint for CTR
    await page.route("**/api/v1/submission/excel", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            status: "Accepted",
            reference: "REP-2026-998",
            entity_report_id: "CTR-ECB-E2E-001",
            timestamp: new Date().toISOString(),
            message: "CTR Report submitted successfully and is being processed"
          }),
        });
      }
    });

    // Click file upload button for CTR
    await page.locator('input[type="file"]').setInputFiles({
      name: "CTR_Test_Report.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("Mock CTR Excel Content")
    });
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Select CTR report type
    await page.getByLabel(/report.*type|type.*report/i).selectOption("CTR");
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Enter entity reference
    await page.getByLabel(/entity.*reference|reference.*entity/i).fill("CTR-E2E-TEST-001");
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Click upload button
    await page.getByRole("button", { name: /upload|submit|send/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify success message for CTR
    await expect(page.getByText(/success|submitted|accepted/i)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify CTR reference number
    await expect(page.getByText(/REP-2026-998/)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    await expect(page.getByText("CTR")).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested
  });

  test("duplicate submission prevention works correctly", async ({ page }) => {
    // Setup authentication for lcb_user
    await page.addInitScript(() => {
      localStorage.setItem("suptech_access_token", "e2e-token-lcb-user");
      localStorage.setItem("suptech_remember_me", "true");
    });

    // Mock the user profile API
    await page.route("**/api/v1/auth/user/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "lcb-user-id",
          username: "lcb_user",
          email: "aml@lcb.com.lr",
          role: "REPORTING_ENTITY_USER",
          account_status: "Active",
          entity_id: "lcb-entity-id",
          entity_name: "Liberia Commercial Bank",
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }),
      });
    });

    // Navigate to Excel upload page
    await page.goto("/");
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByRole("link", { name: /excel|upload|submission/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Mock duplicate detection - first upload succeeds
    let uploadCount = 0;
    await page.route("**/api/v1/submission/excel", async (route) => {
      if (route.request().method() === "POST") {
        uploadCount++;
        if (uploadCount === 1) {
          // First upload succeeds
          await route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({
              status: "Accepted",
              reference: "REP-2026-997",
              entity_report_id: "DUP-TEST-001",
              timestamp: new Date().toISOString(),
              message: "Report submitted successfully"
            }),
          });
        } else {
          // Second upload fails due to duplicate
          await route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              detail: "Duplicate submission detected. A report with this entity reference already exists."
            }),
          });
        }
      }
    });

    // First successful upload
    await page.locator('input[type="file"]').setInputFiles({
      name: "STR_Duplicate_Test.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("Mock Excel Content")
    });
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByLabel(/report.*type|type.*report/i).selectOption("STR");
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByLabel(/entity.*reference|reference.*entity/i).fill("DUPLICATE-TEST-001");
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByRole("button", { name: /upload|submit|send/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    await expect(page.getByText(/REP-2026-997/)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Attempt duplicate upload with same entity reference
    await page.locator('input[type="file"]').setInputFiles({
      name: "STR_Duplicate_Test_2.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("Mock Excel Content 2")
    });
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByLabel(/report.*type|type.*report/i).selectOption("STR");
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByLabel(/entity.*reference|reference.*entity/i).fill("DUPLICATE-TEST-001"); // Same reference
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByRole("button", { name: /upload|submit|send/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify duplicate error message
    await expect(page.getByText(/duplicate|already.*exists/i)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested
  });

  test("invalid Excel file is rejected with proper error messages", async ({ page }) => {
    // Setup authentication
    await page.addInitScript(() => {
      localStorage.setItem("suptech_access_token", "e2e-token-lcb-user");
      localStorage.setItem("suptech_remember_me", "true");
    });

    // Mock the user profile API
    await page.route("**/api/v1/auth/user/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "lcb-user-id",
          username: "lcb_user",
          email: "aml@lcb.com.lr",
          role: "REPORTING_ENTITY_USER",
          account_status: "Active",
          entity_id: "lcb-entity-id",
          entity_name: "Liberia Commercial Bank",
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }),
      });
    });

    // Navigate to Excel upload page
    await page.goto("/");
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByRole("link", { name: /excel|upload|submission/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Mock validation error response
    await page.route("**/api/v1/submission/excel", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            detail: "Schema validation failed: Missing required column: TransactionDate; Missing required column: TransactionAmount; Invalid data format in row 2"
          }),
        });
      }
    });

    // Upload invalid Excel file
    await page.locator('input[type="file"]').setInputFiles({
      name: "Invalid_Report.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("Invalid Excel Content")
    });
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByLabel(/report.*type|type.*report/i).selectOption("STR");
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByRole("button", { name: /upload|submit|send/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify validation error messages
    await expect(page.getByText(/validation.*failed|missing.*column|invalid.*data/i)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    await expect(page.getByText(/TransactionDate|TransactionAmount|row.*2/i)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested
  });

  test("submission status tracking works correctly", async ({ page }) => {
    // Setup authentication
    await page.addInitScript(() => {
      localStorage.setItem("suptech_access_token", "e2e-token-lcb-user");
      localStorage.setItem("suptech_remember_me", "true");
    });

    // Mock the user profile API
    await page.route("**/api/v1/auth/user/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "lcb-user-id",
          username: "lcb_user",
          email: "aml@lcb.com.lr",
          role: "REPORTING_ENTITY_USER",
          account_status: "Active",
          entity_id: "lcb-entity-id",
          entity_name: "Liberia Commercial Bank",
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }),
      });
    });

    // Navigate to submissions page
    await page.goto("/");
    await page.waitForTimeout(2000); // 2-second pause as requested

    await page.getByRole("link", { name: /status|history|submissions/i }).click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Mock submissions list API
    await page.route("**/api/v1/submission/**", async (route) => {
      if (route.request().url().includes("/api/v1/submission/") && !route.request().url().includes("/status")) {
        // List submissions
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            submissions: [
              {
                reference: "REP-2026-996",
                status: "validated",
                report_type: "STR",
                submitted_at: "2026-02-25T10:30:00Z",
                entity_report_id: "STR-LCB-001"
              },
              {
                reference: "REP-2026-995",
                status: "under_review",
                report_type: "CTR",
                submitted_at: "2026-02-24T14:15:00Z",
                entity_report_id: "CTR-LCB-001"
              }
            ],
            total: 2,
            page: 1,
            limit: 20,
            total_pages: 1,
            has_more: false
          }),
        });
      } else if (route.request().url().includes("/status")) {
        // Individual submission status
        const reference = route.request().url().split("/").pop();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            reference: reference,
            status: "validated",
            report_type: "STR",
            submitted_at: "2026-02-25T10:30:00Z",
            last_updated_at: "2026-02-25T11:45:00Z",
            entity_report_id: "STR-LCB-001",
            notes: "Report validated successfully"
          }),
        });
      }
    });

    // Verify submissions are displayed
    await expect(page.getByText("REP-2026-996")).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    await expect(page.getByText("validated")).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    await expect(page.getByText("STR")).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Click on a submission to view details
    await page.getByText("REP-2026-996").click();
    await page.waitForTimeout(2000); // 2-second pause as requested

    // Verify detailed status view
    await expect(page.getByText(/validated.*successfully/i)).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested

    await expect(page.getByText("STR-LCB-001")).toBeVisible();
    await page.waitForTimeout(2000); // 2-second pause as requested
  });
});