"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  CircleArrowOutUpRight,
  CircleCheckBig,
  CircleDashed,
  CircleSlash2,
  Search,
} from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMediaQuery } from "@/components/useMediaQuery";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useAddFriendsMutation,
  useGetFriendsListsQuery,
  useGetFriendsQuery,
  useGetPendingFriendsQuery,
  useGetFriendByIdQuery,
  useAcceptFriendsMutation,
  useRejectFriendsMutation,
  useGetAllPendingFriendsQuery,
} from "@/services/friends";

interface Friends {
  _id: string; // maps from _id
  name: string;
  email: string;
  emailVerified: string;
  isVerified: boolean;
  friends: string[];
  createdAt: string;
  requester: {
    name: string;
  };
}

export default function Friends() {
  const [sideCol, setSideCol] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { data: session, status } = useSession();
  const requesterId = session?.user.id;
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { data: searchUsers } = useGetFriendsQuery();
  const { data: pendingUsers } = useGetPendingFriendsQuery(session?.user?.id!, {
    skip: status !== "authenticated" || !session?.user?.id,
  });
  const { data: alreadyFriend } = useGetFriendsListsQuery(session?.user?.id!, {
    skip: status !== "authenticated" || !session?.user?.id,
  });
  const { data: userFriend } = useGetFriendsListsQuery(selectedUserId, {
    skip: !selectedUserId, // Only fetch when selectedUserId exists
  });
  const { data: userById } = useGetFriendByIdQuery(selectedUserId, {
    skip: !selectedUserId, // Only fetch when selectedUserId exists
  });
  const { data: allPendingUsers } = useGetAllPendingFriendsQuery(
    session?.user?.id!,
    {
      skip: status !== "authenticated" || !session?.user?.id,
    }
  );
  const [newFriend] = useAddFriendsMutation();
  const [acceptFriend] = useAcceptFriendsMutation();
  const [rejectFriend] = useRejectFriendsMutation();

  const handleSendRequest = async (recipientId: string) => {
    if (!requesterId) return;
    try {
      await newFriend({
        requesterId: requesterId,
        recipientId,
      }).unwrap();

      toast.success("Friend request sent successfully!");
    } catch (error) {
      console.error("Error sending friend request:", error);

      if (error && typeof error === "object" && "data" in error) {
        const err = error as { data?: { message?: string } };
        toast.error(err.data?.message ?? "Something went wrong!");
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  const handleSideCol = (id: string) => {
    setSideCol(true);
    setSelectedUserId(id);
  };

  const handleAcceptFriend = async (friendRequestId: string, name: string) => {
    try {
      await acceptFriend(friendRequestId).unwrap();
      toast.success(`You and ${name} are now Friends`);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectFriend = async (friendRequestId: string, name: string) => {
    try {
      await rejectFriend(friendRequestId).unwrap();

      toast.success(`You successfully rejected ${name}`);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const isAlreadyFriend = (userId: string) => {
    return alreadyFriend?.some((friend) => friend._id === userId);
  };

  return (
    <div className=" my-4">
      <div className="grid grid-cols-5 gap-4 sm:mx-15">
        <Tabs
          defaultValue="searchFriends"
          className="mb-4 sm:col-span-3 col-span-5 mx-4 "
        >
          <div className="flex justify-between">
            <div className="">
              <SidebarTrigger className="-ml-1 sm:hidden mr-1" />
              <TabsList>
                <TabsTrigger
                  value="searchFriends"
                  className="font-semibold text-md p-4"
                >
                  <p className="hidden sm:block">Search Friends</p>
                  <Search className="w-4 h-4 text-[#F66435]" />
                </TabsTrigger>
                <TabsTrigger
                  value="friendsRequests"
                  className="relative font-semibold text-md p-4"
                >
                  <p className="hidden sm:block">Friends Requests</p>
                  <CircleArrowOutUpRight className="w-4 h-4 mt-1 text-[#F66435]" />
                  {pendingUsers && pendingUsers.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"></div>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            <img
              src="/logo.PNG"
              alt="Logo"
              className="inline h-12 w-12 -mt-1 sm:hidden "
            />
          </div>

          <TabsContent value="searchFriends">
            <Command className="rounded-lg border shadow-md md:min-w-[450px] h-auto ">
              <Card className="flex  items-center p-2 m-2">
                <div className="w-full ">
                  <CommandInput placeholder="Search..." />
                </div>
              </Card>
              <CommandList className="overflow-hidden">
                <CommandEmpty>No results found.</CommandEmpty>

                <ScrollArea className="h-[70vh]">
                  <CommandGroup>
                    {searchUsers?.map((user) => {
                      const isPending = allPendingUsers?.some(
                        (f) =>
                          (f.requester._id === session?.user.id &&
                            f.recipient._id === user._id) ||
                          (f.recipient._id === session?.user.id &&
                            f.requester._id === user._id)
                      );
                      return (
                        <CommandItem className="p-1 mb-2 " key={user._id}>
                          <Card
                            key={user._id}
                            className="  w-full py-3 px-2 "
                            onClick={() => handleSideCol(user._id)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8   rounded-full ">
                                  <AvatarImage alt="User Avatar" />
                                  <AvatarFallback className="rounded-full bg-gray-400  ">
                                    CN
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-semibold ">
                                    {user.name}
                                  </span>
                                  <CardDescription className="text-xs">
                                    {user.email}
                                  </CardDescription>
                                </div>
                              </div>
                              <div>
                                {isAlreadyFriend(user._id) ? (
                                  <Badge className="py-1">
                                    Friend{" "}
                                    <CircleCheckBig className=" text-white" />
                                  </Badge>
                                ) : isPending ? (
                                  <Badge className="py-1">
                                    Pending
                                    <CircleDashed className=" text-white" />
                                  </Badge>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="cursor-pointer"
                                        onClick={() =>
                                          handleSendRequest(user._id!)
                                        }
                                      >
                                        <CircleArrowOutUpRight className="w-4 h-4 text-[#F66435]" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Add Friend</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </Card>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </ScrollArea>
              </CommandList>
            </Command>
          </TabsContent>
          <TabsContent value="friendsRequests">
            <Card className="p-2 gap-2">
              {!pendingUsers || pendingUsers.length === 0 ? (
                <div className="text-sm p-4">No Friend Requests</div>
              ) : (
                pendingUsers?.map((p) => (
                  <Card className="p-3 " key={p._id}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8   rounded-full ">
                          <AvatarImage alt="User Avatar" />
                          <AvatarFallback className="rounded-full bg-gray-400  ">
                            CN
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <span className="font-semibold text-sm">
                            {p.requester.name}
                          </span>
                          <CardDescription className="text-xs">
                            {p.requester.email}
                          </CardDescription>
                        </div>
                      </div>
                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="cursor-pointer"
                              onClick={() =>
                                handleAcceptFriend(p._id, p.requester.name)
                              }
                            >
                              <CircleCheckBig className="text-[#F66435]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Accept</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="cursor-pointer"
                              onClick={() =>
                                handleRejectFriend(p._id, p.requester.name)
                              }
                            >
                              <CircleSlash2 className="text-[#F66435]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reject</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </Card>
          </TabsContent>
        </Tabs>
        {sideCol &&
          (isMobile ? (
            <Sheet open={sideCol} onOpenChange={setSideCol}>
              <SheetContent className="p-2">
                <SheetHeader className="p-4">
                  {userById && (
                    <>
                      <Card className="relative  w-full h-40 bg-gray-100 mb-6">
                        <Avatar className="absolute -bottom-9 left-6 h-18 w-18  rounded-full ">
                          <AvatarImage alt="User Avatar" />
                          <AvatarFallback className="rounded-full bg-gray-400  ">
                            CN
                          </AvatarFallback>
                        </Avatar>
                      </Card>
                      <SheetTitle className="mt-4 text-2xl ">
                        {userById?.name}
                      </SheetTitle>
                      <SheetDescription className="">
                        {userById?.email}
                      </SheetDescription>
                      Friends:
                      {userFriend?.map((friend) => (
                        <div key={friend._id}>{friend.name}</div>
                      ))}
                    </>
                  )}
                </SheetHeader>
              </SheetContent>
            </Sheet>
          ) : (
            <Card className="w-full col-span-2 flex p-2  ">
              {userById && (
                <>
                  <Card className="relative  w-full h-40 bg-gray-100">
                    <Avatar className="absolute -bottom-9 left-10 h-18 w-18  rounded-full ">
                      <AvatarImage alt="User Avatar" />
                      <AvatarFallback className="rounded-full bg-gray-400  ">
                        CN
                      </AvatarFallback>
                    </Avatar>
                  </Card>
                  <div className="p-4">
                    <CardTitle className="mt-4 text-2xl ">
                      {userById.name}
                    </CardTitle>
                    <CardDescription className="">
                      {userById.email}
                    </CardDescription>
                    Friends:
                    {userFriend?.map((friend) => (
                      <div key={friend._id}>{friend.name}</div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
}
