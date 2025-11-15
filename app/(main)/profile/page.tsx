"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CircleSlash2, CircleSmall, ImagePlus, Loader2, Orbit, SquarePen } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const userId = session?.user?.id;

  const { data: alreadyFriend } = useGetFriendsListsQuery(session?.user?.id!, {
    skip: status !== "authenticated" || !session?.user?.id,
  });

  const [uploadProfile, { isLoading: isUploadingImage }] =
    useUploadProfileMutation();
  const [updateUser, { isLoading: isUpdatingProfile }] =
    useUpdateUserMutation();

  const { data: posts } = useGetUserPostsQuery(session?.user?.id!, {
    skip: status !== "authenticated" || !session?.user?.id,
  });

  // Separate preview states for outside and inside dialog
  const [outsidePreviewUrl, setOutsidePreviewUrl] = useState<string>("");
  const [dialogPreviewUrl, setDialogPreviewUrl] = useState<string>("");
  const [selectedDialogFile, setSelectedDialogFile] = useState<File | null>(
    null
  );

  // Dialog open state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form data for dialog
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    bio: session?.user?.bio || "",
  });

  // Update form when session changes
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        bio: session.user.bio || "",
      });
    }
  }, [session]);

  // Reset dialog state when closed
  useEffect(() => {
    if (!isDialogOpen) {
      setDialogPreviewUrl("");
      setSelectedDialogFile(null);
      setFormData({
        name: session?.user?.name || "",
        bio: session?.user?.bio || "",
      });
    }
  }, [isDialogOpen, session]);

  // Handle instant upload outside dialog
  const handleInstantUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!userId) {
      toast.error("You must be logged in!");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setOutsidePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      formData.append("userId", userId);

      const result = await uploadProfile(formData).unwrap();

      await update({
        user: {
          ...session?.user,
          profileImage: result.profileImage,
        },
      });

      toast.success("Profile image uploaded successfully!");
      setOutsidePreviewUrl(""); // Clear preview, use session image
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(error?.data?.message || "Failed to upload profile image");
      setOutsidePreviewUrl(""); // Revert preview
    }
  };

  // Handle image selection in dialog (preview only, no upload)
  const handleDialogImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDialogPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedDialogFile(file);
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle dialog form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("You must be logged in!");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      let newProfileImage = session?.user?.profileImage;

      // Step 1: Upload image if selected
      if (selectedDialogFile) {
        const imageFormData = new FormData();
        imageFormData.append("profileImage", selectedDialogFile);
        imageFormData.append("userId", userId);

        const imageResult = await uploadProfile(imageFormData).unwrap();
        newProfileImage = imageResult.profileImage;
        console.log("Image uploaded:", newProfileImage);
      }

      // Step 2: Update profile data
      const hasProfileChanges =
        formData.name !== session?.user?.name ||
        formData.bio !== session?.user?.bio;

      if (hasProfileChanges) {
        const updates: any = {};
        if (formData.name !== session?.user?.name) updates.name = formData.name;
        if (formData.bio !== session?.user?.bio) updates.bio = formData.bio;

        await updateUser({ userId, data: updates }).unwrap();
        console.log("Profile updated");
      }

      // Step 3: Update session
      await update({
        user: {
          ...session?.user,
          name: formData.name,
          bio: formData.bio,
          profileImage: newProfileImage,
        },
      });

      toast.success("Profile updated successfully!");
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const isLoading = isUploadingImage || isUpdatingProfile;

  // Get current profile image with preview priority
  const currentProfileImage =
    outsidePreviewUrl || session?.user?.profileImage || undefined;

  const dialogDisplayImage =
    dialogPreviewUrl || session?.user?.profileImage || undefined;

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 w-full">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <AvatarImage src={currentProfileImage} alt="User Avatar" />
                  <AvatarFallback className="rounded-full bg-gray-400">
                    {session?.user?.name?.charAt(0).toUpperCase() || "CN"}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-9 left-26 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full cursor-pointer transition-colors">
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*,image/heic,image/heif"
                    className="hidden"
                    onChange={handleInstantUpload}
                    disabled={isUploadingImage}
                  />
                </label>
              </Card>

              <div className="pt-6">
                <div className="flex mt-4 justify-between items-center">
                  <CardTitle className="text-2xl">
                    {session?.user?.name}
                  </CardTitle>
                  <DialogTrigger asChild>
                    <Button>
                      <SquarePen />
                      <p className="sm:block hidden">Edit Profile</p>
                    </Button>
                  </DialogTrigger>
                </div>

                <CardDescription className="text-sm mt-2">
                  {session?.user?.bio || "No bio yet"}
                </CardDescription>

                <CardDescription className="mt-1">
                  email: {session?.user?.email}
                </CardDescription>

                <div className="flex mt-4 justify-start gap-2 items-center">
                  <Link href="/myFeeds">
                    <Label className="cursor-pointer hover:underline">
                      {posts?.length || 0} Posts
                    </Label>
                  </Link>
                  <Card className="p-3">
                    <Label>{alreadyFriend?.length || 0} Friends</Label>
                  </Card>
                </div>

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
                              <DropdownMenuContent className="w-56 " align="end">
                                <DropdownMenuGroup>
                                  <DropdownMenuItem className="py-2"><Orbit className="w-3 h-3 text-[#F66435]"/>Profile</DropdownMenuItem>
                                  <DropdownMenuItem className="py-2"> <CircleSlash2 className="text-[#F66435]" />UnFriend</DropdownMenuItem>
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
              </div>
            </div>
          </div>

          {/* Dialog Form - Upload on Submit */}
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Profile Image in Dialog */}
                <div className="grid gap-3">
                  <Label>Profile Image</Label>
                  <div className="relative flex justify-center my-2">
                    <Avatar className="h-24 w-24 rounded-full">
                      <AvatarImage src={dialogDisplayImage} alt="User Avatar" />
                      <AvatarFallback className="rounded-full bg-gray-400">
                        {session?.user?.name?.charAt(0).toUpperCase() || "CN"}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute -bottom-2 right-[42%] p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full cursor-pointer transition-colors">
                      <ImagePlus className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*,image/heic,image/heif"
                        className="hidden"
                        onChange={handleDialogImageSelect}
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </div>

                {/* Username */}
                <div className="grid gap-3">
                  <Label htmlFor="name">Username *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Bio */}
                <div className="grid gap-3">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    disabled={isLoading}
                    className="resize-none min-h-20"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 text-right">
                    {formData.bio.length}/500
                  </p>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
