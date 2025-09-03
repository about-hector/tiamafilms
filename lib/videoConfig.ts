export interface VideoQuality {
  url: string
  width: number
  height: number
  fileSize: number // in MB (approximate)
}

export interface VideoConfig {
  id: string
  name: string
  qualities: {
    low: VideoQuality
    medium: VideoQuality
    high: VideoQuality
  }
  duration: number // in seconds
  aspectRatio: string
}

// Cloudflare R2 base URL - videos.tiamafilms.com
export const CLOUDFLARE_R2_BASE_URL = 'https://videos.tiamafilms.com'

export const VIDEO_CONFIGS: VideoConfig[] = [
  {
    id: 'caroline-eran',
    name: 'Caroline Eran Wedding',
    qualities: {
      low: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Acaroline-eran_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 50
      },
      medium: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Acaroline-eran_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 50
      },
      high: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Acaroline-eran_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 50
      }
    },
    duration: 30,
    aspectRatio: '9/16'
  },
  {
    id: 'celine-chris',
    name: 'Celine Chris Wedding',
    qualities: {
      low: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Aceline-chris_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 45
      },
      medium: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Aceline-chris_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 45
      },
      high: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Aceline-chris_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 45
      }
    },
    duration: 32,
    aspectRatio: '9/16'
  },
  {
    id: 'irene-steven',
    name: 'Irene Steven Wedding',
    qualities: {
      low: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Airene-steven_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 55
      },
      medium: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Airene-steven_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 55
      },
      high: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Airene-steven_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 55
      }
    },
    duration: 35,
    aspectRatio: '9/16'
  },
  {
    id: 'kirstie-kyle',
    name: 'Kirstie Kyle Wedding',
    qualities: {
      low: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Akirstie-kyle_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 48
      },
      medium: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Akirstie-kyle_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 48
      },
      high: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Akirstie-kyle_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 48
      }
    },
    duration: 28,
    aspectRatio: '9/16'
  },
  {
    id: 'roxanna-james',
    name: 'Roxanna James Wedding',
    qualities: {
      low: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Aroxanna-james_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 52
      },
      medium: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Aroxanna-james_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 52
      },
      high: {
        url: `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Aroxanna-james_v1.mp4`,
        width: 1080,
        height: 1920,
        fileSize: 52
      }
    },
    duration: 33,
    aspectRatio: '9/16'
  }
]

// Quality selection based on connection and device capabilities
export type QualityLevel = 'low' | 'medium' | 'high'

export interface ConnectionInfo {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | undefined
  downlink: number // Mbps
  rtt: number // ms
  saveData: boolean
}

export function getOptimalQuality(
  connection: ConnectionInfo,
  isVisible: boolean,
  devicePixelRatio: number = 1
): QualityLevel {
  // Always start with low quality if user has save-data enabled
  if (connection.saveData) return 'low'

  // For slow connections, prioritize performance
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return 'low'
  }

  if (connection.effectiveType === '3g') {
    return isVisible ? 'medium' : 'low'
  }

  // For fast connections (4g or undefined), consider device capabilities
  if (connection.downlink < 2) return 'low'
  if (connection.downlink < 5) return 'medium'

  // High-end devices with good connections get high quality
  if (devicePixelRatio >= 2 && connection.downlink >= 5) {
    return isVisible ? 'high' : 'medium'
  }

  return 'medium'
}

export function getTotalDownloadSize(quality: QualityLevel): number {
  return VIDEO_CONFIGS.reduce((total, config) => {
    return total + config.qualities[quality].fileSize
  }, 0)
}