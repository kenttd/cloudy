"use client";
import { ChevronRight, File, Folder, FolderPlus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useUserStore from "@/store/UserStore";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SideBar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useParams } from "next/navigation";
import { Types } from "mongoose";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function Component() {
  const params = useParams<{ userId: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, fetchUser, refresh } = useUserStore();
  const [userCur, setUserCur] = useState<any>();
  const [contents, setContents] = useState(null);

  useEffect(() => {
    fetch("/api/admin/user/" + params.userId)
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        setUserCur(data.user);
        setContents(data.contents);
      });
  }, []);

  useEffect(() => {
    fetchUser("/api/user");
  }, [fetchUser]);

  const handleRefresh = async () => {
    setRefreshKey((prevKey) => prevKey + 1);
    refresh("/api/user");
  };
  console.log("handle home", handleRefresh);
  const folderName = useRef("");
  return (
    <SidebarProvider>
      <SideBar user={user} handleRefresh={handleRefresh} />
      <SidebarInset>
        <div className="flex min-h-screen w-full bg-background overflow-hidden">
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
              <div className="flex items-center space-x-2">
                <SidebarTrigger className="-ml-1 rounded-none" />
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {userCur && (
                <div>
                  <h1 className="text-2xl font-semibold">User Details</h1>
                  <div>
                    <Image
                      src={userCur.avatar}
                      alt=""
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label>Name:</Label>
                    <span>{userCur.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label>Email:</Label>
                    <span>{userCur.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label>Role:</Label>
                    <span>{userCur.role}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label>Storage Limit:</Label>
                    <span>{userCur.formatted_storage_limit}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label>Used Storage:</Label>
                    <span>{userCur.formatted_used_storage}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label>Created At:</Label>
                    <span>{userCur.created_at}</span>
                  </div>
                </div>
              )}

              {contents && <Tree item={contents} />}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function Tree({ item }: { item: FolderContents }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ml-4">
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={false}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronRight
              className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
            />
            <Folder />
            <span className="text-sm">{item.folder.folder_name}</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-4">
            {/* Render files */}
            {item.files.map((file) => (
              <div
                key={file._id.toString()}
                className="flex items-center space-x-2 space-y-2"
              >
                <File />
                <span>{file.file_name}</span>
                {file.is_favorite && <Badge>Favorite</Badge>}
              </div>
            ))}
            {/* Render subfolders */}
            {item.subfolders.map((subfolder) => (
              <Tree key={subfolder.folder._id.toString()} item={subfolder} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface FolderContents {
  folder: {
    _id: Types.ObjectId;
    folder_name: string;
    is_favorite: boolean;
    is_public: boolean;
  };
  files: {
    _id: Types.ObjectId;
    file_name: string;
    file_size: number;
    content_type: string;
    is_favorite: boolean;
    is_deleted: boolean;
  }[];
  subfolders: FolderContents[];
}
