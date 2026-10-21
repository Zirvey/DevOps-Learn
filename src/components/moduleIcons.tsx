import {
  createElement,
  type ComponentType,
  type SVGProps,
} from 'react'
import {
  ArrowRight as PixelArrowRight,
  BookOpen as PixelBookOpen,
  Briefcase,
  Chart,
  Check,
  Circle,
  Cloud,
  Code,
  Docker,
  Earth,
  GitBranch,
  Headphone,
  Layout,
  Lock,
  Server,
  Shield,
  Terminal,
  Wifi,
  Zap,
} from 'pixelarticons/react'

export type PixelIconProps = SVGProps<SVGSVGElement> & { size?: number }

type PixelIcon = ComponentType<SVGProps<SVGSVGElement>>

function withSize(Icon: PixelIcon): ComponentType<PixelIconProps> {
  function SizedIcon({ size = 24, width, height, ...props }: PixelIconProps) {
    const s = size ?? 24
    return createElement(Icon, {
      width: width ?? s,
      height: height ?? s,
      ...props,
    })
  }
  SizedIcon.displayName = `Pixel(${Icon.name || 'Icon'})`
  return SizedIcon
}

/** Maps module.icon keys (legacy Lucide names) → pixelarticons */
export const moduleIconMap: Record<string, ComponentType<PixelIconProps>> = {
  Rocket: withSize(Zap),
  Terminal: withSize(Terminal),
  Box: withSize(Docker),
  Layers: withSize(Layout),
  GitBranch: withSize(GitBranch),
  FileCode: withSize(Code),
  Cloud: withSize(Cloud),
  Activity: withSize(Chart),
  Shield: withSize(Shield),
  GraduationCap: withSize(Briefcase),
  Server: withSize(Server),
  Network: withSize(Earth),
  Wifi: withSize(Wifi),
  ShieldCheck: withSize(Lock),
  Headphones: withSize(Headphone),
}

export const PixelTerminal = moduleIconMap.Terminal
export const PixelArrowRightIcon = withSize(PixelArrowRight)
export const PixelBookOpenIcon = withSize(PixelBookOpen)
export const PixelCheckIcon = withSize(Check)
export const PixelCircleIcon = withSize(Circle)

export function getModuleIcon(name: string): ComponentType<PixelIconProps> {
  return moduleIconMap[name] ?? PixelTerminal
}

/** Unique pixel icons per learning track id */
export const trackIconMap: Record<string, ComponentType<PixelIconProps>> = {
  devops: withSize(Terminal),
  sysadmin: withSize(Server),
  'office-it': withSize(Wifi),
}

export function getTrackIcon(trackId: string): ComponentType<PixelIconProps> {
  return trackIconMap[trackId] ?? withSize(Zap)
}
