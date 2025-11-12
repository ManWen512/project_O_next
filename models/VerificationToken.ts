import mongoose from "mongoose";

export interface IVerificationToken extends mongoose.Document {
  email: string;
  token: string;
  expires: Date;
  createdAt: Date;
}

const VerificationTokenSchema = new mongoose.Schema<IVerificationToken>({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.VerificationToken ||
  mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);