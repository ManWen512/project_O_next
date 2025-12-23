import { chat, toolDefinition, toServerSentEventsStream } from "@tanstack/ai";
import { geminiText } from "@tanstack/ai-gemini";
import { openaiText } from "@tanstack/ai-openai";
import { connectDB } from "@/lib/db";
// import { redis } from "@/lib/redis";

import z from "zod";
import AiContentModel from "@/models/AiContentModel";
import { create } from "node:domain";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

const MAX_REQUESTS = 5; // per user
const WINDOW_MS = 24 * 60 * 60 * 1000; // 1 day in ms

// const checkRateLimit = async (userId:string) => {
//   const key = `aichat:${userId}`; // unique per user


//   // increment count
//   const count = await redis.incr(key);

//   // if this is the 1st request, set TTL
//   if (count === 1) {
//     await redis.expire(key,Math.ceil(WINDOW_MS / 1000));
    
//   }

//   // how much time is left
//   const ttlMs = await redis.pTTL(key);
//   const timeLeftMinutes = Math.ceil(ttlMs / 1000 / 60);

//   return {
//     count,
//     isLimited: count > MAX_REQUESTS,
//     timeLeftMinutes,
//   };
// };


export async function POST(request: Request) {
  await connectDB();
  //   if (!process.env.GEMINI_API_KEY) {
  //     return new Response(
  //       JSON.stringify({
  //         error: "GEMINI_API_KEY not configured",
  //       }),
  //       {
  //         status: 500,
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );
  //   }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "OPENAI_API_KEY not configured",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  const requestBody = await request.json();

  const { messages } = requestBody;
  const { id } = requestBody.data || {};

  console.log("=== Received messages ===");
  console.log("Total messages:", messages.length);
  console.log("id:", id);


  try {
    // ✅ Filter out assistant messages and tool results
    const cleanMessages = messages.filter((msg: any) => {
      // Only keep user messages
      return msg.role === "user";
    });

    console.log("Clean messages count:", cleanMessages.length);
    console.log(
      "Using messages:",
      cleanMessages.map((m: any) => m.content)
    );

    const stream = chat({
      adapter: openaiText("gpt-4o-mini"),
      messages: cleanMessages,

      tools: [
        suggestPostImagesToolDef,
        createPostToolDef,
      ],
      //   conversationId,
    });

    

    // Create a new async iterable that captures chunks
    const capturedStream = (async function* () {
      const chunks: any[] = [];
      let fullResponse = "";

      for await (const chunk of stream) {
        chunks.push(chunk); // Capture for DB
        yield chunk; // Pass through to frontend
      }

      // After stream completes, save to database
      //   await saveToDatabase(chunks, conversationId);
      for (const chunk of chunks) {
        // console.log("Saving chunk:", chunk);

        if (chunk.type === "content" && chunk.delta) {
          fullResponse += chunk.delta;
        }
      }
      console.log("Stream complete:", fullResponse);

      // ✅ Fetch existing images for this chat to prevent duplicates
      let existingImageIds: string[] = [];
      if (id) {
        try {
          const existingContent = await AiContentModel.find({
            chatId: id,
          }).lean();
          existingImageIds = existingContent.flatMap(
            (content: any) =>
              content.images?.map((img: any) => img.imageId) || []
          );
          console.log(
            `Found ${existingImageIds.length} existing images for chat ${id}`
          );
        } catch (error) {
          console.error("Error fetching existing images:", error);
        }
      }


      // After stream completes, detect tool calls and execute manually
      const imageToolCalls = chunks.filter(
        (c) =>
          c.type === "tool-input-available" &&
          c.toolName === "suggest_post_images"
      );

      const allImages: any[] = [];
      const seenImageIds = new Set<string>(existingImageIds);
      // Execute tool calls manually and save to database
      for (const toolCall of imageToolCalls) {
        const { query, limit } = toolCall.input;

        try {
          // Fetch images
          const images = await fetchImagesFromUnsplash(
            query,
            limit,
            Array.from(seenImageIds)
          );
          // ✅ Filter out any remaining duplicates (safety check)
          const uniqueImages = images.filter((img: any) => {
            if (seenImageIds.has(img.imageId)) {
              console.log(`Skipping duplicate image: ${img.imageId}`);
              return false;
            }
            seenImageIds.add(img.imageId);
            return true;
          });

          allImages.push(...uniqueImages);
          // Save directly to database
          console.log(" images ", uniqueImages);
        } catch (error) {
          console.error("Error fetching/saving images:", error);
        }
      }

      // Save once after collecting everything
      if (allImages.length > 0 || fullResponse || messages.length > 0) {
        try {
          console.log("Attempting to save to database...");
          const result = await AiContentModel.create({
            prompt: messages[messages.length - 1]?.content || "",
            output: fullResponse,
            chatId: id,
            images: allImages,
          });
          console.log("✅ Saved to database successfully:", result);
        } catch (error) {
          console.error("❌ Error saving to database:", error);
        }
      } else {
        console.log("No content to save (no images or response)");
      }
    })();

    
    // Get the ReadableStream from toServerSentEventsStream
    const readableStream =
      toServerSentEventsStream(capturedStream);

    // Wrap it in a Response object with proper headers
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

const getTodosToolDef = toolDefinition({
  description: "Fetch a list of todos from the database",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("An optional search query to filter todos"),
  }),
  outputSchema: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      completed: z.boolean(),
      userId: z.number(),
    })
  ),
  name: "get_todos",
});

