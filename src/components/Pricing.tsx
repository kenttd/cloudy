import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Button } from "./ui/button";
import { toast } from "sonner";

export const PriceCard: React.FC<{
  className?: string;
  contactPageHref: string;
  children: React.ReactNode;
}> = ({ className, children, contactPageHref }) => {
  return (
    <article
      className={cn(
        "text-start border backdrop-blur-[4px] h-full min-h-[700px] w-full max-w-[400px]  dark:border-neutral-800 border-neutral-300 px-6 py-6 rounded-xl relative z-[1] flex flex-col justify-between",
        className
      )}
    >
      <span>{children}</span>
      <Button
        // href={contactPageHref}
        onClick={() => {
          toast(`Loading...`);
          fetch(contactPageHref)
            .then((res) => res.json())
            .then((data) => {
              window.open(data.payment_url, "_self");
            });
        }}
        className={
          "w-full flex items-center justify-center mt-7 p-1.5 rounded-lg border dark:border-neutral-700 border-neutral-300 dark:text-neutral-300 text-neutral-600"
        }
      >
        Upgrade
      </Button>
    </article>
  );
};

export const OfferingWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <ul className={cn("mt-10 flex flex-col gap-3 text-sm", className)}>
    {children}
  </ul>
);

export const Offering: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <li className={cn("flex gap-2 items-center font-medium", className)}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={"w-6 h-6 fill-green-600"}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
    <div>{children}</div>
  </li>
);

export const ProductName: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <h1 className={cn("text-lg font-bold text-secondary text-start", className)}>
    {children}
  </h1>
);

export const Price: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("mt-10 mb-7", className)}>
    <div className={"flex items-end gap-1 p-0"}>
      <p className={"text-4xl font-bold block"}>{children}</p>
    </div>
  </div>
);

export const Description: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className={"h-20"}>
    <p className={"leading-[2] text-sm"}>{children}</p>
  </div>
);
