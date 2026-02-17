# Section 2: Detailed Workspace Navigation Maps

## 2.1 Reporting Entity Workspace

Target Users: Reporting Entity User (banks, MFIs, FinTech, etc.)

📊 Reporting Entity Workspace
│

├── 📤 Submit Report

│   ├── Upload Excel (Fallback)

│   ├── API Integration Status

│   └── Download Templates

│       ├── STR Template

│       └── CTR Template

│

├── 📋 My Submissions

│   ├── All Submissions (default view)

│   ├── Filter by Status

│   │   ├── Submitted

│   │   ├── Validated

│   │   ├── Rejected

│   │   ├── Returned for Correction

│   │   └── Under Review

│   ├── Filter by Report Type

│   │   ├── STR

│   │   └── CTR

│   └── Search (by reference number, date range)

│

├── 🔄 Resubmissions

│   └── Returned reports requiring correction

│

├── 📊 Submission Statistics

│   ├── Total submissions (current month/quarter)

│   ├── Acceptance rate

│   └── Average validation time

│

└── 🔑 API Credentials

    ├── View Credentials (masked key, status, dates)

    └── Regenerate Key (with re-authentication)

Navigation Behavior: Default landing: "My Submissions" list view Submission count badges on "Resubmissions" (if any pending) Quick submit button always visible in top-right header API Credentials page shows "No credentials issued" empty state if no credentials exist Breadcrumb Examples: Reporting Entity Workspace > Submit Report Reporting Entity Workspace > My Submissions > FIA-2026-0123 Reporting Entity Workspace > My Submissions > FIA-2026-0123 > Resubmit Reporting Entity Workspace > API Credentials

## 2.2 Compliance Workspace

Target Users: Compliance Officer, Head of Compliance

⚖️ Compliance Workspace
│

├── 📥 Validation Queue

│   ├── Pending Manual Validation (default for Compliance Officer)

│   ├── My Assigned Validations

│   └── All Validations (Head of Compliance only)

│

├── 📋 CTR Review Queue

│   ├── My Assigned CTRs (Compliance Officer)

│   ├── All CTRs (Head of Compliance)

│   ├── Filter by Status

│   │   ├── Pending Review

│   │   ├── Flagged for Escalation

│   │   ├── Escalated

│   │   ├── Archived

│   │   └── Under Monitoring

│   └── Overdue CTRs (>10 days)

│

├── 🚩 Escalation Queue (Head of Compliance only)

│   ├── Pending Approval

│   ├── Approved Escalations

│   └── Rejected Escalations

│

├── 👥 Workload Management (Head of Compliance only)

│   ├── Assign/Reassign CTRs

│   └── Team Workload Dashboard

│

├── 🚨 Compliance Alerts

│   ├── Active Alerts (High/Critical priority)

│   ├── Alert by Rule Type

│   └── Alert Performance Metrics

│

└── 📊 Compliance Dashboards

    ├── CTR Processing Metrics

    ├── Escalation Rate Trends

    ├── Validation Quality Metrics

    └── Reporting Entity Performance

Navigation Behavior: Compliance Officer: Default landing = "My Assigned Validations" (if pending) OR "My Assigned CTRs" Head of Compliance: Default landing = "Workload Management" dashboard Badge notifications: Overdue items count (red badge) Pending escalation approvals (amber badge) Active high/critical alerts (red badge) Breadcrumb Examples: Compliance Workspace > Validation Queue > FIA-2026-0123 > Validate Compliance Workspace > CTR Review > FIA-2026-0156 > Review Compliance Workspace > Escalation Queue > FIA-2026-0178 > Approve Escalation

## 2.3 Analysis Workspace

Target Users: Analyst, Head of Analysis

🔍 Analysis Workspace
│

├── 📥 Analysis Queue

│   ├── My Assigned Reports (Analyst default)

│   │   ├── STRs

│   │   ├── Escalated CTRs

│   │   └── Mixed view (default)

│   ├── All Reports (Head of Analysis)

│   ├── Filter by Report Type

│   │   ├── STR only

│   │   ├── Escalated CTR only

│   │   └── Both (default)

