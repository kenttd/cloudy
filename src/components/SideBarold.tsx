"use client";
import Image from "next/image";
import Link from "next/link";
import { FileUploader } from "./file-uploader";
import {
  Folder,
  Users,
  Trash2,
  Star,
  Calendar,
  FolderPlus,
} from "lucide-react";
import Logo from "@/assets/logo.png";
import { useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SideBarProfile from "./SideBarProfile";

export default function SideBar({
  handleRefresh,
  user,
}: {
  handleRefresh: () => void;
  user: any;
}) {
  const folderName = useRef<HTMLInputElement>(null);
  return (
    <aside className="hidden w-64 flex-col border-r bg-background p-4 md:flex">
      <div className="mb-6 flex items-center gap-2">
        {/* <HardDriveIcon className="h-6 w-6" /> */}
        <Image src={Logo} alt="cloudy's logo" height={50} />
        <h2 className="text-xl font-bold">cloudy</h2>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="text-base shadow-xl font-sans">
            New Folder
            <FolderPlus className="ml-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a new folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Folder name
              </Label>
              <Input
                id="name"
                placeholder="untitled folder"
                className="col-span-3"
                ref={folderName}
                defaultValue={"untitled folder"}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="submit"
                onClick={() => {
                  const aPromise = fetch("/api/folder", {
                    method: "POST",
                    body: JSON.stringify({
                      folderName: folderName.current?.value,
                    }),
                  }).then(async (response) => {
                    if (!response.ok) {
                      throw new Error("Upload failed");
                    }
                    return response.json();
                  });
                  toast.promise(aPromise, {
                    loading: `Creating a folder...`,
                    success: async (data: any) => {
                      handleRefresh();
                      return `Folder created successfully`;
                    },
                    error: (err: any) => {
                      console.error("Upload failed:", err);
                      return "Failed to create a folder";
                    },
                  });
                }}
              >
                Create
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <nav className="flex flex-col gap-2 mt-3">
        <Link
          href="/home"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          prefetch={false}
        >
          <Folder className="h-5 w-5" />
          My Drive
        </Link>
        <Link
          href="/shared-with-me"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          prefetch={false}
        >
          <Users className="h-5 w-5" />
          Shared with me
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          prefetch={false}
        >
          <Trash2 className="h-5 w-5" />
          Trash
        </Link>
        <Link
          href="/starred"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          prefetch={false}
        >
          <Star className="h-5 w-5" />
          Starred
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          prefetch={false}
        >
          <Calendar className="h-5 w-5" />
          Recent
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          prefetch={false}
        >
          <FileUploader handleRefresh={handleRefresh} />
        </Link>
      </nav>
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
      <Button className="bg-transparent text-sky-600 border mt-3 shadow-lg shadow-sky-600/50">
        Get more storage
      </Button>
      {user._id ? (
        <>
          <SideBarProfile user={user} />
        </>
      ) : (
        <></>
      )}
    </aside>
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
