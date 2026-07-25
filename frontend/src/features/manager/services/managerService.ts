/**
 * Manager Service — Phase 4 API integration.
 *
 * Wraps manager-facing endpoints:
 *   GET    /api/v1/manager/leaves/              → list all leave requests (paginated)
 *   GET    /api/v1/manager/leaves/{id}/         → retrieve detail
 *   PATCH  /api/v1/manager/leaves/{id}/approve/ → approve pending request
 *   PATCH  /api/v1/manager/leaves/{id}/reject/  → reject pending request
 *   GET    /api/v1/manager/statistics/          → retrieve manager statistics
 */
import apiClient from "@/api/client";
import { MANAGER_LEAVE_ENDPOINTS } from "@/api/endpoints";
import type { LeaveRequest, PaginatedResponse, ApiResponse, ManagerStatistics } from "@/types";
import type { ManagerLeaveFilters, ReviewActionPayload } from "../types";

export const managerService = {
  /**
   * Fetch all leave requests for manager review with pagination, search, and filtering.
   */
  async getLeaveRequests(
    filters?: ManagerLeaveFilters
  ): Promise<PaginatedResponse<LeaveRequest>> {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<LeaveRequest>>
    >(MANAGER_LEAVE_ENDPOINTS.LIST, { params: filters });

    return data.data;
  },

  /**
   * Fetch detail of a single leave request.
   */
  async getLeaveDetail(id: number): Promise<LeaveRequest> {
    const { data } = await apiClient.get<ApiResponse<LeaveRequest>>(
      MANAGER_LEAVE_ENDPOINTS.DETAIL(id)
    );
    return data.data;
  },

  /**
   * Approve a PENDING leave request.
   */
  async approveLeave(id: number, payload?: ReviewActionPayload): Promise<LeaveRequest> {
    const { data } = await apiClient.patch<ApiResponse<LeaveRequest>>(
      MANAGER_LEAVE_ENDPOINTS.APPROVE(id),
      payload ?? {}
    );
    return data.data;
  },

  /**
   * Reject a PENDING leave request.
   */
  async rejectLeave(id: number, payload?: ReviewActionPayload): Promise<LeaveRequest> {
    const { data } = await apiClient.patch<ApiResponse<LeaveRequest>>(
      MANAGER_LEAVE_ENDPOINTS.REJECT(id),
      payload ?? {}
    );
    return data.data;
  },

  /**
   * Fetch manager statistics.
   */
  async getStatistics(): Promise<ManagerStatistics> {
    const { data } = await apiClient.get<ApiResponse<ManagerStatistics>>(
      MANAGER_LEAVE_ENDPOINTS.STATISTICS
    );
    return data.data;
  },
};
