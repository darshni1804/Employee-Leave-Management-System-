/**
 * LoginPage — Production-ready Authentication Page.
 *
 * Features:
 * - Email / Employee ID login
 * - React Hook Form + Zod schema validation
 * - Loading spinner & state
 * - Backend validation error alerts
 * - Demo account Quick-Fill helper for testing
 */
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";

import { useAuth } from "@/features/auth/store/AuthContext";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { getErrorMessage } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { TechnodhaLogo } from "@/components/shared/TechnodhaLogo";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Destination path after successful login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email_or_employee_id: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setErrorMessage(null);
      const user = await login(values.email_or_employee_id, values.password);
      
      // Redirect based on role or back to intended location
      if (user.role === "MANAGER" || user.role === "ADMIN") {
        navigate(from === "/dashboard" ? "/dashboard" : from, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
    }
  };

  const handleQuickFill = (identifier: string, pass: string) => {
    setValue("email_or_employee_id", identifier, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setErrorMessage(null);
  };

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-lg transition-all duration-200">
      <div className="mb-6 flex flex-col items-center justify-center text-center">
        <TechnodhaLogo size="lg" className="mb-4" />
        <h2 className="text-xl font-bold tracking-tight">Sign In to Technodha LeaveMate</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your Email address or Employee ID to continue
        </p>
      </div>

      {/* Backend Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive animate-fade-in"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Authentication Error</p>
            <p className="mt-0.5 opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email or Employee ID Input */}
        <div>
          <label
            htmlFor="email_or_employee_id"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Email or Employee ID
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <input
              id="email_or_employee_id"
              type="text"
              placeholder="e.g. employee@example.com or EMP001"
              autoComplete="username"
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email_or_employee_id
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
              }`}
              {...register("email_or_employee_id")}
            />
          </div>
          {errors.email_or_employee_id && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email_or_employee_id.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.password
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" label="Signing in..." />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick-Fill Assistant */}
      <div className="mt-8 border-t pt-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 text-center">
          Test Accounts (Click to Autofill)
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickFill("employee@example.com", "Password123!")}
            className="flex flex-col items-start p-2.5 rounded-lg border bg-accent/30 hover:bg-accent hover:border-primary/40 transition-all text-left"
          >
            <span className="font-semibold text-primary">Employee Role</span>
            <span className="text-muted-foreground truncate w-full">EMP001</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("manager@example.com", "Password123!")}
            className="flex flex-col items-start p-2.5 rounded-lg border bg-accent/30 hover:bg-accent hover:border-primary/40 transition-all text-left"
          >
            <span className="font-semibold text-primary">Manager Role</span>
            <span className="text-muted-foreground truncate w-full">MGR001</span>
          </button>
        </div>
      </div>
    </div>
  );
}
