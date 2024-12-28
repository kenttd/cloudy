"use client";
import { Input } from "@/components/ui/input";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SideBar from "@/components/Sidebar";
import FileCard, { files } from "@/components/FileCard";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import FileCardSkeleton from "@/components/FileCardSkeleton";
import useUserStore from "@/store/UserStore";

export default function Component() {
  const [files, setFiles] = useState<null | files[]>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, isFetched, isLoading, error, fetchUser, refresh } =
    useUserStore();

  useEffect(() => {
    const fetchFiles = async () => {
      setFiles(null);
      try {
        const response = await fetch("/api/favorite");
        const data = await response.json();
        console.log("data", data);
        setFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, [refreshKey]);

  const handleRefresh = async () => {
    setRefreshKey((prevKey) => prevKey + 1);
    refresh("/api/user");
  };

  useEffect(() => {
    fetchUser("/api/user");
  }, [fetchUser]);
  return (
    <SidebarProvider>
      <SideBar user={user} handleRefresh={handleRefresh} />
      <SidebarInset>
        <div className="flex min-h-screen w-full bg-background overflow-hidden">
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
              <div className="flex items-center gap-4">
                {/* <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button> */}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search files and folders..."
                    className="w-full bg-muted pl-8 pr-4 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {/* Scrollable part */}
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
