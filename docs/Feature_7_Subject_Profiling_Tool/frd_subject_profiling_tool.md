# Feature Requirements Document (FRD)
## Feature 7: Subject Profiling Tool

**Document Version:** 1.0  
**Date:** February 2026  
**Source:** PRD v1.0  
**Feature ID:** FR-7  
**Phase:** Phase 1 - Foundation (Months 7-8)  
**Status:** Draft  
**Related PRD Version:** 1.0

---

## 1. Document Header

**Document Title:** Feature Requirements Document  
**Feature/Product Name:** Subject Profiling Tool  
**Version:** 1.0  
**Author:** Senior Business Analyst  
**Related PRD Version:** 1.0  
**Status:** Draft  
**Last Updated Date:** February 2026

---

## 2. Scope & Feature Context

### Feature Name
Subject Profiling Tool

### Description
The Subject Profiling Tool enables FIA analysts and compliance officers to view all historical reports (STRs and CTRs) associated with persons, companies, or accounts across the entire database. This capability allows users to identify patterns, repeated behaviors, and connections over time, supporting effective AML/CFT investigation and intelligence production.

### In Scope
- Persistent subject profile creation for persons, companies, and accounts
- Automatic linking of new reports to existing subject profiles via matching identifiers
- Subject profile page displaying associated reports in chronological order
- Display of key subject attributes (name, IDs, addresses, accounts, entities)
- Summary statistics calculation and display per subject
- Manual profile merge functionality for duplicate subjects
- Relationship link creation between subjects
- Visual transaction timeline across all reports
- High-frequency activity flagging (3+ reports in 6 months)
- Investigative notes functionality
- CTR access control enforcement for analysts
- Escalation status display on CTR entries

### Out of Scope
- Network visualization and charting (covered in Feature 17)
- Automated relationship detection (manual linking only in this feature)
- Real-time transaction monitoring alerts
- External database integration for subject enrichment
- Automated duplicate detection and merge suggestions

### Purpose
Enable pattern identification and cross-report analysis for AML/CFT investigations by providing a consolidated view of all activity associated with subjects of interest, supporting FIA's mandate to detect money laundering and terrorist financing.

---

## 3. Actors / Roles

### Actor 1: Analyst
**Role Name:** Analyst  
**Description:** FIA staff member responsible for analyzing STRs and escalated CTRs, conducting investigations, and producing intelligence reports.  
**Capabilities:**
- Search and view subject profiles
- View STRs and escalated CTRs in subject profiles
- View non-escalated CTRs only when subject appears in assigned STR
- Merge duplicate subject profiles
- Create relationship links between subjects
- Add investigative notes to subject profiles
- View transaction timelines

### Actor 2: Compliance Officer
**Role Name:** Compliance Officer  
**Description:** FIA staff member responsible for reviewing CTRs for compliance, identifying red flags, and escalating suspicious activity.  
**Capabilities:**
- Search and view subject profiles
- View all reports (STRs and CTRs) in subject profiles without restriction
- Add investigative notes to subject profiles
- View transaction timelines

### Actor 3: System Process
**Role Name:** Subject Profile Processor  
**Description:** Automated system processes that handle subject profile creation, linking, and flagging.  
**Capabilities:**
- Create subject profiles from report data
- Automatically link new reports to existing profiles via identifier matching
- Calculate and update summary statistics
- Flag high-frequency subjects (3+ reports in 6 months)
- Log all profile changes for audit

---

## 4. Functional Requirements

### 4.1 Subject Profile Creation

**FR-7.1: Persistent Subject Profile Creation**  
**Description:** The system shall create persistent subject profiles for persons, companies, and accounts mentioned in any report (STR or CTR).  
**Actor:** System Process  
**Traceability:** PRD FR-7.1  
**Business Rules:** BR-7.1

### 4.2 Automatic Report Linking

**FR-7.2: Automatic Linking via Matching Identifiers**  
**Description:** The system shall automatically link new reports to existing subject profiles when matching identifiers are detected (name, ID number, account number).  
**Actor:** System Process  
**Traceability:** PRD FR-7.2  
**Business Rules:** BR-7.2

### 4.3 Profile Display

