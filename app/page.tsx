"use client";

import PostDrawer from "@/components/postDrawer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-2xl font-bold fixed left-4 top-2 font-quicksand  z-50">
        Project{" "}
        <img
          src="/logo.PNG"
          alt="Logo"
          className="inline h-12 w-12 -ml-3 mb-1"
        />
      </div>
      <video
        src="/JKZD2030.mp4" // or a remote URL
        autoPlay // start automatically
        loop // repeat continuously
        muted // required for autoplay in most browsers
        playsInline // mobile devices
        className="w-xl h-auto rounded-lg"
      ></video>
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
  );
}
