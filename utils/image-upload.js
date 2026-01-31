import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder within product-images bucket (e.g., 'products', 'categories')
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export async function uploadProductImage(file, folder = "products") {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {string} folder - Folder within product-images bucket
 * @returns {Promise<string[]>} - Array of public URLs
 */
export async function uploadProductImages(files, folder = "products") {
  try {
    const uploadPromises = files.map((file) =>
      uploadProductImage(file, folder),
    );
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
}

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Full URL of image to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteProductImage(imageUrl) {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/product-images\/(.+)$/);

    if (!pathMatch) {
      throw new Error("Invalid image URL format");
    }

    const filePath = pathMatch[1];

    const { error } = await supabaseAdmin.storage
      .from("product-images")
      .remove([filePath]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Delete multiple images
 * @param {string[]} imageUrls - Array of image URLs to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteProductImages(imageUrls) {
  try {
    const deletePromises = imageUrls.map((url) => deleteProductImage(url));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Error deleting images:", error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
}

/**
 * Upload image from URL (for seeding data)
 * @param {string} imageUrl - URL of image to download and upload
 * @param {string} productName - Product name for filename
 * @param {string} folder - Folder within product-images bucket
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export async function uploadImageFromUrl(
  imageUrl,
  productName,
  folder = "products",
) {
  try {
    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Failed to fetch image");

    const blob = await response.blob();

    // Generate filename from product name
    const timestamp = Date.now();
    const sanitizedName = productName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const fileExt = blob.type.split("/")[1] || "jpg";
    const fileName = `${sanitizedName}-${timestamp}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading image from URL:", error);
    throw new Error(`Failed to upload image from URL: ${error.message}`);
  }
}
