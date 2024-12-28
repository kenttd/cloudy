"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import SideBar from "@/components/Sidebar";
import FileCard, { files } from "@/components/FileCard";
import { Search, HomeIcon, LockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import FileCardSkeleton from "@/components/FileCardSkeleton";
import useUserStore from "@/store/UserStore";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import SharedFileCard from "@/components/SharedFileCard";

export default function Component() {
  const params = useParams<{ slug: string }>();
  const [files, setFiles] = useState<null | files[]>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      setFiles(null); // Set to null to show loading state
      try {
        const response = await fetch(`/api/sharedWithMe/${params.slug}`);
        if (response.status === 403) {
          throw new Error("You are not allowed to access this folder");
        }
        const data = await response.json();
        console.log("data", data);
        setFiles(data);
      } catch (error: unknown) {
        console.error("Error fetching files:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
        setUnauthorized(true);
        setFiles([]);
      }
    };
    fetchFiles();
  }, [refreshKey]);

  // const handleRefresh = async () => {
  //   setRefreshKey((prevKey) => prevKey + 1);
  //   refresh("/api/user");
  // };

  // useEffect(() => {
  //   fetchUser("/api/user");
  // }, [fetchUser]);
  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6"></header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 overflow-y-auto max-h-[80vh]">
            {files ? (
              <>
                <SharedFileCard files={files} handleRefresh={() => {}} />
              </>
            ) : (
              <FileCardSkeleton />
            )}
            {unauthorized && <Forbidden403Page />}
          </div>
        </main>
      </div>
    </div>
  );
}

const Forbidden403Page = () => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed border-gray-300 p-8">
      <LockIcon className="h-24 w-24 text-destructive animate-pulse mb-6" />
      <h1 className="text-4xl font-bold text-destructive mb-4">
        403 Forbidden
      </h1>
      <p className="text-lg text-muted-foreground mb-6 max-w-md text-center">
        Oops! It seems you don't have permission to access this folder.
      </p>
      <div className="flex space-x-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Link href="/">
          <Button>
            <HomeIcon className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
