import { AppRouter } from './app/AppRouter'
import { AuthProvider } from './state/AuthContext'
import { SecurityCodeProvider } from './state/SecurityCodeContext'

function App() {
  return (
    <AuthProvider>
      <SecurityCodeProvider>
        <AppRouter />
      </SecurityCodeProvider>
    </AuthProvider>
  )
}

export default App
