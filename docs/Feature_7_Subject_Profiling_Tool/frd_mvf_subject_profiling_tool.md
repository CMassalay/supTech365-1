# Minimum Viable Feature (MVF) Specification
## Feature 7: Subject Profiling Tool

**Document Version:** 1.0  
**Date:** February 2026  
**Source FRD:** frd_subject_profiling_tool.md v1.0  
**Feature ID:** FR-7-MVF  
**Phase:** Phase 1 - Foundation (Months 7-8)  
**Status:** Draft  
**Related FRD Version:** 1.0

---

## 1. Document Header

**Document Title:** Minimum Viable Feature Specification  
**Feature/Product Name:** Subject Profiling Tool (MVF)  
**Version:** 1.0  
**Author:** Senior Business Analyst  
**Related FRD Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Scope & Feature Context

### Feature Name
Subject Profiling Tool (Minimum Viable Feature)

### MVF Description
The MVF enables FIA analysts and compliance officers to view consolidated subject profiles showing all associated reports (STRs and CTRs) with proper role-based access control enforcement. This delivers the core investigative value of cross-report subject tracking without advanced features like profile merging, relationship mapping, or visual timelines.

### Core Value Proposition
Enable FIA staff to identify and review all historical reports associated with a person, company, or account in a single consolidated view, with appropriate access controls distinguishing analyst and compliance officer permissions for CTR data.

### In MVF Scope
- Automatic subject profile creation for persons, companies, and accounts from validated reports
- Automatic linking of new reports to existing subject profiles via identifier matching
- Subject profile page displaying associated reports in chronological order
- Display of key subject attributes (name, IDs, addresses, accounts)
- Basic summary statistics (report counts by type, date range)
- CTR access control enforcement for analysts
- Escalation status display on CTR entries

### Deferred to Future Iterations
| FRD ID | Requirement | Reason for Deferral |
|--------|-------------|---------------------|
| FR-7.6 | Manual profile merge | Enhancement - feature works without it |
| FR-7.7 | Relationship links between subjects | Secondary functionality |
| FR-7.8 | Visual transaction timeline | Nice-to-have visualization |
| FR-7.9 | High-frequency activity flagging | Enhancement - automated alerting |
| FR-7.10 | Investigative notes | Secondary functionality |
| BR-7.3 | High-frequency flagging threshold | Supports deferred FR-7.9 |
| BR-7.5 | Profile merge rules | Supports deferred FR-7.6 |
| BR-7.6 | Relationship link types | Supports deferred FR-7.7 |

### Purpose
Enable pattern identification and cross-report analysis for AML/CFT investigations by providing a consolidated view of all activity associated with subjects of interest, supporting FIA's mandate to detect money laundering and terrorist financing.

---

## 3. Essential Actors / Roles

### Actor 1: Analyst
**Role Name:** Analyst  
**Description:** FIA staff member responsible for analyzing STRs and escalated CTRs.  
**Core MVF Capabilities:**
- Search and view subject profiles
- View STRs and escalated CTRs in subject profiles
- View non-escalated CTRs only when subject appears in assigned STR

### Actor 2: Compliance Officer
**Role Name:** Compliance Officer  
**Description:** FIA staff member responsible for reviewing CTRs for compliance.  
**Core MVF Capabilities:**
- Search and view subject profiles
- View all reports (STRs and CTRs) in subject profiles without restriction

### Actor 3: System Process
**Role Name:** Subject Profile Processor  
**Description:** Automated system processes that handle subject profile creation and linking.  
**Core MVF Capabilities:**
- Create subject profiles from validated report data
- Automatically link new reports to existing profiles via identifier matching
- Calculate basic summary statistics

---

## 4. Core Functional Requirements

### 4.1 Subject Profile Creation

**FR-7.1: Persistent Subject Profile Creation**  
**Description:** The system shall create persistent subject profiles for persons, companies, and accounts mentioned in any report (STR or CTR).  
**Actor:** System Process  
**Traceability:** FRD FR-7.1, PRD FR-7.1  
**Business Rules:** BR-7.1  
**MVF Rationale:** Foundational requirement - the feature cannot exist without profile creation. This enables the core value of consolidated subject views.

### 4.2 Automatic Report Linking

**FR-7.2: Automatic Linking via Matching Identifiers**  
**Description:** The system shall automatically link new reports to existing subject profiles when matching identifiers are detected (name, ID number, account number).  
**Actor:** System Process  
**Traceability:** FRD FR-7.2, PRD FR-7.2  
**Business Rules:** BR-7.2  
**MVF Rationale:** Core automation that enables profile consolidation. Without automatic linking, profiles would be isolated and the cross-report analysis value would not be delivered.