**FR-7.3: Subject Profile Page with Chronological Reports**  
**Description:** The system shall display a subject profile page showing all associated reports in chronological order, including report type (STR, CTR, Escalated CTR).  
**Actor:** Analyst, Compliance Officer  
**Traceability:** PRD FR-7.3  
**Business Rules:** BR-7.4

**FR-7.4: Key Subject Attributes Display**  
**Description:** The system shall show key subject attributes: full name, identification numbers, addresses, associated accounts, associated entities.  
**Actor:** Analyst, Compliance Officer  
**Traceability:** PRD FR-7.4  
**Business Rules:** None

**FR-7.5: Summary Statistics Display**  
**Description:** The system shall calculate and display summary statistics per subject: total reports involving subject (by type: STR, CTR, Escalated CTR), total transaction value, date range of activity.  
**Actor:** System Process, Analyst, Compliance Officer  
**Traceability:** PRD FR-7.5  
**Business Rules:** None

### 4.4 Profile Management

**FR-7.6: Manual Profile Merge**  
**Description:** The system shall allow analysts to manually merge duplicate subject profiles when the same person/entity was entered with slight variations.  
**Actor:** Analyst  
**Traceability:** PRD FR-7.6  
**Business Rules:** BR-7.5

**FR-7.7: Relationship Link Creation**  
**Description:** The system shall allow analysts to create relationship links between subjects (e.g., "Company Director," "Spouse," "Business Partner").  
**Actor:** Analyst  
**Traceability:** PRD FR-7.7  
**Business Rules:** BR-7.6

### 4.5 Visualization

**FR-7.8: Visual Transaction Timeline**  
**Description:** The system shall display a visual timeline of all transactions involving a subject across all reports (STRs, CTRs, and escalated CTRs).  
**Actor:** Analyst, Compliance Officer  
**Traceability:** PRD FR-7.8  
**Business Rules:** BR-7.4

### 4.6 Flagging and Alerts

**FR-7.9: High-Frequency Activity Flagging**  
**Description:** The system shall flag subjects appearing in 3 or more reports within a 6-month period for analyst attention.  
**Actor:** System Process  
**Traceability:** PRD FR-7.9  
**Business Rules:** BR-7.3

### 4.7 Investigative Notes

**FR-7.10: Investigative Notes**  
**Description:** The system shall allow analysts to add investigative notes to subject profiles visible to all FIA staff.  
**Actor:** Analyst, Compliance Officer  
**Traceability:** PRD FR-7.10  
**Business Rules:** None

### 4.8 Access Control

**FR-7.11: CTR Access Control for Analysts**  
**Description:** The system shall allow analysts to view CTR data for subjects only when: (a) the CTR has been escalated to their workflow, or (b) the subject appears in an STR currently assigned to them.  
**Actor:** Analyst  
**Traceability:** PRD FR-7.11  
**Business Rules:** BR-7.4

**FR-7.12: Escalation Status Display**  
**Description:** The system shall display escalation status on CTR entries in subject profiles (e.g., "CTR - Escalated" vs. "CTR - Archived").  
**Actor:** Analyst, Compliance Officer  
**Traceability:** PRD FR-7.12  
**Business Rules:** BR-7.7

---

## 5. Business Rules

### BR-7.1: Subject Profile Creation Triggers
**Rule Statement:** Subject profiles shall be created for each unique person, company, or account mentioned in any STR or CTR upon report validation. Profiles are created based on subject type: Person (individual), Company (legal entity), or Account (financial account).  
**Examples:**
- STR mentions "John Mensah, ID: LIB123456" → Person profile created with name and ID
- CTR mentions "ABC Trading Co., Registration: REG789" → Company profile created
- Report mentions account number "ACC-001-2026" → Account profile created and linked to owner

### BR-7.2: Automatic Linking Criteria
**Rule Statement:** New reports shall be automatically linked to existing subject profiles when any of the following identifiers match exactly: full name (case-insensitive), national ID number, passport number, company registration number, or account number. Partial matches do not trigger automatic linking.  
**Examples:**
- New CTR with "LIB123456" → Links to existing profile with same ID number
- New STR with "John Mensah" matches existing "JOHN MENSAH" → Linked (case-insensitive)
- New report with "J. Mensah" does NOT auto-link to "John Mensah" → Requires manual merge

