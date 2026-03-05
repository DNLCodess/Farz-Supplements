/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Disables Vercel's image optimization entirely
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.js",
    // Keep remotePatterns for any non-Cloudinary images (og tags, etc.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "drzoegjgwjdkekybidsr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
