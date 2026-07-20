/** Site identity — learning platform (not handbook) */
export const siteConfig = {
  name: 'DevOps',
  tagline: 'Платформа для обучения DevOps и Office IT',
  description:
    'Онлайн-курс: Linux, Docker, Kubernetes, CI/CD, Terraform, офисные сети, Omada, Fortinet — уроки, практика, прогресс',

  /** Hero showcase — положите файлы в public/media/ */
  heroVideo: {
    mp4: '/media/hero-showcase.mp4',
    webm: '/media/hero-showcase.webm',
    poster: '/media/hero-showcase-poster.jpg',
  },
} as const
