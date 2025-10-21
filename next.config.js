/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com', 'yt3.ggpht.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' } // optional broad allowance
    ],
  },
}

module.exports = nextConfig;