### 4.3 Profile Display

**FR-7.3: Subject Profile Page with Chronological Reports**  
**Description:** The system shall display a subject profile page showing all associated reports in chronological order, including report type (STR, CTR, Escalated CTR).  
**Actor:** Analyst, Compliance Officer  
**Traceability:** FRD FR-7.3, PRD FR-7.3  
**Business Rules:** BR-7.4  
**MVF Rationale:** Essential for users to view and understand subject history. The profile page is the primary interface for delivering core value.

**FR-7.4: Key Subject Attributes Display**  
**Description:** The system shall show key subject attributes: full name, identification numbers, addresses, associated accounts, associated entities.  
**Actor:** Analyst, Compliance Officer  
**Traceability:** FRD FR-7.4, PRD FR-7.4  
**Business Rules:** None  
**MVF Rationale:** Basic profile information required for user identification and investigation context. Without attributes, profiles lack meaning.

**FR-7.5: Summary Statistics Display**  
**Description:** The system shall calculate and display summary statistics per subject: total reports involving subject (by type: STR, CTR, Escalated CTR), total transaction value, date range of activity.  
**Actor:** System Process, Analyst, Compliance Officer  
**Traceability:** FRD FR-7.5, PRD FR-7.5  
**Business Rules:** None  
**MVF Rationale:** Basic counts and date ranges provide immediate investigative value by showing activity volume and timespan. Essential for quick assessment of subject risk.

### 4.4 Access Control

**FR-7.11: CTR Access Control for Analysts**  
**Description:** The system shall allow analysts to view CTR data for subjects only when: (a) the CTR has been escalated to their workflow, or (b) the subject appears in an STR currently assigned to them.  
**Actor:** Analyst  
**Traceability:** FRD FR-7.11, PRD FR-7.11  
**Business Rules:** BR-7.4  
**MVF Rationale:** Critical security and compliance requirement. Proper access control is mandatory for the feature to be usable in production. Failure to enforce this would violate data access policies.

**FR-7.12: Escalation Status Display**  
**Description:** The system shall display escalation status on CTR entries in subject profiles (e.g., "CTR - Escalated" vs. "CTR - Archived").  
**Actor:** Analyst, Compliance Officer  
**Traceability:** FRD FR-7.12, PRD FR-7.12  
**Business Rules:** BR-7.7  
**MVF Rationale:** Supports access control differentiation by making escalation status visible. Users need to understand which CTRs are accessible to analysts vs. compliance-only.

---

## 5. Essential Business Rules

### BR-7.1: Subject Profile Creation Triggers
**Rule Statement:** Subject profiles shall be created for each unique person, company, or account mentioned in any STR or CTR upon report validation. Profiles are created based on subject type: Person (individual), Company (legal entity), or Account (financial account).  
**Examples:**
- STR mentions "John Mensah, ID: LIB123456" → Person profile created with name and ID
- CTR mentions "ABC Trading Co., Registration: REG789" → Company profile created
- Report mentions account number "ACC-001-2026" → Account profile created and linked to owner

**Traceability:** FRD BR-7.1  
**MVF Rationale:** Defines when profiles are created - essential for FR-7.1 to function correctly.

### BR-7.2: Automatic Linking Criteria
**Rule Statement:** New reports shall be automatically linked to existing subject profiles when any of the following identifiers match exactly: full name (case-insensitive), national ID number, passport number, company registration number, or account number. Partial matches do not trigger automatic linking.  
**Examples:**
- New CTR with "LIB123456" → Links to existing profile with same ID number
- New STR with "John Mensah" matches existing "JOHN MENSAH" → Linked (case-insensitive)
- New report with "J. Mensah" does NOT auto-link to "John Mensah" → Would require manual merge (deferred feature)

**Traceability:** FRD BR-7.2  
**MVF Rationale:** Defines matching logic for automatic linking - essential for FR-7.2 to work correctly.

### BR-7.4: CTR Access Restrictions for Analysts
**Rule Statement:** Analysts shall only access CTR data within subject profiles when: (a) the CTR has been escalated to the analysis workflow, OR (b) the subject appears in an STR currently assigned to the analyst. Non-escalated CTRs shall be hidden or marked "Access Restricted - Compliance Only" for analysts. Compliance Officers have unrestricted access to all CTRs.  
**Examples:**
- Analyst assigned STR mentioning "Sarah Konneh" → Can view all CTRs where Sarah appears
- Analyst views profile with 3 CTRs (none escalated, subject not in assigned STR) → CTRs hidden
- Compliance Officer views same profile → All 3 CTRs visible

**Traceability:** FRD BR-7.4  
**MVF Rationale:** Critical business rule defining access control logic - mandatory for security compliance.

