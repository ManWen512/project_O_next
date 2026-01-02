"use client";

import PostDrawer from "@/components/postDrawer";
import { Button } from "@/components/ui/button";
import { ArrowBigRightDash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div>
      <div className="sm:flex items-center justify-center min-h-screen bg-white">
        <div className="text-2xl font-bold fixed left-4 top-2 font-quicksand  z-50">
          Project{" "}
          <img
            src="/logo.PNG"
            alt="Logo"
            className="inline h-12 w-12 -ml-3 mb-1"
          />
        </div>
        <div>
          <video
            src="/JKZD2030.mp4" // or a remote URL
            autoPlay // start automatically
            loop // repeat continuously
            muted // required for autoplay in most browsers
            playsInline // mobile devices
            className="w-xl h-auto rounded-lg"
          ></video>
        </div>

        <div className="px-4">
          <p className="mb-2 "> Just by Chatting</p>
          <p className="font-bold text-4xl mb-4">
            Create Social Media Posts with AI
          </p>
          <div className="text-lg">
            <p>Turn ideas into complete posts</p>
            <p className="">
              AI suggests captions, images, and even publishes posts{" "}
            </p>
            <p className=""> all inside one AI chat</p>
          </div>
          <Button
            className="bg-[#F66435] hover:bg-[#b84c27] mt-15"
            onClick={() => router.push("/login")}
          >
            Try Now <ArrowBigRightDash className="inline-block " />
          </Button>
        </div>
        <div className="absolute top-4 right-8 flex gap-2">
          <Button
            className="bg-[#F66435] hover:bg-[#b84c27]"
            onClick={() => router.push("/login")}
          >
            Log In
          </Button>
          <Button variant="ghost" onClick={() => router.push("/register")}>
            Register
          </Button>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex flex-col items-center justify-center my-8 ">
          <p className="text-4xl font-semibold">Start with an Idea </p>
          <p className="block"> AI writes the captions</p>
        </div>
        <div className="flex items-center justify-center mb-25">
          <img
            src="/branding_1.png"
            alt="branding_1"
            className="sm:w-[70vw] w-full rounded-xl shadow-xl"
          />
        </div>
        <div className="flex flex-col items-center justify-center mb-12 ">
          <p className="text-4xl font-semibold">AI finds the perfect images </p>
          <p className="block"> Smart image suggestions</p>
        </div>
        <div className="flex items-center justify-center mb-25">
          <img
            src="/branding_2.png"
            alt="branding_2"
            className="sm:w-[70vw] w-full rounded-xl shadow-xl"
          />
        </div>
        <div className="flex flex-col items-center justify-center mb-12 ">
          <p className="text-4xl font-semibold">
            Puts everything together 
          </p>
           <p className="block"> AI ready-to-post creation</p>
        </div>
        <div className="flex items-center justify-center mb-25">
          <img
            src="/branding_3.png"
            alt="branding_3"
            className="sm:w-[70vw] w-full rounded-xl shadow-xl"
          />
        </div>
        <div className="flex flex-col items-center justify-center mb-12">
          <p className="text-4xl font-semibold">
            Review and publish {" "}
          </p>
             <p className="block"> with one click</p>
        </div>
        <div className="flex items-center justify-center pb-25 border-b">
          <img
            src="/branding_4.png"
            alt="branding_4"
            className="sm:w-[70vw] w-full rounded-xl shadow-xl"
          />
        </div>
      </div>
    
    </div>
  );
}
