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
import { Check, Cross, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { files } from "./FileCard";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { set } from "mongoose";

export default function ShareFolderDialog({ file }: { file: files }) {
  const [list, setList] = useState<[] | null>();
  const [email, setEmail] = useState(null);
  const [checked, setChecked] = useState(false);

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
            <div className="flex items-center space-x-2">
              {/* <Switch /> */}
              <Switch
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
                checkedIcon={
                  <Check size={12} color="green" className="ml-1 mt-1" />
                }
                uncheckedIcon={
                  <X size={12} color="gray" className="ml-1 mt-1" />
                }
                checked={checked}
                onCheckedChange={(checked) => {
                  setChecked(checked);
                }}
              />
              <Label>Public</Label>
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
      </DialogContent>
    </Dialog>
  );
}