### BR-7.3: High-Frequency Flagging Threshold
**Rule Statement:** Subjects appearing in 3 or more reports (STRs, CTRs, or combination) within any rolling 6-month period shall be automatically flagged as "High Frequency Activity" and added to the priority review list.  
**Examples:**
- Subject in 2 STRs and 1 CTR within 5 months → Flagged as high frequency
- Subject in 2 reports in January and 1 report in August → NOT flagged (outside 6-month window)
- Subject in 4 reports over 4 months → Flagged; flag persists until analyst reviews

### BR-7.4: CTR Access Restrictions for Analysts
**Rule Statement:** Analysts shall only access CTR data within subject profiles when: (a) the CTR has been escalated to the analysis workflow, OR (b) the subject appears in an STR currently assigned to the analyst. Non-escalated CTRs shall be hidden or marked "Access Restricted - Compliance Only" for analysts. Compliance Officers have unrestricted access to all CTRs.  
**Examples:**
- Analyst assigned STR mentioning "Sarah Konneh" → Can view all CTRs where Sarah appears
- Analyst views profile with 3 CTRs (none escalated, subject not in assigned STR) → CTRs hidden
- Compliance Officer views same profile → All 3 CTRs visible

### BR-7.5: Profile Merge Rules
**Rule Statement:** When merging duplicate subject profiles, all associated reports from both profiles shall be consolidated under the surviving profile. The merge action shall be logged with: initiating user, timestamp, source profile IDs, target profile ID, and reason for merge. Merge actions cannot be automatically reversed.  
**Examples:**
- Merge "ABC Trading Co." into "ABC Trading Company Ltd." → All reports consolidated, audit log created
- Conflicting attributes (different addresses) → System prompts user to select which to retain
- Merge logged: "User: analyst1, Date: 2026-02-03, Merged Profile #123 into #456, Reason: Same entity"

### BR-7.6: Relationship Link Types
**Rule Statement:** Relationship links between subjects shall specify a predefined relationship type. Supported relationship types include: Company Director, Shareholder, Spouse, Family Member, Business Partner, Employee, Authorized Signatory, Beneficial Owner, and Other (with required description).  
**Examples:**
- Link "John Mensah" to "ABC Trading Co." as "Company Director"
- Link "Sarah Konneh" to "James Konneh" as "Spouse"
- Link "Diamond Mining Ltd" to "Gold Exports Inc" as "Other: Common ownership structure"

### BR-7.7: Escalation Status Labels
**Rule Statement:** CTR entries in subject profiles shall display one of the following escalation status labels: "CTR - Archived" (closed without escalation), "CTR - Under Monitoring" (flagged for future review), "CTR - Escalated to Analysis" (elevated to STR workflow).  
**Examples:**
- CTR reviewed and closed normally → "CTR - Archived"
- CTR flagged for monitoring by compliance → "CTR - Under Monitoring"
- CTR escalated by Head of Compliance → "CTR - Escalated to Analysis"

---

## 6. Error & Exception Handling

### ERR-PROF-001: Profile Not Found
**Error Condition:** User searches for a subject that does not exist in the system.  
**System Behavior:** System displays "No matching subjects found" message with option to refine search criteria.  
**User Message:** "No subject profiles match your search criteria. Try adjusting your search terms or check for alternate spellings."  
**Recovery Action:** User can modify search terms, use partial matching, or browse recent profiles.

### ERR-PROF-002: Merge Conflict - Conflicting Attributes
**Error Condition:** User attempts to merge two profiles with conflicting attribute values (e.g., different addresses, different dates of birth).  
**System Behavior:** System displays conflict resolution dialog listing all conflicting attributes and their values from each profile.  
**User Message:** "The profiles contain conflicting information. Please select which value to retain for each attribute."  
**Recovery Action:** User selects the correct value for each conflicting attribute before completing merge. All decisions are logged.

### ERR-PROF-003: Access Denied - CTR Restricted
**Error Condition:** Analyst attempts to view CTR details for a subject when access criteria are not met (CTR not escalated and subject not in assigned STR).  
**System Behavior:** System blocks access and displays restriction message. Restricted CTRs appear as placeholder entries with limited metadata.  
**User Message:** "Access Restricted - This CTR is available to Compliance Officers only. You may view this CTR if: (a) it is escalated, or (b) the subject appears in an STR assigned to you."  
**Recovery Action:** Analyst can request access escalation through supervisor or work with Compliance Officer.

