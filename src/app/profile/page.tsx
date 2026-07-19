import { auth } from "../../auth";
import { redirect } from "next/navigation";
import AppNav from "../components/AppNav";
import { prisma } from "../../lib/prisma";
import { User, Mail, Calendar, Shield, Download, BookMarked, Star, Edit2 } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  // Redirect unauthenticated users back to home
  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch user from DB for full profile data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
      _count: {
        select: {
          downloads: true,
          savedPresets: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) redirect("/");

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isPro = user.subscription?.tier === "pro" && user.subscription?.status === "active";

  const stats = [
    { label: "Downloads", value: user._count.downloads, icon: Download },
    { label: "Saved", value: user._count.savedPresets, icon: BookMarked },
    { label: "Reviews", value: user._count.reviews, icon: Star },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <AppNav links={[{ label: "Profile", href: "/profile", active: true }]} />

      <main className="max-w-3xl mx-auto px-6 pt-24 pb-24">

        {/* ── Header ── */}
        <div className="mb-8">
          <span className="font-mono text-xs text-primary uppercase tracking-[0.24em]">§ Account</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Profile</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Manage your account details and preferences.
          </p>
        </div>

        {/* ── Avatar + identity card ── */}
        <div
          className="rounded-2xl p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-5"
          style={{ background: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          {/* Avatar */}
          <div className="shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Avatar"}
                className="w-20 h-20 rounded-full object-cover"
                style={{ boxShadow: "0 0 0 3px var(--background), 0 0 0 5px rgba(0,0,0,0.08)" }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold uppercase"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h2 className="text-xl font-bold tracking-tight truncate">
                {user.displayName ?? user.name ?? "Anonymous"}
              </h2>
              {isPro ? (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                  Pro
                </span>
              ) : (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: "color-mix(in oklab, var(--primary) 12%, var(--background))", color: "var(--primary)" }}
                >
                  Free
                </span>
              )}
              {user.role !== "USER" && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                  style={{ background: "color-mix(in oklab, oklch(0.72 0.15 160) 12%, var(--background))", color: "oklch(0.45 0.15 155)" }}
                >
                  <Shield className="w-3 h-3" />
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              {user.email && (
                <p className="text-sm flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {user.email}
                </p>
              )}
              <p className="text-sm flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                Joined {joinedDate}
              </p>
              {user.bio && (
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl p-5 flex flex-col items-center text-center"
              style={{ background: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" }}
            >
              <Icon className="w-4 h-4 mb-2" style={{ color: "var(--primary)" }} />
              <span className="text-2xl font-bold tracking-tight">{value}</span>
              <span className="text-xs mt-0.5 font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Account details ── */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{ background: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#f8f6f3" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Account Details
            </h3>
          </div>

          {[
            { label: "Display name", value: user.displayName ?? user.name ?? "—" },
            { label: "Email", value: user.email ?? "—" },
            { label: "Username", value: user.username ? `@${user.username}` : user.email ? `@${user.email.split("@")[0]}` : "—" },
            { label: "Auth provider", value: user.googleId ? "Google" : "Email / Password" },
            { label: "Account status", value: (user.emailVerified || user.googleId) ? "Verified" : "Unverified" },
            { label: "Member since", value: joinedDate },
          ].map(({ label, value }, idx, arr) => (
            <div
              key={label}
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                borderBottom: idx !== arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                background: idx % 2 === 0 ? "#ffffff" : "#fafaf8",
              }}
            >
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                {label}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Subscription card ── */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{ background: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#f8f6f3" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Subscription
            </h3>
          </div>

          <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold mb-0.5">
                {isPro ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {isPro
                  ? `Renews ${user.subscription?.stripeCurrentPeriodEnd
                      ? new Date(user.subscription.stripeCurrentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "—"}`
                  : "Upgrade to unlock power-prompts and download packs."}
              </p>
            </div>
            {!isPro && (
              <a
                href="/pro"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                Upgrade to Pro →
              </a>
            )}
          </div>
        </div>

        {/* ── Danger zone ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#f8f6f3" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
              Danger Zone
            </h3>
          </div>
          <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold mb-0.5">Delete account</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              disabled
              className="shrink-0 px-4 py-2 text-xs font-semibold rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: "#dc2626", borderColor: "#fecaca", background: "#fff5f5" }}
            >
              Delete account
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
