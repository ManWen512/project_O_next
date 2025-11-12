// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/models/User";
import PasswordResetToken from "@/models/PasswordResetToken";
import { connectDB } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user exists
    const user = await User.findOne({ email });

    // ⚠️ Security: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a password reset email has been sent." },
        { status: 200 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // Delete any existing reset tokens for this email
    await PasswordResetToken.deleteMany({ email });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token
    const resetToken = new PasswordResetToken({
      email,
      token,
      expires,
    });
    await resetToken.save();

    // Send email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      { message: "If an account exists, a password reset email has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}