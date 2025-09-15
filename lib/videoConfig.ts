export interface VideoQuality {
  mp4: string
  webm: string
  width: number
  height: number
  fileSize: number // in MB (approximate)
}

export interface VideoConfig {
  id: string
  name: string
  qualities: {
    medium: VideoQuality // 720p
    high: VideoQuality   // 1080p
  }
  poster: string
  thumbnail: string
  duration: number // in seconds
  aspectRatio: string
  posterTime?: number // time in seconds to use for poster/thumbnail
}

// Cloudflare R2 base URL - videos.tiamafilms.com
export const CLOUDFLARE_R2_BASE_URL = 'https://videos.tiamafilms.com'

export const VIDEO_CONFIGS: VideoConfig[] = [
  {
    id: 'caroline-eran',
    name: 'Caroline Eran Wedding',
    qualities: {
      medium: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-caroline-eran-ig-reel_v1_720p-h264_75b809d9.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-caroline-eran-ig-reel_v1_720p-vp9_75b809d9.webm`,
        width: 720,
        height: 1280,
        fileSize: 10
      },
      high: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-caroline-eran-ig-reel_v1_1080p-h264_75b809d9.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-caroline-eran-ig-reel_v1_1080p-vp9_75b809d9.webm`,
        width: 1080,
        height: 1920,
        fileSize: 27
      }
    },
    poster: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-caroline-eran-ig-reel_v1_poster_75b809d9.jpg`,
    thumbnail: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-caroline-eran-ig-reel_v1_thumb-540p_75b809d9.jpg`,
    duration: 30,
    aspectRatio: '9/16',
    posterTime: 12
  },
  {
    id: 'celine-chris',
    name: 'Celine Chris Wedding',
    qualities: {
      medium: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-celine-chris-ig-reel_v1_720p-h264_5eec8adc.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-celine-chris-ig-reel_v1_720p-vp9_5eec8adc.webm`,
        width: 720,
        height: 1280,
        fileSize: 11
      },
      high: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-celine-chris-ig-reel_v1_1080p-h264_5eec8adc.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-celine-chris-ig-reel_v1_1080p-vp9_5eec8adc.webm`,
        width: 1080,
        height: 1920,
        fileSize: 30
      }
    },
    poster: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-celine-chris-ig-reel_v1_poster_5eec8adc.jpg`,
    thumbnail: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-celine-chris-ig-reel_v1_thumb-540p_5eec8adc.jpg`,
    duration: 32,
    aspectRatio: '9/16',
    posterTime: 8
  },
  {
    id: 'irene-steven',
    name: 'Irene Steven Wedding',
    qualities: {
      medium: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-irene-steven-ig-reel_v1_720p-h264_b2bd597f.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-irene-steven-ig-reel_v1_720p-vp9_b2bd597f.webm`,
        width: 720,
        height: 1280,
        fileSize: 8
      },
      high: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-irene-steven-ig-reel_v1_1080p-h264_b2bd597f.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-irene-steven-ig-reel_v1_1080p-vp9_b2bd597f.webm`,
        width: 1080,
        height: 1920,
        fileSize: 21
      }
    },
    poster: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-irene-steven-ig-reel_v1_poster_b2bd597f.jpg`,
    thumbnail: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-irene-steven-ig-reel_v1_thumb-540p_b2bd597f.jpg`,
    duration: 35,
    aspectRatio: '9/16',
    posterTime: 15
  },
  {
    id: 'kirstie-kyle',
    name: 'Kirstie Kyle Wedding',
    qualities: {
      medium: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-kirstie-kyle-ig-reel_v1_720p-h264_68be2a46.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-kirstie-kyle-ig-reel_v1_720p-vp9_68be2a46.webm`,
        width: 720,
        height: 1280,
        fileSize: 11
      },
      high: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-kirstie-kyle-ig-reel_v1_1080p-h264_68be2a46.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-kirstie-kyle-ig-reel_v1_1080p-vp9_68be2a46.webm`,
        width: 1080,
        height: 1920,
        fileSize: 30
      }
    },
    poster: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-kirstie-kyle-ig-reel_v1_poster_68be2a46.jpg`,
    thumbnail: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-kirstie-kyle-ig-reel_v1_thumb-540p_68be2a46.jpg`,
    duration: 28,
    aspectRatio: '9/16',
    posterTime: 5
  },
  {
    id: 'roxanna-james',
    name: 'Roxanna James Wedding',
    qualities: {
      medium: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-roxanna-james-ig-reel_v1_720p-h264_a45631e5.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-roxanna-james-ig-reel_v1_720p-vp9_a45631e5.webm`,
        width: 720,
        height: 1280,
        fileSize: 10
      },
      high: {
        mp4: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-roxanna-james-ig-reel_v1_1080p-h264_a45631e5.mp4`,
        webm: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-roxanna-james-ig-reel_v1_1080p-vp9_a45631e5.webm`,
        width: 1080,
        height: 1920,
        fileSize: 29
      }
    },
    poster: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-roxanna-james-ig-reel_v1_poster_a45631e5.jpg`,
    thumbnail: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms/videos/2025/unknown-roxanna-james-ig-reel_v1_thumb-540p_a45631e5.jpg`,
    duration: 33,
    aspectRatio: '9/16',
    posterTime: 20
  }
]

// Quality selection based on connection and device capabilities
export type QualityLevel = 'medium' | 'high'

export interface ConnectionInfo {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | undefined
  downlink: number // Mbps
  rtt: number // ms
  saveData: boolean
}

export function getOptimalQuality(
  connection: ConnectionInfo,
  isVisible: boolean,
  devicePixelRatio: number = 1,
  isMobile: boolean = false
): QualityLevel {
  // Always use medium quality if user has save-data enabled
  if (connection.saveData) return 'medium'

  // Mobile devices get 720p (medium quality) for better performance
  if (isMobile) return 'medium'

  // For slow connections, use medium quality
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return 'medium'
  }

  if (connection.effectiveType === '3g') {
    return isVisible ? 'medium' : 'medium'
  }

  // For fast connections (4g or undefined), consider device capabilities
  if (connection.downlink < 3) return 'medium'

  // Desktop with good connections get high quality (1080p)
  if (!isMobile && devicePixelRatio >= 1 && connection.downlink >= 3) {
    return isVisible ? 'high' : 'medium'
  }

  return 'medium'
}

export function getTotalDownloadSize(quality: QualityLevel): number {
  return VIDEO_CONFIGS.reduce((total, config) => {
    return total + config.qualities[quality].fileSize
  }, 0)
}

// WebM support detection
export function supportsWebM(): boolean {
  if (typeof window === 'undefined') return false

  const video = document.createElement('video')
  return !!(video.canPlayType && video.canPlayType('video/webm; codecs="vp9"').replace(/no/, ''))
}

// Get optimal video URL with format priority
export function getOptimalVideoUrl(
  videoConfig: VideoConfig,
  quality: QualityLevel
): string {
  const qualityConfig = videoConfig.qualities[quality]

  // Prioritize WebM if supported, fallback to MP4
  if (supportsWebM()) {
    return qualityConfig.webm
  }

  return qualityConfig.mp4
}

// Get poster or thumbnail based on device type
export function getPosterUrl(
  videoConfig: VideoConfig,
  isMobile: boolean = false
): string {
  return isMobile ? videoConfig.thumbnail : videoConfig.poster
}

// Mobile device detection utility
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}