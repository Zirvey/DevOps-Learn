import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import {
  addChapterComment,
  COMMENT_MAX_LENGTH,
  deleteChapterComment,
  getCommentsForChapter,
  type ChapterComment,
} from '../hooks/useChapterComments'
import { useLanguage } from '../i18n/LanguageContext'

interface ChapterCommentsProps {
  chapterSlug: string
}

function formatTime(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso.slice(0, 16).replace('T', ' ')
  }
}

export function ChapterComments({ chapterSlug }: ChapterCommentsProps) {
  const { t, locale } = useLanguage()
  const { session, isAuthenticated } = useAuth()
  const [comments, setComments] = useState<ChapterComment[]>(() =>
    getCommentsForChapter(chapterSlug),
  )
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setComments(getCommentsForChapter(chapterSlug))
    setBody('')
    setError(null)
  }, [chapterSlug])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!session) return
    setError(null)
    const result = addChapterComment({
      chapterSlug,
      userId: session.userId,
      displayName: session.displayName,
      body,
    })
    if (!result.ok) {
      setError(
        result.error === 'too-long'
          ? t('comments.errorTooLong')
          : t('comments.errorEmpty'),
      )
      return
    }
    setBody('')
    setComments(getCommentsForChapter(chapterSlug))
  }

  const handleDelete = (id: string) => {
    if (!session) return
    if (!deleteChapterComment(id, session.userId)) return
    setComments(getCommentsForChapter(chapterSlug))
  }

  return (
    <section id="chapter-comments" className="chapter-comments">
      <h3>
        <MessageSquare size={20} />
        {t('comments.title')}
        <span className="comments-count">{comments.length}</span>
      </h3>
      <p className="comments-note">{t('comments.localNote')}</p>

      {comments.length === 0 ? (
        <p className="comments-empty">{t('comments.empty')}</p>
      ) : (
        <ul className="comments-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div className="comment-meta">
                <strong>{comment.displayName}</strong>
                <time dateTime={comment.createdAt}>
                  {formatTime(comment.createdAt, locale)}
                </time>
                {session?.userId === comment.userId && (
                  <button
                    type="button"
                    className="comment-delete"
                    onClick={() => handleDelete(comment.id)}
                    aria-label={t('comments.delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p>{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      {isAuthenticated && session ? (
        <form className="comments-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor={`comment-${chapterSlug}`}>
            {t('comments.placeholder')}
          </label>
          <textarea
            id={`comment-${chapterSlug}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('comments.placeholder')}
            maxLength={COMMENT_MAX_LENGTH}
            rows={3}
            required
          />
          <div className="comments-form-actions">
            <span className="comments-counter">
              {body.length}/{COMMENT_MAX_LENGTH}
            </span>
            {error && <span className="comments-error">{error}</span>}
            <button type="submit" className="btn btn-primary">
              {t('comments.submit')}
            </button>
          </div>
        </form>
      ) : (
        <p className="comments-login">
          {t('comments.loginPrompt')}{' '}
          <Link to="/account">{t('comments.loginLink')}</Link>
        </p>
      )}
    </section>
  )
}
