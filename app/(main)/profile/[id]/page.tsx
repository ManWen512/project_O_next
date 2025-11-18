"use client";

import { useGetFriendByIdQuery } from "@/services/friends";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CircleSlash2, CircleSmall, Earth, LockKeyhole, Orbit } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { useGetFriendsListsQuery } from "@/services/friends";
import {
  useUploadProfileMutation,
  useUpdateUserMutation,
} from "@/services/user";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGetUserPostsQuery } from "@/services/post";
import { ImageCarousel } from "@/components/imageCarousel";
import { PostCard } from "@/components/postCard";

interface ProfileDetailPageProps {
  params: {
    id: string;
  };
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

export default function ProfileDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: userById } = useGetFriendByIdQuery(id, {
    skip: !id, // Only fetch when selectedUserId exists
  });
  const { data: alreadyFriend } = useGetFriendsListsQuery(id, {
    skip: !id, // Only fetch when selectedUserId exists
  });
  const { data: posts } = useGetUserPostsQuery();

  console.log(userById);
  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 w-full">
        <div className="sm:col-span-3 col-span-4 p-4 sm:mx-15">
          <div className="flex justify-between">
            <div className="flex mt-2 z-50">
              <SidebarTrigger className="-ml-1 sm:hidden mr-1" />
              <div className="text-lg font-semibold">Profile</div>
            </div>
            <img
              src="/logo.PNG"
              alt="Logo"
              className="inline h-12 w-12 -mt-1 sm:hidden"
            />
          </div>

          <div>
            <Card className="relative w-full h-40 bg-gray-100 mt-4">
              {/* Outside Dialog - Instant Upload */}
              <Avatar className="absolute -bottom-9 left-10 h-22 w-22 rounded-full">
                <AvatarImage
                  src={userById?.user?.profileImage}
                  alt="User Avatar"
                />
                <AvatarFallback className="rounded-full bg-gray-400">
                  {userById?.user?.name?.charAt(0).toUpperCase() || "CN"}
                </AvatarFallback>
              </Avatar>
            </Card>

            <div className="pt-6">
              <div className="flex mt-4 justify-between items-center">
                <CardTitle className="text-2xl">
                  {userById?.user?.name}
                </CardTitle>
              </div>

              <CardDescription className="text-sm mt-2">
                {userById?.user?.bio || "No bio yet"}
              </CardDescription>

              <CardDescription className="mt-1">
                email: {userById?.user?.email}
              </CardDescription>
              <Tabs defaultValue="post">
                <div className="flex mt-4 justify-start gap-2 items-center">
                  <TabsList>
                    <TabsTrigger value="post">
                      <Label className="cursor-pointer">
                        {posts?.length || 0} Posts
                      </Label>
                    </TabsTrigger>
                    <TabsTrigger value="friend">
                      <Label>{alreadyFriend?.length || 0} Friends</Label>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="post">
                  <Card className="mt-2 p-2 gap-2">
                    {userById?.posts?.map((post) => (
                      <Card
                        key={post._id}
                        className="relative  mt-4 shadow-sm  rounded-4xl"
                      >
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
                              
                                <CardTitle className="ml-1 text-sm font-medium ">
                                  {post.user?.name}
                                </CardTitle>
                        

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
                                    <DropdownMenuShortcut>
                                      ⌘B
                                    </DropdownMenuShortcut>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Settings
                                    <DropdownMenuShortcut>
                                      ⌘S
                                    </DropdownMenuShortcut>
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
                          <PostCard
                            key={post._id}
                            _id={post._id}
                            likes={post?.likes}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </Card>
                </TabsContent>

                {/* friends tab */}
                <TabsContent value="friend">
                  <Card className="mt-2 p-2 gap-2">
                    {alreadyFriend && alreadyFriend?.length > 0 ? (
                      alreadyFriend?.map((friend) => (
                        <Card className="p-3" key={friend._id}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 rounded-full">
                                <AvatarImage
                                  src={friend?.profileImage}
                                  alt="User Avatar"
                                />
                                <AvatarFallback className="rounded-full bg-gray-400">
                                  CN
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-semibold">
                                  {friend?.name}
                                </span>
                                <CardDescription className="text-xs">
                                  {friend?.bio}
                                </CardDescription>
                              </div>
                            </div>
                            <div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <CircleSmall />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  className="w-56 "
                                  align="end"
                                >
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem className="py-2">
                                      <Orbit className="w-3 h-3 text-[#F66435]" />
                                      Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="py-2">
                                      {" "}
                                      <CircleSlash2 className="text-[#F66435]" />
                                      UnFriend
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <CardDescription className="p-3">
                        There are no Friends
                      </CardDescription>
                    )}
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
