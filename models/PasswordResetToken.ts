import mongoose from "mongoose";

const PasswordResetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PasswordResetToken || 
  mongoose.model("PasswordResetToken", PasswordResetTokenSchema);