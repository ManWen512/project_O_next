"use client";

import {  NotebookPen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLikePostMutation } from "@/services/post";
import { useSession } from "next-auth/react";
import { Heart } from "./animate-ui/icons/heart";


interface PostProps {
  _id: string;
  likes: string[];
  currentUserId?: string; // array of userIds
}

export function PostCard({ _id, likes }: PostProps) {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id;
  const [likePost] = useLikePostMutation();

  const handleLike = async () => {
   
    try {
      // Use RTK Query mutation - it will automatically update the cache
      await likePost(_id).unwrap();
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
        <Heart animateOnHover 
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
