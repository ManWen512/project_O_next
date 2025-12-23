import { connectDB } from "@/lib/db";
import AiContentModel from "@/models/AiContentModel";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { imageIds } = await request.json();


    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "imageIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const contents = await AiContentModel.aggregate([
      {
        $match: {
          chatId: id,
          "images.imageId": { $in: imageIds },
        },
      },
      {
        $project: {
          _id: 0,
          images: {
            $filter: {
              input: "$images",
              as: "img",
              cond: { $in: ["$$img.imageId", imageIds] },
            },
          },
        },
      },
    ]);



    const images = contents.flatMap((c) => c.images);
    console.log("Fetched Images:", images);

    return NextResponse.json({
      images,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
