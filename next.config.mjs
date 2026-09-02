/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 430, 640, 768, 1024, 1280, 1536, 1920],
  },
  async headers() {
    return [
      {
        // Proof assets are swapped in place under the same filenames (see the
        // README), so they must revalidate rather than be pinned for a year.
        // The CDN serves the cached copy instantly and refreshes in the
        // background, so a replaced photo or hero video goes live on the next
        // request instead of sticking for returning visitors.
        source: "/proof/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
