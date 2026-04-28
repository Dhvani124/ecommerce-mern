import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: Object, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cod", "razorpay", "paypal"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentResult: {
      provider: String,
      orderId: String,
      paymentId: String,
      signature: String,
      captureId: String,
      raw: Object
    },
    status: { type: String, enum: ["pending", "shipped", "delivered"], default: "pending" },
    statusHistory: [
      {
        status: String,
        note: String,
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

orderSchema.pre("save", function addInitialStatus(next) {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status, note: "Order placed" });
  }
  next();
});

export const Order = mongoose.model("Order", orderSchema);