│   ├── Filter by Status

│   │   ├── Analyze (in progress)

│   │   ├── Pending Approval

│   │   ├── Approved

│   │   └── Returned for revision

│   └── Overdue Reports (>7 days in Analyze)

│

├── 📂 My Cases (Analyst)

│   ├── Open Cases

│   ├── Cases Pending Approval

│   ├── Approved Cases

│   └── Closed Cases

│

├── 👥 Workload Management (Head of Analysis only)

│   ├── Assign/Reassign Reports

│   ├── Case Assignment

│   └── Team Performance Dashboard

│

├── 🔍 Subject Profiles

│   ├── Search Subjects

│   ├── High-Frequency Subjects (3+ reports in 6mo)

│   ├── PEP Subjects

│   └── Recently Updated Profiles

│

├── 🚨 Analysis Alerts

│   ├── Active Alerts (STR + Escalated CTR)

│   ├── Alert by Risk Level

│   │   ├── Critical

│   │   ├── High

│   │   ├── Medium

│   │   └── Low

│   └── Alert Performance Metrics

│

└── 📊 Analysis Dashboards

    ├── STR vs Escalated CTR Volumes

    ├── Case Opening Rate Trends

    ├── Analysis Processing Time

    └── Intelligence Production Metrics

Navigation Behavior: Analyst: Default landing = "My Assigned Reports" (sorted by priority: Critical alerts → High alerts → oldest first) Head of Analysis: Default landing = "Workload Management" dashboard Badge notifications: Overdue reports (red badge) Pending case approvals (amber badge) Critical/high alerts (red badge) New escalated CTRs (blue badge) Breadcrumb Examples: Analysis Workspace > My Assigned Reports > FIA-2026-0234 (STR) > Analyze Analysis Workspace > My Assigned Reports > FIA-2026-0189 (Escalated CTR) > Analyze Analysis Workspace > My Cases > CASE-2026-0045 > Intelligence Draft Analysis Workspace > Subject Profiles > John Mensah > View Profile

## 2.4 Case & Intelligence Workspace

Target Users: Analyst (case owner), Head of Analysis, Director Ops, OIC

📁 Case & Intelligence
│

├── 📂 Case Management

│   ├── All Cases (filtered by role)

│   │   ├── My Cases (Analyst)

│   │   ├── All Active Cases (Head of Analysis, Director Ops)

│   │   └── All Cases (OIC)

│   ├── Filter by Status

│   │   ├── Open

│   │   ├── Under Investigation

│   │   ├── Pending Intelligence Approval

│   │   ├── Pending Dissemination (OIC only)

│   │   ├── Disseminated

│   │   └── Closed

│   ├── Filter by Age

│   │   ├── 0-30 days

│   │   ├── 31-60 days

│   │   └── >60 days (overdue)

│   └── Search Cases

│

├── 📝 Intelligence Production

│   ├── Draft Intelligence Reports (Analyst)

│   ├── Pending Approval (Head of Analysis)

│   ├── Approved for Dissemination (OIC queue)

│   └── Intelligence Templates

│       ├── Tactical Intelligence Report

│       ├── Strategic Assessment

│       ├── Subject Profile

│       └── Typology Analysis

│

├── 📤 Dissemination (OIC only)

│   ├── Pending Dissemination

│   ├── Disseminated Intelligence

│   │   ├── By recipient (LEA, CBL, etc.)

│   │   ├── By date

│   │   └── By case type

│   ├── Dissemination Log

│   └── Recipient Feedback Tracking

│

└── 📊 Case Metrics

    ├── Case Opening Rate

    ├── Case Resolution Time

    ├── Intelligence Production Volume

    └── Dissemination Statistics

Navigation Behavior: Analyst: Default landing = "My Cases" → "Open" status Head of Analysis: Default landing = "Pending Approval" (if any) OR "All Active Cases" OIC: Default landing = "Pending Dissemination" (if any) OR "Disseminated Intelligence" Badge notifications: Pending approvals (Head of Analysis, amber) Pending dissemination (OIC, red) Overdue cases >30 days (red) Breadcrumb Examples: Case & Intelligence > Case Management > CASE-2026-0045 > Case Details Case & Intelligence > Intelligence Production > CASE-2026-0045 > Draft Tactical Report Case & Intelligence > Dissemination > DISS-2026-0012 > Disseminate to LEA

