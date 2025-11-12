"use client";

import { Heart, NotebookPen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLikePostMutation } from "@/services/post";

interface PostProps {
  _id: string;
  likes: string[];
  currentUserId?: string; // array of userIds
}

export function PostCard({ _id, likes, currentUserId }: PostProps) {
  const [likePost] = useLikePostMutation();

  const handleLike = async () => {
    if (!currentUserId) return;
    try {
      // Use RTK Query mutation - it will automatically update the cache
      await likePost({
        postId: _id,
        userId: currentUserId,
      }).unwrap();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update like");
    }
  };

  // Calculate current state from props (which will be updated when parent refetches)
  const liked = currentUserId ? likes.includes(currentUserId) : false;
  const likeCount = likes.length;

  return (
    <div>
      <div className="flex mx-2 mt-4 items-center">
        <button
          onClick={handleLike}
          className="flex items-center cursor-pointer"
        >
          <Heart
            className=" w-4 h-4 mr-2 text-[#F66435]"
            fill={`${liked ? "#F66435" : "white"}`}
          />
        </button>
        <p className="text-sm">{likeCount} Likes</p>
        <NotebookPen className=" w-4 h-4 ml-4 mr-2 text-[#F66435]" />
        <p className="text-sm">Comments</p>
      </div>
    </div>
  );
}
