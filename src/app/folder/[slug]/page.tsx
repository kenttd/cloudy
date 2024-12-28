"use client";
import { Input } from "@/components/ui/input";
import FileCard, { files } from "@/components/FileCard";
import { FolderPlus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import FileCardSkeleton from "@/components/FileCardSkeleton";
import useUserStore from "@/store/UserStore";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SideBar from "@/components/Sidebar";
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
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";

export default function Component() {
  const [files, setFiles] = useState<null | files[]>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [breadcrumb, setBreadcrumb] = useState(null);
  const { user, isFetched, isLoading, error, fetchUser, refresh } =
    useUserStore();

  useEffect(() => {
    const fetchFiles = async () => {
      setFiles(null); // Set to null to show loading state
      try {
        const response = await fetch("/api/files");
        const data = await response.json();
        console.log("data", data);
        setFiles(data.files);
        setBreadcrumb(data.breadcrumb);
      } catch (error) {
        console.error("Error fetching files:", error);
        // Handle error state if needed
      }
    };

    fetchFiles();
  }, [refreshKey]);

  useEffect(() => {
    fetchUser("/api/user");
  }, [fetchUser]);

  const handleRefresh = async () => {
    setRefreshKey((prevKey) => prevKey + 1);
    refresh("/api/user");
  };
  const folderName = useRef("");

  return (
    <SidebarProvider>
      <SideBar user={user} handleRefresh={handleRefresh} />
      <SidebarInset>
        <div className="flex min-h-screen w-full bg-background overflow-hidden">
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
              <div className="flex items-center space-x-2">
                <SidebarTrigger className="-ml-1" />

                <div className="text-lg">
                  {breadcrumb ? (
                    <DynamicBreadcrumb items={breadcrumb} />
                  ) : (
                    <Skeleton className="h-4 w-5" />
                  )}
                  {/* <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search files and folders..."
                    className="w-full bg-muted pl-8 pr-4 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div> */}
                </div>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="text-base shadow-xl font-sans mb-3">
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
                      <Label className="text-right">Folder name</Label>
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-y-auto max-h-[80vh]">
                {files ? (
                  <>
                    <FileCard files={files} handleRefresh={handleRefresh} />
                  </>
                ) : (
                  <FileCardSkeleton />
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
