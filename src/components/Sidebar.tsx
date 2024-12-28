"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "@/assets/logo.png";
import { FileUploader } from "./file-uploader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  BadgeCheck,
  Bell,
  Calendar,
  ChevronsUpDown,
  CreditCard,
  Folder,
  HomeIcon,
  LogOut,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useSidebar } from "@/components/ui/sidebar";
import { Progress } from "./ui/progress";
import { useEffect, useState } from "react";
import { url } from "inspector";
import { toast } from "sonner";

const sidebarUser = [
  {
    name: "My Drive",
    url: "/",
    icon: Folder,
  },
  {
    name: "Shared with me",
    url: "/shared-with-me",
    icon: Users,
  },
  {
    name: "Trash",
    url: "/trash",
    icon: Trash2,
  },
  {
    name: "Starred",
    url: "/starred",
    icon: Star,
  },
];
const sidebarAdmin = [
  {
    name: "My Drive",
    url: "/",
    icon: Folder,
  },
  {
    name: "Shared with me",
    url: "/shared-with-me",
    icon: Users,
  },
  {
    name: "Trash",
    url: "/trash",
    icon: Trash2,
  },
  {
    name: "Starred",
    url: "/starred",
    icon: Star,
  },
  {
    name: "Admin Actions",
    url: "/admin",
    icon: Shield,
  },
];
export default function SideBar({
  user,
  handleRefresh,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    used_storage: number;
    storage_limit: number;
    role: string;
    _id: string;
  };
  handleRefresh: () => void;
}) {
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();
  console.log("user", user);
  console.log("handle sidebar", handleRefresh);
  const [data, setData] = useState<
    { name: string; url: string; icon: React.ComponentType }[]
  >([]);
  useEffect(() => {
    if (user.role == "admin") setData(sidebarAdmin);
    else setData(sidebarUser);
  }, [user]);

  return (
    <Sidebar
      collapsible="icon"
      // onMouseEnter={(e) => {
      //   console.log("mouse enter", e);
      //   if (!open) setOpen(true);
      // }}
      // onMouseLeave={() => {
      //   console.log("mouse leave");
      //   if (open) setOpen(false);
      // }}
    >
      <SidebarHeader>
        <div className="flex items-center space-x-2">
          <Image src={Logo} alt="cloudy's logo" height={50} />
          <div className="flex items-end">
            <h2 className="text-xl font-bold group-data-[collapsible=icon]:hidden">
              cloudy
            </h2>
            {user.role == "admin" && (
              <h2 className="text-xs font-semibold group-data-[collapsible=icon]:hidden">
                for admin
              </h2>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group/collapsible">
          <SidebarMenu>
            {data.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="hover:bg-gray-300">
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {open && (
          <SidebarGroup>
            <FileUploader handleRefresh={handleRefresh} />
            {user._id ? (
              <>
                <div className="mt-5">
                  <Progress
                    value={getPercentage(user.used_storage, user.storage_limit)}
                  />
                  <p className="text-xs mt-1">{`${formatBytes(
                    user.used_storage
                  )} of ${formatBytes(user.storage_limit)} used`}</p>
                </div>
              </>
            ) : (
              <></>
            )}
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {/* <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src="https://lh3.googleusercontent.com/a/ACg8ocJkXPVe0twhjsBfCLVdoU4Er0VnNy5AovhgiV3yzvetkgewMDzf=s96-c"
                      alt={user.name}
                    />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar> */}
                  <Image
                    src={user.avatar}
                    alt="user avatar"
                    width="30"
                    height="30"
                    className="rounded-lg"
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    {/* <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar> */}
                    <Image
                      src={user.avatar}
                      alt="user avatar"
                      width="30"
                      height="30"
                      className="rounded-lg"
                    />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.name}
                      </span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles className="mr-3" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-3" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function getPercentage(used: number, limit: number) {
  return Math.ceil((used / limit) * 100);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
  return `${formattedSize} ${sizes[i]}`;
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
