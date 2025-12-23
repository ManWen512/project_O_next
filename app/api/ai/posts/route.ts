// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import Post from "@/models/postModels";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string;
    const content = formData.get("content") as string;
    const tags = JSON.parse(formData.get("tags") as string);
    const visibility = formData.get("visibility") as string;
    const imageIds = JSON.parse(formData.get("imageIds") as string);

    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 });
    }

    // Connect to DB and create post
    await connectDB();
    
    const post = await Post.create({
      user: userId,
      content,
      image: imageIds, // Store the image IDs from S3
      tags,
      visibility,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}