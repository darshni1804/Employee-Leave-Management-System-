/**
 * UnauthorizedPage — shown when user lacks the required role.
 */
import { Link, useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-8">
      <ShieldX className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground max-w-sm">
        You do not have permission to view this page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          Go Back
        </button>
        <Link
          to="/dashboard"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
