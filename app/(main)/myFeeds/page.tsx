"use client";

import Recommendations from "@/components/recommendations";
import Suggestions from "@/components/suggestions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ImageCarousel } from "@/components/imageCarousel";
import {
  CircleSlash2,
  CircleSmall,
  Earth,
  LockKeyhole,
  Newspaper,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  useDeletePostMutation,
  useGetPrivatePostsQuery,
  useGetPublicPostsQuery,
  useGetUserPostsQuery,
} from "@/services/post";
import Profile from "@/components/profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

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
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage: string;
  bio: string;
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

export default function MyFeeds() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [deletePost, { isLoading }] = useDeletePostMutation();
  const [currentPostId, setCurrentPostId] = useState<string>("");

  const {
    data: posts,
    isLoading: postsloading,
    error: postsError,
  } = useGetUserPostsQuery();
  const {
    data: privatePosts,
    isLoading: privateLoading,
    error: privateError,
  } = useGetPrivatePostsQuery();
  const {
    data: publicPosts,
    isLoading: publicLoading,
    error: publicError,
  } = useGetPublicPostsQuery();

  if (status === "loading") return null; // or a loader/spinner

  if (!session?.user) return null;

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId).unwrap();
      toast.success("Post Deleted Successfully!");
      setOpen(false);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div>
      <div className="w-full">
        <div className="grid grid-cols-4 gap-2 w-full">
          <div className="sm:col-span-3 col-span-4 p-4 sm:mx-15">
            <Tabs defaultValue="myFeeds" className="mb-4">
              <div className="flex justify-between">
                <div className="flex ">
                  <SidebarTrigger className="-ml-1 sm:hidden mr-1 mt-2" />
                  <TabsList className="">
                    <TabsTrigger value="myFeeds" className="font-semibold  p-4">
                      <p className="hidden sm:block">My Feeds</p>
                      <Newspaper className="w-4 h-4 text-[#F66435]" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="publicFeeds"
                      className="font-semibold p-4"
                    >
                      <p className="hidden sm:block">Public Feeds</p>
                      <Earth className="w-4 h-4 text-[#F66435]" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="privateFeeds"
                      className="font-semibold  p-4"
                    >
                      <p className="hidden sm:block">Private Feeds</p>
                      <LockKeyhole className="w-4 h-4 text-[#F66435]" />
                    </TabsTrigger>
                  </TabsList>
                </div>
                <img
                  src="/logo.PNG"
                  alt="Logo"
                  className="inline h-12 w-12 -mt-1 sm:hidden "
                />
              </div>
              <TabsContent value="myFeeds">
                {!posts || posts.length === 0 ? (
                  <Label className="mt-4">There are no Feeds!</Label>
                ) : (
                  posts?.map((post) => (
                    <Card
                      key={post._id}
                      className="relative mb-4 mt-4 shadow-sm  rounded-4xl"
                    >
                      <CardHeader className="flex  items-center px-3 sm:px-6">
                        <Avatar className="h-6 w-6 rounded-full    mr-3 ">
                          <AvatarImage
                            src={post.user?.profileImage}
                            alt="User Avatar"
                          />
                          <AvatarFallback className="rounded-full bg-gray-400 p-2 ">
                            CN
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="ml-2 text-sm font-medium ">
                            {post?.user?.name}
                          </CardTitle>

                          <CardDescription className="ml-2 text-sm font-medium flex items-center ">
                            {timeAgo(post.createdAt)}.{" "}
                            {post.visibility === "public" ? (
                              <Earth className="w-4 h-4 ml-2 mt-1" />
                            ) : (
                              <LockKeyhole className="w-4 h-4 ml-2 mt-1" />
                            )}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6">
                        <ImageCarousel postImages={post.image} />
                        <div className="ml-2 text-sm font-medium whitespace-break-spaces">
                          {post?.content}
                        </div>
                      </CardContent>
                      <div className="absolute top-6 right-6  ">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <CircleSmall />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem>Profile</DropdownMenuItem>
                              <DropdownMenuItem>Billing</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentPostId(post._id);
                                  setOpen(true);
                                }}
                              >
                                <CircleSlash2 className="text-[#F66435]" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
              <TabsContent value="publicFeeds">
                {!publicPosts || publicPosts.length === 0 ? (
                  <Label className="mt-4">There are no Public Feeds!</Label>
                ) : (
                  publicPosts?.map((post) => (
                    <Card
                      key={post._id}
                      className="relative mb-4 mt-4 shadow-sm  rounded-4xl"
                    >
                      <CardHeader className="flex  items-center px-3 sm:px-6">
                        <Avatar className="h-6 w-6 rounded-full    mr-3 ">
                          <AvatarImage
                            src={post.user?.profileImage}
                            alt="User Avatar"
                          />
                          <AvatarFallback className="rounded-full bg-gray-400 p-2 ">
                            CN
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="ml-2 text-sm font-medium ">
                            {post?.user?.name}
                          </CardTitle>

                          <CardDescription className="ml-2 text-sm font-medium flex items-center ">
                            {timeAgo(post.createdAt)}.{" "}
                            {post.visibility === "public" ? (
                              <Earth className="w-4 h-4 ml-2 mt-1" />
                            ) : (
                              <LockKeyhole className="w-4 h-4 ml-2 mt-1" />
                            )}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6">
                        <ImageCarousel postImages={post.image} />
                        <div className="ml-2 text-sm font-medium whitespace-break-spaces">
                          {post?.content}
                        </div>
                      </CardContent>
                      <div className="absolute top-6 right-6  ">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <CircleSmall />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem>Profile</DropdownMenuItem>
                              <DropdownMenuItem>Billing</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentPostId(post._id);
                                  setOpen(true);
                                }}
                              >
                                <CircleSlash2 className="text-[#F66435]" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="privateFeeds">
                {!privatePosts || privatePosts.length === 0 ? (
                  <Label className="mt-4">There are no Private Feeds!</Label>
                ) : (
                  privatePosts?.map((post) => (
                    <Card
                      key={post._id}
                      className="relative mb-4 mt-4 shadow-sm  rounded-4xl"
                    >
                      <CardHeader className="flex  items-center px-3 sm:px-6">
                        <Avatar className="h-6 w-6 rounded-full    mr-3 ">
                          <AvatarImage
                            src={post.user?.profileImage}
                            alt="User Avatar"
                          />
                          <AvatarFallback className="rounded-full bg-gray-400 p-2 ">
                            CN
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="ml-2 text-sm font-medium ">
                            {post?.user?.name}
                          </CardTitle>

                          <CardDescription className="ml-2 text-sm font-medium flex items-center ">
                            {timeAgo(post.createdAt)}.{" "}
                            {post.visibility === "public" ? (
                              <Earth className="w-4 h-4 ml-2 mt-1" />
                            ) : (
                              <LockKeyhole className="w-4 h-4 ml-2 mt-1" />
                            )}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6">
                        <ImageCarousel postImages={post.image} />
                        <div className="ml-2 text-sm font-medium whitespace-break-spaces">
                          {post?.content}
                        </div>
                      </CardContent>
                      <div className="absolute top-6 right-6  ">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <CircleSmall />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem>Profile</DropdownMenuItem>
                              <DropdownMenuItem>Billing</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentPostId(post._id);
                                  setOpen(true);
                                }}
                              >
                                <CircleSlash2 className="text-[#F66435]" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden sm:block col-span-1 sticky top-6 mr-5 pt-4 h-fit">
            <Profile user={session!.user} />
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => handleDelete(currentPostId)}
                disabled={isLoading}
              >
                {isLoading ? (
                 <> <Spinner className="animate-spin w-4 h-4" /> Confirming</>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
