import { AppRouter } from './app/AppRouter'
import { AuthBootstrap } from './store'

function App() {
  return (
    <>
      <AuthBootstrap />
      <AppRouter />
    </>
  )
}

export default App