### BR-7.7: Escalation Status Labels
**Rule Statement:** CTR entries in subject profiles shall display one of the following escalation status labels: "CTR - Archived" (closed without escalation), "CTR - Under Monitoring" (flagged for future review), "CTR - Escalated to Analysis" (elevated to STR workflow).  
**Examples:**
- CTR reviewed and closed normally → "CTR - Archived"
- CTR flagged for monitoring by compliance → "CTR - Under Monitoring"
- CTR escalated by Head of Compliance → "CTR - Escalated to Analysis"

**Traceability:** FRD BR-7.7  
**MVF Rationale:** Supports FR-7.12 and access control visibility - users need clear status indicators.

---

## 6. Critical Error & Exception Handling

### ERR-PROF-001: Profile Not Found
**Error Condition:** User searches for a subject that does not exist in the system.  
**System Behavior:** System displays "No matching subjects found" message with option to refine search criteria.  
**User Message:** "No subject profiles match your search criteria. Try adjusting your search terms or check for alternate spellings."  
**Recovery Action:** User can modify search terms or browse recent profiles.  
**Traceability:** FRD ERR-PROF-001  
**MVF Rationale:** Basic error handling required for search functionality to be usable. Users will frequently search for subjects that don't exist.

### ERR-PROF-003: Access Denied - CTR Restricted
**Error Condition:** Analyst attempts to view CTR details for a subject when access criteria are not met (CTR not escalated and subject not in assigned STR).  
**System Behavior:** System blocks access and displays restriction message. Restricted CTRs appear as placeholder entries with limited metadata.  
**User Message:** "Access Restricted - This CTR is available to Compliance Officers only. You may view this CTR if: (a) it is escalated, or (b) the subject appears in an STR assigned to you."  
**Recovery Action:** Analyst can request access escalation through supervisor or work with Compliance Officer.  
**Traceability:** FRD ERR-PROF-003  
**MVF Rationale:** Security-critical error handling. Must clearly communicate access restrictions to prevent confusion and security concerns.

---

## 7. Minimal Non-Functional Requirements

### 7.1 Security Requirements

**NFR-PROF-SEC-1: Access Control Enforcement**  
**Description:** The system shall enforce CTR access restrictions for analysts with 100% accuracy, preventing unauthorized access to non-escalated CTR data.  
**Measurement Criteria:** Zero unauthorized CTR access incidents. Access control tested on every profile view.  
**Traceability:** FRD NFR-PROF-SEC-1, FR-7.11  
**MVF Rationale:** Compliance-critical requirement. The feature cannot go to production without guaranteed access control enforcement. This is non-negotiable for AML/CFT compliance.

**NFR-PROF-SEC-3: Data Confidentiality**  
**Description:** The system shall protect subject profile data from unauthorized access using role-based access control aligned with FATF Recommendation 29 confidentiality requirements.  
**Measurement Criteria:** All profile data access requires authentication. Data encrypted at rest and in transit.  
**Traceability:** FRD NFR-PROF-SEC-3, All FRs  
**MVF Rationale:** Baseline security requirement. Subject profile data is sensitive AML/CFT information requiring protection. Feature is unusable without basic confidentiality controls.

---

## 8. What's Deferred

### 8.1 Deferred Functional Requirements

| FRD ID | Requirement | Reason for Deferral | Future Iteration |
|--------|-------------|---------------------|------------------|
| FR-7.6 | Manual profile merge | Enhancement - feature works with auto-linking only. Manual merge is for edge cases where auto-linking fails due to name variations. | Iteration 2 |
| FR-7.7 | Relationship link creation | Secondary functionality - not part of primary user journey. Adds investigative value but not required for core profile viewing. | Iteration 2 |
| FR-7.8 | Visual transaction timeline | Nice-to-have visualization enhancement. Report list provides functional alternative. | Iteration 3 |
| FR-7.9 | High-frequency activity flagging | Automated alerting enhancement. Users can manually identify frequency from statistics. | Iteration 2 |
| FR-7.10 | Investigative notes | Secondary functionality. Users can track notes externally for MVF. | Iteration 2 |

### 8.2 Deferred Business Rules

| FRD ID | Rule | Reason for Deferral |
|--------|------|---------------------|
| BR-7.3 | High-frequency flagging threshold | Supports deferred FR-7.9 |
| BR-7.5 | Profile merge rules | Supports deferred FR-7.6 |
| BR-7.6 | Relationship link types | Supports deferred FR-7.7 |

### 8.3 Deferred Error Handling

