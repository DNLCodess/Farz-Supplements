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
  Save,
  Check,
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
  const [validationErrors, setValidationErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: !!productId,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

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
      if (product.image_url) setImagePreview(product.image_url);
    }
  }, [product, formData]);

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

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

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
    if (!formData.name?.trim()) errors.name = "Product name is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      errors.price = "Please enter a valid price";
    if (
      formData.compare_at_price &&
      parseFloat(formData.compare_at_price) <= parseFloat(formData.price)
    )
      errors.compare_at_price = "Compare price must be higher than price";
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

        if (!uploadResponse.ok) throw new Error("Failed to upload image");

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
    if (price > 0 && cost > 0)
      return (((price - cost) / price) * 100).toFixed(1);
    return 0;
  };

  const calculateDiscount = () => {
    const price = parseFloat(formData?.price) || 0;
    const comparePrice = parseFloat(formData?.compare_at_price) || 0;
    if (price > 0 && comparePrice > 0)
      return (((comparePrice - price) / comparePrice) * 100).toFixed(0);
    return 0;
  };

  const categories = categoriesData || [];

  const isSaving = updateMutation.isPending || uploadingImage;
  const isDeleting = deleteMutation.isPending;

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                href="/admin/products"
                className="shrink-0 w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors duration-150"
                aria-label="Back to products"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    Edit Product
                  </h1>
                  {hasUnsavedChanges && (
                    <span className="shrink-0 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg">
                      Unsaved
                    </span>
                  )}
                </div>
                {/* Subtitle hidden on very small screens to reduce clutter */}
                <p className="hidden sm:block text-sm text-gray-500 mt-0.5">
                  Update product details
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Delete — icon-only on mobile, full on sm+ */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Delete product"
                className="flex items-center gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 active:bg-red-100 transition-colors duration-150 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Delete</span>
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving || !hasUnsavedChanges}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-900 text-white rounded-xl text-sm font-semibold hover:bg-green-800 active:bg-green-950 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-h-[44px]"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden xs:inline">Uploading…</span>
                  </>
                ) : updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden xs:inline">Saving…</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <form onSubmit={handleSubmit}>
          {/*
            Layout strategy:
            - Mobile (< lg): single column, image panel first for context
            - lg+: two-column grid (2fr + 1fr)
          */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* ── RIGHT COLUMN (image + status) — rendered first on mobile ── */}
            <div className="lg:col-span-1 lg:order-2 space-y-5">
              {/* Product Image */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
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
                    className={`relative border-2 border-dashed rounded-xl transition-colors duration-150 ${
                      isDragging
                        ? "border-green-700 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
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
                      className="cursor-pointer flex flex-col items-center justify-center py-10 px-6 text-center"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        Click to upload
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </p>
                      <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                        or drag and drop
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative group">
                    {/* Aspect ratio: square on mobile, square on all */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={imagePreview}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      aria-label="Remove image"
                      className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors duration-150 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Replace button — always visible on touch */}
                    <label
                      htmlFor="image-upload-replace"
                      className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <Upload className="w-4 h-4" />
                      Replace Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-replace"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Status
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 active:bg-gray-100 transition-colors duration-150 min-h-[64px]">
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        Active
                      </p>
                      <p className="text-sm text-gray-500">Visible in store</p>
                    </div>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-900 border-gray-300 rounded accent-green-900"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 active:bg-gray-100 transition-colors duration-150 min-h-[64px]">
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        Featured
                      </p>
                      <p className="text-sm text-gray-500">Show on homepage</p>
                    </div>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-900 border-gray-300 rounded accent-green-900"
                    />
                  </label>
                </div>
              </div>

              {/* Margin summary — only shows when data present, sticky on lg */}
              {formData.price && formData.cost_price && (
                <div className="hidden lg:block bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-5">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Profit Margin
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {calculateMargin()}%
                  </p>
                  {formData.compare_at_price && calculateDiscount() > 0 && (
                    <p className="text-sm text-green-700 mt-1">
                      {calculateDiscount()}% discount shown to customers
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── LEFT COLUMN (main form) ── */}
            <div className="lg:col-span-2 lg:order-1 space-y-5">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Moringa Leaf Capsules"
                      className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-colors duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 ${
                        validationErrors.name
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    {validationErrors.name && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      readOnly
                      className="w-full px-4 py-3 border-2 rounded-xl text-base bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Short Description
                    </label>
                    <input
                      type="text"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      maxLength={150}
                      placeholder="A brief one-liner shown in product cards"
                      className="w-full px-4 py-3 border-2 rounded-xl text-base border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 transition-colors duration-150"
                    />
                    <p className="mt-1 text-xs text-gray-400 text-right">
                      {formData.short_description.length}/150
                    </p>
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Describe the product, its benefits, ingredients…"
                      className="w-full px-4 py-3 border-2 rounded-xl text-base leading-relaxed border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 resize-none transition-colors duration-150"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Pricing
                </h2>

                {/* Stack on mobile, 3-col on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold text-base pointer-events-none">
                        ₦
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        className={`w-full pl-9 pr-4 py-3 border-2 rounded-xl text-base transition-colors duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 ${
                          validationErrors.price
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {validationErrors.price && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {validationErrors.price}
                      </p>
                    )}
                  </div>

                  {/* Compare At Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Compare At Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none">
                        ₦
                      </span>
                      <input
                        type="number"
                        name="compare_at_price"
                        value={formData.compare_at_price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        className={`w-full pl-9 pr-4 py-3 border-2 rounded-xl text-base transition-colors duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 ${
                          validationErrors.compare_at_price
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {validationErrors.compare_at_price && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {validationErrors.compare_at_price}
                      </p>
                    )}
                  </div>

                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cost Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none">
                        ₦
                      </span>
                      <input
                        type="number"
                        name="cost_price"
                        value={formData.cost_price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        className="w-full pl-9 pr-4 py-3 border-2 rounded-xl text-base border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 transition-colors duration-150"
                      />
                    </div>
                  </div>
                </div>

                {/* Margin — visible inline on mobile, hidden on lg (shown in sidebar) */}
                {formData.price && formData.cost_price && (
                  <div className="lg:hidden mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Profit Margin
                    </span>
                    <span className="text-xl font-bold text-green-900">
                      {calculateMargin()}%
                    </span>
                  </div>
                )}
              </div>

              {/* Inventory */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Inventory
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      min="0"
                      inputMode="numeric"
                      className="w-full px-4 py-3 border-2 rounded-xl text-base border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 transition-colors duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      name="low_stock_threshold"
                      value={formData.low_stock_threshold}
                      onChange={handleInputChange}
                      min="0"
                      inputMode="numeric"
                      className="w-full px-4 py-3 border-2 rounded-xl text-base border-gray-300 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 transition-colors duration-150"
                    />
                    <p className="mt-1.5 text-xs text-gray-400">
                      Alert when stock falls below this number
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Floating Save bar — only on mobile, shows when unsaved ── */}
              {hasUnsavedChanges && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shadow-lg">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 active:bg-red-100 transition-colors duration-150 min-h-[48px] disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 bg-green-900 text-white rounded-xl text-sm font-semibold hover:bg-green-800 active:bg-green-950 transition-colors duration-150 min-h-[48px] disabled:opacity-50 shadow-sm"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading…
                      </>
                    ) : updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Bottom spacer so content isn't hidden behind floating bar on mobile */}
              {hasUnsavedChanges && <div className="h-20 lg:hidden" />}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
