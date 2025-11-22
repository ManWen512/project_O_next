import { Chat } from "@/components/chat";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function OChat() {
  return (
    <div className="w-full sm:px-20 p-4">
      <div className=" flex justify-between">
        <div className="fixed flex top-2 z-50 p-2  bg-gray-100 rounded-2xl">
          <SidebarTrigger className="-ml-1 sm:hidden mr-1 " />
          <div className=" text-lg font-semibold ">O Chat</div>
        </div>

      </div>
      <div className="mt-8">
        <Chat />
      </div>
    </div>
  );
}
