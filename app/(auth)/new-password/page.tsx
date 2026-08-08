"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import * as z from "zod";
import { NewPasswordSchema } from "@/schemas";

export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    if (!token) {
      setMessage({ type: "error", text: "Missing token in link" });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, token }),
      });
      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
        return;
      }

      setMessage({ type: "success", text: data.success });
      setTimeout(() => router.push("/login"), 1500);
    });
  };

  return (
    <div className="mx-auto max-w-sm space-y-4 py-10">
      <h1 className="text-xl font-semibold">New password</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <input
          {...form.register("password")}
          placeholder="New password"
          type="password"
          disabled={isPending}
          className="w-full rounded border p-2"
        />

        {message && (
          <p className={message.type === "error" ? "text-red-600" : "text-green-600"}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-black p-2 text-white"
        >
          Save password
        </button>
      </form>
    </div>
  );
}
