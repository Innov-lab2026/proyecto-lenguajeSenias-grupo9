import { Image } from 'expo-image'

interface GoogleIconProps {
  size?: number
}

/** Logo de Google renderizado con expo-image (asset SVG, sin transformer). */
export function GoogleIcon({ size = 20 }: GoogleIconProps) {
  return (
    <Image
      source={require('@/assets/icons/google.svg')}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  )
}