## 2.5 Rules Management Workspace

Target Users: Head of Compliance (Compliance rules), Head of Analysis (Analysis rules)

⚙️ Rules Management
│

├── 📋 Compliance Rules (Head of Compliance only)

│   ├── Active Rules

│   ├── Inactive Rules

│   ├── Create New Rule

│   ├── Pre-Configured Rules (10 baseline)

│   └── Rule Performance Metrics

│       ├── Alert volume by rule

│       ├── True positive rate

│       └── False positive rate

│

├── 📋 Analysis Rules (Head of Analysis only)

│   ├── Active Rules

│   ├── Inactive Rules

│   ├── Create New Rule

│   ├── Pre-Configured Rules

│   └── Rule Performance Metrics

│

├── 🔍 Rule Testing Sandbox

│   ├── Test rule against historical data

│   └── Preview alert volume

│

└── 📊 Combined Rule Performance (Both heads can view, and Director Ops)

    ├── Alert distribution (Compliance vs Analysis)

    ├── Escalation correlation with alerts

    └── Case opening correlation with alerts

Navigation Behavior: Head of Compliance: Can ONLY access "Compliance Rules" section Head of Analysis: Can ONLY access "Analysis Rules" section Both: Can view "Combined Rule Performance" (read-only) Domain separation enforced per PRD AC-6.4, Test Case 6.8 Attempting to access other domain → 403 error: "You do not have permission to manage [Compliance/Analysis] rules. Contact [Head of Compliance/Analysis]." Breadcrumb Examples: Rules Management > Compliance Rules > Active Rules Rules Management > Compliance Rules > Edit Rule: "Structuring Pattern Detection" Rules Management > Analysis Rules > Create New Rule

## 2.6 Audit & Oversight Workspace

Target Users: Director Ops, OIC, Head of Compliance, Head of Analysis

🔍 Audit & Oversight
│

├── 📜 Audit Logs

│   ├── Search Audit Events

│   │   ├── By object (Report, Case, Intelligence, Dissemination)

│   │   ├── By actor (User)

│   │   ├── By action type (StageTransition, Decision, Export, etc.)

│   │   ├── By date range

│   │   └── By break-glass sessions

│   ├── Report Lifecycle Audit Trail

│   │   └── Complete history: Submission → Dissemination

│   ├── Case Audit Trail

│   ├── Dissemination Audit Trail (OIC only)

│   └── Export Audit Trail

│       ├── Data exports

│       ├── Report exports

│       └── Intelligence exports

│

├── 🔐 Break-Glass Access Logs (OIC only)

│   ├── Active Sessions

│   ├── Past Sessions

│   ├── Pending Requests (for approval)

│   └── Access Justifications

│

├── 📊 System Performance Metrics

│   ├── Processing Time Trends

│   │   ├── Submission → Validation (target: 10s)

│   │   ├── Validation → Compliance Review (CTR)

│   │   ├── Validation → Analysis (STR)

│   │   └── Submission → Dissemination (target: 18 days)

│   ├── Workload Distribution

│   │   ├── Compliance Officers

│   │   ├── Analysts

│   │   └── Bottleneck identification

│   ├── System Health

│   │   ├── Uptime (target: 99%)

│   │   ├── API response times

│   │   └── Database performance

│   └── User Activity Metrics

│

├── 📈 Executive Dashboards

│   ├── Director Ops Dashboard

│   │   ├── Compliance + Analysis unified view

│   │   ├── Escalation flow visualization

│   │   ├── Bottleneck alerts

│   │   └── Resource allocation recommendations

│   ├── OIC Dashboard

│   │   ├── Pending dissemination queue

│   │   ├── Intelligence production summary

│   │   ├── Law enforcement feedback tracking

│   │   └── Strategic intelligence gaps

│   └── Compliance Reports (FATF, CBL)

│       ├── Monthly statistical reports

