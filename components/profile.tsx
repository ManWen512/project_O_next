import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardDescription, CardTitle } from "./ui/card";

export default function Profile() {
  return (
    <div>
    
      <Card className="relative  w-full h-40 bg-gray-100">
        <Avatar className="absolute -bottom-9 left-10 h-18 w-18  rounded-full ">
          <AvatarImage alt="User Avatar" />
          <AvatarFallback className="rounded-full bg-gray-400  ">
            CN
          </AvatarFallback>
        </Avatar>
      </Card>
      <div className="p-4">
        <CardTitle className="mt-4 text-2xl ">name</CardTitle>
        <CardDescription className="">email</CardDescription>
        Friends:
      
          <div >name</div>
     
      </div>
    </div>
  );
}
