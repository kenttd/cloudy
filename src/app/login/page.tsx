"use client";
import ShiningButton from "@/components/ShiningButton";
import { useEffect, useState } from "react";
export default function LoginPage() {
  const [redirectLink, setRedirectLink] = useState(null);
  useEffect(() => {
    fetch("/api/getGoogleUrl")
      .then((res) => res.json())
      .then((data) => {
        setRedirectLink(data.url);
      });
  }, []);
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-primary-foreground">
          {/* <ChromeIcon className="mr-2 h-5 w-5" /> */}
          <span className="text-sm font-medium">cloudy</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Sign in to your account
        </h1>
        <p className="mt-2 text-muted-foreground">
          Securely access your files and collaborate with your team.
        </p>
        <div className="mt-6">
          <ShiningButton
            label="Sign in with Google"
            redirectLink={redirectLink}
          />
        </div>
      </div>
    </div>
  );
}
