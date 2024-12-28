"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Check, Clipboard, Cross, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { files } from "./FileCard";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";

export default function ShareFolderDialog({ file }: { file: files }) {
  const [list, setList] = useState<[] | null>();
  const [email, setEmail] = useState(null);
  const [checked, setChecked] = useState(file.is_public);
  const [usersWithAccess, setUsersWithAccess] = useState<[] | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [disabled, setDisabled] = useState(false);
  console.log("file", file);
  useEffect(() => {
    fetch(`/api/folder/${file._id}/permission`)
      .then((res) => res.json())
      .then((data) => {
        setUsersWithAccess(data);
      });
  }, [refresh]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (email != null) {
      timeout = setTimeout(() => {
        fetch(`/api/user/auto-complete?keyword=${email}`)
          .then((res) => {
            if (!res.ok) throw new Error("error");
            console.log("ok");
            return res.json();
          })
          .then((data) => {
            console.log("comp", data);
            setList(data);
          })
          .catch((err) => {
            setList(null);
          });
      }, 500);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [email]);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group-hover:opacity-100"
          onClick={() => {}}
        >
          <UserPlus className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{file.name}"</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center space-x-2 justify-between mb-3">
              <div className="items-center space-x-2 flex">
                <Switch
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                  checkedIcon={
                    <Check size={12} color="green" className="ml-1 mt-1" />
                  }
                  uncheckedIcon={
                    <X size={12} color="gray" className="ml-1 mt-1" />
                  }
                  disabled={disabled}
                  checked={checked}
                  onCheckedChange={(checked) => {
                    setDisabled(true);
                    fetch(`/api/folder/${file._id}/public`, {
                      method: "POST",
                      body: JSON.stringify({
                        folderId: file._id,
                        is_public: checked,
                      }),
                    }).then((res) => {
                      if (res.ok) {
                        toast.success(
                          `This folder is now ${checked ? "public" : "private"}`
                        );
                        setDisabled(false);
                      } else toast.error("Error");
                    });
                    setChecked(checked);
                  }}
                />
                <Label>Public</Label>
              </div>
              {checked && (
                <div className="flex items-center space-x-2">
                  <Button
                    className="text-xs"
                    onClick={() => {
                      const link = `${window.location.origin}/public/${file._id}`;
                      navigator.clipboard.writeText(link);
                      toast.success("Link copied to clipboard");
                    }}
                  >
                    <Clipboard size={20} />
                    Copy Public Link
                  </Button>
                </div>
              )}
            </div>
            <Input
              placeholder="Add people by typing their email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              disabled={checked}
            />
          </div>
        </div>
        <div className="space-y-3">
          {list ? (
            list.map(
              (x: {
                avatar: string;
                name: string;
                email: string;
                _id: string;
              }) => (
                <div
                  className="flex items-center justify-between"
                  key={x.email}
                >
                  <div className="flex">
                    <Image
                      src={x.avatar}
                      alt="user avatar"
                      width={500}
                      height={500}
                      className="w-10 rounded-full"
                    />
                    <div className="text-xs truncate ml-2">
                      <div>{x.name}</div>
                      <div>{x.email}</div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      fetch(`/api/user/${x._id}/permission`, {
                        method: "POST",
                        body: JSON.stringify({
                          folderId: file._id,
                        }),
                      }).then((res) => {
                        if (res.ok) {
                          toast.success("Permission granted");
                          setUsersWithAccess(null);
                          setRefresh((prev) => !prev);
                        } else toast.error("Error");
                      });
                    }}
                  >
                    Add
                  </Button>
                </div>
              )
            )
          ) : (
            <></>
          )}
        </div>
        {!checked && (
          <div>
            <div className="mb-3">People with access</div>
            <div className="space-y-3">
              {usersWithAccess ? (
                usersWithAccess.map((x: { user: any }) => {
                  const user = x.user as {
                    avatar: string;
                    name: string;
                    email: string;
                    _id: string;
                  };
                  return (
                    <div
                      className="flex items-center justify-between"
                      key={user.email}
                    >
                      <div className="flex">
                        <Image
                          src={user.avatar}
                          alt="user avatar"
                          width={500}
                          height={500}
                          className="w-10 rounded-full"
                        />
                        <div className="text-xs truncate ml-2">
                          <div>{user.name}</div>
                          <div>{user.email}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          fetch(`/api/user/${user._id}/permission`, {
                            method: "DELETE",
                            body: JSON.stringify({
                              folderId: file._id,
                            }),
                          }).then((res) => {
                            if (res.ok) {
                              toast.success("Permission revoked");
                              setUsersWithAccess(null);
                              setRefresh((prev) => !prev);
                            } else toast.error("Error");
                          });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
