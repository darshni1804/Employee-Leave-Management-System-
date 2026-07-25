# Application Screenshots Guide

This directory contains screenshots demonstrating the key features and pages of the Employee Leave Management System.

---

## Screen Overview

### 1. Login Page (`login_page.png`)
- **Route:** `/login`
- **Features:** Email/Employee ID login, password visibility toggle, Zod client-side validation, error alerts, test account quick-fill buttons for Employee and Manager roles.

### 2. Employee Dashboard (`employee_dashboard.png`)
- **Route:** `/dashboard` (as `EMPLOYEE` role)
- **Features:** Stat cards for Remaining Leave (out of 20 days), Approved Leaves count, Pending Leaves count, recent activity log, and quick "Apply for Leave" action button.

### 3. Apply Leave Page (`apply_leave.png`)
- **Route:** `/leaves` -> "Apply Leave" tab
- **Features:** React Hook Form + Zod date picker inputs, reason textarea, validation against past dates & end < start, inline validation errors, success toast notification.

### 4. Leave History Page (`leave_history.png`)
- **Route:** `/leaves` -> "My Leaves" tab
- **Features:** Responsive data table, color-coded status badges (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`), search input, status filter, date range filters, pagination controls, cancel button for pending requests.

### 5. Manager Dashboard (`manager_dashboard.png`)
- **Route:** `/dashboard` or `/approvals` (as `MANAGER` or `ADMIN` role)
- **Features:** Organizational leave metrics (Pending Requests, Approved Today, Total Employees, Approved Total, Rejected Total, Cancelled Total), real-time summary.

### 6. Manager Requests Review (`manager_requests.png`)
- **Route:** `/approvals` or `/team/leaves`
- **Features:** Responsive table showing all employee requests, search by employee name/ID/email/reason, status filter, date range filter, pagination, Approve and Reject action buttons (visible only for `PENDING` status), and approval/rejection modal dialog with optional comments.
