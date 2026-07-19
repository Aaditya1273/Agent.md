import Link from "next/link";
import { getPresetData } from "../../../../../../lib/data";
import { Download, Bookmark, Terminal, ChevronRight, FileText, Star, GitFork, Lock } from "lucide-react";
import MarkdownViewer from "../../../../../../components/MarkdownViewer";
import AppNav from "../../../../../../components/AppNav";
import "highlight.js/styles/github.css";

export default async function PresetDetailPage({
  params,
}: {
  params: Promise<{ model: string; work: string; preset: string }>;
}) {
  const { model, work, preset } = await params;
  const data = getPresetData(model, work, preset);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans" style={{ background: "var(--background)" }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>Preset not found</h1>
        <Link href={`/models/${model}/work/${work}`} style={{ color: "var(--primary)" }} className="hover:underline">Go back</Link>
      </div>
    );
  }

  const displayRawMarkdown = data.isPremium
    ? data.rawMarkdown.split("\n").slice(0, 15).join("\n") + "\n\n..."
    : data.rawMarkdown;
  const displayContent = data.isPremium
    ? data.content.split("\n").slice(0, 10).join("\n") + "\n\n..."
    : data.content;
  const displayFrontmatter = data.isPremium ? null : data.frontmatter;

  const lineCount = data.rawMarkdown.split("\n").length;
  const sizeKb = (new TextEncoder().encode(data.rawMarkdown).length / 1024).toFixed(1);

  return (
    <div className="min-h-screen font-sans" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <AppNav links={[
        { label: "Models", href: "/" },
        { label: "Domain", href: `/models/${model}` },
        { label: "Styles", href: `/models/${model}/work/${work}` },
        { label: preset, href: `#`, active: true },
      ]} />

      {/* ── File header ── */}
      <div className="border-b" style={{ borderColor: "rgba(0,0,0,0.06)", background: "var(--card)" }}>
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs font-mono mb-5" style={{ color: "var(--muted-foreground)" }}>
            <Link href="/" className="hover:text-foreground transition-colors" style={{ color: "inherit" }}>agent.md</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <Link href={`/models/${model}`} className="hover:text-foreground transition-colors" style={{ color: "inherit" }}>{model}</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <Link href={`/models/${model}/work/${work}`} className="hover:text-foreground transition-colors" style={{ color: "inherit" }}>{work}</Link>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{preset}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>{data.name}</h1>
                {data.isPremium ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "color-mix(in oklab, oklch(0.78 0.18 60) 12%, var(--background))", color: "oklch(0.55 0.18 55)" }}>
                    Premium
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "color-mix(in oklab, oklch(0.72 0.15 160) 12%, var(--background))", color: "oklch(0.45 0.15 155)" }}>
                    Free
                  </span>
                )}
              </div>

              <p className="text-sm max-w-2xl mb-4" style={{ color: "var(--muted-foreground)" }}>
                Engineering standard and design system prompts for{" "}
                <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>{data.model}</strong>
                , tuned for{" "}
                <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>{data.work}</strong> environments.
              </p>

              <div className="flex items-center gap-5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {lineCount.toLocaleString()} lines</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="13" cy="8" r="1.5"/></svg>
                  {sizeKb} KB
                </span>
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> {data.model}</span>
                <span className="flex items-center gap-1.5"><GitFork className="w-3.5 h-3.5" /> {work}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-xl transition-colors"
                style={{ background: "#f0ede9", color: "var(--foreground)", border: "1px solid rgba(0,0,0,0.08)" }}>
                <Bookmark className="w-4 h-4" /> Star
              </button>
              {data.isPremium ? (
                <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                  <Lock className="w-4 h-4" /> Unlock Pro
                </button>
              ) : (
                <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                  <Download className="w-4 h-4" /> Download .md
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-screen-2xl mx-auto px-6 py-7">
        <div className="flex gap-6 relative">
          {/* Viewer */}
          <article className="flex-1 min-w-0 relative">
            <MarkdownViewer
              rawMarkdown={displayRawMarkdown}
              content={displayContent}
              frontmatter={displayFrontmatter}
              isPremium={data.isPremium}
            />

            {data.isPremium && (
              <div className="absolute bottom-0 left-0 right-0 h-[280px] flex flex-col items-center justify-end pb-8 pointer-events-none"
                style={{ background: "linear-gradient(to top, var(--background) 40%, transparent)" }}>
                <div className="pointer-events-auto rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
                  style={{ background: "var(--card)", boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                  <Lock className="w-6 h-6 mx-auto mb-3" style={{ color: "var(--primary)" }} />
                  <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--foreground)" }}>Premium System Prompt</h3>
                  <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
                    Upgrade to Pro to unlock the full engineering standard and download the complete <code className="text-xs px-1 py-0.5 rounded-md font-mono" style={{ background: "var(--muted)" }}>.md</code> pack.
                  </p>
                  <button className="w-full py-2.5 text-sm font-semibold rounded-xl transition-colors"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}>
                    Upgrade to Pro →
                  </button>
                </div>
              </div>
            )}
          </article>

          {/* Sticky sidebar */}
          <aside className="hidden xl:block w-[220px] shrink-0">
            <div className="sticky top-20 space-y-3">
              {/* Quick install */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#f8f6f3" }}>
                  <h3 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                    <Terminal className="w-3.5 h-3.5" /> Quick Install
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Initialize in your project:</p>
                  <div className="rounded-xl p-3 text-xs font-mono break-all select-all cursor-text"
                    style={{ background: "#f0ede9", color: "var(--foreground)" }}>
                    <span style={{ color: "var(--primary)", fontWeight: 600 }}>npx</span> agentmd init {preset}
                  </div>
                </div>
              </div>

              {/* Pack contents */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#f8f6f3" }}>
                  <h3 className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Pack Contents</h3>
                </div>
                <div className="px-4 py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-mono text-xs" style={{ color: "var(--foreground)" }}>
                    <FileText className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                    DESIGN.md
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{sizeKb}KB</span>
                </div>
              </div>

              {/* About */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#f8f6f3" }}>
                  <h3 className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>About</h3>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {[["Model", data.model], ["Domain", data.work], ["Access", data.isPremium ? "Pro" : "Free"]].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-xs mb-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

