"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/admin",
      });

      if (!response?.ok || response?.error) {
        setError("Incorrect email or password. Please try again.");
        return;
      }

      // Use a hard navigation so the browser sends the fresh session cookie
      // in a new full-page request — more reliable behind reverse proxies.
      window.location.href = response.url ?? "/admin";
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--ink)]" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? <p className="mt-2 text-sm text-[#a53f2b]">{errors.email.message}</p> : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--ink)]" htmlFor="password">
          Password
        </label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? <p className="mt-2 text-sm text-[#a53f2b]">{errors.password.message}</p> : null}
      </div>
      {error ? <p className="rounded-2xl bg-[#fff1ec] px-4 py-3 text-sm text-[#a53f2b]">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}