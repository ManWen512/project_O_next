// app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <div className="text-2xl font-bold fixed left-2 top-2 font-quicksand text-white z-50">
        Project <img src="/logo.PNG" alt="Logo" className="inline h-12 w-12 -ml-3 mb-1" />
      </div>
      <Card className="w-full max-w-md space-y-5  p-8  text-center sm:mt-2 mt-12">
        {status === "loading" && (
          <>
            <Spinner className="mx-auto h-16 w-16 text-[#F66435]" />
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Verifying your email...
              </CardTitle>
              <CardDescription>Please wait a moment</CardDescription>
            </CardHeader>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-[#F66435]" />
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Email Verified!
              </CardTitle>
              <CardDescription>Redirecting to login page...</CardDescription>
              <Link href="/login" className="text-[#F66435] hover:underline text-sm">
                Go to Login
              </Link>
            </CardHeader>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-[#F66435]" />
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Verification Failed
              </CardTitle>
              <CardDescription>{message}</CardDescription>{" "}
              <Button
                onClick={() => router.push("/resend-verification")}
                className="bg-[#F66435] hover:bg-[#b84c27] mt-8"
              >
                Resend Verification Email
              </Button>
              <Link href="/register" className="text-[#F66435] hover:underline text-sm">
                Back to Register
              </Link>
            </CardHeader>

          
          </>
        )}
      </Card>
    </div>
  );
}
