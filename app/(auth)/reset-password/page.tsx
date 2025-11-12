// app/reset-password/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const formSubmitted = useRef(false);
  const { validation, validatePassword } = usePasswordValidation();

  // Reset Password Form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const passwordValue = resetPasswordForm.watch("newPassword");

  // Update validation when password changes
  useEffect(() => {
    validatePassword(passwordValue);
  }, [passwordValue, validatePassword]);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    }
  }, [token, router]);

  const handleSubmit = async (data: ResetPasswordFormValues) => {


    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.newPassword }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Password reset successfully!");
        setTimeout(() => {
          router.push("/login?reset=true");
        }, 2000);
      } else {
        toast.error(result.error || "Failed to reset password");
        formSubmitted.current = false;
      }
    } catch (error) {
      toast.error("Something went wrong");
      formSubmitted.current = false;
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md sm:mt-2 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Set New Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={resetPasswordForm.handleSubmit(handleSubmit)} className="space-y-6">
              <Controller
                name="newPassword"
                control={resetPasswordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="newPassword"
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
                      Must be at least 8 characters long. Must include at least
                      one uppercase letter, lowercase letter, number, and
                      special character.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmNewPassword"
                control={resetPasswordForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmNewPassword">
                      Confirm New Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="confirmNewPassword"
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
                      Please confirm your new password.
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
                    disabled={resetPasswordForm.formState.isSubmitting}
                    className="bg-[#F66435] hover:bg-[#b84c27]"
                  >
                    {resetPasswordForm.formState.isSubmitting ? (
                      <>
                        <Spinner />
                        <span>Resetting Password...</span>
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
