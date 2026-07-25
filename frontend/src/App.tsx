import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/store/AuthContext";
import { router } from "@/router";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      {/* Global toast notifications */}
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}

export default App;
