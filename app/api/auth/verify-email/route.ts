import { NextResponse } from "next/server";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find token
    const verificationToken = await VerificationToken.findOne({ token });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Check if token expired
    if (new Date() > verificationToken.expires) {
      await VerificationToken.deleteOne({ token });
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    // Update user
    const user = await User.findOne({ email: verificationToken.email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    user.isVerified = true;
    user.emailVerified = new Date();
    await user.save();

    // Delete token
    await VerificationToken.deleteOne({ token });

    return NextResponse.json(
      { message: "Email verified successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}