import Link from "next/link";

interface AppNavProps {
  /** Breadcrumb links shown in the center. Pass empty array to show nothing. */
  links?: { label: string; href: string; active?: boolean }[];
}

export default async function AppNav({ links = [] }: AppNavProps) {
  // Fetch GitHub star count server-side
  let starCount: number | null = null;
  try {
    const res = await fetch("https://api.github.com/repos/Aaditya1273/Agent.md", {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
    });
    if (res.ok) {
      const json = await res.json();
      starCount = json.stargazers_count ?? null;
    }
  } catch {}

  const formatted =
    starCount === null
      ? null
      : starCount >= 1000
      ? `${(starCount / 1000).toFixed(1)}k`
      : String(starCount);

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "var(--card)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div
            className="size-6 rounded-md flex items-center justify-center"
            style={{ background: "var(--foreground)" }}
          >
            <div className="size-2 rotate-45" style={{ background: "var(--background)" }} />
          </div>
          <span
            className="font-mono font-semibold tracking-tighter text-[15px]"
            style={{ color: "var(--foreground)" }}
          >
            AGENT.MD
          </span>
        </Link>

        {/* Center nav links */}
        {links.length > 0 && (
          <div className="hidden md:flex items-center gap-6 text-sm">
            {links.map(({ label, href, active }) =>
              active ? (
                <span key={label} className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  {label}
                </span>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {label}
                </Link>
              )
            )}
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Sign in */}
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={{ color: "var(--muted-foreground)", background: "transparent" }}
          >
            Sign in
          </button>

          {/* GitHub Star — split pill */}
          <a
            href="https://github.com/Aaditya1273/Agent.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0 rounded-lg overflow-hidden text-xs font-medium transition-all hover:opacity-85"
            style={{ border: "1px solid rgba(0,0,0,0.14)" }}
          >
            <span
              className="flex items-center gap-1.5 px-2.5 py-1.5"
              style={{
                background: "#f6f4f0",
                color: "var(--foreground)",
                borderRight: formatted ? "1px solid rgba(0,0,0,0.1)" : "none",
              }}
            >
              {/* GitHub outlined star path */}
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.096L6.715 4.956a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.346Z" />
              </svg>
              Star
            </span>
            {formatted && (
              <span
                className="px-2.5 py-1.5 font-mono"
                style={{ background: "#f0ede9", color: "var(--foreground)" }}
              >
                {formatted}
              </span>
            )}
          </a>

          {/* Get Pro */}
          <Link
            href="/pro"
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            Get Pro
          </Link>
        </div>
      </div>
    </nav>
  );
}
