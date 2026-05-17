export type DownloadModalMode = 'trial' | 'owned'

export default function () {
  const state = useState('ui', () => ({
    cartOpen: false,
    loginOpen: false,
    downloadModal: null as { productId: string, mode: DownloadModalMode } | null,
  }))

  return {
    state,

    showCart: () => { state.value.cartOpen = true },
    hideCart: () => { state.value.cartOpen = false },

    showLogin: () => { state.value.loginOpen = true },
    hideLogin: () => { state.value.loginOpen = false },

    showTrial: (productId: string) => { state.value.downloadModal = { productId, mode: 'trial' } },
    showDownloads: (productId: string) => { state.value.downloadModal = { productId, mode: 'owned' } },
    hideDownloadModal: () => { state.value.downloadModal = null },
  }
}
