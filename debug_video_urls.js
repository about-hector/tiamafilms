// Debug script to test video URLs
const CLOUDFLARE_R2_BASE_URL = 'https://videos.tiamafilms.com'

const testUrls = [
  `${CLOUDFLARE_R2_BASE_URL}/tiamafilms%3A2025%3Aig-reel%3Acaroline-eran_v1.mp4`,
  `${CLOUDFLARE_R2_BASE_URL}/tiamafilms:2025:ig-reel:caroline-eran_v1.mp4`,
  `${CLOUDFLARE_R2_BASE_URL}/tiamafilms_2025_ig-reel_caroline-eran_v1.mp4`
]

console.log('Testing video URLs:')
testUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`)
})

// Test fetch for each URL
async function testFetch() {
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i]
    try {
      console.log(`\nTesting URL ${i + 1}: ${url}`)
      const response = await fetch(url, { method: 'HEAD' })
      console.log(`✅ Success: ${response.status} ${response.statusText}`)
      console.log(`Content-Type: ${response.headers.get('content-type')}`)
      console.log(`Content-Length: ${response.headers.get('content-length')}`)
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`)
    }
  }
}

if (typeof window !== 'undefined') {
  testFetch()
}