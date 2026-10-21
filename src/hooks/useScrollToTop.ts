import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  scrollToElementId,
  scrollWindowToTop,
} from '../utils/scroll'

/** Smooth scroll to top or in-page hash on route / hash change */
export function useScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace(/^#/, ''))
      requestAnimationFrame(() => {
        if (!scrollToElementId(id)) {
          scrollWindowToTop()
        }
      })
      return
    }
    scrollWindowToTop()
  }, [pathname, hash])
}
