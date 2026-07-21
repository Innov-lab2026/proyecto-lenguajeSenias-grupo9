import { Redirect } from 'expo-router'
import { useSessionStore } from '@/src/store/sessionStore'

export default function IndexRoute() {
  const status = useSessionStore((state) => state.status)

  return <Redirect href={status === 'authenticated' ? '/home' : '/login'} />
}
