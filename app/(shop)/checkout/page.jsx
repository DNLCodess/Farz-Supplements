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
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import AddressSelector from "@/components/shared/checkout/address-selector";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { initiateCheckout, isLoading } = useCheckout();
  const { user, isAuthenticated } = useAuth();

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
  const [checkoutError, setCheckoutError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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
            is_default: addresses.length === 0,
          });
        } catch (error) {
          console.error("Failed to save address:", error);
        }
      }

      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePreviousStep = () => {
    setCheckoutError(null);
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!validateStep(2)) return;

    if (items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }

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

    if (!checkoutData.customer_email || !checkoutData.customer_phone) {
      setCheckoutError("Missing required contact information");
      toast.error("Please check your contact information");
      return;
    }

    if (
      !checkoutData.shipping_address ||
      !checkoutData.shipping_city ||
      !checkoutData.shipping_state
    ) {
      setCheckoutError("Missing required shipping information");
      toast.error("Please check your shipping address");
      return;
    }

    try {
      const result = await initiateCheckout(checkoutData);

      if (result.success) {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("pending_order_id", result.order.id);
            localStorage.setItem(
              "pending_payment_reference",
              result.payment.reference,
            );
          } catch (storageError) {
            console.error("LocalStorage error:", storageError);
          }
        }

        clearCart();

        if (result.payment.authorization_url) {
          window.location.href = result.payment.authorization_url;
        } else {
          throw new Error("Missing payment URL");
        }
      } else {
        const errorMessage = result.error || "Failed to create order";
        setCheckoutError(errorMessage);

        toast.error(errorMessage, {
          duration: 5000,
        });

        if (result.step === "stock_check") {
          window.scrollTo({ top: 0, behavior: "smooth" });

          setTimeout(() => {
            toast.info("Please review your cart and try again", {
              action: {
                label: "View Cart",
                onClick: () => router.push("/cart"),
              },
            });
          }, 1000);
        }

        if (result.step === "payment_init") {
          setRetryCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error.message || "An unexpected error occurred";
      setCheckoutError(errorMessage);
      toast.error("Something went wrong. Please try again.");
      setRetryCount((prev) => prev + 1);
    }
  };

  const handleRetryPayment = () => {
    setCheckoutError(null);
    setRetryCount(0);
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-12">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-green-900 hover:text-green-700 font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back to Cart
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900">
            Secure Checkout
          </h1>
        </div>

        {/* Progress Steps - Desktop */}
        <div className="hidden md:block mb-6 lg:mb-8 bg-white rounded-xl lg:rounded-2xl border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 lg:w-14 lg:h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? "bg-green-900 border-green-900"
                          : isActive
                            ? "bg-white border-green-900"
                            : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 lg:w-7 lg:h-7 ${isActive ? "text-green-900" : "text-gray-500"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs lg:text-base font-bold ${
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
                      className={`h-1 flex-1 mx-2 lg:mx-4 rounded transition-colors ${
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
        <div className="md:hidden mb-4 bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-600">
              Step {currentStep} of 3
            </span>
            <span className="text-xs font-bold text-green-900">
              {steps[currentStep - 1].title}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-green-900 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {checkoutError && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-red-900 mb-1 text-sm sm:text-base">
                  Payment Failed
                </h3>
                <p className="text-xs sm:text-sm text-red-800 mb-2 break-words">
                  {checkoutError}
                </p>
                <button
                  onClick={handleRetryPayment}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-xs sm:text-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Form - Left Column */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmitOrder}
              className="space-y-4 sm:space-y-6"
            >
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-900" />
                    Contact Information
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="customer_first_name"
                          value={formData.customer_first_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
                            errors.customer_first_name
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="John"
                        />
                        {errors.customer_first_name && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.customer_first_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="customer_last_name"
                          value={formData.customer_last_name}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
                            errors.customer_last_name
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="Doe"
                        />
                        {errors.customer_last_name && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.customer_last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="email"
                          name="customer_email"
                          value={formData.customer_email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
                            errors.customer_email
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.customer_email && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.customer_email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          name="customer_phone"
                          value={formData.customer_phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
                            errors.customer_phone
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="08012345678"
                        />
                      </div>
                      {errors.customer_phone && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="mt-4 sm:mt-5 w-full bg-green-900 text-white px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Shipping
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-900" />
                    Shipping Address
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    {isAuthenticated && addresses.length > 0 && (
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
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

                    {(useNewAddress ||
                      !isAuthenticated ||
                      addresses.length === 0) && (
                      <>
                        <label className="flex items-center gap-2 p-2.5 sm:p-3 bg-gray-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sameAsCustomer}
                            onChange={(e) =>
                              setSameAsCustomer(e.target.checked)
                            }
                            className="w-4 h-4 text-green-900 focus:ring-green-900 rounded"
                          />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            Shipping name same as contact name
                          </span>
                        </label>

                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">
                              First Name *
                            </label>
                            <input
                              type="text"
                              name="shipping_first_name"
                              value={formData.shipping_first_name}
                              onChange={handleInputChange}
                              disabled={sameAsCustomer}
                              className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
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
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.shipping_first_name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">
                              Last Name *
                            </label>
                            <input
                              type="text"
                              name="shipping_last_name"
                              value={formData.shipping_last_name}
                              onChange={handleInputChange}
                              disabled={sameAsCustomer}
                              className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
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
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.shipping_last_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1.5">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            name="shipping_address"
                            value={formData.shipping_address}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
                              errors.shipping_address
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-300 focus:border-green-900"
                            }`}
                            placeholder="123 Main Street, Apt 4B"
                          />
                          {errors.shipping_address && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.shipping_address}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">
                              City *
                            </label>
                            <input
                              type="text"
                              name="shipping_city"
                              value={formData.shipping_city}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
                                errors.shipping_city
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-green-900"
                              }`}
                              placeholder="Lagos"
                            />
                            {errors.shipping_city && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.shipping_city}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">
                              State *
                            </label>
                            <select
                              name="shipping_state"
                              value={formData.shipping_state}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2.5 sm:py-3 border rounded-lg text-sm focus:outline-none transition-colors ${
                                errors.shipping_state
                                  ? "border-red-500 focus:border-red-600"
                                  : "border-gray-300 focus:border-green-900"
                              }`}
                            >
                              <option value="">Select</option>
                              {states.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                            {errors.shipping_state && (
                              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.shipping_state}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1.5">
                            Postal Code (Optional)
                          </label>
                          <input
                            type="text"
                            name="shipping_postal_code"
                            value={formData.shipping_postal_code}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-900 transition-colors"
                            placeholder="100001"
                          />
                        </div>

                        {isAuthenticated && useNewAddress && (
                          <label className="flex items-center gap-2 p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveAddress}
                              onChange={(e) => setSaveAddress(e.target.checked)}
                              className="w-4 h-4 text-green-900 focus:ring-green-900 rounded"
                            />
                            <div className="flex items-center gap-1.5">
                              <Bookmark className="w-4 h-4 text-green-700" />
                              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                                Save for future orders
                              </span>
                            </div>
                          </label>
                        )}

                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1.5">
                            Order Notes (Optional)
                          </label>
                          <textarea
                            name="order_notes"
                            value={formData.order_notes}
                            onChange={handleInputChange}
                            rows="2"
                            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-900 transition-colors resize-none"
                            placeholder="Special delivery instructions?"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-5 flex gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 bg-white border border-gray-300 text-gray-900 px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={isCreating}
                      className="flex-1 bg-green-900 text-white px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-green-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="hidden xs:inline">Saving...</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden xs:inline">Review Order</span>
                          <span className="xs:hidden">Review</span>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-900" />
                    Review Your Order
                  </h2>

                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">
                      Contact Information
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {formData.customer_first_name}{" "}
                      {formData.customer_last_name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 break-all">
                      {formData.customer_email}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {formData.customer_phone}
                    </p>
                  </div>

                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">
                      Shipping Address
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {formData.shipping_first_name}{" "}
                      {formData.shipping_last_name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {formData.shipping_address}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {formData.shipping_city}, {formData.shipping_state}
                      {formData.shipping_postal_code &&
                        ` ${formData.shipping_postal_code}`}
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 mb-4 sm:mb-5">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-green-900 mb-0.5 text-xs sm:text-sm">
                          Secure Payment
                        </p>
                        <p className="text-xs text-green-800 leading-relaxed">
                          You'll be redirected to Paystack to complete your
                          payment securely.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      disabled={isLoading}
                      className="flex-1 bg-white border border-gray-300 text-gray-900 px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:border-green-900 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-green-900 text-white px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span className="hidden xs:inline">
                            Processing...
                          </span>
                          <span className="xs:hidden">Wait...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden xs:inline">
                            Proceed to Payment
                          </span>
                          <span className="xs:hidden">Pay Now</span>
                        </>
                      )}
                    </button>
                  </div>

                  {retryCount > 0 && (
                    <p className="mt-3 text-center text-xs text-gray-600">
                      Having trouble? Check your connection and try again.
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-6 lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200 max-h-[200px] sm:max-h-[300px] overflow-y-auto">
                {items.map((item) => {
                  const product = item.product || item;
                  const itemName = item.name || product.name || "Product";
                  const itemImages = item.images || product.images || [];
                  const itemPrice = item.price || product.price || 0;

                  return (
                    <div key={item.id} className="flex gap-2 sm:gap-3">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                        {!imageErrors[item.id] ? (
                          <Image
                            src={
                              itemImages[0] || "/images/product-placeholder.png"
                            }
                            alt={itemName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 48px, 64px"
                            onError={() => handleImageError(item.id)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl">
                            🌿
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-0.5">
                          {itemName}
                        </h3>
                        <p className="text-sm sm:text-base font-bold text-green-900">
                          ₦{(itemPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-bold text-gray-900">
                    {shippingCost === 0 ? (
                      <span className="text-green-700">Free</span>
                    ) : (
                      `₦${shippingCost.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Transaction Fee</span>
                  <span className="font-bold text-gray-900">
                    ₦{paystackFee.toLocaleString()}
                  </span>
                </div>
                {subtotal < freeShippingThreshold && (
                  <p className="text-xs text-green-700 bg-green-50 p-2 rounded-lg">
                    Add ₦{(freeShippingThreshold - subtotal).toLocaleString()}{" "}
                    more for free shipping!
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  Total
                </span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">
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
