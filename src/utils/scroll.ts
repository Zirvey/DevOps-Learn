export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth'
}

export function scrollWindowToTop(): void {
  window.scrollTo({ top: 0, left: 0, behavior: getScrollBehavior() })
}

export function scrollToElementId(id: string): boolean {
  const element = document.getElementById(id)
  if (!element) return false
  element.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' })
  return true
}

export function scrollToLocationHash(hash: string): void {
  if (!hash) {
    scrollWindowToTop()
    return
  }
  const id = decodeURIComponent(hash.replace(/^#/, ''))
  if (!id) {
    scrollWindowToTop()
    return
  }
  scrollToElementId(id)
}
