import type { ChapterTranslation } from '../../i18n/chapterTranslation'
import type { TerminalLab } from '../../types'

export type EnContentPack = {
  chaptersBySlug: Record<string, ChapterTranslation>
  terminalLabsBySlug: Record<string, TerminalLab>
}

let cache: EnContentPack | null = null
let pending: Promise<EnContentPack> | null = null

export function getEnContentPack(): EnContentPack | null {
  return cache
}

export function loadEnContentPack(): Promise<EnContentPack> {
  if (cache) return Promise.resolve(cache)
  if (!pending) {
    pending = Promise.all([import('./chapters'), import('./terminal-labs')]).then(
      ([chaptersMod, labsMod]) => {
        cache = {
          chaptersBySlug: chaptersMod.enChaptersBySlug,
          terminalLabsBySlug: labsMod.enTerminalLabsBySlug,
        }
        return cache
      },
    )
  }
  return pending
}

/** Warm the EN pack after first paint so locale switches feel instant. */
export function prefetchEnContentPack(): void {
  void loadEnContentPack()
}
