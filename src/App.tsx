import { RouterProvider } from 'react-router-dom';

// project-imports
import router from '@/routes';

// auth-provider
// import { FirebaseProvider as AuthProvider } from '@/contexts/FirebaseContext';
import { AWSCognitoProvider as AuthProvider } from '@/contexts/AWSCognitoContext';

function App() {

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  )
}

export default App