const getTodosTool = getTodosToolDef.server(async ({ query }) => {
  const url = new URL("https://jsonplaceholder.typicode.com/todos");
  if (query) url.searchParams.set("q", query);
  console.log(url.toString());

  const response = await fetch(url.toString());

  return await response.json();
});

export const updateCounterToolDef = toolDefinition({
  name: "set_count",
  description: "Set the counter value stored in the browser",
  inputSchema: z.object({
    count: z.number().describe("The new counter value to set"),
  }),
  outputSchema: z.object({ success: z.boolean() }),
});

export const suggestPostImagesToolDef = toolDefinition({
  name: "suggest_post_images",
  description: "Suggest images for a social media post using open image APIs",
  inputSchema: z.object({
    query: z.string().describe("Search keywords for images"),
    limit: z.number().max(5).default(3),
  }),
});

// Server implementation (separate)
async function fetchImagesFromUnsplash(
  query: string,
  limit: number,
  excludedIds: string[] = []
) {
  // ✅ Request more images than needed to account for filtering
  const fetchLimit = Math.min(30, limit + excludedIds.length);

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=${fetchLimit}`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  const data = await res.json();
  console.log(`Fetched ${data.results?.length || 0} images from Unsplash`);

  // ✅ Filter out excluded IDs and limit to requested amount
  const filteredResults = data.results
    .filter((img: any) => !excludedIds.includes(img.id))
    .slice(0, limit);

  console.log(
    `Returning ${filteredResults.length} images after filtering duplicates`
  );

  return filteredResults.map((img: any) => ({
    url: img.urls.regular,
    source: "Unsplash",
    author: img.user.name,
    license: "Unsplash License",
    imageId: img.id,
  }));
}

// ✅ CREATE POST TOOL DEFINITION (using imageIds)
const createPostToolDef = toolDefinition({
  name: "create_post",
  description:
    "Create a social media post with selected image(s) and caption. Use the imageId(s) from previously searched images. Multiple images can be selected.",
  inputSchema: z.object({
    imageIds: z
      .array(z.string())
      .describe(
        "Array of image IDs from the previous search results (e.g., ['img_001', 'img_002'])"
      ),
    content: z
      .string()
      .describe(
        "Caption/content text for the post (e.g., 'Beautiful morning!')"
      ),
    tags: z
      .array(z.string())
      .optional()
      .describe(
        "Optional hashtags or tags for the post (e.g., ['morning', 'sunrise'])"
      ),
    visibility: z
      .enum(["public", "private"])
      .default("public")
      .describe("Post visibility: public or private"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    postId: z.string(),
    message: z.string(),
    imagesUsed: z.number(),
  }),
});
