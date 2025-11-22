import { ImagePlus, SquareArrowOutUpRight, SquarePen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardDescription, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";
import type { User } from "next-auth";
import { useGetFriendsListsQuery } from "@/services/friends";
import { useGetUserPostsQuery } from "@/services/post";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ProfileProps {
  user: User; // 👈 use NextAuth's extended User
}

export default function Profile({ user }: ProfileProps) {
  const { data: alreadyFriend } = useGetFriendsListsQuery(user.id);
  const { data: posts } = useGetUserPostsQuery();
     const { data: session } = useSession();

  return (
    <div>
      <div>
        <Card className="relative  w-full h-40 bg-gray-100 mt-4">
          <Avatar className="absolute -bottom-9 left-10 h-22 w-22  rounded-full ">
            <AvatarImage
              src={user.profileImage ?? undefined}
              alt="User Avatar"
            />
            <AvatarFallback className="rounded-full bg-gray-400  ">
              CN
            </AvatarFallback>
          </Avatar>
        </Card>
        <div className="pt-6">
          <Link
            href={
             user?.id === session?.user?.id
                ? "/profile" // ⭐ your own profile
                : `/profile/${user?.id}` // ⭐ other user's profile
            }
          >
            <div className="flex mt-4 justify-between items-center">
              <CardTitle className=" text-2xl ">{user?.name}<SquareArrowOutUpRight className="inline-block w-4 h-4 ml-2" /></CardTitle>
            </div>
          </Link>
          <CardDescription className="text-sm">{user?.bio}</CardDescription>
          <CardDescription className="">{user?.email}</CardDescription>

          <div className="flex mt-4 justify-start gap-2 items-center">
            <Label> {posts?.length || 0} Posts</Label>
            <Label> {alreadyFriend?.length || 0} Friends</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
