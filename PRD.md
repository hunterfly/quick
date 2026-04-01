# Product Requirements Document (PRD)

## PR (Purchase Requisition) System – MVP Version

---

## 1. Overview

### 1.1 Purpose

This document defines the **MVP (Minimum Viable Product)** requirements for a Purchase Requisition (PR) system. The goal of this version is to launch a simple but usable system that allows employees to create PR requests and get them approved using a basic workflow.

### 1.2 MVP Goal

Deliver the smallest usable version that:

* Employees can create and submit PR
* Managers can approve or reject PR
* The system supports simple approval rules based on amount

---

## 2. MVP Scope

### In Scope (Phase 1)

Only the following 3 core features will be included:

1. Create and Submit PR
2. Basic Multi‑Level Approval (1–2 levels)
3. Auto‑Approval based on amount (Threshold)

### Out of Scope (Later Phase)

* Vendor management
* Purchase Order (PO)
* Budget control
* Inventory integration
* Reporting dashboard
* Advanced workflow rules

---

## 3. MVP Core Features

### 3.1 Create and Submit Purchase Request

#### Description

Employees must be able to create a PR easily and submit it for approval.

#### Functional Requirements

* User can create a new PR
* User can add multiple items in one PR
* Required fields:

  * Item name
  * Quantity
  * Unit price
  * Total price (auto‑calculated)
  * Required date
  * Attachment (optional)
* User can save draft
* User can submit PR
* System generates PR number automatically

#### PR Status (MVP Version)

* Draft
* Submitted
* Approved
* Rejected

---

### 3.2 Basic Approval Workflow (1–2 Levels Only)

#### Description

The MVP will support a simple approval flow with only 1 or 2 approvers.

#### Example Flow

* If PR value is small → Manager approval only
* If PR value is high → Manager + Finance approval

#### Functional Requirements

* Approver can:

  * Approve
  * Reject
* System records approval history
* System shows current status to requester

---

### 3.3 Auto‑Approval Based on Amount (Threshold)

#### Description

Small purchase requests should be automatically approved to reduce manual work.

#### Example Rules (MVP)

* Below 3,000 THB → Auto Approved
* 3,000 – 20,000 THB → Manager Approval
* Above 20,000 THB → Manager + Finance Approval

#### Functional Requirements

* System calculates total PR value automatically
* System checks threshold rules when user submits PR
* If amount matches auto‑approval rule → PR is approved automatically

---

## 4. User Roles (MVP)

### 4.1 Employee (Requester)

* Create PR
* Edit draft PR
* Submit PR
* View status

### 4.2 Approver (Manager / Finance)

* View assigned PR
* Approve PR
* Reject PR

### 4.3 Admin (Basic Only)

* Set approval threshold amounts
* Assign approvers

---

## 5. MVP User Flow

### Step 1: Employee Creates PR

* Employee clicks "Create PR"
* Adds item(s)
* Submits PR

### Step 2: System Checks Rules

* If amount < threshold → Auto Approved
* If amount ≥ threshold → Send to approver

### Step 3: Approval

* Manager approves → Done
* If second level required → Send to Finance

---

## 6. MVP Success Criteria

The MVP will be considered successful if:

* Employees can create PR without help from procurement team
* Managers can approve PR in less than 1 minute
* Small PR requests are automatically approved
* The full workflow works without manual intervention

---

## 7. Future Phase (After MVP)

After the MVP is stable, the next features can be added:

* Advanced multi‑level workflow
* Notification system (email / in‑app)
* Budget validation
* Vendor and PO module
* Dashboard & reporting

---

## 8. Summary

This MVP focuses only on **3 simple but critical features**:

1. Create PR
2. Approve PR
3. Auto‑approval based on amount

The goal is fast launch, fast testing with real users, and fast iteration.

