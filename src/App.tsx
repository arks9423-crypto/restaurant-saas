import '@/shared/lib/i18n'
import { useAuthInit } from '@/features/auth/hooks/useAuth'
import { AppRouter } from '@/app/Router'

export default function App() {
  useAuthInit()
  return <AppRouter />
}