│       ├── Quarterly compliance reports

│       └── Annual typology analysis

│

└── 🚨 System Alerts

    ├── Overdue reports (>18 day target)

    ├── Stale cases (>30 days)

    ├── Security events

    └── Data quality issues

Navigation Behavior: Director Ops: Default landing = "Executive Dashboards" → "Director Ops Dashboard" OIC: Default landing = "Executive Dashboards" → "OIC Dashboard" Head of Compliance/Analysis: Default landing = "System Performance Metrics" (filtered to their domain) Badge notifications: Break-glass pending approvals (OIC only, red) Critical system alerts (all, red) Overdue reports/cases (amber) Breadcrumb Examples: Audit & Oversight > Audit Logs > Report Lifecycle > FIA-2026-0123 Audit & Oversight > Break-Glass Access Logs > Session: SESS-2026-001 Audit & Oversight > Executive Dashboards > Director Ops Dashboard

## 2.7 Administration Workspace

Target Users: Tech Admin, OIC (oversight)

⚙️ Administration
│

├── 👥 User Management

│   ├── All Users

│   ├── Create User

│   ├── Manage Roles

│   │   ├── Reporting Entity User

│   │   ├── Compliance Officer

│   │   ├── Head of Compliance

│   │   ├── Analyst

│   │   ├── Head of Analysis

│   │   ├── Director of Operations

│   │   ├── OIC

│   │   └── Tech Admin

│   ├── Deactivate/Reactivate Users

│   └── Password Reset Requests

│

├── 🏢 Reporting Entity Management

│   ├── All Reporting Entities (46+ currently active)

│   ├── Register New Entity

│   ├── API Credentials Management

│   │   ├── Issue credentials

│   │   ├── Revoke credentials

│   │   └── Regenerate credentials

│   ├── Entity Performance Metrics

│   └── Submission Quality Reports

│

├── 🔐 Security Settings

│   ├── Session Timeout Configuration (default: 30 min)

│   ├── Password Policy

│   ├── Failed Login Lockout Settings (default: 5 attempts)

│   ├── Re-Authentication Settings

│   │   └── Sensitive actions requiring re-auth

│   └── IP Whitelisting (optional)

│

├── 🔧 System Configuration

│   ├── Workflow Stage Thresholds

│   │   ├── Overdue CTR threshold (default: 10 days)

│   │   ├── Overdue STR threshold (default: 7 days)

│   │   └── Overdue case threshold (default: 30 days)

│   ├── Validation Rules Configuration

│   │   ├── Deduplication settings

│   │   ├── File size limits (default: 25MB per PTD)

│   │   └── goAML schema version (locked: 5.0.1)

│   ├── Notification Settings

│   │   ├── Email templates

│   │   └── Notification frequency

│   └── Rate Limiting (API)

│       └── Per-entity submission limits

│

├── 💾 Backup & Recovery (Tech Admin only)

│   ├── Manual Backup Trigger

│   ├── Restore from Backup

│   ├── Backup Schedule Configuration

│   └── Backup Verification Logs

│

├── 🔍 System Logs (Tech Admin only)

│   ├── Application Logs

│   ├── Error Logs

│   ├── Security Event Logs

│   └── Performance Logs

│

└── 📊 System Health Monitoring (Tech Admin only)

    ├── Server Metrics (CPU, RAM, Disk)

    ├── Database Performance

    ├── API Health

    └── Uptime Statistics

Navigation Behavior: Tech Admin: Default landing = "System Health Monitoring" OIC: Limited view = "User Management" + "Reporting Entity Management" only (oversight, no direct edits without Tech Admin execution) Break-glass content access: NOT available here (requires explicit OIC authorization per session in Audit & Oversight) Badge notifications: Failed system health checks (red) Pending password reset requests (blue) Critical Access Restriction: Tech Admin CANNOT access report/case/intelligence content through Administration workspace Content access requires break-glass authorization (tracked in Audit & Oversight) Breadcrumb Examples: Administration > User Management > Create User Administration > Reporting Entity Management > Bank of Monrovia > API Credentials Administration > System Configuration > Workflow Stage Thresholds
