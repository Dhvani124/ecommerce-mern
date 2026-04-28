import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signToken = (id) => jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const sendToken = (res, user, statusCode = 200) => {
  res.status(statusCode).json({
    token: signToken(user._id),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

