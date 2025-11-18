"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Check,
  CircleCheckBig,
  CircleSlash2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { text } from "stream/consumers";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useAddPostMutation } from "@/services/post";
import { Spinner } from "./ui/spinner";

const PostDrawer = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]); // for preview
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [visibility, setVisibility] = useState<string>("public");
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [addPost, { isLoading }] = useAddPostMutation();
  // Auto-expand drawer when input has more than 2 lines or has images
  useEffect(() => {
    const hasImages = images.length > 0;
    const hasContent = inputValue.trim().length > 0;

    if (hasImages || hasContent) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [inputValue, images]);

  // generate previews whenever images change
  useEffect(() => {
    const newPreviews: string[] = [];
    images.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setOpen(false);
    // Show spinner BEFORE API call
    const toastId = toast.loading("Uploading...");

    const formData = new FormData();
    formData.append("content", inputValue);
    formData.append("visibility", visibility);
    images.forEach((file) => formData.append("image", file));

    await addPost(formData).unwrap();

    toast.dismiss(toastId);
    toast.success("Post created successfully!");
    setInputValue("");
    setImages([]);
    setPreviews([]);
  };

  return (
    <div className="">
      {/* Drawer Implementation */}
      <div
        className={`
        fixed bottom-0 left-1/2 transform -translate-x-1/2
        w-full sm:w-[calc(100%-4rem)]   max-w-3xl                       
       bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl
        z-50 transition-all duration-300 ease-in-out
    ${open ? "h-[70vh] sm:h-[75vh]" : "h-[20vh] md:h-[10vh] xl:h-[22vh] overflow-hidden"}
  `}
      >
        <ScrollArea className={`${open ? "overflow-auto" : ""} `}>
          {/* Drawer Handle */}
          <div className=" pt-2 ">
            <div
              className="w-full h-3 flex justify-center cursor-pointer "
              onClick={() => setOpen(!open)}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full " />
            </div>
          </div>

          {/* Drawer Header */}
          <div className={`px-6 py-4 border-b border-gray-200 `}>
            <Label className="text-lg font-semibold">
              What's on your mind?
            </Label>
            <div className="mt-2 ">
              <div className={open ? "space-y-4" : "flex items-center gap-2"}>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 rounded-full grayscale ">
                    <AvatarImage />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  {open && (
                    <Select
                      defaultValue={visibility}
                      onValueChange={setVisibility}
                    >
                      <SelectTrigger className="w-auto ml-3 animate-in slide-in-from-left-8 duration-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Only Me</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setInputValue(e.target.value)
                  }
                  placeholder="What's on your mind?"
                  className="w-full min-h-8 max-h-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={open ? 4 : 1}
                />

                {/* Image Upload Button */}
                <div className=" flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,image/heic,image/heif"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              {/* Image Preview */}
              {previews.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Attached Images ({previews.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {previews.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-auto object-cover rounded-lg bg-gray-200"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-400 text-white rounded-full sm:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {open && (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Tags & Mentions
                    </h3>
                    <input
                      type="text"
                      placeholder="Add tags..."
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          {open && (
            <div className="  p-6 ">
              <div className="flex gap-3 justify-end ">
                <Button
                  onClick={() => {
                    setInputValue("");
                    setImages([]);
                    setOpen(false);
                  }}
                  variant="ghost"
                >
                  Cancel <CircleSlash2 />
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={(!inputValue && images.length === 0) || isLoading}
                >
                  Post <CircleCheckBig className="ml-2" />
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Overlay - only shows when drawer is open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
        />
      )}
    </div>
  );
};

export default PostDrawer;
