/** Site identity — learning platform (not handbook) */
const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const siteConfig = {
  name: 'DevOps',
  tagline: 'Платформа для обучения DevOps и Office IT',
  description:
    'Онлайн-курс: Linux, Docker, Kubernetes, CI/CD, Terraform, офисные сети, Omada, Fortinet — уроки, практика, прогресс',

  /** Hero showcase — положите файлы в public/media/ */
  heroVideo: {
    mp4: asset('media/hero-showcase.mp4'),
    webm: asset('media/hero-showcase.webm'),
    poster: asset('media/hero-showcase-poster.jpg'),
  },
} as const
