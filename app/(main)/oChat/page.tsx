"use client";

import { Chat } from "@/components/chat";
import { ChatNew } from "@/components/ChatNew";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";

export default function OChat() {
  const { data: session, status } = useSession();

  // ✅ Wait for authentication before initializing chat
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>
          <Spinner className="inline-block mr-2"/>
          Loading authentication...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div>Please sign in to use this feature</div>;
  }
  return (
    <div className="w-full sm:px-20 p-4">
      <div className=" flex justify-between">
        <div className="fixed flex top-2 z-50 p-2  bg-gray-100 rounded-2xl">
          <SidebarTrigger className="-ml-1 sm:hidden mr-1 " />
          <div className=" text-lg font-semibold ">O Chat</div>
        </div>
      </div>
      <div className="mt-8">
        <ChatNew userId={session?.user.id} />
      </div>
    </div>
  );
}
