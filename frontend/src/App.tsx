import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/features/auth/store/AuthContext";
import { SettingsProvider } from "@/features/settings/SettingsContext";
import { router } from "@/router";

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        {/* Global toast notifications */}
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