| FRD ID | Error Scenario | Reason for Deferral |
|--------|----------------|---------------------|
| ERR-PROF-002 | Merge conflict - conflicting attributes | Supports deferred FR-7.6 (profile merge) |
| ERR-PROF-004 | Relationship link validation failure | Supports deferred FR-7.7 (relationship links) |
| ERR-PROF-005 | High-frequency flag calculation error | Supports deferred FR-7.9 (flagging) |
| ERR-PROF-006 | Note save failure | Supports deferred FR-7.10 (notes) |

### 8.4 Deferred Non-Functional Requirements

| FRD ID | NFR | Reason for Deferral |
|--------|-----|---------------------|
| NFR-PROF-PERF-1 | Profile page load time (3s) | Performance optimization - can accept slower initial performance |
| NFR-PROF-PERF-2 | Search response time (2s) | Performance optimization |
| NFR-PROF-PERF-3 | Timeline rendering (5s) | Supports deferred FR-7.8 (timeline) |
| NFR-PROF-PERF-4 | High-volume profile support (500 reports) | Scalability optimization - initial profiles will be smaller |
| NFR-PROF-SEC-2 | Comprehensive audit logging | Enhancement - basic logging sufficient for MVF |
| NFR-PROF-USAB-1 | Advanced search functionality | Usability enhancement |
| NFR-PROF-USAB-2 | Profile navigation optimization | Usability polish |
| NFR-PROF-USAB-3 | Timeline interactivity | Supports deferred FR-7.8 |
| NFR-PROF-SCALE-1 | Subject volume growth (100K profiles) | Scalability - not needed for initial launch |
| NFR-PROF-SCALE-2 | Concurrent users (50) | Scalability - smaller user base initially |
| NFR-PROF-COMPLY-1 | Audit trail completeness | Advanced compliance - basic audit sufficient for MVF |
| NFR-PROF-COMPLY-2 | 10-year data retention | Advanced compliance - can implement retention policy later |

### 8.5 Future Iteration Notes

**Iteration 2 (Recommended):**
- FR-7.6 (Profile Merge) - High value for handling name variations
- FR-7.9 (High-Frequency Flagging) - Automates pattern detection
- FR-7.10 (Investigative Notes) - Supports collaboration

**Iteration 3:**
- FR-7.7 (Relationship Links) - Enables network analysis
- FR-7.8 (Visual Timeline) - Enhanced visualization

**Dependencies:**
- FR-7.7 and FR-7.8 are prerequisites for Feature 17 (Network Visualization)
- Profile merge (FR-7.6) should be prioritized if users encounter many name variation issues

**Risks of Deferring:**
- Without profile merge, duplicate profiles will accumulate for subjects with name variations
- Without high-frequency flagging, analysts must manually identify repeat subjects
- Without notes, investigation context may be lost between sessions

---

## 9. Glossary

**Subject Profile:** A persistent record representing a person, company, or account that has appeared in one or more STRs or CTRs, aggregating all associated reports and attributes.

**STR (Suspicious Transaction Report):** A report filed when a transaction appears suspicious and may indicate money laundering, terrorist financing, or other financial crimes.

**CTR (Currency Transaction Report):** A report filed for large cash transactions above a defined threshold, typically used for compliance monitoring.

**Escalated CTR:** A CTR that has been elevated from the compliance workflow to the analysis workflow due to suspicious patterns or compliance officer recommendation.

**Access Control:** Role-based restrictions determining which users can view specific data. In MVF, analysts have restricted CTR access while compliance officers have full access.

---

## 10. MVF Acceptance Criteria

**AC-MVF-7.1: Subject Profile Creation and Display**  
Given a validated STR or CTR containing subject "John Mensah, ID: LIB123456," when the report is processed, then a subject profile is created and displays the subject's name, ID, and associated report.

**AC-MVF-7.2: Automatic Report Linking**  
Given an existing profile for "John Mensah, ID: LIB123456," when a new report with the same ID is validated, then the new report is automatically linked to the existing profile.

**AC-MVF-7.3: CTR Access Control - Analyst Restriction**  
Given an analyst viewing a subject profile with 2 non-escalated CTRs and 1 STR, when the analyst is not assigned the STR, then the analyst sees only the STR and the CTRs are marked as restricted.

**AC-MVF-7.4: CTR Access Control - Compliance Full Access**  
Given a compliance officer viewing the same profile, when viewing the profile, then all 3 reports (2 CTRs and 1 STR) are fully visible.

**AC-MVF-7.5: Escalation Status Display**  
Given a subject profile containing CTRs with different statuses, when a user views the profile, then each CTR displays its escalation status (Archived, Under Monitoring, or Escalated to Analysis).

---

## 11. Approval

**Prepared by:** Senior Business Analyst  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 12. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Senior Business Analyst | Initial MVF specification created from FRD v1.0 |

---

**Document End**
