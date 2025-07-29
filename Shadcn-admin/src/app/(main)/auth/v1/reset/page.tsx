"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import apiClient from "@/lib/api-client";

const FormSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    password_confirm: z.string().min(6, { message: "Confirm Password must be at least 6 characters." }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match.",
    path: ["password_confirm"],
  });

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      password_confirm: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const uid = urlParams.get("uid");

      if (!token || !uid) throw new Error("Invalid or missing token or uid");

      await new Promise((res) => setTimeout(res, 1500)); // Simulated delay

      await apiClient.post("/api/admins/password/reset/done/", {
        uid,
        token,
        password: data.password,
        password_confirm: data.password_confirm,
      });

      toast.success("Password reset successful. You can now log in.");
      window.location.href = "/auth/v1/login";
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh">
      <div className="bg-background flex w-full items-center justify-center p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
          <div className="space-y-4 text-center">
            <div className="text-3xl font-medium tracking-tight">Reset Password to continue</div>
            <div className="text-muted-foreground mx-auto max-w-xl">
              Fill in your new password below.
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute top-2/4 right-3 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password_confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="password_confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute top-2/4 right-3 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <div className="flex items-center justify-center gap-2">
      <div className="h-4 w-4 rounded-full border-2 border-t-2 border-muted-foreground border-t-transparent animate-spin" />
      Resetting...
    </div>
  ) : (
    "Reset"
  )}
</Button>

            </form>
          </Form>

          <p className="text-muted-foreground text-sm text-center">
            Already have an account?{" "}
            <Link href="/auth/v1/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      <div className="bg-primary hidden lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <img
              src="/reset.jpg"
              alt="Reset Illustration"
              className="mx-auto h-32 w-32 rounded-full border-4 border-white object-contain shadow-md"
            />
            <div className="flex flex-col items-center space-y-2">
              <h1 className="text-primary-foreground text-4xl font-light">DevHub Admin</h1>
              <p className="text-primary-foreground/80 text-xl">Build for developers, by developers…</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
