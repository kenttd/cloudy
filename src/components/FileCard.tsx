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
import ShareFolderDialog from "./ShareFolderDialog";

export default function FileCard({
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
            {file.type == "folder" ? (
              <>
                <Folder className="h-10 w-10 text-primary" />
                <div className="text-center">
                  <h3 className="text-sm font-medium">{file.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {file.itemCount} {file.itemCount! > 1 ? "files" : "file"},{" "}
                    {file.formatted_total_size}
                  </p>
                </div>
              </>
            ) : (
              <>
                <File className="h-10 w-10 text-primary" />
                <div className="text-center">
                  <h3 className="text-sm font-medium">{file.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {file.formatted_file_size}
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-center gap-2 bg-muted p-2 mt-auto">
            {file.type == "folder" ? (
              <FolderButtons file={file} router={router} />
            ) : (
              <FileButtons file={file} />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="group-hover:opacity-100"
              onClick={() => {
                fetch(`/api/favorite/`, {
                  method: "POST",
                  body: JSON.stringify({
                    type: file.type,
                    _id: file._id,
                    is_favorite: !file.is_favorite,
                  }),
                })
                  .then((res) => {
                    if (!res.ok) {
                      throw new Error("Error fetching the file view URL");
                    }
                    return res.json();
                  })
                  .then((data) => {
                    handleRefresh();
                  })
                  .catch((error) => {
                    console.error("Fetch error:", error);
                  });
              }}
            >
              <Star
                className="h-4 w-4"
                fill={file.is_favorite ? "gold" : "transparent"}
              />
              <span className="sr-only">Star</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}

function FileButtons({ file }: { file: files }) {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="group-hover:opacity-100"
        onClick={async () => {
          toast(`Getting url for ${file.name}...`);
          try {
            const response = await fetch(
              `/api/files/${encodeURIComponent(file.s3_key!)}/download-url`,
              {
                method: "GET",
              }
            );

            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const filename =
              response.headers
                .get("Content-Disposition")
                ?.split("filename=")[1]
                ?.replace(/"/g, "") || "download";

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.parentNode!.removeChild(link);
            window.URL.revokeObjectURL(url);
          } catch (err) {
          } finally {
          }
        }}
      >
        <Download className="h-4 w-4" />
        <span className="sr-only">Download</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="group-hover:opacity-100"
        onClick={() => {
          toast(`Getting url for ${file.name}...`);
          fetch(`/api/files/${encodeURIComponent(file.s3_key!)}/view-url`)
            .then((res) => res.json())
            .then((data) => {
              window.open(data.viewUrl, "_blank");
            });
        }}
      >
        <ExternalLink className="h-4 w-4" />
        <span className="sr-only">Open</span>
      </Button>
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
          window.location.href = `${baseUrl}/folder/${file._id}`;
        }}
      >
        <FolderOpen className="h-4 w-4" />
        <span className="sr-only">Open Folder</span>
      </Button>
      <ShareFolderDialog file={file} />
    </>
  );
}

export interface files {
  _id: string;
  created_at: string;
  updated_at: string;
  parent_folder: string;
  total_size?: number; //folder type
  itemCount?: number; //folder type
  name: string;
  type: string;
  formatted_total_size: string;
  s3_key?: string; //file type
  file_size?: string; //file type
  content_type?: string; //file type
  is_favorite?: boolean; //file type
  formatted_file_size?: string; //file type
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
