"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Package,
  DollarSign,
  BarChart3,
  Tag,
  Image as ImageIcon,
  Info,
  Eye,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/app/actions/products";
import { getCategories } from "@/app/actions/categories";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const productId = params.id;

  const [formData, setFormData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Initialize form data when product loads
  useEffect(() => {
    if (product && !formData) {
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        short_description: product.short_description || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        compare_at_price: product.compare_at_price?.toString() || "",
        cost_price: product.cost_price?.toString() || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        category_id: product.category_id || "",
        stock_quantity: product.stock_quantity?.toString() || "0",
        low_stock_threshold: product.low_stock_threshold?.toString() || "10",
        weight: product.weight?.toString() || "",
        dimensions: product.dimensions || "",
        is_active: product.is_active,
        is_featured: product.is_featured || false,
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
      });

      // Set existing image
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    }
  }, [product, formData]);

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateProduct(productId, data),
    onSuccess: (result) => {
      if (result.success) {
        setHasUnsavedChanges(false);
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        toast.success("Product updated successfully!", {
          icon: <Check className="w-4 h-4" />,
        });
      } else {
        toast.error(result.error || "Failed to update product");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        toast.success("Product deleted successfully");
        router.push("/admin/products");
      } else {
        toast.error(result.error || "Failed to delete product");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setHasUnsavedChanges(true);

    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      processImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(file);
      setHasUnsavedChanges(true);
      toast.success("Image ready for upload");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) {
      errors.name = "Product name is required";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "Please enter a valid price";
    }
    if (
      formData.compare_at_price &&
      parseFloat(formData.compare_at_price) <= parseFloat(formData.price)
    ) {
      errors.compare_at_price = "Compare price must be higher than price";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      let imageUrl = imagePreview;

      // Upload new image if changed
      if (imageFile) {
        setUploadingImage(true);
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const formDataToSend = new FormData();
        formDataToSend.append("file", imageFile);
        formDataToSend.append("fileName", fileName);

        const uploadResponse = await fetch("/api/upload-product-image", {
          method: "POST",
          body: formDataToSend,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
        setUploadingImage(false);
      }

      const productData = {
        ...formData,
        image_url: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      };

      updateMutation.mutate(productData);
    } catch (error) {
      setUploadingImage(false);
      toast.error(error.message || "Failed to process image");
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const calculateMargin = () => {
    const price = parseFloat(formData?.price) || 0;
    const cost = parseFloat(formData?.cost_price) || 0;
    if (price > 0 && cost > 0) {
      return (((price - cost) / price) * 100).toFixed(1);
    }
    return 0;
  };

  const calculateDiscount = () => {
    const price = parseFloat(formData?.price) || 0;
    const comparePrice = parseFloat(formData?.compare_at_price) || 0;
    if (price > 0 && comparePrice > 0) {
      return (((comparePrice - price) / comparePrice) * 100).toFixed(0);
    }
    return 0;
  };

  const getCharCountColor = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage >= 95) return "text-red-600 font-semibold";
    if (percentage >= 80) return "text-amber-600";
    return "text-gray-500";
  };

  const categories = categoriesData || [];

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/products"
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-150 min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-charcoal">
                    Edit Product
                  </h1>
                  {hasUnsavedChanges && (
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-lg">
                      Unsaved changes
                    </span>
                  )}
                </div>
                <p className="text-base text-gray-600 mt-1">
                  Update product details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-red-300 text-red-700 rounded-xl text-base font-medium hover:bg-red-50 transition-all duration-150 min-h-[48px]"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  updateMutation.isPending ||
                  uploadingImage ||
                  !hasUnsavedChanges
                }
                className="flex items-center gap-2 px-8 py-3.5 bg-green-900 text-white rounded-xl text-base font-semibold hover:bg-green-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow min-h-[48px]"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Reuse the same form structure as new product page */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-5">
                Basic Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Product Name <span className="text-red-500 text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 rounded-xl text-lg transition-all duration-150 border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    readOnly
                    className="w-full px-5 py-4 border-2 rounded-xl text-lg bg-gray-50 border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    maxLength={150}
                    className="w-full px-5 py-4 border-2 rounded-xl text-lg border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-5 py-4 border-2 rounded-xl text-lg leading-relaxed border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-5">
                Pricing
              </h2>
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Price <span className="text-red-500 text-lg">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 font-semibold text-lg">
                      ₦
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-12 pr-5 py-4 border-2 rounded-xl text-lg border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2.5">
                    Compare At Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      ₦
                    </span>
                    <input
                      type="number"
                      name="compare_at_price"
                      value={formData.compare_at_price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-12 pr-5 py-4 border-2 rounded-xl text-lg border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2.5">
                    Cost Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                      ₦
                    </span>
                    <input
                      type="number"
                      name="cost_price"
                      value={formData.cost_price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-12 pr-5 py-4 border-2 rounded-xl text-lg border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                    />
                  </div>
                </div>
              </div>

              {formData.price && formData.cost_price && (
                <div className="mt-5 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-700">
                      Profit Margin
                    </span>
                    <span className="text-2xl font-bold text-green-900">
                      {calculateMargin()}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory - Similar structure */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-5">
                Inventory
              </h2>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-5 py-4 border-2 rounded-xl text-lg border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2.5">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-5 py-4 border-2 rounded-xl text-lg border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-charcoal mb-5">
                Product Image
              </h2>

              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`relative border-3 border-dashed rounded-2xl p-10 text-center ${
                    isDragging
                      ? "border-green-900 bg-green-50"
                      : "border-gray-300"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer block"
                  >
                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-900">
                      Click to upload
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative group">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
                    <Image
                      src={imagePreview}
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-charcoal mb-5">
                Status
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Active
                    </p>
                    <p className="text-base text-gray-600">Visible in store</p>
                  </div>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-green-900 border-gray-300 rounded-md"
                  />
                </label>

                <label className="flex items-center justify-between p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Featured
                    </p>
                    <p className="text-base text-gray-600">Show on homepage</p>
                  </div>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-green-900 border-gray-300 rounded-md"
                  />
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
