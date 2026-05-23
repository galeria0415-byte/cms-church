"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "At least 8 characters."),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match.", path: ["confirm"] });

type SetupInput = z.infer<typeof schema>;

export default function SetupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SetupInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Setup failed.");
      return;
    }
    router.push("/login?setup=1");
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <Card className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">First-time setup</p>
        <h1 className="mt-2 font-serif text-2xl text-[var(--ink)]">Create your admin account</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">This page only works while no users exist. Once completed, this form is disabled.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Your name</label>
            <Input placeholder="e.g. Pastor John" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Email address</label>
            <Input type="email" placeholder="admin@yourchurch.org" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Password</label>
            <Input type="password" placeholder="Min. 8 characters" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Confirm password</label>
            <Input type="password" {...register("confirm")} />
            {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>}
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create admin account"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
