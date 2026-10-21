import { useEffect } from 'react'

/**
 * Optional first-party analytics. Enable by setting at build time:
 * - VITE_ANALYTICS_PROVIDER=plausible|umami
 * - VITE_ANALYTICS_SRC=https://…/script.js  (required)
 * - VITE_ANALYTICS_DOMAIN=your.site  (Plausible data-domain)
 * - VITE_ANALYTICS_WEBSITE_ID=…  (Umami data-website-id)
 *
 * Without VITE_ANALYTICS_SRC nothing is injected (safe default for GitHub Pages).
 */
export function Analytics() {
  useEffect(() => {
    const src = import.meta.env.VITE_ANALYTICS_SRC as string | undefined
    if (!src || typeof document === 'undefined') return
    if (document.querySelector(`script[data-devops-analytics="${src}"]`)) return

    const provider = (
      import.meta.env.VITE_ANALYTICS_PROVIDER as string | undefined
    )?.toLowerCase()
    const script = document.createElement('script')
    script.defer = true
    script.src = src
    script.dataset.devopsAnalytics = src

    if (provider === 'umami') {
      const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID as
        | string
        | undefined
      if (!websiteId) return
      script.dataset.websiteId = websiteId
    } else {
      // Default: Plausible-compatible attributes
      const domain = import.meta.env.VITE_ANALYTICS_DOMAIN as string | undefined
      if (!domain) return
      script.dataset.domain = domain
    }

    document.head.appendChild(script)
    return () => {
      script.remove()
    }
  }, [])

  return null
}
