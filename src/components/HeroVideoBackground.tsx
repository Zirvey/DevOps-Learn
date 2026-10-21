import { useCallback, useState } from 'react'
import { siteConfig } from '../config/site'
import { DashboardPreview } from './DashboardPreview'

/** Full-bleed loop video behind hero text (Basedash-style) */
export function HeroVideoBackground() {
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  const { mp4, webm, poster } = siteConfig.heroVideo
  const showVideo = videoReady && !videoFailed

  const onCanPlay = useCallback(() => setVideoReady(true), [])
  const onError = useCallback(() => setVideoFailed(true), [])

  return (
    <div className="hero-video-bg" aria-hidden="true">
      {!videoFailed && (
        <video
          className={`hero-video-bg__media${showVideo ? ' is-visible' : ''}`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={poster}
          onCanPlay={onCanPlay}
          onError={onError}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      )}

      <div
        className={`hero-video-bg__fallback${showVideo ? '' : ' is-visible'}`}
      >
        <DashboardPreview />
      </div>

      <div className="hero-video-bg__scrim" />
    </div>
  )
}
