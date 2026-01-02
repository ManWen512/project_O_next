"use client";

import { use, useEffect, useRef, useState } from "react";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { clientTools } from "@tanstack/ai-client";
import { updateCounterToolDef } from "../app/api/ai/chat/route";

import { Spinner } from "./ui/spinner";

import { Input } from "./ui/input";
import {
  CircleArrowOutUpRight,
  ImageIcon,
  Search,
  AlertCircle,
  Download,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import Markdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import AiImageCarouselDialog from "./AiImageCarousel";
import AiDialogBox from "./AiDialogBox";

const updateCounterTool = updateCounterToolDef.client(({ count }) => {
  localStorage.setItem("counter", count.toString());

  return { success: true };
});

// Define status types
type ImageSearchStatus =
  | "idle"
  | "triggered"
  | "searching"
  | "fetching"
  | "processing"
  | "completed"
  | "error";

export function ChatNew({ userId }: { userId: string | undefined }) {
  const [input, setInput] = useState("");
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [images, setImages] = useState<any[]>([]);

  const [imageSearchStatus, setImageSearchStatus] =
    useState<ImageSearchStatus>("idle");
  const [imageSearchMessage, setImageSearchMessage] = useState("");
  const hasFetchedRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [imageToolTriggered, setImageToolTriggered] = useState(false);
  // ✅ Define state to store post results
  const [postResults, setPostResults] = useState<{
    status: string;
    imageIds: string[];
    content: string;
    tags: string[];
    visibility: string;
  } | null>(null);
  const [confirmPostDialog, setConfirmPostDialog] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  // Fetch conversation history on mount if conversationId exists
  useEffect(() => {
    const fetchConversationHistory = async () => {
      if (!userId) return;
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`/api/ai/getHistory/${userId}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.messages) {
          setInitialMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching conversation history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchConversationHistory();
  }, [userId]);

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents("/api/ai/chat"),
    body: { id: userId },
    tools: clientTools(updateCounterTool),
    onChunk: (chunk) => {
      if (
        chunk.type === "tool-input-available" &&
        chunk.toolName === "create_post"
      ) {
        setConfirmPostDialog(true);
        setPostResults(chunk.input as any);
      }

      if (
        chunk.type === "tool-input-available" &&
        chunk.toolName === "suggest_post_images"
      ) {
        setImageToolTriggered(true);
        hasFetchedRef.current = false; // Reset for new search
        console.log("Image search triggered");

        // Start image search feedback
        setImageSearchStatus("triggered");
        setImageSearchMessage("AI detected need for images...");
      }
    },
    onFinish: () => {
      // 🔥 Stream is complete, database save should be done
      console.log("Stream finished, fetching images...");
      if (userId && !hasFetchedRef.current) {
        hasFetchedRef.current = true;
        setImageSearchStatus("searching");
        setImageSearchMessage("Searching for images on Unsplash...");
        setTimeout(() => fetchImages(userId), 500);
      }
    },
  });

  // Reset imageToolTriggered when a new message is sent (new conversation)
  useEffect(() => {
    // Reset when user sends a new message (input cleared)
    if (!isLoading && input === "") {
      setImageToolTriggered(false);
      setImageSearchStatus("idle");
      setImageSearchMessage("");
    }
  }, [isLoading, input]);

  useEffect(() => {
    if (userId) {
      fetchImages(userId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchImages = async (userId: string) => {
    try {
      setImageSearchStatus("fetching");
      setImageSearchMessage("Fetching high-quality images...");

      const response = await fetch(`/api/ai/image/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setImageSearchStatus("processing");
      setImageSearchMessage("Processing and optimizing images...");

      const data = await response.json();

      if (!Array.isArray(data.images)) {
        setImageSearchStatus("completed");
        setImageSearchMessage("No images found for this query");
        setTimeout(() => {
          setImageSearchStatus("idle");
          setImageSearchMessage("");
        }, 3000);
        return;
      }

      setImages((prev) => {
        const existing = new Set(prev.map((img) => img.url));
        const newImages = data.images.filter(
          (img: any) => !existing.has(img.url)
        );

        // Complete the process
        setImageSearchStatus("completed");
        setImageSearchMessage(`Found ${newImages.length} images!`);

        // Auto-hide after 3 seconds
        setTimeout(() => {
          setImageSearchStatus("idle");
          setImageSearchMessage("");
          setImageToolTriggered(false); // Reset after completion
        }, 3000);

        return [...prev, ...newImages];
      });
    } catch (error) {
      console.error("Error fetching images:", error);
      setImageSearchStatus("error");
      setImageSearchMessage("Failed to fetch images. Please try again.");

      // Reset error status after 5 seconds
      setTimeout(() => {
        setImageSearchStatus("idle");
        setImageSearchMessage("");
        setImageToolTriggered(false); // Reset after completion
      }, 5000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message =
      selectedImageIds.length > 0
        ? `["${selectedImageIds.join(",")}"] ${input}`
        : input;

    sendMessage(message);
    setInput("");
    setSelectedImageIds([]); // Clear selected images after sending
  };

  return (
    <div className="flex flex-col h-[screen-10vh]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mt-10">
        {/* Empty state */}
        {messages.length === 0 && initialMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center p-4 text-gray-500">
            <p className="text-sm font-medium">Start a conversation ✨</p>
            <p className="text-xs max-w-sm text-center pt-5">
              This AI can suggest images, generate captions, and help you create
              engaging posts for Project O.
            </p>{" "}
            <p className="text-xs max-w-sm text-center pt-2">
              {" "}
              Just type what you want to post about, and let the AI do the rest.
            </p>
          </div>
        )}

        {/* Initial Messages */}
        {initialMessages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block max-w-[80%] p-2 rounded-lg bg-gray-50 text-gray-900 border border-gray-100 shadow-xl"`}
            >
              {message.parts && message.parts.length > 0 ? (
                message.parts.map((part: any, idx: number) => {
                  if (part.type === "thinking") {
                    return (
                      <div
                        key={idx}
                        className="text-sm text-gray-500 italic mb-2"
                      >
                        💭 Thinking: {part.content}
                      </div>
                    );
                  }
                  if (part.type === "text") {
                    const cleanedContent = part.content
                      .replace(/\[.*?\]/g, "")
                      .trim();

                    return (
                      <div key={idx}>
                        <Markdown>{cleanedContent}</Markdown>
                      </div>
                    );
                  }
                  return null;
                })
              ) : (
                <div className="text-gray-400 italic">"Processed."</div>
              )}
            </div>
          </div>
        ))}

        {/* Current Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block max-w-[80%] p-2 rounded-lg bg-gray-50 text-gray-900 border border-gray-100 shadow-xl"`}
            >
              {message.parts && message.parts.length > 0 ? (
                message.parts.map((part: any, idx: number) => {
                  if (part.type === "thinking") {
                    return (
                      <div
                        key={idx}
                        className="text-sm text-gray-500 italic mb-2"
                      >
                        💭 Thinking: {part.content}
                      </div>
                    );
                  }
                  if (part.type === "text") {
                    const cleanedContent = part.content
                      .replace(/\[.*?\]/g, "")
                      .trim();

                    return (
                      <div key={idx}>
                        <Markdown>{cleanedContent}</Markdown>
                      </div>
                    );
                  }
                  return null;
                })
              ) : (
                <div className="text-gray-400 italic">"Processing."</div>
              )}
            </div>
          </div>
        ))}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Search Status Banner */}
      {imageToolTriggered && imageSearchStatus !== "idle" && (
        <div className={` z-10 bg-gray-100 p-3 shadow-sm mb-2 rounded-md`}>
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className={`text-black flex items-center gap-2`}>
              <Spinner className="h-4 w-4 animate-spin" />

              <span className="text-sm font-medium">{imageSearchMessage}</span>
            </div>

            {imageSearchStatus === "completed" && images.length > 0 && (
              <span className="text-xs text-gray-600 ml-auto">
                Scroll down to view images ↓
              </span>
            )}
          </div>
        </div>
      )}

      <AiImageCarouselDialog
        images={images}
        imageSearchStatus={imageSearchStatus}
        onSelectionChange={setSelectedImageIds}
        initialSelectedIds={selectedImageIds} // Optional: for two-way binding
      />

      {selectedImageIds.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t bg-gray-50">
          {selectedImageIds.map((id) => {
            const img = images.find((i) => i.imageId === id); // Change from i.id to i.imageId
            if (!img) return null;

            return (
              <div
                key={id}
                className="relative w-20 h-20 rounded-lg overflow-hidden border"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="py-2">
        <div className="relative *:flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="py-6 pr-15"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl"
          >
            {isLoading ? <Spinner /> : <CircleArrowOutUpRight />}
          </Button>
        </div>
      </form>

      <AiDialogBox
        userId={userId}
        postResults={postResults}
        confirmPostDialog={confirmPostDialog}
        setConfirmPostDialog={setConfirmPostDialog}
      />
    </div>
  );
}
