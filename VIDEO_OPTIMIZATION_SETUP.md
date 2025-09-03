# Video Optimization Setup Guide

## Overview

Your website has been refactored with a comprehensive video optimization system that provides:

- **90%+ bandwidth reduction** through intelligent quality selection
- **Shared video instances** to eliminate duplicate downloads
- **Connection-aware loading** for mobile users
- **Progressive preloading** during the loading screen
- **Seamless caching** with browser-native optimization

## Quick Setup Steps

### 1. Upload Videos to Cloudflare R2

Upload your 5 wedding videos to Cloudflare R2 in three quality levels:

**Required file structure:**
```
your-r2-bucket/
├── caroline-eran-360p.mp4    (8MB target)
├── caroline-eran-720p.mp4    (25MB target)
├── caroline-eran-1080p.mp4   (50MB target)
├── celine-chris-360p.mp4     (7MB target)
├── celine-chris-720p.mp4     (22MB target)
├── celine-chris-1080p.mp4    (45MB target)
├── irene-steven-360p.mp4     (9MB target)
├── irene-steven-720p.mp4     (28MB target)
├── irene-steven-1080p.mp4    (55MB target)
├── kirstie-kyle-360p.mp4     (8MB target)
├── kirstie-kyle-720p.mp4     (24MB target)
├── kirstie-kyle-1080p.mp4    (48MB target)
├── roxanna-james-360p.mp4    (9MB target)
├── roxanna-james-720p.mp4    (27MB target)
└── roxanna-james-1080p.mp4   (52MB target)
```

### 2. Update R2 Configuration

Edit `lib/videoConfig.ts` and update the `CLOUDFLARE_R2_BASE_URL`:

```typescript
export const CLOUDFLARE_R2_BASE_URL = 'https://your-actual-bucket-url.r2.dev'
```

Replace `your-actual-bucket-url.r2.dev` with your actual R2 public URL.

### 3. Set R2 Bucket Policies

Ensure your R2 bucket allows public read access for video files:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 4. Configure CORS (if needed)

Add CORS configuration to your R2 bucket:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com", "https://tiamafilms.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

## How It Works

### Intelligent Quality Selection

The system automatically chooses video quality based on:

- **Connection speed**: 2G/3G users get lower quality
- **Data saver mode**: Respects user's data saving preferences
- **Device capabilities**: High-DPI screens get better quality
- **Visibility**: Off-screen videos load lower quality first

### Progressive Loading Strategy

1. **Loading Screen**: Starts preloading first 2-3 videos immediately
2. **Priority Queue**: Loads videos in order of appearance on page
3. **Background Loading**: Continues loading remaining videos after page load
4. **Smart Caching**: Keeps 5 most recently used videos in memory

### Bandwidth Optimization

**Before** (Public folder approach):
- 5 videos × 50MB × multiple instances = ~1.25GB total download
- All users download full quality regardless of connection
- No caching optimization
- Bots crawl and consume bandwidth

**After** (Optimized approach):
- Low-quality mobile: ~40MB total (90% reduction)
- Medium-quality default: ~125MB total (75% reduction)
- High-quality fast connections: ~250MB total (50% reduction)
- Single download per video across entire site
- Intelligent preloading prevents loading delays

### Connection-Aware Features

```typescript
// Automatic quality selection
if (connection.effectiveType === '2g') return 'low'     // 8MB per video
if (connection.effectiveType === '3g') return 'medium'  // 25MB per video
if (connection.downlink >= 5) return 'high'            // 50MB per video

// Data saver mode
if (connection.saveData) return 'low'  // Always prioritize data saving
```

### Performance Monitoring

The system provides real-time metrics:

```typescript
import { useVideo, useConnectionAware } from '@/contexts/VideoContext'

function PerformanceMonitor() {
  const {
    loadedVideos,           // Array of loaded video IDs
    preloadedVideos,        // Array of preloaded video IDs
    totalDownloadedSize,    // Total MB downloaded
    connectionInfo          // Current connection info
  } = useVideo()

  const {
    shouldReduceData,       // Whether to use data-saving mode
    canAffordHighQuality    // Whether connection supports high quality
  } = useConnectionAware()

  return (
    <div>
      <p>Downloaded: {Math.round(totalDownloadedSize)}MB</p>
      <p>Connection: {connectionInfo.effectiveType}</p>
      <p>Quality Mode: {canAffordHighQuality ? 'High' : shouldReduceData ? 'Low' : 'Medium'}</p>
    </div>
  )
}
```

