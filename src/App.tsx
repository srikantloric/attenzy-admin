import { RouterProvider } from "react-router-dom";

// project-imports
import router from "@/routes";

// auth-provider
import { AWSCognitoProvider as AuthProvider } from "@/contexts/AWSCognitoContext";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
