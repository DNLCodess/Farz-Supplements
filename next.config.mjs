/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
        // ✅ Old Supabase URLs (keep this so existing DB records don't break)
        protocol: "https",
        hostname: "drzoegjgwjdkekybidsr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // ✅ New Cloudinary URLs
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