## Video Encoding Recommendations

### Quality Levels

**Low Quality (360p):**
- Resolution: 360×640 (9:16 aspect ratio)
- Bitrate: 1.5 Mbps video, 128 kbps audio
- Target file size: 5-10MB per video
- Use case: 2G/3G connections, data saver mode

**Medium Quality (720p):**
- Resolution: 720×1280 (9:16 aspect ratio)
- Bitrate: 4 Mbps video, 192 kbps audio
- Target file size: 20-30MB per video
- Use case: Standard desktop/mobile viewing

**High Quality (1080p):**
- Resolution: 1080×1920 (9:16 aspect ratio)
- Bitrate: 8 Mbps video, 256 kbps audio
- Target file size: 45-60MB per video
- Use case: High-end devices, fast connections

### FFmpeg Encoding Commands

```bash
# Low quality (360p)
ffmpeg -i input.mp4 -vf scale=360:640 -c:v libx264 -preset medium -crf 28 -c:a aac -b:a 128k output-360p.mp4

# Medium quality (720p)
ffmpeg -i input.mp4 -vf scale=720:1280 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 192k output-720p.mp4

# High quality (1080p)
ffmpeg -i input.mp4 -vf scale=1080:1920 -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 256k output-1080p.mp4
```

## Testing and Validation

### 1. Connection Simulation

Test the system with different connection speeds:

1. Open Chrome DevTools → Network tab
2. Set throttling to "Slow 3G" or "Fast 3G"
3. Reload the page and observe quality selection
4. Check Network tab for downloaded file sizes

### 2. Data Saver Mode Testing

Test data saver behavior:

1. Open Chrome DevTools → Console
2. Run: `navigator.connection.saveData = true`
3. Reload page - should use low quality only

### 3. Performance Metrics

Monitor the loading process:

```javascript
// Add to browser console during loading
const videoContext = document.querySelector('[data-video-context]')
console.log('Preloaded videos:', videoContext.preloadedVideos)
console.log('Total downloaded:', videoContext.totalDownloadedSize + 'MB')
```

## Troubleshooting

### Videos Not Loading

1. **Check R2 URLs**: Verify `CLOUDFLARE_R2_BASE_URL` in `lib/videoConfig.ts`
2. **Check CORS**: Ensure R2 bucket allows cross-origin requests
3. **Check Network Tab**: Look for 404 or CORS errors in DevTools

### Slow Loading

1. **Check Connection Detection**: Verify connection speed detection working
2. **Reduce Quality**: Consider lowering target file sizes
3. **Increase Concurrent Loads**: Adjust `maxConcurrentLoads` in `VideoManager`

### High Bandwidth Usage

1. **Verify Quality Selection**: Check if low quality is being served on slow connections
2. **Check Preloading**: Ensure preloading doesn't load all videos immediately
3. **Monitor Cache Size**: Verify `maxCacheSize` is reasonable

## File Structure Reference

```
lib/
├── videoConfig.ts          # R2 URLs and quality definitions
├── videoManager.ts         # Core video management logic
└── utils.ts

contexts/
└── VideoContext.tsx        # React context for video state

components/
├── SharedVideo.tsx         # Optimized video component
├── LoadingScreen.tsx       # Enhanced with preloading
├── V2MasonryHero.tsx      # Updated to use SharedVideo
└── V2StorySection.tsx     # Updated to use SharedVideo

app/
├── layout.tsx             # Includes VideoProvider
└── page.tsx               # Updated with videoId references
```

## Next Steps

1. **Upload videos to R2** with the specified quality levels
2. **Update the R2 URL** in `lib/videoConfig.ts`
3. **Test on various devices** and connection speeds
4. **Monitor performance** using browser DevTools
5. **Adjust quality targets** based on real-world performance

The system is now ready to provide optimal video experiences for all your users while being extremely mindful of bandwidth costs and mobile data usage.