/**
 * NotFoundPage — 404 page.
 */
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-8">
      <p className="text-7xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
