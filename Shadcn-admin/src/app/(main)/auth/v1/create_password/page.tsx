//v1/create_password
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import apiClient from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Use correct names matching API!
const FormSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirm_password: z.string().min(6, { message: "Confirm Password must be at least 6 characters." }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const uid = urlParams.get("uid");

      if (!token || !uid) throw new Error("Invalid or missing token or uid");

      await apiClient.post("/api/admins/password/set/", {
        uid,
        token,
        password: data.password,
        confirm_password: data.confirm_password,
      });

      toast.success("Password reset successful. You can now log in.", { duration: 5000 });
      window.location.href = "/auth/v1/login";
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Something went wrong", {
        duration: 5000,
      });
    }
  };

  return (
    <div className="flex h-dvh">
      {/* Form Section */}
      <div className="bg-background flex w-full items-center justify-center p-8 lg:w-2/3">
        <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
          <div className="space-y-4 text-center">
            <div className="text-3xl font-medium tracking-tight">Create a password to continue</div>
            <div className="text-muted-foreground mx-auto max-w-xl">
              Please make sure that it is at least 8 characters long with at least one uppercase letter, one lowercase
              letter, and one number.
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
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
                        className="text-muted-foreground absolute top-2/4 right-3 -translate-y-1/2 transform"
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
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="confirm_password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="text-muted-foreground absolute top-2/4 right-3 -translate-y-1/2 transform"
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
              <Button className="w-full" type="submit">
                Submit
              </Button>
            </form>
          </Form>

          <p className="text-muted-foreground text-s text-center">
            Already have an account?{" "}
            <Link href="login" className="text-primary cursor-pointer hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Illustration Section */}
      <div className="bg-primary hidden lg:block lg:w-1/3">
        <div className="flex h-full flex-col items-center justify-center p-12 text-center">
          <div className="space-y-6">
            <img
              src="/reset.jpg"
              alt="Welcome Illustration"
              className="mx-auto h-32 w-32 rounded-full border-4 border-white object-contain shadow-md"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <h1 className="text-primary-foreground text-center text-5xl font-light">DevHub Admin</h1>
              <p className="text-primary-foreground/80 text-center text-xl">Build for developers, by developers....</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
