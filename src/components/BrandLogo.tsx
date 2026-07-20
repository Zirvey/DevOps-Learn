interface BrandLogoProps {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span className={['brand-logo', className].filter(Boolean).join(' ')}>
      <span className="brand-logo-prompt" aria-hidden="true">
        &gt;_{' '}
      </span>
      <span className="brand-logo-name">DevOps</span>
    </span>
  )
}
