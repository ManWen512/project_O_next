"use client";

import { useState, useRef } from "react";
import { Mail, ArrowLeft } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formSubmitted = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formSubmitted.current) return;
    formSubmitted.current = true;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset email sent! Please check your email.", {
          duration: Infinity,
        });
      } else {
        toast.error(data.error || "Failed to send reset email");
        formSubmitted.current = false;
      }
    } catch (error) {
      toast.error("Something went wrong");
      formSubmitted.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <div className="text-2xl font-bold fixed left-2 top-2 font-quicksand text-white z-50">
        Project{" "}
        <img
          src="/logo.PNG"
          alt="Logo"
          className="inline h-12 w-12 -ml-3 mb-1"
        />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Forgot Password?</CardTitle>
          <CardDescription>
            No worries, we'll send you reset instructions.
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
              disabled={isLoading}
              className="w-full bg-[#F66435] hover:bg-[#b84c27]"
            >
              {isLoading ? "Sending..." : "Send Reset Email"}
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
