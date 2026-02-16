# Functional Requirements Document

**Document Title:** Functional Requirements Document  
**Feature/Product Name:** Rule-Based Analysis & Alert Generation  
**Version:** 1.0  
**Author:** Business Analyst  
**Related PRD Version:** PRD v1.0 (Feature 8)  
**Status:** Draft  
**Last Updated Date:** 2026-02-04

---

## 1. Scope & Feature Context

**Feature Name**  
Rule-Based Analysis & Alert Generation

**Description**  
The system automatically flags reports matching predefined suspicious patterns to enable risk-based prioritization. Compliance officers and analysts can define rules, view generated alerts on role-specific dashboards, and mark alert dispositions. The system supports two rule domains: compliance-level rules for CTR processing and analysis-level rules for STR and escalated CTR investigation.

**In Scope**  
- Rule definition and management (compliance-level and analysis-level)
- Automatic rule execution on validated reports
- Alert generation with risk level assignment
- Alert display on role-based dashboards
- Alert disposition tracking (True Positive, False Positive, Under Investigation)
- Combination rules supporting multiple conditions
- Pre-configured common AML rules
- Audit logging of all rule executions and alert generations
- Rule modification, deactivation, and deletion with documented justification

**Out of Scope**  
- Real-time transaction monitoring within financial institutions
- Machine learning or AI-based risk scoring (deferred to Phase 4)
- Rule execution on reports before validation
- Alert generation for archived reports
- External data integration for rule conditions (deferred to Phase 3)

**Purpose**  
Enable automated risk-based prioritization of reports, reducing manual review workload and ensuring high-risk activity receives immediate attention. This supports FIA's goal of reducing manual workload by 60% and achieving efficient triage of suspicious transactions.

---

## 2. Actors / Roles

**Compliance Officer Supervisor**  
Senior compliance officer responsible for managing compliance-level alert rules. Can define, modify, deactivate, and delete compliance-level rules for CTR processing. Cannot access or modify analysis-level rules.

**Head of Analysis**  
Senior analyst responsible for managing analysis-level alert rules. Can define, modify, deactivate, and delete analysis-level rules for STR and escalated CTR investigation. Cannot access or modify compliance-level rules.

**Compliance Officers**  
Officers who review CTRs and view compliance-level alerts on their dashboards. Can view alert details, see rule logic that triggered alerts, and mark alerts with disposition labels (True Positive, False Positive, Under Investigation).

**Analysts**  
Analysts who investigate STRs and escalated CTRs. View analysis-level alerts on their dashboards, can view alert details, see rule logic that triggered alerts, and mark alerts with disposition labels.

**Compliance Officers (for CTRs)**  
Staff who validate CTR reports. Their validation action triggers automatic rule execution for compliance-level rules on CTRs.

**Analysts (for STRs)**  
Staff who validate STR reports. Their validation action triggers automatic rule execution for analysis-level rules on STRs.

**System Process**  
Automated process that executes rules, generates alerts, and logs all rule execution activities. Triggers rule execution immediately after report validation or escalation.

---

## 3. Functional Requirements (FR)

### FR-8.1: Compliance-Level Rule Definition

**Description**  
The system shall allow Compliance Officer Supervisors to define compliance-level alert rules for CTR processing.

**Actor**  
Compliance Officer Supervisor

**Traceability**  
PRD FR-8.1

**Business Rules**  
BR-8.2, BR-8.7

---

### FR-8.2: Analysis-Level Rule Definition

**Description**  
The system shall allow Head of Analysis to define analysis-level alert rules for STR and escalated CTR investigation.

**Actor**  
Head of Analysis

**Traceability**  
PRD FR-8.2

**Business Rules**  
BR-8.3, BR-8.7

---

### FR-8.3: Compliance-Level Rule Execution

**Description**  
The system shall automatically apply all active compliance-level rules to CTRs immediately after manual validation by Compliance Officer.

**Actor**  
System Process

**Traceability**  
PRD FR-8.3

**Business Rules**  
BR-8.2, BR-8.4

---

### FR-8.4: Analysis-Level Rule Execution

**Description**  
The system shall automatically apply all active analysis-level rules to STRs and escalated CTRs immediately after validation or escalation.

**Actor**  
System Process

**Traceability**  
PRD FR-8.4

**Business Rules**  
BR-8.3, BR-8.4

---

