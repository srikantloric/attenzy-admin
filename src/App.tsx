import { RouterProvider } from 'react-router-dom';

// project-imports
import router from '@/routes';

// auth-provider
import { AWSCognitoProvider as AuthProvider } from '@/contexts/AWSCognitoContext';
import { ThemeProvider } from './components/theme-provider';

function App() {

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}

export default App
