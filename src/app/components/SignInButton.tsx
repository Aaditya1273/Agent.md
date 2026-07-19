"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hover:bg-muted border border-border"
      style={{ color: "var(--foreground)", background: "transparent" }}
    >
      Sign in
    </button>
  );
}