### FR-8.5: Alert Generation with Risk Levels

**Description**  
The system shall generate alerts when rule conditions are met, assigning risk levels: Low, Medium, High, Critical.

**Actor**  
System Process

**Traceability**  
PRD FR-8.5

**Business Rules**  
BR-8.1

---

### FR-8.6: Compliance Alert Display

**Description**  
The system shall display generated compliance-level alerts on compliance officers' dashboards for CTR review.

**Actor**  
System Process

**Traceability**  
PRD FR-8.6

**Business Rules**  
BR-8.5

---

### FR-8.7: Analysis Alert Display

**Description**  
The system shall display generated analysis-level alerts on analysts' dashboards for STR and escalated CTR investigation.

**Actor**  
System Process

**Traceability**  
PRD FR-8.7

**Business Rules**  
BR-8.5

---

### FR-8.8: Alert Rule Logic Visibility

**Description**  
The system shall allow compliance officers and analysts to view the specific rule logic that triggered each alert.

**Actor**  
Compliance Officers, Analysts

**Traceability**  
PRD FR-8.8

**Business Rules**  
None

---

### FR-8.9: Alert Disposition

**Description**  
The system shall allow compliance officers and analysts to mark alerts as "True Positive," "False Positive," or "Under Investigation."

**Actor**  
Compliance Officers, Analysts

**Traceability**  
PRD FR-8.9

**Business Rules**  
BR-8.6

---

### FR-8.10: Combination Rules Support

**Description**  
The system shall support combination rules that evaluate multiple conditions using logical operators (e.g., "Subject in 3+ CTRs AND total value >,000 in 30 days").

**Actor**  
Compliance Officer Supervisor, Head of Analysis

**Traceability**  
PRD FR-8.10

**Business Rules**  
None

---

### FR-8.11: Pre-Configured Rules

**Description**  
The system shall provide 10 pre-configured common AML rules covering both compliance-level patterns (structuring, threshold proximity) and analysis-level patterns (PEP involvement, high-risk jurisdictions).

**Actor**  
System Process

**Traceability**  
PRD FR-8.11

**Business Rules**  
BR-8.8

---

### FR-8.12: Rule Execution and Alert Audit Logging

**Description**  
The system shall log all rule executions and alert generations for audit purposes, including rule identifier, report identifier, execution timestamp, conditions evaluated, result, and generated alert details.

**Actor**  
System Process

**Traceability**  
PRD FR-8.12

**Business Rules**  
None

---

### FR-8.13: Rule Management

**Description**  
The system shall allow Compliance Officer Supervisors and Head of Analysis to deactivate, modify, or delete rules within their respective domains with documented justification, including reason for change and timestamp.

**Actor**  
Compliance Officer Supervisor, Head of Analysis

**Traceability**  
PRD FR-8.13

**Business Rules**  
BR-8.7

---

### FR-8.14: Rule Type Support

**Description**  
The system shall support two types of alert rules: compliance-level alerts for CTR red-flag detection (e.g., structuring patterns, threshold proximity) and analysis-level alerts for STR and escalated CTR risk assessment (e.g., PEP involvement, high-risk jurisdictions).

**Actor**  
System Process

**Traceability**  
PRD FR-8.14

**Business Rules**  
BR-8.2, BR-8.3

---

### FR-8.15: Compliance Rule Domain Separation

**Description**  
The system shall prevent compliance-level alert rules from triggering on STRs (which bypass compliance review).

**Actor**  
System Process

**Traceability**  
PRD FR-8.15

**Business Rules**  
BR-8.2

---

### FR-8.16: Escalated CTR Analysis Rule Application

**Description**  
The system shall apply relevant analysis-level alert rules to escalated CTRs upon escalation.

**Actor**  
System Process

**Traceability**  
PRD FR-8.16

**Business Rules**  
BR-8.3, BR-8.4

---

## 4. Business Rules (BR)

### BR-8.1: Risk Level Assignment

**Rule Statement**  
When a rule condition is met, the system shall assign one of four risk levels to the generated alert: Low, Medium, High, or Critical. The risk level is determined by the rule definition and cannot be manually overridden during alert generation.

**Examples**  
- Rule "CTR amount >,000 = High Risk" generates High Risk alert when condition met
- Rule "Subject is PEP = Critical" generates Critical alert when condition met
- Rule "Transaction to high-risk country = Medium Risk" generates Medium Risk alert when condition met

