"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  File,
  Folder,
  Download,
  ExternalLink,
  FolderOpen,
  Star,
} from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SharedFileCard({
  files,
  handleRefresh,
}: {
  files: files[];
  handleRefresh: () => void;
}) {
  const router = useRouter();
  return (
    <>
      {files.map((file) => (
        <Card className="group flex flex-col h-full" key={file._id}>
          <CardContent className="flex flex-col items-center justify-center gap-2 p-4 flex-grow">
            <Folder className="h-10 w-10 text-primary" />
            <div className="text-center">
              <h3 className="text-sm font-medium">{file.name}</h3>
              <p className="text-xs text-muted-foreground">
                {file.itemCount} {file.itemCount! > 1 ? "files" : "file"},{" "}
                {file.formatted_total_size}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-center gap-2 bg-muted p-2 mt-auto">
            <FolderButtons file={file} router={router} />
          </CardFooter>
        </Card>
      ))}
    </>
  );
}

function FolderButtons({
  file,
  router,
}: {
  file: files;
  router: AppRouterInstance;
}) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="group-hover:opacity-100"
        onClick={() => {
          // router.push(`/folder/${file._id}`);
          const baseUrl = window.location.origin; // This gets the current base URL
          window.location.href = `${baseUrl}/shared-with-me/${file._id}`;
        }}
      >
        <FolderOpen className="h-4 w-4" />
        <span className="sr-only">Open Folder</span>
      </Button>
    </>
  );
}

export interface files {
  _id: string;
  created_at: string;
  updated_at: string;
  parent_folder: string;
  total_size: number;
  itemCount: number;
  name: string;
  type: string;
  formatted_total_size: string;
}

async function downloadWithFetch(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}
