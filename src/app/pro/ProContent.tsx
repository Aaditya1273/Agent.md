"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Check, Zap, Lock, FileText, Download, Star, ArrowRight, Sparkles } from "lucide-react";

const FREE_FEATURES = [
  "Access to all design-md presets",
  "GitHub-style markdown preview",
  "Copy raw markdown",
  "Mermaid diagram rendering",
  "Frontmatter table viewer",
  "All AI model directories",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Power-prompts collection (50+ premium packs)",
  "Download full .md packs",
  "Priority model updates",
  "Private preset collections",
  "API access for CI/CD pipelines",
  "Early access to new models",
  "Community Discord access",
];

const PLANS = [
  { id: "monthly", label: "Monthly", price: 9, period: "/month", save: null, total: null },
  { id: "annual",  label: "Annual",  price: 7, period: "/month", save: "Save 22%", total: "billed $84/yr" },
];

export function ProContent({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const plan = PLANS.find((p) => p.id === billing)!;

  return (
    <>
      {/* Hero */}
      <section className="max-w-screen-xl mx-auto px-6 pt-20 pb-12 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "color-mix(in oklab, var(--primary) 12%, var(--background))", color: "var(--primary)" }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Pro membership
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: "var(--foreground)" }}>
          The best AI prompts.<br />
          <span style={{ color: "var(--primary)" }}>Unlocked.</span>
        </h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: "var(--muted-foreground)" }}>
          Get access to every power-prompt pack, download full engineering standards, and stay ahead with priority updates.
        </p>
      </section>

      {/* Billing toggle */}
      <div className="flex justify-center mb-10">
        <div
          className="flex items-center p-1 rounded-xl"
          style={{ background: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setBilling(p.id as "monthly" | "annual")}
              className="relative flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all"
              style={
                billing === p.id
                  ? { background: "var(--foreground)", color: "var(--background)" }
                  : { background: "transparent", color: "var(--muted-foreground)" }
              }
            >
              {p.label}
              {p.save && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    billing === p.id
                      ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                      : { background: "color-mix(in oklab, var(--primary) 12%, var(--background))", color: "var(--primary)" }
                  }
                >
                  {p.save}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plans grid */}
      <section className="max-w-screen-lg mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">

          {/* Free card */}
          <div
            className="rounded-2xl p-7 flex flex-col"
            style={{ background: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Free</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold" style={{ color: "var(--foreground)" }}>$0</span>
                <span className="text-sm mb-1" style={{ color: "var(--muted-foreground)" }}>/month</span>
              </div>
              <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
                Everything you need to get started with AI-driven design systems.
              </p>
            </div>
            <ul className="space-y-3 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--foreground)" }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: "#f0ede9", color: "var(--foreground)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              Browse free presets <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pro card */}
          <div
            className="rounded-2xl p-7 flex flex-col relative overflow-hidden"
            style={{ background: "var(--foreground)", color: "var(--background)", boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.12)" }}
          >
            {/* Subtle dot texture */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
            />
            <div className="relative mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Pro</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                  Most popular
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-sm mb-1 opacity-60">{plan.period}</span>
              </div>
              {plan.total && <p className="text-xs mt-1 opacity-50">{plan.total}</p>}
              <p className="text-sm mt-2 opacity-70">Full access to every premium pack, download rights, and API access.</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8 relative">
              {PRO_FEATURES.map((f, i) => (
                <li key={f} className={`flex items-start gap-2.5 text-sm ${i === 0 ? "opacity-50" : "opacity-90"}`}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: i === 0 ? "inherit" : "var(--primary)" }} />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA — sign in first if not authed, otherwise go to checkout */}
            {isAuthenticated ? (
              <button
                className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Zap className="w-4 h-4" />
                Get Pro — ${plan.price}/mo
              </button>
            ) : (
              <button
                onClick={() => signIn("google", { callbackUrl: "/pro" })}
                className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Zap className="w-4 h-4" />
                Sign in to get Pro
              </button>
            )}
            <p className="text-center text-xs mt-3 opacity-40">Cancel anytime · No lock-in</p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {[
            { icon: Lock,     title: "Secure payments", body: "Powered by Stripe. Your card is never stored." },
            { icon: Download, title: "Instant access",  body: "Download any pack the moment you subscribe." },
            { icon: Star,     title: "Cancel anytime",  body: "No contracts. Cancel with one click, no questions." },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl p-5"
              style={{ background: "var(--card)", boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)" }}
            >
              <Icon className="w-4 h-4 mb-3" style={{ color: "var(--primary)" }} />
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
