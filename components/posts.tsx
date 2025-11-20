"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { ImageCarousel } from "./imageCarousel";
import { useEffect, useState } from "react";
import { useRef, UIEvent } from "react";
import {
  CircleDot,
  CircleSmall,
  Earth,
  GitPullRequestDraft,
  Heart,
  LockKeyhole,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { PostCard } from "./postCard";
import { useSession } from "next-auth/react";
import { useGetPostsQuery } from "@/services/post";
import Link from "next/link";

interface Post {
  _id: string;
  content: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  image?: string[];
  tags?: string[];
  visibility?: "public" | "private";
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000); // seconds difference

  if (diff < 60) return `${diff} sec ago`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Posts() {
  const [page, setPage] = useState(1);
  const { data: session } = useSession();
  const { data, isLoading, error } = useGetPostsQuery(page);

  if (error) return <div>Error loading posts</div>;

  // merged cache is available from data
  const posts = data?.posts ?? [];

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;

    const atBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 50;

    if (atBottom && !isLoading && data && page < data.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div
      onScroll={handleScroll}
      className="relative  h-[68vh] overflow-y-auto"
    >
      {posts?.map((post) => (
        <Card key={post._id} className="relative  mt-4 shadow-sm  rounded-4xl">
          <div className="">
            <CardHeader className="flex  items-center px-3 sm:px-6">
              <Avatar className="h-8 w-8 rounded-full  overflow-hidden">
                <AvatarImage
                  src={post.user?.profileImage}
                  alt="User Avatar"
                  className=""
                />
                <AvatarFallback className="rounded-full bg-gray-400">
                  CN
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={
                    post.user?._id === session?.user?.id
                      ? "/profile" // ⭐ your own profile
                      : `/profile/${post.user?._id}` // ⭐ other user's profile
                  }
                >
                  <CardTitle className="ml-1 text-sm font-medium ">
                    {post.user?.name}
                  </CardTitle>
                </Link>

                <CardDescription className="ml-1 text-sm font-medium flex items-center ">
                  {timeAgo(post.createdAt)}.
                  {post.visibility === "public" ? (
                    <Earth className="w-4 h-4 ml-2 mt-1" />
                  ) : (
                    <LockKeyhole className="w-4 h-4 ml-2 mt-1" />
                  )}
                </CardDescription>
              </div>
            </CardHeader>{" "}
            <div className="absolute top-6 right-6  ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CircleSmall />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>
                      Billing
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CardContent className="px-3 sm:px-6">
            <ImageCarousel postImages={post.image} />
            <div className="ml-2 text-sm font-medium whitespace-break-spaces">
              {post?.content}
            </div>
            <PostCard key={post._id} _id={post._id} likes={post?.likes} />
          </CardContent>
        </Card>
      ))}
      {isLoading && <p className="text-center py-4 ">Loading...</p>}
    </div>
  );
}
