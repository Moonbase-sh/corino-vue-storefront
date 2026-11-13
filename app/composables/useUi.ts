export type DownloadModalMode = 'trial' | 'owned'

/** The reviews modal's tabs: everyone's published reviews, or the customer's own. */
export type ReviewsTab = 'all' | 'mine'

export default function () {
  const state = useState('ui', () => ({
    cartOpen: false,
    loginOpen: false,
    downloadModal: null as { productId: string, mode: DownloadModalMode } | null,
    reviewsModal: null as { productId: string, tab: ReviewsTab } | null,
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

    showReviews: (productId: string, tab: ReviewsTab = 'all') => { state.value.reviewsModal = { productId, tab } },
    hideReviews: () => { state.value.reviewsModal = null },
  }
}
