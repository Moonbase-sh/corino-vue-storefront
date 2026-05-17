export default function () {
  const state = useState('ui', () => ({
    cartOpen: false,
    loginOpen: false,
    trialProductId: null as string | null,
  }))

  return {
    state,

    showCart: () => { state.value.cartOpen = true },
    hideCart: () => { state.value.cartOpen = false },

    showLogin: () => { state.value.loginOpen = true },
    hideLogin: () => { state.value.loginOpen = false },

    showTrial: (productId: string) => { state.value.trialProductId = productId },
    hideTrial: () => { state.value.trialProductId = null },
  }
}
