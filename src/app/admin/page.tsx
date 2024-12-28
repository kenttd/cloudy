"use client";
import { useEffect, useRef, useState } from "react";
import useUserStore from "@/store/UserStore";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SideBar from "@/components/Sidebar";
import { AdminTable } from "@/components/AdminTable";

export default function Component() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, fetchUser, refresh } = useUserStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/admin")
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        setData(data);
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
              <AdminTable data={data} />
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
