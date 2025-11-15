import { ImagePlus, SquarePen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardDescription, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useUploadProfileMutation } from "@/services/user";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function Profile() {
  const [uploadProfile, { isLoading }] = useUploadProfileMutation();
  const { data: session } = useSession();
  const userId = session?.user?.id;

 
  return (
    <div>
      <div>
        <Card className="relative  w-full h-40 bg-gray-100 mt-4">
          <Avatar className="absolute -bottom-9 left-10 h-22 w-22  rounded-full ">
            <AvatarImage alt="User Avatar" />
            <AvatarFallback className="rounded-full bg-gray-400  ">
              CN
            </AvatarFallback>
          </Avatar>
        
        </Card>
        <div className="pt-6">
          <div className="flex mt-4 justify-between items-center">
            <CardTitle className=" text-2xl ">Min Wai Yan Oo</CardTitle>
          </div>
          <CardDescription className="text-sm">No pain no gain</CardDescription>
          <CardDescription className="">
            email: waiyan55512@gmail.com
          </CardDescription>

          <div className="flex mt-4 justify-start gap-2 items-center">
            <Label>31 Posts</Label>
            <Label>31 Friends</Label>
          </div>
          <Button className="mt-4">
            <SquarePen />
            <p className="sm:block hidden">Edit Profile</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
