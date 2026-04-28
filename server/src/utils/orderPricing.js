import { AppError } from "./AppError.js";

export const getActiveDiscount = (product, now = new Date()) => {
  const discount = product.discount || {};

  if (!discount.percentage) return 0;

  const startDate = discount.startDate ? new Date(discount.startDate) : null;
  const endDate = discount.endDate ? new Date(discount.endDate) : null;

  if (startDate && now < startDate) return 0;
  if (endDate && now > endDate) return 0;

  return discount.percentage;
};

export const getEffectivePrice = (product) => {
  const discountPercentage = getActiveDiscount(product);
  const finalPrice = discountPercentage
    ? Number((product.price * (1 - discountPercentage / 100)).toFixed(2))
    : product.price;

  return { finalPrice, discountPercentage };
};

export const normalizeShippingAddress = (address = {}) => ({
  label: address.label?.trim() || "Home",
  fullName: address.fullName?.trim() || "",
  phone: address.phone?.trim() || "",
  addressLine1: address.addressLine1?.trim() || "",
  addressLine2: address.addressLine2?.trim() || "",
  city: address.city?.trim() || "",
  state: address.state?.trim() || "",
  postalCode: address.postalCode?.trim() || "",
  country: address.country?.trim() || "India"
});

export const validateShippingAddress = (address) => {
  const requiredFields = ["fullName", "phone", "addressLine1", "city", "postalCode"];
  const missingField = requiredFields.find((field) => !address[field]);

  if (missingField) {
    throw new AppError(`Shipping ${missingField} is required`, 400);
  }
};

export const buildOrderTotals = (unitPrice, quantity) => {
  const subtotal = Number((unitPrice * quantity).toFixed(2));
  const tax = Number((subtotal * 0.05).toFixed(2));
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = Number((subtotal + tax + shippingFee).toFixed(2));

  return { subtotal, tax, shippingFee, total };
};
