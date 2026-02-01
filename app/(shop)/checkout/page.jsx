"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [imageErrors, setImageErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    // Contact Info
    email: "",
    phone: "",

    // Shipping Info
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",

    // Payment
    paymentMethod: "card",

    // Order notes
    orderNotes: "",
  });

  const [errors, setErrors] = useState({});

  const subtotal = getTotalPrice();
  const shipping = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + shipping;

  const states = [
    "Lagos",
    "Abuja",
    "Rivers",
    "Kano",
    "Oyo",
    "Delta",
    "Edo",
    "Ogun",
    "Kaduna",
    "Anambra",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Invalid email format";

      if (!formData.phone) newErrors.phone = "Phone number is required";
      else if (!/^[0-9]{11}$/.test(formData.phone.replace(/\s/g, "")))
        newErrors.phone = "Invalid phone number (11 digits)";
    }

    if (step === 2) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
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

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      clearCart();
      router.push("/order-confirmation");
    }, 2000);
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({ ...prev, [productId]: true }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Add items to your cart before checking out
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-green-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Contact", icon: User },
    { number: 2, title: "Shipping", icon: MapPin },
    { number: 3, title: "Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-green-900 hover:text-green-700 font-medium text-lg mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Checkout
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all ${
                        isCompleted
                          ? "bg-green-900 border-green-900"
                          : isActive
                            ? "bg-white border-green-900"
                            : "bg-gray-100 border-gray-300"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      ) : (
                        <Icon
                          className={`w-7 h-7 ${isActive ? "text-green-900" : "text-gray-500"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-base font-bold ${
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
                      className={`h-1 flex-1 mx-4 rounded ${
                        isCompleted ? "bg-green-900" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form - Left Column */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <User className="w-7 h-7 text-green-900" />
                    Contact Information
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                            errors.email
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                            errors.phone
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="08012345678"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="mt-6 w-full bg-green-900 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
                  >
                    Continue to Shipping
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Information */}
              {currentStep === 2 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <MapPin className="w-7 h-7 text-green-900" />
                    Shipping Address
                  </h2>

                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-base font-bold text-gray-900 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                            errors.firstName
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="John"
                        />
                        {errors.firstName && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-base font-bold text-gray-900 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                            errors.lastName
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="Doe"
                        />
                        {errors.lastName && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-4 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                          errors.address
                            ? "border-red-500 focus:border-red-600"
                            : "border-gray-300 focus:border-green-900"
                        }`}
                        placeholder="123 Main Street, Apartment 4B"
                      />
                      {errors.address && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-base font-bold text-gray-900 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                            errors.city
                              ? "border-red-500 focus:border-red-600"
                              : "border-gray-300 focus:border-green-900"
                          }`}
                          placeholder="Lagos"
                        />
                        {errors.city && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-base font-bold text-gray-900 mb-2">
                          State *
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-4 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                            errors.state
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
                        {errors.state && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {errors.state}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-base font-bold text-gray-900 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900 transition-colors"
                          placeholder="100001"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-bold text-gray-900 mb-2">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        name="orderNotes"
                        value={formData.orderNotes}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-green-900 transition-colors resize-none"
                        placeholder="Any special delivery instructions?"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-green-900 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <CreditCard className="w-7 h-7 text-green-900" />
                    Payment Method
                  </h2>

                  <div className="space-y-4 mb-6">
                    <label className="flex items-center gap-4 p-5 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-green-900 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleInputChange}
                        className="w-6 h-6 text-green-900 focus:ring-green-900"
                      />
                      <CreditCard className="w-6 h-6 text-gray-700" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-base">
                          Card Payment
                        </p>
                        <p className="text-sm text-gray-600">
                          Pay securely with your debit or credit card
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-5 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-green-900 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={formData.paymentMethod === "transfer"}
                        onChange={handleInputChange}
                        className="w-6 h-6 text-green-900 focus:ring-green-900"
                      />
                      <Truck className="w-6 h-6 text-gray-700" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-base">
                          Bank Transfer
                        </p>
                        <p className="text-sm text-gray-600">
                          Transfer to our bank account
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-5 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-green-900 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="delivery"
                        checked={formData.paymentMethod === "delivery"}
                        onChange={handleInputChange}
                        className="w-6 h-6 text-green-900 focus:ring-green-900"
                      />
                      <Package className="w-6 h-6 text-gray-700" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-base">
                          Pay on Delivery
                        </p>
                        <p className="text-sm text-gray-600">
                          Pay when you receive your order
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="p-5 bg-green-50 rounded-xl border-2 border-green-200 mb-6">
                    <div className="flex items-start gap-3">
                      <Lock className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-green-900 mb-1">
                          Secure Checkout
                        </p>
                        <p className="text-sm text-green-800">
                          Your payment information is encrypted and secure. We
                          never store your card details.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:border-green-900 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-green-900 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-6 h-6" />
                          <span>Complete Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Products */}
              <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                      {!imageErrors[item.id] ? (
                        <Image
                          src={
                            item.images?.[0] ||
                            "/images/product-placeholder.png"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                          onError={() => handleImageError(item.id)}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-3xl">
                          🌿
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-lg font-bold text-green-900">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-bold text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-700">Free</span>
                    ) : (
                      `₦${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-green-900">
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
