import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Button } from "./ui/button";
import { toast } from "sonner";
export default function SideBarProfile({ user }: { user: any }) {
  return (
    <div className="mt-10 flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="overflow-hidden rounded-full">
            <Image
              src={user.avatar}
              alt="user avatar"
              width={500}
              height={500}
              className="w-14 rounded-full cursor-pointer"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="text-sm truncate ml-2">
        <div>{user.name}</div>
        <div>{user.email}</div>
      </div>
    </div>
  );
}

function logout() {
  const aPromise = fetch("/api/logout").then(() => {
    window.location.href = "/login";
  });
  toast.promise(aPromise, {
    loading: "Logging out...",
    success: (result) => {
      return "Logged out. Redirecting...";
    },
    error: (error) => {
      return "Error logging out.";
    },
  });
}
