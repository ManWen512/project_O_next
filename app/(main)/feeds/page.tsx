import PostDrawer from "@/components/postDrawer";
import Posts from "@/components/posts";
import Recommendations from "@/components/recommendations";
import Suggestions from "@/components/suggestions";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Feeds() {
  return (
    <div className="w-full">

      <div className="grid grid-cols-4 gap-2 w-full">
        <div className="sm:col-span-3 col-span-4 p-4 sm:mx-15">
          <div className="flex justify-between">
            <div className="flex  mt-2 z-50">
              <SidebarTrigger className="-ml-1 sm:hidden mr-1 " />
              <div className=" text-lg font-semibold"> Feeds</div>
            </div>
            <img
              src="/logo.PNG"
              alt="Logo"
              className="inline h-12 w-12 -mt-1 sm:hidden "
            />
          </div>
          <Posts />
          <PostDrawer />
        </div>
        <div className="hidden sm:block col-span-1 sticky top-6 mr-5  h-fit">
          <Suggestions />
          <Recommendations />
        </div>
      </div>
    </div>
  );
}