### ERR-PROF-004: Relationship Link Validation Failure
**Error Condition:** User attempts to create a relationship link with invalid parameters (missing relationship type, self-referencing link, duplicate link).  
**System Behavior:** System rejects the link creation and displays specific validation error.  
**User Message:** 
- Missing type: "Please select a relationship type."
- Self-reference: "A subject cannot be linked to itself."
- Duplicate: "This relationship already exists between these subjects."  
**Recovery Action:** User corrects the invalid parameter and retries.

### ERR-PROF-005: High-Frequency Flag Calculation Error
**Error Condition:** System encounters error while calculating high-frequency flags (e.g., date parsing error, database timeout).  
**System Behavior:** System logs error, continues processing other profiles, and queues failed profile for retry.  
**User Message:** No direct user message. Admin dashboard displays flag calculation status.  
**Recovery Action:** System automatically retries failed calculations. Admin can manually trigger recalculation if needed.

### ERR-PROF-006: Note Save Failure
**Error Condition:** User attempts to save an investigative note but operation fails (network error, validation error).  
**System Behavior:** System preserves note content in form and displays error message.  
**User Message:** "Unable to save note. Your content has been preserved. Please try again."  
**Recovery Action:** User retries save operation. If persistent, user can copy content and report issue.

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

**NFR-PROF-PERF-1: Profile Page Load Time**  
**Description:** The system shall load subject profile pages within 3 seconds for profiles with up to 50 associated reports under normal load conditions.  
**Measurement Criteria:** 95th percentile page load time ≤ 3 seconds measured from request to full page render.  
**Traceability:** FR-7.3, FR-7.4, FR-7.5

**NFR-PROF-PERF-2: Search Response Time**  
**Description:** The system shall return subject search results within 2 seconds for searches against the full subject database.  
**Measurement Criteria:** 95th percentile search response time ≤ 2 seconds for queries returning up to 100 results.  
**Traceability:** FR-7.1, FR-7.2

**NFR-PROF-PERF-3: Timeline Rendering**  
**Description:** The system shall render transaction timelines within 5 seconds for subjects with up to 100 transactions.  
**Measurement Criteria:** Timeline visualization fully interactive within 5 seconds of page load.  
**Traceability:** FR-7.8

**NFR-PROF-PERF-4: High-Volume Profile Support**  
**Description:** The system shall support subject profiles with up to 500 associated reports without performance degradation.  
**Measurement Criteria:** Profiles with 500 reports load within 10 seconds. Pagination available for report lists exceeding 50 items.  
**Traceability:** FR-7.3, FR-7.5

### 7.2 Security Requirements

**NFR-PROF-SEC-1: Access Control Enforcement**  
**Description:** The system shall enforce CTR access restrictions for analysts with 100% accuracy, preventing unauthorized access to non-escalated CTR data.  
**Measurement Criteria:** Zero unauthorized CTR access incidents. Access control tested on every profile view.  
**Traceability:** FR-7.11

**NFR-PROF-SEC-2: Audit Logging**  
**Description:** The system shall log all profile access, merges, relationship links, and note additions with user identity, timestamp, and action details.  
**Measurement Criteria:** All actions logged within 1 second of completion. Logs are immutable and retained for 10 years.  
**Traceability:** FR-7.6, FR-7.7, FR-7.10

**NFR-PROF-SEC-3: Data Confidentiality**  
**Description:** The system shall protect subject profile data from unauthorized access using role-based access control aligned with FATF Recommendation 29 confidentiality requirements.  
**Measurement Criteria:** All profile data access requires authentication. Data encrypted at rest and in transit.  
**Traceability:** All FRs

### 7.3 Usability Requirements

**NFR-PROF-USAB-1: Search Functionality**  
**Description:** The system shall provide intuitive search with support for partial name matching, ID number search, and account number search.  
**Measurement Criteria:** Users can find subjects within 3 search attempts for 95% of searches.  
**Traceability:** FR-7.1, FR-7.2

