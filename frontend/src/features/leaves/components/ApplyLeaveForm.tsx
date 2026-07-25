/**
 * ApplyLeaveForm — Form for applying for leave matching Reference Image 3 design system.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, AlertCircle, Send } from "lucide-react";
import { applyLeaveSchema, type ApplyLeaveFormValues } from "@/lib/validations";
import { employeeLeavesService } from "../services/employeeLeavesService";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { LeaveRequest } from "@/types";

interface ApplyLeaveFormProps {
  onSuccess?: (leave: LeaveRequest) => void;
}

export function ApplyLeaveForm({ onSuccess }: ApplyLeaveFormProps) {
  const { toast } = useToast();
  const [backendError, setBackendError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      start_date: "",
      end_date: "",
      reason: "",
    },
  });

  const startDate = watch("start_date");

  const onSubmit = async (values: ApplyLeaveFormValues) => {
    setBackendError(null);
    try {
      const newLeave = await employeeLeavesService.applyLeave({
        start_date: values.start_date,
        end_date: values.end_date,
        reason: values.reason ?? "",
      });
      toast.success("Leave request submitted!", "Your request is now pending approval.");
      reset();
      onSuccess?.(newLeave);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      const msg = axiosErr.response?.data?.message ?? getErrorMessage(err);
      setBackendError(msg);
    }
  };

  return (
    <div className="rounded-[18px] border border-[#E5E7EB] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-6 py-5 bg-[#F8FAFC]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-base text-[#111827]">
            Apply for Leave
          </h2>
          <p className="font-sans text-xs text-[#64748B]">
            Submit a new leave request for manager approval
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6" noValidate>
        {/* Backend error */}
        {backendError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{backendError}</p>
          </div>
        )}

        {/* Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Start Date */}
          <div>
            <label
              htmlFor="start_date"
              className="block font-sans text-sm font-medium text-[#374151] mb-2"
            >
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="start_date"
              type="date"
              min={today}
              disabled={isSubmitting}
              className={`w-full h-12 rounded-xl border bg-white px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                errors.start_date
                  ? "border-rose-400 focus:ring-rose-500"
                  : "border-[#D1D5DB]"
              }`}
              {...register("start_date")}
            />
            {errors.start_date && (
              <p className="mt-1.5 text-xs text-rose-600">
                {errors.start_date.message}
              </p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end_date"
              className="block font-sans text-sm font-medium text-[#374151] mb-2"
            >
              End Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="end_date"
              type="date"
              min={startDate || today}
              disabled={isSubmitting}
              className={`w-full h-12 rounded-xl border bg-white px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
                errors.end_date
                  ? "border-rose-400 focus:ring-rose-500"
                  : "border-[#D1D5DB]"
              }`}
              {...register("end_date")}
            />
            {errors.end_date && (
              <p className="mt-1.5 text-xs text-rose-600">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label
            htmlFor="reason"
            className="block font-sans text-sm font-medium text-[#374151] mb-2"
          >
            Reason{" "}
            <span className="text-[#64748B] font-normal">(Optional)</span>
          </label>
          <textarea
            id="reason"
            rows={4}
            placeholder="Briefly describe the reason for your leave request..."
            disabled={isSubmitting}
            className="w-full rounded-xl border border-[#D1D5DB] bg-white p-4 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder:text-[#94A3B8]"
            {...register("reason")}
          />
        </div>

        {/* Submit button with Accent Orange */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 items-center gap-2 rounded-xl bg-[#FF6A00] px-8 text-sm font-semibold text-white shadow-xs hover:bg-[#FF8533] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Leave Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
