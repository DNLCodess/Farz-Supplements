export default function cloudinaryLoader({ src, width, quality }) {
  // If it's not a Cloudinary URL, return as-is (handles old Supabase URLs)
  if (!src.includes("res.cloudinary.com")) {
    return src;
  }

  // Extract the part after /upload/
  const uploadIndex = src.indexOf("/upload/");
  if (uploadIndex === -1) return src;

  const base = src.substring(0, uploadIndex + 8); // includes "/upload/"
  const rest = src.substring(uploadIndex + 8); // everything after "/upload/"

  // Strip any existing version prefix (v1234567890/)
  const withoutVersion = rest.replace(/^v\d+\//, "");

  // Inject Cloudinary transformations
  const transformations = `w_${width},q_${quality || 75},f_auto,c_limit`;

  return `${base}${transformations}/${withoutVersion}`;
}