**NFR-PROF-USAB-2: Profile Navigation**  
**Description:** The system shall provide clear navigation between subject profiles, associated reports, and relationship links.  
**Measurement Criteria:** Users can navigate from profile to any linked content within 2 clicks.  
**Traceability:** FR-7.3, FR-7.7

**NFR-PROF-USAB-3: Timeline Interactivity**  
**Description:** The system shall provide interactive timeline with zoom, pan, and drill-down to transaction details.  
**Measurement Criteria:** All timeline interactions respond within 500ms.  
**Traceability:** FR-7.8

### 7.4 Scalability Requirements

**NFR-PROF-SCALE-1: Subject Volume Growth**  
**Description:** The system shall support growth to 100,000 subject profiles without architecture changes.  
**Measurement Criteria:** Search and retrieval performance maintained as profile count grows.  
**Traceability:** FR-7.1, FR-7.2

**NFR-PROF-SCALE-2: Concurrent Users**  
**Description:** The system shall support 50 concurrent users accessing subject profiles without performance degradation.  
**Measurement Criteria:** Response times maintained with 50 concurrent profile views and searches.  
**Traceability:** All FRs

### 7.5 Compliance Requirements

**NFR-PROF-COMPLY-1: Audit Trail Completeness**  
**Description:** The system shall maintain complete audit trails for all profile merges and relationship links to support internal and external audits.  
**Measurement Criteria:** Audit logs contain all required fields (user, timestamp, action, before/after state). Logs exportable for audit review.  
**Traceability:** FR-7.6, FR-7.7

**NFR-PROF-COMPLY-2: Data Retention**  
**Description:** The system shall retain all subject profile data and associated audit logs for minimum 10 years per Liberian AML/CFT regulations.  
**Measurement Criteria:** No data automatically purged within retention period. Retention policies enforced automatically.  
**Traceability:** All FRs

---

## 8. Acceptance Criteria

**AC-7.1: Subject Profile Display with Mixed Report Types**  
Given a subject "John Mensah" appears in 2 STRs, 3 CTRs (1 escalated), over 8 months, when an analyst searches "John Mensah," then the system displays a profile showing all 5 reports with dates, transaction totals, and report type labels (STR, CTR, Escalated CTR).  
**Traceability:** FR-7.1, FR-7.3, FR-7.5, FR-7.12

**AC-7.2: Profile Merge Consolidation**  
Given two profiles "ABC Trading Co." and "ABC Trading Company Ltd." refer to the same entity, when an analyst merges them, then all reports (STRs and CTRs) from both profiles appear under a single consolidated profile.  
**Traceability:** FR-7.6

**AC-7.3: High-Frequency Flagging**  
Given a subject appears in 4 reports (2 STRs, 2 CTRs) within 5 months, when the analyst views the subject list, then the subject appears with a "High Frequency" flag.  
**Traceability:** FR-7.9

**AC-7.4: CTR Access Control - Analyst with Assigned STR**  
Given an analyst is assigned an STR mentioning subject "Sarah Konneh," when viewing Sarah's profile, then the analyst can see historical CTRs involving Sarah only if those CTRs were escalated or Sarah appears in the assigned STR.  
**Traceability:** FR-7.11

**AC-7.5: CTR Access Control - Role Differentiation**  
Given a subject profile contains 2 non-escalated CTRs and 3 STRs, when a compliance officer (not analyst) views the profile, then they see all 5 reports; when an analyst views the profile, they see only the 3 STRs unless the CTRs were escalated.  
**Traceability:** FR-7.11, FR-7.12

---

## 9. Edge Cases

1. **Subject name spelled differently across reports**
   - System relies on exact identifier matching for auto-linking; analysts must manually merge profiles with name variations

2. **Multiple subjects with same common name but different IDs**
   - System creates separate profiles; analysts can verify and merge if appropriate

3. **Subject appearing in 100+ reports (performance)**
   - System implements pagination and lazy loading; timeline shows aggregated view with drill-down

4. **Profile merge with conflicting attribute values**
   - System prompts user to resolve conflicts; all decisions logged

5. **Analyst attempts to access subject profile containing only non-escalated CTRs**
   - System displays profile with restricted view; CTRs hidden or marked as restricted

---

## 10. Glossary

**Subject Profile:** A persistent record representing a person, company, or account that has appeared in one or more STRs or CTRs, aggregating all associated reports and attributes.

