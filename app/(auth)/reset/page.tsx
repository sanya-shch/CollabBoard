"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import * as z from "zod";
import { ResetSchema } from "@/schemas";

export default function ResetPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      setMessage(data.success ?? data.error);
    });
  };

  return (
    <div className="mx-auto max-w-sm space-y-4 py-10">
      <h1 className="text-xl font-semibold">Password reset</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <input
          {...form.register("email")}
          placeholder="Email"
          type="email"
          disabled={isPending}
          className="w-full rounded border p-2"
        />

        {message && <p className="text-sm">{message}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-black p-2 text-white"
        >
          Send a letter
        </button>
      </form>

      <p className="text-sm text-center text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-black hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
