"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PostResult = {
  status: string;
  imageIds: string[];
  content: string;
  tags: string[];
  visibility: string;
};

type ImageData = {
  imageId: string;
  url: string;
};

interface ConfirmPostDialogProps {
  userId?: string;
  postResults: PostResult | null;
  confirmPostDialog: boolean;
  setConfirmPostDialog: (open: boolean) => void;
}

export default function AiDialogBox({
  userId,
  postResults,
  confirmPostDialog,
  setConfirmPostDialog,
}: ConfirmPostDialogProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (!postResults) return;
    setContent(postResults.content);
    setTags(postResults.tags);
  }, [postResults]);

  useEffect(() => {
    if (!userId || !postResults || postResults.imageIds.length === 0) return;

    const fetchImageUrls = async () => {
      const res = await fetch(`/api/ai/imageUrl/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageIds: postResults.imageIds }),
      });

      const data = await res.json();
      setImages(data.images ?? []);
    };

    fetchImageUrls();
  }, [userId, postResults]);

  // Now it's safe to return early
  if (!postResults) return null;

  // 🔹 Remove image
  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.imageId !== imageId));
  };

  // 🔹 Remove tag
  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleConfirmPost = async (data: {
    imageIds: string[];
    content: string;
    tags: string[];
  }) => {
    try {
      const formData = new FormData();
      formData.append("userId", userId!); // your existing userId
      formData.append("content", data.content);
      formData.append("tags", JSON.stringify(data.tags));
      formData.append("imageIds", JSON.stringify(data.imageIds));
      formData.append("visibility", postResults!.visibility);

      const res = await fetch("/api/ai/posts", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create post");
      }

      const result = await res.json();
      console.log("Post created:", result);
      
      toast.success("Post created successfully!");

      // Close dialog or show success message
      setConfirmPostDialog(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };


  return (
    <Dialog open={confirmPostDialog} onOpenChange={setConfirmPostDialog}>
      <DialogContent className="max-w-lg w-lg space-y-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Confirm your post</DialogTitle>
        </DialogHeader>

        {/* 🖼 Image preview */}
        <ScrollArea className="w-full rounded-md border bg-gray-50 whitespace-nowrap ">
          <div className="flex gap-3 pr-3 py-3 max-w-sm ">
            {images.map((image) => (
              <div
                key={image.imageId}
                className="relative group w-40 shrink-0 "
              >
                <img
                  src={image.url}
                  alt="Generated"
                  className="w-full h-28 object-cover rounded-md"
                />

                {/* ❌ remove */}
                <button
                  onClick={() => removeImage(image.imageId)}
                  className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center
                             bg-black/60 text-white rounded-full w-6 h-6"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* ✏️ Editable caption */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your caption..."
          className="resize-none"
        />

        {/* 🏷 Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="relative group pr-6"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="absolute right-1 top-1 hidden group-hover:block"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          <Badge variant="outline">{postResults.visibility}</Badge>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setConfirmPostDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleConfirmPost({
                imageIds: images.map((i) => i.url),
                content,
                tags,
              })
            }
          >
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