---

### BR-8.2: Compliance-Level Rule Scope

**Rule Statement**  
Compliance-level alert rules shall only trigger on Currency Transaction Reports (CTRs) and shall never trigger on Suspicious Transaction Reports (STRs).

**Examples**  
- Compliance rule "CTR amount >,000 = High Risk" triggers on validated CTR with ,000
- Same compliance rule does not trigger on validated STR with ,000
- Compliance rules are evaluated only after CTR validation by Compliance Officer

---

### BR-8.3: Analysis-Level Rule Scope

**Rule Statement**  
Analysis-level alert rules shall only trigger on Suspicious Transaction Reports (STRs) and Escalated CTRs. Analysis-level rules do not trigger on non-escalated CTRs.

**Examples**  
- Analysis rule "Subject is PEP = Critical" triggers on validated STR with PEP subject
- Same analysis rule triggers on escalated CTR with PEP subject
- Analysis rule does not trigger on non-escalated CTR with PEP subject

---

### BR-8.4: Rule Execution Timing

**Rule Statement**  
The system shall execute compliance-level rules immediately after manual validation of CTRs by Compliance Officers. The system shall execute analysis-level rules immediately after validation of STRs by Analysts or immediately upon escalation of CTRs to Analysis workflow.

**Examples**  
- CTR validated at 10:00 AM triggers compliance rule execution at 10:00 AM
- STR validated at 2:00 PM triggers analysis rule execution at 2:00 PM
- CTR escalated at 3:00 PM triggers analysis rule execution at 3:00 PM

---

### BR-8.5: Alert Visibility

**Rule Statement**  
Compliance-level alerts shall be visible only on compliance officers' dashboards. Analysis-level alerts shall be visible only on analysts' dashboards. Users cannot view alerts outside their role domain.

**Examples**  
- Compliance officer sees compliance-level alerts for CTRs in their dashboard
- Analyst sees analysis-level alerts for STRs and escalated CTRs in their dashboard
- Compliance officer cannot view analysis-level alerts
- Analyst cannot view compliance-level alerts

---

### BR-8.6: Alert Disposition Options

**Rule Statement**  
Compliance officers and analysts shall mark each alert with one of three disposition labels: "True Positive" (alert correctly identified suspicious activity), "False Positive" (alert incorrectly flagged legitimate activity), or "Under Investigation" (alert requires further review to determine validity).

**Examples**  
- Compliance officer reviews alert, determines legitimate payroll transaction, marks as "False Positive"
- Analyst reviews alert, confirms suspicious pattern, marks as "True Positive"
- Analyst reviews alert, needs more information, marks as "Under Investigation"

---

### BR-8.7: Rule Modification Requirements

**Rule Statement**  
When Compliance Officer Supervisors or Head of Analysis modify, deactivate, or delete rules within their respective domains, the system shall require documented justification including reason for change, which is logged with timestamp and user identifier.

**Examples**  
- Head of Analysis changes rule threshold from ",000" to ",000" with reason "Reduce false positives based on 3-month review"
- Compliance Officer Supervisor deactivates rule with reason "Rule causing excessive false positives, under review"
- All changes logged with timestamp, user, and justification

---

### BR-8.8: Pre-Configured Rule Count

**Rule Statement**  
The system shall provide exactly 10 pre-configured common AML rules at deployment: 5 compliance-level rules covering structuring patterns and threshold proximity, and 5 analysis-level rules covering PEP involvement and high-risk jurisdictions.

**Examples**  
- System deployed with 5 pre-configured compliance-level rules active
- System deployed with 5 pre-configured analysis-level rules active
- Total of 10 pre-configured rules available at system launch

---

## 5. Error & Exception Handling

### ERR-RULE-001: Rule Definition Validation Error

**Error Condition**  
Compliance Officer Supervisor or Head of Analysis attempts to create or modify a rule with invalid logic, contradictory conditions, or missing required fields.

**System Behavior**  
The system shall reject the rule definition, prevent saving, and display validation error messages indicating specific issues with the rule logic.

**User Message**  
The system shall display clear error messages identifying the validation failure (e.g., "Rule condition contains contradictory logic" or "Required field 'Risk Level' is missing").

**Recovery Action**  
User must correct the rule definition errors and resubmit. System provides guidance on valid rule structure and required fields.

