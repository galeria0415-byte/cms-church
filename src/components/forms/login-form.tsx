"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSetUp = searchParams.get("setup") === "1";
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const response = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: "/admin",
    });

    if (response?.error) {
      setError("Incorrect email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-white/70" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className="h-9 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#c9a455] focus:ring-1 focus:ring-[#c9a455]/40"
          placeholder="your@email.com"
        />
        {errors.email ? <p className="mt-1 text-xs text-red-400">{errors.email.message}</p> : null}
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-white/70" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          className="h-9 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-[#c9a455] focus:ring-1 focus:ring-[#c9a455]/40"
          placeholder="••••••••"
        />
        {errors.password ? <p className="mt-1 text-xs text-red-400">{errors.password.message}</p> : null}
      </div>
      {error ? <p className="rounded-lg bg-red-900/40 px-3 py-2 text-sm text-red-300">{error}</p> : null}
      {justSetUp ? <p className="rounded-lg bg-green-900/30 px-3 py-2 text-sm text-green-400">Account created. Sign in to continue.</p> : null}
      <Button type="submit" className="w-full bg-[#c9a455] text-[#111827] hover:bg-[#a07830]" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}