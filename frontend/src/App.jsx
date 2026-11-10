import { RouterProvider } from 'react-router'
import { AuthProvider } from './features/auth/auth.context'
import { NotificationProvider } from './features/shared/components/NotificationProvider'
import { router } from './AppRoutes'

const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  )
}

export default App
