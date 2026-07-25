/**
 * Leaves service — wraps all leave-related API calls.
 */
import apiClient from "@/api/client";
import { LEAVE_ENDPOINTS } from "@/api/endpoints";
import type { LeaveType, LeaveRequest, LeaveBalance } from "@/types";
import type { PaginatedResponse } from "@/types";
import type {
  CreateLeaveRequestPayload,
  ReviewLeaveRequestPayload,
  LeaveRequestFilters,
} from "../types";

export const leavesService = {
  // ─── Leave Types ─────────────────────────────
  async getLeaveTypes(): Promise<LeaveType[]> {
    const { data } = await apiClient.get<LeaveType[]>(LEAVE_ENDPOINTS.TYPES);
    return data;
  },

  // ─── Leave Requests ───────────────────────────
  async getLeaveRequests(
    filters?: LeaveRequestFilters
  ): Promise<PaginatedResponse<LeaveRequest>> {
    const { data } = await apiClient.get<PaginatedResponse<LeaveRequest>>(
      LEAVE_ENDPOINTS.REQUESTS,
      { params: filters }
    );
    return data;
  },

  async getLeaveRequest(id: number): Promise<LeaveRequest> {
    const { data } = await apiClient.get<LeaveRequest>(
      LEAVE_ENDPOINTS.REQUEST_DETAIL(id)
    );
    return data;
  },

  async createLeaveRequest(
    payload: CreateLeaveRequestPayload
  ): Promise<LeaveRequest> {
    const { data } = await apiClient.post<LeaveRequest>(
      LEAVE_ENDPOINTS.REQUESTS,
      payload
    );
    return data;
  },

  async approveLeaveRequest(
    id: number,
    payload: ReviewLeaveRequestPayload = {}
  ): Promise<LeaveRequest> {
    const { data } = await apiClient.post<LeaveRequest>(
      LEAVE_ENDPOINTS.REQUEST_APPROVE(id),
      payload
    );
    return data;
  },

  async rejectLeaveRequest(
    id: number,
    payload: ReviewLeaveRequestPayload = {}
  ): Promise<LeaveRequest> {
    const { data } = await apiClient.post<LeaveRequest>(
      LEAVE_ENDPOINTS.REQUEST_REJECT(id),
      payload
    );
    return data;
  },

  async cancelLeaveRequest(id: number): Promise<LeaveRequest> {
    const { data } = await apiClient.post<LeaveRequest>(
      LEAVE_ENDPOINTS.REQUEST_CANCEL(id)
    );
    return data;
  },

  // ─── Leave Balances ───────────────────────────
  async getLeaveBalances(): Promise<LeaveBalance[]> {
    const { data } = await apiClient.get<LeaveBalance[]>(
      LEAVE_ENDPOINTS.BALANCES
    );
    return data;
  },
};
