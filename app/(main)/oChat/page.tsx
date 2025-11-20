import { Chat } from "@/components/chat";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function OChat() {
  return (
    <div className="w-full sm:px-20 p-4">
      <div className="flex justify-between">
        <div className="flex mt-2 z-50">
          <SidebarTrigger className="-ml-1 sm:hidden mr-1 " />
          <div className=" text-lg font-semibold">O Chat</div>
        </div>

        <img
          src="/logo.PNG"
          alt="Logo"
          className="inline h-12 w-12 -mt-1 sm:hidden"
        />
      </div>
      <Chat />
    </div>
  );
}