---

### ERR-RULE-002: Rule Execution Failure

**Error Condition**  
System encounters an error during rule execution that prevents evaluation of rule conditions or generation of alerts (e.g., data access failure, calculation error, system resource unavailability).

**System Behavior**  
The system shall log the execution failure with error details, skip the failed rule for that report, continue executing remaining rules, and generate alerts for successfully evaluated rules.

**User Message**  
The system shall not display error messages to end users for rule execution failures. System administrators receive error notifications through monitoring systems.

**Recovery Action**  
System automatically retries failed rule executions. System administrators investigate logged errors and resolve underlying issues.

---

### ERR-RULE-003: Permission Denied - Cross-Domain Rule Access

**Error Condition**  
Compliance Officer Supervisor attempts to access, modify, or delete an analysis-level rule, or Head of Analysis attempts to access, modify, or delete a compliance-level rule.

**System Behavior**  
The system shall prevent the action and deny access to the rule.

**User Message**  
The system shall display "Permission Denied - Analysis rules managed by Head of Analysis" or "Permission Denied - Compliance rules managed by Compliance Officer Supervisor" as appropriate.

**Recovery Action**  
User must contact the appropriate role (Head of Analysis for analysis rules, Compliance Officer Supervisor for compliance rules) to request rule changes.

---

### ERR-RULE-004: Alert Generation Failure

**Error Condition**  
System successfully evaluates rule conditions and determines alert should be generated, but encounters an error during alert creation or assignment (e.g., database write failure, notification system failure).

**System Behavior**  
The system shall log the alert generation failure with full context, retry alert generation, and if retry fails, queue the alert for manual review by system administrators.

**User Message**  
The system shall not display error messages to end users. If alert generation fails after retries, system administrators receive notifications.

**Recovery Action**  
System automatically retries alert generation. System administrators investigate and manually create alerts if automatic retry fails.

---

### ERR-RULE-005: Rule Modification Conflict

**Error Condition**  
Multiple users attempt to modify the same rule simultaneously, or a rule is modified while alerts from the previous rule version are still being generated or reviewed.

**System Behavior**  
The system shall prevent concurrent modifications using locking mechanism, and shall apply rule modifications only to new rule evaluations while preserving historical alerts generated under previous rule versions.

**User Message**  
The system shall display "Rule is currently being modified by another user. Please try again in a moment" or similar message indicating the conflict.

**Recovery Action**  
User must wait for the current modification to complete, then retry their modification. Historical alerts remain associated with the rule version that generated them.

---

## 6. Non-Functional Requirements (NFR)

### NFR-PERF-8.1: Alert Generation Response Time

**Description**  
The system shall generate alerts within 1 minute of report validation or escalation completion.

**Measurement Criteria**  
Time measured from report validation/escalation timestamp to alert creation timestamp. 95% of alerts must be generated within 1 minute under normal system load.

**Traceability**  
FR-8.3, FR-8.4, FR-8.5

---

### NFR-PERF-8.2: Rule Execution Throughput

**Description**  
The system shall support execution of 50+ active rules per report without performance degradation, completing all rule evaluations within the 1-minute alert generation window.

**Measurement Criteria**  
System tested with 50 active rules on a single report. All rules evaluated and alerts generated within 1 minute. System response time for other operations remains unaffected.

**Traceability**  
FR-8.3, FR-8.4

---

### NFR-SEC-8.1: Role-Based Rule Access Control

**Description**  
The system shall enforce role-based access control preventing Compliance Officer Supervisors from accessing analysis-level rules and preventing Head of Analysis from accessing compliance-level rules.

**Measurement Criteria**  
Access control tested by attempting cross-domain rule access. All unauthorized access attempts are denied and logged. No user can view or modify rules outside their domain.

**Traceability**  
FR-8.1, FR-8.2, FR-8.13

---

### NFR-SEC-8.2: Immutable Rule Change Audit Trail

**Description**  
The system shall maintain an immutable audit trail for all rule modifications, deactivations, and deletions, including timestamp, user identifier, rule identifier, change type, justification, and previous rule configuration.

**Measurement Criteria**  
Audit log entries verified for all rule changes. Log entries cannot be modified or deleted by any user role. Audit trail supports forensic investigation of rule change history.

**Traceability**  
FR-8.13

---

### NFR-REL-8.1: Rule Execution Success Rate