**STR (Suspicious Transaction Report):** A report filed when a transaction appears suspicious and may indicate money laundering, terrorist financing, or other financial crimes.

**CTR (Currency Transaction Report):** A report filed for large cash transactions above a defined threshold, typically used for compliance monitoring.

**Escalated CTR:** A CTR that has been elevated from the compliance workflow to the analysis workflow due to suspicious patterns or compliance officer recommendation.

**High-Frequency Activity:** A designation applied to subjects appearing in 3 or more reports within a 6-month rolling period, indicating potential patterns requiring analyst attention.

**Profile Merge:** The process of consolidating two or more subject profiles that represent the same real-world person, company, or account into a single unified profile.

**Relationship Link:** A defined connection between two subject profiles indicating their real-world relationship (e.g., Company Director, Spouse, Business Partner).

**Transaction Timeline:** A visual chronological representation of all transactions associated with a subject across all reports, enabling pattern identification.

---

## 11. Dependencies

### 11.1 Prerequisites

**D-1: User Authentication (Feature 1)**  
Users must be authenticated before accessing subject profiles. Role-based access control determines CTR visibility.

**D-2: Digital Submission (Features 2 & 3)**  
Subject profiles are created from data in submitted reports (Excel or API).

**D-3: Automated Validation (Feature 4)**  
Subject profile creation triggers after reports pass automated validation.

**D-4: Manual Validation (Feature 5)**  
Reports must complete validation before subjects are fully profiled.

**D-5: Task Assignment (Feature 6)**  
CTR access control for analysts depends on STR assignment context from workload distribution.

### 11.2 Downstream Dependencies

**D-6: Rule-Based Analysis (Feature 8)**  
Subject profiles support alert generation based on subject activity patterns.

**D-7: Network Visualization (Feature 17)**  
Relationship links created in subject profiling feed network visualization capabilities.

---

## 12. Open Issues & Decisions Pending

| Issue ID | Description | Impact | Assigned To | Target Date |
|----------|-------------|--------|-------------|-------------|
| ISS-PROF-001 | Define complete catalog of relationship link types beyond initial set | Affects FR-7.7, BR-7.6 | Product Manager | TBD |
| ISS-PROF-002 | Determine performance optimization approach for profiles with 500+ reports | Affects NFR-PROF-PERF-4 | Technical Lead | TBD |
| ISS-PROF-003 | Clarify merge conflict resolution for complex attribute conflicts (e.g., multiple addresses) | Affects FR-7.6, BR-7.5 | Business Analyst | TBD |
| ISS-PROF-004 | Define retention policy for merged/superseded profile data | Affects NFR-PROF-COMPLY-2 | Compliance Manager | TBD |

---

## 13. Traceability Matrix

| FRD Requirement | PRD Source | Acceptance Criteria | Business Rules |
|-----------------|------------|---------------------|----------------|
| FR-7.1 | PRD FR-7.1 | AC-7.1 | BR-7.1 |
| FR-7.2 | PRD FR-7.2 | AC-7.1 | BR-7.2 |
| FR-7.3 | PRD FR-7.3 | AC-7.1 | BR-7.4 |
| FR-7.4 | PRD FR-7.4 | AC-7.1 | - |
| FR-7.5 | PRD FR-7.5 | AC-7.1 | - |
| FR-7.6 | PRD FR-7.6 | AC-7.2 | BR-7.5 |
| FR-7.7 | PRD FR-7.7 | - | BR-7.6 |
| FR-7.8 | PRD FR-7.8 | - | BR-7.4 |
| FR-7.9 | PRD FR-7.9 | AC-7.3 | BR-7.3 |
| FR-7.10 | PRD FR-7.10 | - | - |
| FR-7.11 | PRD FR-7.11 | AC-7.4, AC-7.5 | BR-7.4 |
| FR-7.12 | PRD FR-7.12 | AC-7.1, AC-7.5 | BR-7.7 |

---

## 14. Approval

**Prepared by:** Senior Business Analyst  
**Reviewed by:** [To be filled]  
**Approved by:** [To be filled]  
**Date:** [To be filled]

---

## 15. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | Senior Business Analyst | Initial FRD created from PRD v1.0 |

---

**Document End**
