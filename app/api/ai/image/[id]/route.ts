import { connectDB } from "@/lib/db";
import AiContentModel from "@/models/AiContentModel";
import { NextResponse } from "next/server";

interface ImageContent {
  images?: string[];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await params;

    // ✅ find returns an array
    const contents = (await AiContentModel.find({ chatId: id })
      .select("images -_id")
      .lean()) as ImageContent[];

    // ✅ flatten all images
    const images = contents.flatMap(doc => doc.images ?? []);

    return NextResponse.json({
      id,
      images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
