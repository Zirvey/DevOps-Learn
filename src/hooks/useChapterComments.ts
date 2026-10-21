export interface ChapterComment {
  id: string
  chapterSlug: string
  userId: string
  displayName: string
  body: string
  createdAt: string
}

const STORAGE_KEY = 'devops-handbook-comments'
const MAX_BODY = 1000

function readAll(): ChapterComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ChapterComment[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(comments: ChapterComment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments))
}

export function getCommentsForChapter(chapterSlug: string): ChapterComment[] {
  return readAll()
    .filter((c) => c.chapterSlug === chapterSlug)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
}

export function addChapterComment(input: {
  chapterSlug: string
  userId: string
  displayName: string
  body: string
}): { ok: true; comment: ChapterComment } | { ok: false; error: string } {
  const body = input.body.trim()
  if (!body) return { ok: false, error: 'empty' }
  if (body.length > MAX_BODY) return { ok: false, error: 'too-long' }

  const comment: ChapterComment = {
    id: crypto.randomUUID(),
    chapterSlug: input.chapterSlug,
    userId: input.userId,
    displayName: input.displayName.trim() || 'User',
    body,
    createdAt: new Date().toISOString(),
  }

  const all = readAll()
  all.push(comment)
  writeAll(all)
  return { ok: true, comment }
}

export function deleteChapterComment(
  commentId: string,
  userId: string,
): boolean {
  const all = readAll()
  const next = all.filter(
    (c) => !(c.id === commentId && c.userId === userId),
  )
  if (next.length === all.length) return false
  writeAll(next)
  return true
}

export const COMMENT_MAX_LENGTH = MAX_BODY
