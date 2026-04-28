import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/handmade_ecommerce");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "staff", "user"], default: "user" }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const email = "admin@handmade.com";
const password = "admin123";

await User.deleteOne({ email });

const hashedPassword = await bcrypt.hash(password, 12);
const admin = await User.create({
  name: "Admin",
  email,
  password: hashedPassword,
  role: "admin"
});
console.log("Admin created:", admin.email);
console.log("Login email:", email);
console.log("Login password:", password);

await mongoose.disconnect();
process.exit(0);