**Description**  
The system shall achieve a rule execution success rate greater than 99.5%, meaning less than 0.5% of rule executions fail due to system errors.

**Measurement Criteria**  
Success rate calculated as (Successful rule executions / Total rule execution attempts) x 100 over a 30-day period. Target: >99.5%.

**Traceability**  
FR-8.3, FR-8.4

---

### NFR-USAB-8.1: Rule Definition Interface Usability

**Description**  
The rule definition interface shall be usable by non-technical compliance officers and analysts without requiring programming knowledge or technical training beyond standard system user training.

**Measurement Criteria**  
Usability testing with 5 non-technical users. 80% of users successfully create a valid rule within 15 minutes after training. User satisfaction score >4.0 on 5-point scale.

**Traceability**  
FR-8.1, FR-8.2

---

### NFR-MAINT-8.1: Rule Execution Logging Completeness

**Description**  
The system shall log all rule executions and alert generations with complete context including rule identifier, report identifier, execution timestamp, conditions evaluated, evaluation results, generated alert details, and any errors encountered.

**Measurement Criteria**  
Log entries verified for 100% of rule executions. All log entries contain required fields. Logs support audit requirements and troubleshooting.

**Traceability**  
FR-8.12

---

## 7. Glossary

**Alert**  
A notification generated by the system when a rule condition is met, indicating potential suspicious activity requiring review. Alerts are assigned risk levels and displayed on role-specific dashboards.

**Analysis-Level Alert**  
An alert generated by analysis-level rules that trigger on STRs and escalated CTRs. These alerts appear on analysts' dashboards and support investigation workflows.

**Compliance-Level Alert**  
An alert generated by compliance-level rules that trigger on CTRs. These alerts appear on compliance officers' dashboards and support compliance review workflows.

**Disposition**  
The classification assigned to an alert by a compliance officer or analyst indicating the alert's validity: True Positive (correctly identified suspicious activity), False Positive (incorrectly flagged legitimate activity), or Under Investigation (requires further review).

**Escalated CTR**  
A Currency Transaction Report that has been escalated from the Compliance Review stage to the Analysis workflow for investigation. Escalated CTRs are treated similarly to STRs for analysis-level rule execution.

**PEP (Politically Exposed Person)**  
An individual who is or has been entrusted with prominent public functions, their family members, or close associates. PEP involvement in transactions is a risk indicator for money laundering.

**Risk Level**  
A classification assigned to alerts indicating the severity of potential suspicious activity: Low, Medium, High, or Critical. Risk levels are determined by rule definitions.

**Rule**  
A predefined condition or set of conditions that, when met by a report, triggers alert generation. Rules are categorized as compliance-level (for CTRs) or analysis-level (for STRs and escalated CTRs).

**Structuring Pattern**  
A pattern of transactions designed to avoid reporting thresholds, such as multiple transactions just below the ,000 reporting threshold within a short time period.

**Threshold Proximity**  
Transactions that approach but do not exceed regulatory reporting thresholds, which may indicate attempts to avoid triggering mandatory reporting requirements.

---

## 8. Open Issues & Decisions Pending

| Issue ID | Description | Impact | Assigned To | Target Date |
|----------|-------------|--------|-------------|-------------|
| ISS-8.001 | How should the system handle reports that trigger 5+ rules simultaneously? Should all alerts be generated or should there be a prioritization mechanism? | Affects FR-8.5, alert display performance | Product Manager | TBD |
| ISS-8.002 | What happens to alerts generated by a rule version when that rule is modified? Should historical alerts be updated or preserved with original rule logic? | Affects FR-8.13, audit trail requirements | Head of Analysis, Compliance Officer Supervisor | TBD |
| ISS-8.003 | Should there be limits on rule complexity (e.g., maximum number of conditions in combination rules) to prevent performance degradation? | Affects FR-8.10, NFR-PERF-8.2 | Technical Lead | TBD |
| ISS-8.004 | How should the system handle rule execution when report data is incomplete or contains null values? Should rules skip evaluation or generate alerts for data quality issues? | Affects FR-8.3, FR-8.4 | Business Analyst | TBD |
| ISS-8.005 | Should rule performance metrics (true positive rate, false positive rate) be displayed to rule managers, and if so, what metrics and frequency? | Affects rule management interface, FR-8.13 | Product Manager | TBD |

---
