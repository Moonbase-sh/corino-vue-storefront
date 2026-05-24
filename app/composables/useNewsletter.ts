const SUBSCRIBED_KEY = 'corino:newsletter:subscribed'
const EMAIL_KEY = 'corino:newsletter:email'

export default function () {
  const state = useState('newsletter', () => ({
    subscribed: false,
    email: null as string | null,
  }))

  const hydrate = () => {
    if (!import.meta.client)
      return
    state.value.subscribed = localStorage.getItem(SUBSCRIBED_KEY) === 'true'
    state.value.email = localStorage.getItem(EMAIL_KEY)
  }

  const markSubscribed = (email: string) => {
    if (import.meta.client) {
      localStorage.setItem(SUBSCRIBED_KEY, 'true')
      localStorage.setItem(EMAIL_KEY, email)
    }
    state.value.subscribed = true
    state.value.email = email
  }

  return { state, hydrate, markSubscribed }
}
