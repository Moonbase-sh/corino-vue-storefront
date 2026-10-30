const ANSWER_KEY = 'corino:cookie-consent'

export default function () {
  const state = useState('cookie-consent', () => ({
    // Whether the store needs this visitor's consent before it keeps the ad
    // click IDs they arrived with. Set by plugins/moonbase.ts once the browser
    // has loaded the catalog for this visitor.
    required: false,
    // The visitor's answer, remembered across visits. `null` until they answer.
    answer: null as boolean | null,
    // Opened again from "Cookie settings" in the footer.
    reopened: false,
  }))

  const hydrate = () => {
    if (!import.meta.client)
      return
    const stored = localStorage.getItem(ANSWER_KEY)
    state.value.answer = stored === null ? null : stored === 'true'
  }

  const answer = (granted: boolean) => {
    localStorage.setItem(ANSWER_KEY, String(granted))
    state.value.answer = granted
    state.value.reopened = false
  }

  const open = computed(() => state.value.reopened || (state.value.required && state.value.answer === null))

  return {
    state,
    open,
    hydrate,
    answer,
    reopen: () => { state.value.reopened = true },
  }
}
