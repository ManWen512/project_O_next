"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";


// Custom hook for password validation
const usePasswordValidation = () => {
  const [validation, setValidation] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = useCallback((password: string) => {
    setValidation({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    });
  }, []);

  return { validation, validatePassword };
};

// Signup Form Schema
const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });



type SignupFormValues = z.infer<typeof signupSchema>;


// Validation Item Component
const ValidationItem = ({
  isValid,
  text,
}: {
  isValid: boolean;
  text: string;
}) => (
  <div className="flex items-center gap-2 text-sm ">
    {isValid ? (
      <Check className="h-4 w-4 text-[#F66435]" />
    ) : (
      <div className="h-4 w-4 rounded-full bg-[#F66435]" />
    )}
    <span className={isValid ? "text-[#F66435]" : "text-gray-500"}>{text}</span>
  </div>
);

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);

  const { validation, validatePassword } = usePasswordValidation();

  // Signup Form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = signupForm.watch("password");

  // Update validation when password changes
  useEffect(() => {
    validatePassword(passwordValue);
  }, [passwordValue, validatePassword]);

  useEffect(() => {
    if (signupForm.formState.errors.root) {
      toast.error(signupForm.formState.errors.root.message);
    }
  }, [signupForm.formState.errors.root]);



  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      // Step 1: Register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Signup failed");
        return;
      }


      toast.success("Signup successful! Please verify your email.",{ duration: Infinity});
    } catch (err) {
      toast.error("Something went wrong during signup.");
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4">
      <div className="text-2xl font-bold fixed left-2 top-2 font-quicksand text-white z-50">
        Project <img src="/logo.PNG" alt="Logo" className="inline h-12 w-12 -ml-3 mb-1" />
      </div>
      <div className="w-full max-w-md sm:mt-2 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Register</CardTitle>
            <CardDescription>Create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={signupForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <Input
                        {...field}
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        aria-invalid={fieldState.invalid}
                      />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="email"
                  control={signupForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldDescription>
                        We will not share your email with anyone else.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={signupForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          aria-invalid={fieldState.invalid}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <Eye className="h-4 w-4 text-[#F66435]" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-[#F66435]" />
                          )}
                        </button>
                      </div>

                      {/* Password Validation Checklist */}
                      <div
                        className={`transition-all duration-300 ease-in-out transform ${
                          isPasswordFocused || passwordValue
                            ? "mt-1 p-3 opacity-100 translate-y-0 max-h-48"
                            : "opacity-0 -translate-y-2 max-h-0 overflow-hidden"
                        }  bg-gray-50 rounded-md space-y-2`}
                      >
                        <ValidationItem
                          isValid={validation.hasMinLength}
                          text="At least 8 characters long"
                        />
                        <ValidationItem
                          isValid={validation.hasUpperCase}
                          text="One uppercase letter (A-Z)"
                        />
                        <ValidationItem
                          isValid={validation.hasLowerCase}
                          text="One lowercase letter (a-z)"
                        />
                        <ValidationItem
                          isValid={validation.hasNumber}
                          text="One number (0-9)"
                        />
                        <ValidationItem
                          isValid={validation.hasSpecialChar}
                          text="One special character (!@#$% etc.)"
                        />
                      </div>
                      <FieldDescription>
                        Must be at least 8 characters long. Must include at
                        least one uppercase letter, lowercase letter, number,
                        and special character.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={signupForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          aria-invalid={fieldState.invalid}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <Eye className="h-4 w-4 text-[#F66435]" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-[#F66435]" />
                          )}
                        </button>
                      </div>
                      <FieldDescription>
                        Please confirm your password.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <FieldGroup>
                  <Field>
                    <Button
                      type="submit"
                      disabled={signupForm.formState.isSubmitting}
                      className="bg-[#F66435] hover:bg-[#b84c27]"
                    >
                      {signupForm.formState.isSubmitting ? (
                        <>
                          <Spinner />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        "Sign Up"
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
                      <rect x="26" y="26" width="20" height="20" fill="#000" />
                    </svg>
                    Continue with Microsoft
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#F66435]">
                      Sign in
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
  );
}
