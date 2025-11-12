"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (message) {
      toast.success(message);
    }
    if (error) {
      toast.error(error);
    }
  }, [message, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setEmail("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="text-2xl font-bold fixed left-2 top-2 font-quicksand text-white z-50">
        Project <img src="/logo.PNG" alt="Logo" className="inline h-12 w-12 -ml-3 mb-1" />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Resend Verification</CardTitle>
          <CardDescription>
            Enter your email to receive a new verification link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F66435] hover:bg-[#b84c27]"
            >
              {loading ? "Sending..." : "Send Verification Email"}
            </Button>
          </form>

          <div className="text-center mt-3 text-sm">
              <Link href="/login" className="text-[#F66435] hover:underline ">
                Back to Login
              </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
