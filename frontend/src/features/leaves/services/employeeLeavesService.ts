/**
 * Employee Leaves Service — Phase 2 API integration.
 *
 * Wraps the employee-facing leave endpoints:
 *   GET    /api/v1/leaves/              → list own leaves (paginated)
 *   POST   /api/v1/leaves/              → apply for leave
 *   GET    /api/v1/leaves/{id}/         → get leave detail
 *   PATCH  /api/v1/leaves/{id}/cancel/  → cancel pending leave
 *
 * Important: These endpoints only work for EMPLOYEE role.
 * The cancel action uses PATCH (not POST).
 * Responses are wrapped in {success, message, data} envelope.
 */
import apiClient from "@/api/client";
import { EMPLOYEE_LEAVE_ENDPOINTS } from "@/api/endpoints";
import type { LeaveRequest, PaginatedResponse, ApiResponse } from "@/types";
import type { ApplyLeavePayload, EmployeeLeaveFilters } from "../types";

export const employeeLeavesService = {
  /**
   * Fetch the authenticated employee's leave history (paginated).
   * Supports filtering by status, start_date, end_date and search by reason/status.
   */
  async getMyLeaves(
    filters?: EmployeeLeaveFilters
  ): Promise<PaginatedResponse<LeaveRequest>> {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<LeaveRequest>>
    >(EMPLOYEE_LEAVE_ENDPOINTS.LIST, { params: filters });

    // Unwrap the {success, message, data: {...pagination}} envelope
    return data.data;
  },

  /**
   * Get full detail of a single leave request.
   */
  async getLeaveDetail(id: number): Promise<LeaveRequest> {
    const { data } = await apiClient.get<ApiResponse<LeaveRequest>>(
      EMPLOYEE_LEAVE_ENDPOINTS.DETAIL(id)
    );
    return data.data;
  },

  /**
   * Submit a new leave request.
   * Backend enforces: no past dates, end >= start, no overlap, annual limit.
   */
  async applyLeave(payload: ApplyLeavePayload): Promise<LeaveRequest> {
    const { data } = await apiClient.post<ApiResponse<LeaveRequest>>(
      EMPLOYEE_LEAVE_ENDPOINTS.LIST,
      payload
    );
    return data.data;
  },

  /**
   * Cancel a PENDING leave request.
   * Uses PATCH (not POST) as defined by the Phase 2 backend.
   */
  async cancelLeave(id: number): Promise<LeaveRequest> {
    const { data } = await apiClient.patch<ApiResponse<LeaveRequest>>(
      EMPLOYEE_LEAVE_ENDPOINTS.CANCEL(id)
    );
    return data.data;
  },
};
