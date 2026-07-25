/**
 * ApplyLeaveForm — React Hook Form + Zod form for applying for leave.
 *
 * Features:
 * - start_date, end_date (date inputs with min constraint)
 * - reason (optional textarea)
 * - Client-side validation (no past dates, end >= start)
 * - Backend error display
 * - Loading state on submit button
 * - Success callback
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

  // Today's date as YYYY-MM-DD for min attribute
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
      // Try to extract field-level backend errors
      const axiosErr = err as {
        response?: { data?: { message?: string; errors?: Record<string, string | string[]> } };
      };
      const msg = axiosErr.response?.data?.message ?? getErrorMessage(err);
      setBackendError(msg);
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Apply for Leave</h2>
          <p className="text-xs text-muted-foreground">
            Submit a new leave request for approval
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5" noValidate>
        {/* Backend error */}
        {backendError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/8 p-3.5 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{backendError}</p>
          </div>
        )}

        {/* Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Start Date <span className="text-destructive">*</span>
            </label>
            <input
              id="start_date"
              type="date"
              min={today}
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.start_date
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
              }`}
              {...register("start_date")}
            />
            {errors.start_date && (
              <p className="mt-1 text-xs text-destructive">
                {errors.start_date.message}
              </p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              End Date <span className="text-destructive">*</span>
            </label>
            <input
              id="end_date"
              type="date"
              min={startDate || today}
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.end_date
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
              }`}
              {...register("end_date")}
            />
            {errors.end_date && (
              <p className="mt-1 text-xs text-destructive">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Reason{" "}
            <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <textarea
            id="reason"
            rows={4}
            placeholder="Briefly describe the reason for your leave..."
            disabled={isSubmitting}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground disabled:opacity-60"
            {...register("reason")}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Submit Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
