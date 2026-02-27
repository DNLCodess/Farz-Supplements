"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
} from "lucide-react";
import { toast } from "sonner";
import { createProduct } from "@/app/actions/products";
import { getCategories } from "@/app/actions/categories";

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    price: "",
    compare_at_price: "",
    cost_price: "",
    sku: "",

    category_id: "",
    stock_quantity: "0",
    low_stock_threshold: "10",
    weight: "",
    dimensions: "",
    images: [],
    is_active: true,
    is_featured: false,
    meta_title: "",
    meta_description: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("new-product-draft");
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
        setHasUnsavedChanges(true);

        // Load image preview if exists
        if (parsed.imagePreview) {
          setImagePreview(parsed.imagePreview);
        }

        toast.info("Draft restored from previous session");
      } catch (error) {
        console.error("Failed to restore draft:", error);
        localStorage.removeItem("new-product-draft");
      }
    }
  }, []);

  // Save to localStorage on changes (debounced)
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        const dataToSave = {
          ...formData,
          imagePreview: imagePreview,
        };
        localStorage.setItem("new-product-draft", JSON.stringify(dataToSave));
      }, 1000); // Save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, imagePreview, hasUnsavedChanges]);

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (result) => {
      if (result.success) {
        setHasUnsavedChanges(false);
        localStorage.removeItem("new-product-draft"); // Clear saved draft
        toast.success("Product created successfully!", {
          icon: <Check className="w-4 h-4" />,
        });
        router.push("/admin/products");
      } else {
        toast.error(result.error || "Failed to create product");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges && !createMutation.isPending) {
          handleSubmit(e);
        }
      }
      // Escape to go back
      if (e.key === "Escape" && !createMutation.isPending) {
        router.push("/admin/products");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [hasUnsavedChanges, createMutation.isPending]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setHasUnsavedChanges(true);

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Auto-generate slug from name (always update unless user manually edited)
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
      setFormData((prev) => ({ ...prev, slug }));
    }

    // Auto-fill meta title
    if (name === "name" && !formData.meta_title) {
      setFormData((prev) => ({ ...prev, meta_title: value }));
    }

    // Auto-fill short description from description
    if (
      name === "description" &&
      !formData.short_description &&
      value.length > 0
    ) {
      const short = value.substring(0, 150);
      setFormData((prev) => ({ ...prev, short_description: short }));
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
      setImageFile(file); // Store actual file for upload
      setFormData((prev) => ({
        ...prev,
        imagePreview: reader.result, // For localStorage persistence
      }));
      setHasUnsavedChanges(true);
      toast.success("Image ready for upload");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData((prev) => ({
      ...prev,
      images: [],
      imagePreview: null,
    }));
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
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

    if (!formData.slug.trim()) {
      errors.slug = "URL slug is required";
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
      let imageUrl = null;

      // Upload image to Supabase storage if exists
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

      // Prepare product data without base64 image
      const productData = {
        ...formData,
        image_url: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      };

      // Remove imagePreview field (used only for localStorage)
      delete productData.imagePreview;

      createMutation.mutate(productData);
    } catch (error) {
      setUploadingImage(false);
      toast.error(error.message || "Failed to process image");
    }
  };

  const calculateMargin = () => {
    const price = parseFloat(formData.price) || 0;
    const cost = parseFloat(formData.cost_price) || 0;
    if (price > 0 && cost > 0) {
      return (((price - cost) / price) * 100).toFixed(1);
    }
    return 0;
  };

  const calculateDiscount = () => {
    const price = parseFloat(formData.price) || 0;
    const comparePrice = parseFloat(formData.compare_at_price) || 0;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          {/* Mobile Layout - Stacked (< lg) */}
          <div className="flex flex-col gap-4 lg:hidden">
            {/* Top row - Back button and title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="shrink-0 p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Back to products"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-charcoal">
                    Add New Product
                  </h1>
                  {hasUnsavedChanges && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg whitespace-nowrap">
                      Unsaved
                    </span>
                  )}
                  {createMutation.isPending && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Saving
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5 hidden sm:block">
                  Fill in the details below
                </p>
              </div>
            </div>

            {/* Bottom row - Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-150 min-h-[44px] active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending ||
                  uploadingImage ||
                  !hasUnsavedChanges
                }
                className="flex-[1.5] flex items-center justify-center gap-2 px-4 py-3 bg-green-900 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow min-h-[44px] active:scale-95"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Product</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Layout - Horizontal (>= lg) */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-150 min-w-[48px] min-h-[48px] flex items-center justify-center"
                title="Back to products (Esc)"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-charcoal">
                    Add New Product
                  </h1>
                  {hasUnsavedChanges && (
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-lg animate-fade-in">
                      Unsaved changes
                    </span>
                  )}
                  {createMutation.isPending && (
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  )}
                </div>
                <p className="text-base text-gray-600 mt-1">
                  Fill in the details below to add a new product
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl text-base font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-150 min-h-[48px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  createMutation.isPending ||
                  uploadingImage ||
                  !hasUnsavedChanges
                }
                className="flex items-center gap-2 px-8 py-3.5 bg-green-900 text-white rounded-xl text-base font-semibold hover:bg-green-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow min-h-[48px]"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading Image...
                  </>
                ) : createMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-green-900" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-charcoal">
                  Basic Information
                </h2>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-2.5">
                    Product Name{" "}
                    <span className="text-red-500 text-base sm:text-lg">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g., Organic Turmeric Capsules"
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 border-2 rounded-xl text-base sm:text-lg transition-all duration-150 ${
                      focusedField === "name"
                        ? "border-green-900 ring-4 ring-green-900/10"
                        : validationErrors.name
                          ? "border-red-500"
                          : "border-gray-300"
                    } focus:outline-none`}
                    required
                    autoFocus
                  />
                  {validationErrors.name && (
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Product Slug */}
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    URL Slug <span className="text-red-500 text-lg">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 text-base font-mono">
                      /products/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("slug")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="auto-generated-from-name"
                      className={`w-full pl-28 pr-24 py-4 border-2 rounded-xl text-lg font-mono transition-all duration-150 bg-gray-50 ${
                        focusedField === "slug"
                          ? "border-green-900 ring-4 ring-green-900/10"
                          : validationErrors.slug
                            ? "border-red-500"
                            : "border-gray-300"
                      } focus:outline-none`}
                      readOnly
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                      Auto
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Automatically generated from product name
                  </p>
                  {validationErrors.slug && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.slug}
                    </p>
                  )}
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("short_description")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Brief one-line description for listings"
                    maxLength={150}
                    className={`w-full px-5 py-4 border-2 rounded-xl text-lg transition-all duration-150 ${
                      focusedField === "short_description"
                        ? "border-green-900 ring-4 ring-green-900/10"
                        : "border-gray-300"
                    } focus:outline-none`}
                  />
                  <p
                    className={`text-sm mt-2 transition-colors font-medium ${getCharCountColor(formData.short_description.length, 150)}`}
                  >
                    {formData.short_description.length}/150 characters
                  </p>
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("description")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Detailed product description, benefits, usage instructions..."
                    rows={6}
                    className={`w-full px-5 py-4 border-2 rounded-xl text-lg leading-relaxed transition-all duration-150 resize-none ${
                      focusedField === "description"
                        ? "border-green-900 ring-4 ring-green-900/10"
                        : "border-gray-300"
                    } focus:outline-none`}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-900" />
                </div>
                <h2 className="text-lg font-semibold text-charcoal">Pricing</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Discount Price{" "}
                    <span className="text-red-500 text-lg">*</span>
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
                      onFocus={() => setFocusedField("price")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`w-full pl-12 pr-5 py-4 border-2 rounded-xl text-lg transition-all duration-150 ${
                        focusedField === "price"
                          ? "border-green-900 ring-4 ring-green-900/10"
                          : validationErrors.price
                            ? "border-red-500"
                            : "border-gray-300"
                      } focus:outline-none`}
                      required
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2.5">
                    Actual Price
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
                      onFocus={() => setFocusedField("compare_at_price")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`w-full pl-12 pr-5 py-4 border-2 rounded-xl text-lg transition-all duration-150 ${
                        focusedField === "compare_at_price"
                          ? "border-green-900 ring-4 ring-green-900/10"
                          : validationErrors.compare_at_price
                            ? "border-red-500"
                            : "border-gray-300"
                      } focus:outline-none`}
                    />
                  </div>
                  {validationErrors.compare_at_price && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.compare_at_price}
                    </p>
                  )}
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
                      onFocus={() => setFocusedField("cost_price")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`w-full pl-12 pr-5 py-4 border-2 rounded-xl text-lg transition-all duration-150 ${
                        focusedField === "cost_price"
                          ? "border-green-900 ring-4 ring-green-900/10"
                          : "border-gray-300"
                      } focus:outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Margin Calculator */}
              {formData.price && formData.cost_price && (
                <div className="mt-5 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-700">
                      Profit Margin
                    </span>
                    <span className="text-2xl font-bold text-green-900">
                      {calculateMargin()}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5 font-medium">
                    ₦
                    {(
                      parseFloat(formData.price) -
                      parseFloat(formData.cost_price)
                    ).toFixed(2)}{" "}
                    profit per unit
                  </p>
                </div>
              )}
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-green-900" />
                </div>
                <h2 className="text-lg font-semibold text-charcoal">
                  Inventory
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    SKU (Stock Code)
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Auto-generated"
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg font-mono transition-all duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Leave empty to auto-generate
                  </p>
                </div>

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
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg transition-all duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2.5">
                    Low Stock Alert At
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg transition-all duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Alert when stock falls below this number
                  </p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <Tag className="w-4 h-4 text-green-900" />
                </div>
                <h2 className="text-lg font-semibold text-charcoal">
                  Product Details
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg transition-all duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 appearance-none bg-white cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='10' viewBox='0 0 16 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L8 8.5L15 1.5' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1.25rem center",
                      paddingRight: "3rem",
                    }}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg transition-all duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-green-900" />
                </div>
                <h2 className="text-lg font-semibold text-charcoal">
                  SEO & Metadata
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2.5">
                    Meta Title (For Search Engines)
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from product name"
                    maxLength={60}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg transition-all duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10"
                  />
                  <p
                    className={`text-sm mt-2 transition-colors font-medium ${getCharCountColor(formData.meta_title.length, 60)}`}
                  >
                    {formData.meta_title.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2.5">
                    Meta Description (For Search Engines)
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    placeholder="Brief description for search engines"
                    maxLength={160}
                    rows={3}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl text-lg leading-relaxed transition-all duration-150 focus:outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/10 resize-none"
                  />
                  <p
                    className={`text-sm mt-2 transition-colors font-medium ${getCharCountColor(formData.meta_description.length, 160)}`}
                  >
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Media & Status */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-green-900" />
                </div>
                <h2 className="text-lg font-semibold text-charcoal">
                  Product Image
                </h2>
              </div>

              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`relative border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-green-900 bg-green-50 scale-[1.02]"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                      <Upload className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Click to upload image
                    </p>
                    <p className="text-base text-gray-500">
                      or drag and drop here
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      PNG, JPG or WebP (max. 5MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative group animate-fade-in">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-sm">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-sm">
              <h2 className="text-lg font-semibold text-charcoal mb-5">
                Status
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-150 group min-h-[72px]">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 group-hover:text-green-900 transition-colors">
                      Active
                    </p>
                    <p className="text-base text-gray-600 mt-1">
                      Product visible in store
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-green-900 border-gray-300 rounded-md focus:ring-green-900 transition-all cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-150 group min-h-[72px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-gray-900 group-hover:text-green-900 transition-colors">
                        Featured
                      </p>
                      <Sparkles className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-base text-gray-600 mt-1">
                      Show on homepage
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-green-900 border-gray-300 rounded-md focus:ring-green-900 transition-all cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Quick Stats Preview */}
            {formData.price && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6 animate-fade-in">
                <h3 className="text-base font-bold text-green-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quick Preview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-700">
                      Price
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      ₦{parseFloat(formData.price).toLocaleString()}
                    </span>
                  </div>
                  {formData.compare_at_price && calculateDiscount() > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-700">
                        Discount
                      </span>
                      <span className="text-xl font-bold text-green-900">
                        {calculateDiscount()}% off
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-700">
                      Stock
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formData.stock_quantity} units
                    </span>
                  </div>
                  {formData.cost_price && formData.stock_quantity > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t-2 border-green-200">
                      <span className="text-base font-medium text-gray-700">
                        Inventory Value
                      </span>
                      <span className="text-xl font-bold text-green-900">
                        ₦
                        {(
                          parseFloat(formData.price) *
                          parseInt(formData.stock_quantity)
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Help Tips */}
            <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6">
              <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Quick Tips
              </h3>
              <ul className="space-y-3 text-base text-blue-800">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-xl font-bold">
                    •
                  </span>
                  <span className="leading-relaxed">
                    Add high-quality images for better customer engagement
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-xl font-bold">
                    •
                  </span>
                  <span className="leading-relaxed">
                    Include detailed descriptions with benefits
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-xl font-bold">
                    •
                  </span>
                  <span className="leading-relaxed">
                    Set competitive pricing based on market research
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1 text-xl font-bold">
                    •
                  </span>
                  <span className="leading-relaxed">
                    Keep stock quantities updated regularly
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
