import dotenv from "dotenv";

dotenv.config();

for (const key of ["MONGO_URI", "JWT_SECRET"]) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_ENV: process.env.PAYPAL_ENV || "sandbox",
  PAYPAL_CURRENCY: process.env.PAYPAL_CURRENCY || "INR"
};
