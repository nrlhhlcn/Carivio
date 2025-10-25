/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // CSP temporarily disabled for development
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; font-src 'self' https:; img-src 'self' data: blob: https:; media-src 'self' blob:; connect-src 'self' http: https:; worker-src 'self' blob:; child-src 'self' blob: https:; frame-src 'self' blob: https:; object-src 'none'; base-uri 'self'; form-action 'self';"
  //         },
  //       ],
  //     },
  //   ]
  // },
}

export default nextConfig
