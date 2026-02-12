"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { useCheckout } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { useAddresses } from "@/hooks/use-addresses";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import AddressSelector from "@/components/shared/checkout/address-selector";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { initiateCheckout, isLoading } = useCheckout();
  const { user, isAuthenticated } = useAuth();

  // Fetch user addresses if authenticated
  const {
    addresses,
    defaultAddress,
    isLoading: isLoadingAddresses,
    createAddress,
    isCreating,
  } = useAddresses(user?.id);

  const [imageErrors, setImageErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(false);

  const [formData, setFormData] = useState({
    customer_email: "",
    customer_phone: "",
    customer_first_name: "",
    customer_last_name: "",
    shipping_first_name: "",
    shipping_last_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal_code: "",
    order_notes: "",
  });

  const [errors, setErrors] = useState({});
  const [sameAsCustomer, setSameAsCustomer] = useState(true);

  const subtotal = getTotalPrice();
  const freeShippingThreshold = 50000;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 2500;
  const amountBeforeFee = subtotal + shippingCost;
  const paystackFee = Math.min(Math.round(amountBeforeFee * 0.015), 2000);
  const total = amountBeforeFee + paystackFee;

  const states = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    "FCT",
  ];

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  // Pre-fill user info if authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_email: user.email || "",
        customer_first_name: user.first_name || "",
        customer_last_name: user.last_name || "",
        customer_phone: user.phone || "",
      }));
    }
  }, [user]);

  // Auto-select default address
  useEffect(() => {
    if (defaultAddress && !useNewAddress) {
      setSelectedAddressId(defaultAddress.id);
      handleSelectSavedAddress(defaultAddress);
    }
  }, [defaultAddress, useNewAddress]);

  useEffect(() => {
    if (sameAsCustomer) {
      setFormData((prev) => ({
        ...prev,
        shipping_first_name: prev.customer_first_name,
        shipping_last_name: prev.customer_last_name,
      }));
    }
  }, [
    sameAsCustomer,
    formData.customer_first_name,
    formData.customer_last_name,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectSavedAddress = (address) => {
    setSelectedAddressId(address.id);
    setFormData((prev) => ({
      ...prev,
      shipping_first_name: formData.customer_first_name,
      shipping_last_name: formData.customer_last_name,
      shipping_address:
        address.address_line1 +
        (address.address_line2 ? `, ${address.address_line2}` : ""),
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_postal_code: address.postal_code || "",
    }));
    setUseNewAddress(false);
  };

  const handleAddNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setFormData((prev) => ({
      ...prev,
      shipping_address: "",
      shipping_city: "",
      shipping_state: "",
      shipping_postal_code: "",
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.customer_email) {
        newErrors.customer_email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
        newErrors.customer_email = "Invalid email format";
      }

      if (!formData.customer_phone) {
        newErrors.customer_phone = "Phone number is required";
      } else if (
        !/^[0-9]{11}$/.test(formData.customer_phone.replace(/\s/g, ""))
      ) {
        newErrors.customer_phone = "Invalid phone (11 digits required)";
      }

      if (!formData.customer_first_name) {
        newErrors.customer_first_name = "First name is required";
      }

      if (!formData.customer_last_name) {
        newErrors.customer_last_name = "Last name is required";
      }
    }

    if (step === 2) {
      if (!formData.shipping_first_name) {
        newErrors.shipping_first_name = "First name is required";
      }
      if (!formData.shipping_last_name) {
        newErrors.shipping_last_name = "Last name is required";
      }
      if (!formData.shipping_address) {
        newErrors.shipping_address = "Address is required";
      }
      if (!formData.shipping_city) {
        newErrors.shipping_city = "City is required";
      }
      if (!formData.shipping_state) {
        newErrors.shipping_state = "State is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (validateStep(currentStep)) {
      // Save address if requested (authenticated users only)
      if (
        currentStep === 2 &&
        saveAddress &&
        useNewAddress &&
        isAuthenticated
      ) {
        try {
          await createAddress({
            address_type: "shipping",
            address_line1: formData.shipping_address,
            city: formData.shipping_city,
            state: formData.shipping_state,
            postal_code: formData.shipping_postal_code || null,
            is_default: addresses.length === 0, // Make first address default
          });
        } catch (error) {
          console.error("Failed to save address:", error);
          // Don't block checkout if address save fails
        }
      }

      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!validateStep(2)) return;

    const checkoutData = {
      customer_email: formData.customer_email.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_first_name: formData.customer_first_name.trim(),
      customer_last_name: formData.customer_last_name.trim(),
      shipping_first_name: formData.shipping_first_name.trim(),
      shipping_last_name: formData.shipping_last_name.trim(),
      shipping_address: formData.shipping_address.trim(),
      shipping_city: formData.shipping_city.trim(),
      shipping_state: formData.shipping_state.trim(),
      shipping_postal_code: formData.shipping_postal_code?.trim() || null,
      order_notes: formData.order_notes?.trim() || null,
      items: items.map((item) => ({
        product_id: item.id,
        unit_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        name: item.name,
        images: item.images,
      })),
      subtotal,
      shipping_cost: shippingCost,
    };

    const result = await initiateCheckout(checkoutData);

    if (result.success) {
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_order_id", result.order.id);
        localStorage.setItem(
          "pending_payment_reference",
          result.payment.reference,
        );
      }

      clearCart();
      window.location.href = result.payment.authorization_url;
    } else {
      toast.error(result.error || "Failed to create order");

      if (result.step === "stock_check") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  if (items.length === 0) {
    return null;
  }

  const steps = [
    { number: 1, title: "Contact", icon: User },
    { number: 2, title: "Shipping", icon: MapPin },
    { number: 3, title: "Review", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-green-900 hover:text-green-700 font-semibold text-base sm:text-lg mb-3 sm:mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Cart
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Secure Checkout
          </h1>
        </div>

        {/* Progress Steps - Desktop */}
        <div className="hidden sm:block mb-8 bg-white rounded-2xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-3 transition-all ${
                        isCompleted
                          ? "bg-green-900 border-green-900"
                          : isActive
                            ? "bg-white border-green-900"
                            : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      ) : (
                        <Icon
                          className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? "text-green-900" : "text-gray-500"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 sm:mt-3 text-sm sm:text-base font-bold ${
                        isActive || isCompleted
                          ? "text-green-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 sm:mx-4 rounded transition-colors ${
                        isCompleted ? "bg-green-900" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Steps - Mobile */}
        <div className="sm:hidden mb-6 bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-600">
              Step {currentStep} of 3
            </span>
            <span className="text-sm font-bold text-green-900">
              {steps[currentStep - 1].title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form - Left Column */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmitOrder}
              className="space-y-5 sm:space-y-6"
            >
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-green-900" />
                    Contact Information
                  </h2>

                  <div className="space-y-4 sm:space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="customer_first_name"
                          value={formData.customer_first_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                            errors.customer_first_name
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="John"
                        />
                        {errors.customer_first_name && (
                          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {errors.customer_first_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="customer_last_name"
                          value={formData.customer_last_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                            errors.customer_last_name
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="Doe"
                        />
                        {errors.customer_last_name && (
                          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {errors.customer_last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <input
                          type="email"
                          name="customer_email"
                          value={formData.customer_email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                            errors.customer_email
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.customer_email && (
                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {errors.customer_email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <input
                          type="tel"
                          name="customer_phone"
                          value={formData.customer_phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                            errors.customer_phone
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="08012345678"
                        />
                      </div>
                      {errors.customer_phone && (
                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {errors.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="mt-5 sm:mt-6 w-full bg-green-900 text-white px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Shipping
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-green-900" />
                    Shipping Address
                  </h2>

                  <div className="space-y-4 sm:space-y-5">
                    {/* Saved Addresses (Authenticated Users Only) */}
                    {isAuthenticated && addresses.length > 0 && (
                      <div>
                        <label className="block text-sm sm:text-base font-bold text-gray-900 mb-3">
                          Choose Address
                        </label>
                        <AddressSelector
                          addresses={addresses}
                          selectedAddressId={selectedAddressId}
                          onSelectAddress={handleSelectSavedAddress}
                          onAddNew={handleAddNewAddress}
                          isLoading={isLoadingAddresses}
                        />
                      </div>
                    )}

                    {/* New Address Form */}
                    {(useNewAddress ||
                      !isAuthenticated ||
                      addresses.length === 0) && (
                      <>
                        {/* Same as contact info checkbox */}
                        <label className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsCustomer}
                            onChange={(e) =>
                              setSameAsCustomer(e.target.checked)
                            }
                            className="w-4 h-4 sm:w-5 sm:h-5 text-green-900 focus:ring-green-900 rounded"
                          />
                          <span className="text-sm sm:text-base font-semibold text-gray-900">
                            Shipping name same as contact name
                          </span>
                        </label>

                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                          <div>
                            <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                              First Name *
                            </label>
                            <input
                              type="text"
                              name="shipping_first_name"
                              value={formData.shipping_first_name}
                              onChange={handleInputChange}
                              disabled={sameAsCustomer}
                              className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                                sameAsCustomer
                                  ? "bg-gray-100 cursor-not-allowed"
                                  : ""
                              } ${
                                errors.shipping_first_name
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-green-900"
                              }`}
                              placeholder="John"
                            />
                            {errors.shipping_first_name && (
                              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {errors.shipping_first_name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              name="shipping_last_name"
                              value={formData.shipping_last_name}
                              onChange={handleInputChange}
                              disabled={sameAsCustomer}
                              className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                                sameAsCustomer
                                  ? "bg-gray-100 cursor-not-allowed"
                                  : ""
                              } ${
                                errors.shipping_last_name
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-green-900"
                              }`}
                              placeholder="Doe"
                            />
                            {errors.shipping_last_name && (
                              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {errors.shipping_last_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            name="shipping_address"
                            value={formData.shipping_address}
                            onChange={handleInputChange}
                            className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                              errors.shipping_address
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-300 focus:border-green-900"
                            }`}
                            placeholder="123 Main Street, Apartment 4B"
                          />
                          {errors.shipping_address && (
                            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              {errors.shipping_address}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              name="shipping_city"
                              value={formData.shipping_city}
                              onChange={handleInputChange}
                              className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                                errors.shipping_city
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-green-900"
                              }`}
                              placeholder="Lagos"
                            />
                            {errors.shipping_city && (
                              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {errors.shipping_city}
                              </p>
                            )}
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                              State *
                            </label>
                            <select
                              name="shipping_state"
                              value={formData.shipping_state}
                              onChange={handleInputChange}
                              className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none transition-colors ${
                                errors.shipping_state
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-green-900"
                              }`}
                            >
                              <option value="">Select state</option>
                              {states.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                            {errors.shipping_state && (
                              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center gap-1.5 sm:gap-2">
                                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {errors.shipping_state}
                              </p>
                            )}
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              name="shipping_postal_code"
                              value={formData.shipping_postal_code}
                              onChange={handleInputChange}
                              className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:border-green-900 transition-colors"
                              placeholder="100001"
                            />
                          </div>
                        </div>

                        {/* Save Address Option (Authenticated Users Only) */}
                        {isAuthenticated && useNewAddress && (
                          <label className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-lg sm:rounded-xl cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-green-900 focus:ring-green-900 rounded"
                            />
                            <div className="flex items-center gap-2">
                              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                              <span className="text-sm sm:text-base font-semibold text-gray-900">
                                Save this address for future orders
                              </span>
                            </div>
                          </label>
                        )}

                        <div>
                          <label className="block text-sm sm:text-base font-bold text-gray-900 mb-2">
                            Order Notes (Optional)
                          </label>
                          <textarea
                            name="order_notes"
                            value={formData.order_notes}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:border-green-900 transition-colors resize-none"
                            placeholder="Any special delivery instructions?"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="w-full sm:flex-1 bg-white border-2 border-gray-300 text-gray-900 px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isCreating}
                      className="w-full sm:flex-1 bg-green-900 text-white px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Review Order
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit - Same as before */}
              {currentStep === 3 && (
                <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-900" />
                    Review Your Order
                  </h2>

                  {/* Contact Info */}
                  <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gray-50 rounded-lg sm:rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                      Contact Information
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                      {formData.customer_first_name}{" "}
                      {formData.customer_last_name}
                    </p>
                    <p className="text-sm sm:text-base text-gray-700">
                      {formData.customer_email}
                    </p>
                    <p className="text-sm sm:text-base text-gray-700">
                      {formData.customer_phone}
                    </p>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gray-50 rounded-lg sm:rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                      Shipping Address
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700">
                      {formData.shipping_first_name}{" "}
                      {formData.shipping_last_name}
                    </p>
                    <p className="text-sm sm:text-base text-gray-700">
                      {formData.shipping_address}
                    </p>
                    <p className="text-sm sm:text-base text-gray-700">
                      {formData.shipping_city}, {formData.shipping_state}
                      {formData.shipping_postal_code &&
                        ` ${formData.shipping_postal_code}`}
                    </p>
                  </div>

                  {/* Security Notice */}
                  <div className="p-4 sm:p-5 bg-green-50 rounded-lg sm:rounded-xl border-2 border-green-200 mb-5 sm:mb-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <div>
                        <p className="font-bold text-green-900 mb-1 text-sm sm:text-base">
                          Secure Payment
                        </p>
                        <p className="text-xs sm:text-sm text-green-800">
                          You'll be redirected to Paystack to complete your
                          payment securely. Your payment information is
                          encrypted and never stored on our servers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="w-full sm:flex-1 bg-white border-2 border-gray-300 text-gray-900 px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:flex-1 bg-green-900 text-white px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span>Proceed to Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary - Same as before but truncated for brevity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Order Summary
              </h2>

              {/* Products */}
              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b-2 border-gray-200 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                {items.map((item) => {
                  const product = item.product || item;
                  const itemName = item.name || product.name || "Product";
                  const itemImages = item.images || product.images || [];
                  const itemPrice = item.price || product.price || 0;

                  return (
                    <div key={item.id} className="flex gap-3 sm:gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden">
                        {!imageErrors[item.id] ? (
                          <Image
                            src={
                              itemImages[0] || "/images/product-placeholder.png"
                            }
                            alt={itemName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 64px, 80px"
                            onError={() => handleImageError(item.id)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl">
                            🌿
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-green-900 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
                          {itemName}
                        </h3>
                        <p className="text-base sm:text-lg font-bold text-green-900">
                          ₦{(itemPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 pb-5 sm:pb-6 border-b-2 border-gray-200">
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-bold text-gray-900">
                    {shippingCost === 0 ? (
                      <span className="text-green-700">Free</span>
                    ) : (
                      `₦${shippingCost.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-700">Transaction Fee</span>
                  <span className="font-bold text-gray-900">
                    ₦{paystackFee.toLocaleString()}
                  </span>
                </div>
                {subtotal < freeShippingThreshold && (
                  <p className="text-xs sm:text-sm text-green-700 bg-green-50 p-2.5 sm:p-3 rounded-lg">
                    Add ₦{(freeShippingThreshold - subtotal).toLocaleString()}{" "}
                    more for free shipping!
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  Total
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-green-900">
                  ₦{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
