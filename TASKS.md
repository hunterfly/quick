# TASKS.md - PR System MVP

## Progress Overview

| Feature                        | Status |
| ------------------------------ | ------ |
| 1. Project Setup               | ✅     |
| 2. Database Design             | ✅     |
| 3. User Authentication & Roles | ✅     |
| 4. Create & Submit PR          | ✅     |
| 5. Basic Approval Workflow     | ✅     |
| 6. Auto-Approval (Threshold)   | ☐      |
| 7. Admin Configuration         | ☐      |
| 8. Testing & QA                | ☐      |

---

## 1. Project Setup

- [x] Initialize project (backend + frontend)
- [x] Setup database connection
- [x] Setup project structure and folder organization
- [x] Configure environment variables
- [x] Setup linting and formatting tools

---

## 2. Database Design

- [x] Design and create `users` table (id, name, email, role)
- [x] Design and create `pr_requests` table (id, pr_number, requester_id, status, total_amount, created_at, submitted_at)
- [x] Design and create `pr_items` table (id, pr_id, item_name, quantity, unit_price, total_price, required_date)
- [x] Design and create `pr_approvals` table (id, pr_id, approver_id, level, action, comment, created_at)
- [x] Design and create `approval_rules` table (id, min_amount, max_amount, required_levels)
- [x] Design and create `attachments` table (id, pr_id, file_path, file_name)

---

## 3. User Authentication & Roles

- [x] Implement user login/register
- [x] Define roles: Employee, Manager, Finance, Admin
- [x] Implement role-based access control (RBAC)
- [x] Create middleware for authentication (proxy.ts)
- [x] Create middleware for role authorization

---

## 4. Create & Submit PR (Feature 1)

### 4.1 PR Form UI

- [x] Create PR form page
- [x] Add item input fields (item name, quantity, unit price)
- [x] Implement auto-calculate total price (quantity × unit price)
- [x] Add required date field
- [x] Add attachment upload (optional)
- [x] Implement add/remove multiple items
- [x] Add note to PR

### 4.2 PR Business Logic

- [x] Implement PR number auto-generation
- [x] Implement save as draft functionality
- [x] Implement submit PR functionality
- [x] Define PR status: Draft, Submitted, Approved, Rejected
- [x] Validate required fields before submit

### 4.3 PR List & View

- [x] Create "My PR" list page (Employee view)
- [x] Create PR detail page
- [x] Show PR status with visual indicator
- [x] Allow edit draft PR

---

## 5. Basic Approval Workflow (Feature 2)

### 5.1 Approver UI

- [x] Create "Pending Approvals" list page
- [x] Create approval action page (Approve / Reject)
- [x] Add reject comment field
- [x] Show approval history on PR detail

### 5.2 Approval Logic

- [x] Implement approval flow (Level 1 → Level 2)
- [x] Implement approve action
- [x] Implement reject action (PR rejected at any level)
- [x] Record approval history per PR
- [x] Update PR status on approval completion
- [x] Notify requester of status change (basic)

---

## 6. Auto-Approval Based on Amount (Feature 3)

- [ ] Create threshold configuration (default rules):
  - Below 3,000 THB → Auto Approved
  - 3,000 – 20,000 THB → Manager Approval
  - Above 20,000 THB → Manager + Finance Approval
- [ ] Implement auto-calculate total PR amount from items
- [ ] Implement rule checking on PR submit
- [ ] Implement auto-approve logic (skip approval if < threshold)
- [ ] Log auto-approval in approval history

---

## 7. Admin Configuration

- [ ] Create admin dashboard page
- [ ] Implement threshold amount settings UI
- [ ] Implement assign approvers UI
- [ ] Implement save/update approval rules
- [ ] Implement user management (basic list)

---

## 8. Testing & QA

### Unit Tests

- [ ] Test PR creation logic
- [ ] Test PR submit validation
- [ ] Test auto-calculate total
- [ ] Test approval flow logic
- [ ] Test auto-approval threshold logic
- [ ] Test PR number generation

### Integration Tests

- [ ] Test full PR flow: Create → Submit → Auto-approve
- [ ] Test full PR flow: Create → Submit → Manager Approve
- [ ] Test full PR flow: Create → Submit → Manager Approve → Finance Approve
- [ ] Test full PR flow: Create → Submit → Manager Reject

### E2E / Manual Testing

- [ ] Test Employee workflow
- [ ] Test Manager workflow
- [ ] Test Finance workflow
- [ ] Test Admin configuration
- [ ] Verify success criteria from PRD §6

---

## Definition of Done

MVP is complete when:

1. ✅ Employee can create PR without help from procurement
2. ✅ Manager can approve PR in less than 1 minute
3. ✅ Small PR requests (< 3,000 THB) are auto-approved
4. ✅ Full workflow works without manual intervention
