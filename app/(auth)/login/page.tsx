"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect, useState, FormEvent, use, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "next-auth/react";
import { Suspense } from "react";

// Login Form Schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const reset = searchParams.get("reset");
  const toastShown = useRef(false);
  const [defaultEmail, setDefaultEmail] = useState("");

  useEffect(() => {
    const email = searchParams.get("email");
    if (email) setDefaultEmail(email);
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
    },
  });

  useEffect(() => {
    if (verified && !toastShown.current) {
      toast.success("Email verified successfully! You can now log in.");
      toastShown.current = true;
    }
  }, [verified]);

  useEffect(() => {
    if (reset && !toastShown.current) {
      toast.success("Password reset successfully! You can now log in.");
      toastShown.current = true;
    }
  }, [reset]);

  useEffect(() => {
    if (form.formState.errors.root) {
      toast.error(form.formState.errors.root.message);
    }
  }, [form.formState.errors.root]);

  const handleSubmit = async (data: LoginFormValues) => {
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      //cannot be catch error with try and catch
      form.setError("root", {
        //error is inside the result
        message: result.error,
      });
      return;
    }

    if (!result?.error) {
      router.replace("/feeds");
    }
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4 ">
        <div className="text-2xl font-bold fixed left-2 top-2 font-quicksand text-white z-50">
          Project{" "}
          <img
            src="/logo.PNG"
            alt="Logo"
            className="inline h-12 w-12 -ml-3 mb-1"
          />
        </div>
        <div className="w-full max-w-md sm:mt-2 mt-12 ">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          {...field}
                          id="email"
                          type="text"
                          placeholder="Enter your email"
                          aria-invalid={fieldState.invalid}
                          autoComplete="email"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <div className="relative">
                          <Input
                            {...field}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            aria-invalid={fieldState.invalid}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Field orientation="horizontal" className="justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        className="rounded border-none bg-gray-200"
                      />
                      <label htmlFor="remember" className="text-sm">
                        Remember me
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#F66435] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </Field>

                  <FieldGroup>
                    <Field>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-[#F66435] hover:bg-[#b84c27]"
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Spinner />
                            <span>Signing in...</span>
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </Field>
                  </FieldGroup>

                  <FieldSeparator>Or continue with</FieldSeparator>

                  <Field>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        // Redirect to Google OAuth
                        window.location.href = `/api/auth/google`;
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        // Redirect to Microsoft OAuth
                        window.location.href = "/api/auth/microsoft";
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        width="48"
                        height="48"
                        role="img"
                        aria-label="Microsoft logo"
                      >
                        <rect x="2" y="2" width="20" height="20" fill="#000" />
                        <rect x="26" y="2" width="20" height="20" fill="#000" />
                        <rect x="2" y="26" width="20" height="20" fill="#000" />
                        <rect
                          x="26"
                          y="26"
                          width="20"
                          height="20"
                          fill="#000"
                        />
                      </svg>
                      Continue with Microsoft
                    </Button>
                    <FieldDescription className="px-6 text-center">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/register"
                        className="text-[#F66435] hover:underline"
                      >
                        Sign up
                      </Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <FieldDescription className="p-2 text-center">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </Suspense>
  );
}
