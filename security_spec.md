# Security Specification: NexusHR Firestore Database

## 1. Data Invariants
1. **Identity & Role Enforcement**: Non-admin users cannot elevate their own role to 'admin' or 'manager'. Admin privileges are verified against server-authenticated user email (`voicu.dragan@interqas.com`) or role documents.
2. **Onboarding Tasks**: Tasks can only be modified by the assigned employee, their department manager, or an administrator.
3. **Leave Requests**: Only managers and admins can change the status of a leave request to 'approved' or 'rejected'. Employees can only submit their own leave requests with initial status 'pending'.
4. **Performance Reviews**: Only assigned reviewers or administrators can submit final evaluation scores. Self-review comments are editable only by the subject employee prior to final submission.
5. **Payroll Records**: Employees can only read their own compensation records. Only administrators can create, update, or disburse payroll records. Managers have aggregate departmental visibility.
6. **Mobility & Promotions**: Promotion nominations require manager or admin initiation. Status changes to 'approved' can only be executed by administrators.
7. **Notifications**: Targeted users or administrators can mark notifications as read.
8. **Size & Schema Limits**: Every string input is bounded (e.g., ID <= 128 characters, reason <= 500 characters, reviews <= 1000 characters).

## 2. The "Dirty Dozen" Malicious Payloads

1. **Role Escalation via Profile Update**:
   - Payload: `{ "id": "emp_02", "role": "admin" }` by an unverified/employee session.
   - Expected Result: `PERMISSION_DENIED`.

2. **Self-Approval of Leave Request**:
   - Payload: `{ "id": "lr_101", "employeeId": "emp_02", "status": "approved" }` executed by `emp_02`.
   - Expected Result: `PERMISSION_DENIED`.

3. **Payroll Manipulation Attack**:
   - Payload: `{ "id": "pay_99", "employeeId": "emp_02", "netSalary": 999999 }` submitted by non-admin.
   - Expected Result: `PERMISSION_DENIED`.

4. **Unauthorized Reading of Other Employee's Payslip**:
   - Operation: `getDoc(/payroll_records/pay_ceo)` by `emp_02`.
   - Expected Result: `PERMISSION_DENIED`.

5. **Resource Exhaustion String Injection (Denial of Wallet)**:
   - Payload: `{ "title": "A".repeat(50000), "category": "it_setup" }`.
   - Expected Result: `PERMISSION_DENIED`.

6. **ID Path Variable Poisoning**:
   - Document ID: `/employees/../../malicious_path!@#$`.
   - Expected Result: `PERMISSION_DENIED`.

7. **Tampering with Finalized Performance Review**:
   - Payload: `{ "overallRating": 5, "status": "finalized" }` attempted on an already finalized review document.
   - Expected Result: `PERMISSION_DENIED`.

8. **Ghost Field / Shadow Key Injection**:
   - Payload: `{ "id": "lr_102", "employeeId": "emp_02", "status": "pending", "__adminBypass": true }`.
   - Expected Result: `PERMISSION_DENIED`.

9. **Self-Promotion Approval**:
   - Payload: `{ "id": "mob_01", "status": "approved", "proposedTitle": "VP of Engineering" }` by the candidate.
   - Expected Result: `PERMISSION_DENIED`.

10. **Orphaned Leave Request with Fake Employee ID**:
    - Payload: `{ "employeeId": "non_existent_user_999", "status": "pending" }`.
    - Expected Result: `PERMISSION_DENIED`.

11. **Spoofed Admin Email without Verification**:
    - Request: Auth token with email `voicu.dragan@interqas.com` but `email_verified == false`.
    - Expected Result: `PERMISSION_DENIED`.

12. **Blanket Query Scraping**:
    - Operation: `collection('payroll_records').get()` as regular employee without proper filter.
    - Expected Result: `PERMISSION_DENIED`.
