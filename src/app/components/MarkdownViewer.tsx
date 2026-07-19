"use client";

import { useState, useEffect } from "react";
import { Copy, Check, FileCode2, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

// ─── Mermaid ──────────────────────────────────────────────────────────────────
function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("mermaid").then((m) => {
      const mermaid = m.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 14,
      });
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      mermaid.render(id, chart)
        .then(({ svg }) => { if (!cancelled) setSvg(svg); })
        .catch((e) => { if (!cancelled) setError(String(e?.message || e)); });
    });
    return () => { cancelled = true; };
  }, [chart]);

  if (error) return (
    <div className="my-4 p-4 rounded-xl text-sm font-mono" style={{ background: "#fff4e8", color: "var(--primary)", border: "1px solid rgba(0,0,0,0.06)" }}>
      <strong>Mermaid error:</strong> {error}
    </div>
  );
  if (!svg) return (
    <div className="my-4 py-6 text-center text-sm rounded-xl animate-pulse"
      style={{ background: "#f7f5f2", color: "var(--muted-foreground)" }}>
      Rendering diagram…
    </div>
  );
  return (
    <div className="my-4 overflow-x-auto flex justify-center p-6 rounded-xl"
      style={{ background: "#f7f5f2", border: "1px solid rgba(0,0,0,0.05)" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ─── Frontmatter ─────────────────────────────────────────────────────────────
function FrontmatterValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-mono"
            style={{ background: "#fff0e6", color: "var(--primary)", border: "1px solid #ffd4a8" }}>
            {String(item)}
          </span>
        ))}
      </div>
    );
  }
  if (typeof value === "object" && value !== null) {
    return <FrontmatterNested data={value as Record<string, unknown>} />;
  }
  if (typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return (
      <span className="flex items-center gap-2.5 font-mono text-sm" style={{ color: "var(--foreground)" }}>
        <span className="w-4 h-4 rounded-md shrink-0"
          style={{ backgroundColor: value, boxShadow: "0 0 0 1px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,0.15)" }} />
        {value}
      </span>
    );
  }
  return <span className="text-sm" style={{ color: "var(--foreground)" }}>{String(value)}</span>;
}

function FrontmatterNested({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-start gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide shrink-0 pt-0.5"
            style={{ color: "var(--muted-foreground)", minWidth: 100 }}>{key}</span>
          <FrontmatterValue value={value} />
        </div>
      ))}
    </div>
  );
}

function FrontmatterTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;
  return (
    <div className="rounded-xl overflow-hidden mb-8" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
      {entries.map(([key, value], idx) => (
        <div key={key}
          className="flex gap-0 items-stretch"
          style={{
            background: idx % 2 === 0 ? "#ffffff" : "#fafaf8",
            borderBottom: idx !== entries.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
          }}>
          <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider shrink-0 flex items-start pt-3.5"
            style={{ width: 160, color: "var(--muted-foreground)", background: "#f8f6f3" }}>
            {key}
          </div>
          <div className="px-5 py-3 flex-1 min-w-0 flex items-start">
            <FrontmatterValue value={value} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Markdown components ──────────────────────────────────────────────────────
const mdComponents: Components = {
  code({ className, children, ...props }) {
    const lang = /language-(\w+)/.exec(className || "")?.[1] ?? "";
    const isBlock = !!className?.startsWith("language-");
    const code = String(children).replace(/\n$/, "");

    if (lang === "mermaid") return <MermaidDiagram chart={code} />;

    if (isBlock || lang) {
      return (
        <div className="relative group my-5">
          {lang && (
            <span className="absolute top-3 right-3 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: "var(--muted-foreground)" }}>
              {lang}
            </span>
          )}
          <pre className="rounded-xl overflow-x-auto px-5 py-4 text-sm leading-relaxed m-0"
            style={{ background: "#f7f5f2", border: "1px solid rgba(0,0,0,0.06)" }}>
            <code className={className}
              style={{ fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace", fontSize: "0.83em", color: "var(--foreground)" }}
              {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }

    return (
      <code className="px-1.5 py-0.5 rounded-md text-[0.875em] font-mono"
        style={{ background: "#fff0e6", color: "var(--primary)" }}
        {...props}>
        {children}
      </code>
    );
  },

  h1: ({ children, id }) => (
    <h1 id={id} className="group flex items-center gap-2 text-2xl font-bold mt-8 mb-4 first:mt-0 pb-3"
      style={{ color: "var(--foreground)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
      {id && <a href={`#${id}`} className="opacity-0 group-hover:opacity-60 transition-opacity text-sm" style={{ color: "var(--primary)" }}>#</a>}
      {children}
    </h1>
  ),
  h2: ({ children, id }) => (
    <h2 id={id} className="group flex items-center gap-2 text-xl font-semibold mt-7 mb-3 pb-2"
      style={{ color: "var(--foreground)", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
      {id && <a href={`#${id}`} className="opacity-0 group-hover:opacity-60 transition-opacity text-sm" style={{ color: "var(--primary)" }}>#</a>}
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className="group flex items-center gap-2 text-lg font-semibold mt-6 mb-3" style={{ color: "var(--foreground)" }}>
      {id && <a href={`#${id}`} className="opacity-0 group-hover:opacity-60 transition-opacity text-sm" style={{ color: "var(--primary)" }}>#</a>}
      {children}
    </h3>
  ),
  h4: ({ children, id }) => <h4 id={id} className="text-base font-semibold mt-5 mb-2" style={{ color: "var(--foreground)" }}>{children}</h4>,
  h5: ({ children, id }) => <h5 id={id} className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--foreground)" }}>{children}</h5>,
  h6: ({ children, id }) => <h6 id={id} className="text-sm font-semibold mt-4 mb-2" style={{ color: "var(--muted-foreground)" }}>{children}</h6>,

  p: ({ children }) => <p className="text-sm leading-7 my-3" style={{ color: "var(--foreground)" }}>{children}</p>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2" style={{ color: "var(--primary)" }}>
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 my-3 space-y-1 text-sm" style={{ color: "var(--foreground)" }}>{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 my-3 space-y-1 text-sm" style={{ color: "var(--foreground)" }}>{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,

  blockquote: ({ children }) => (
    <blockquote className="pl-4 my-5 [&>p]:my-1 rounded-r-lg py-2"
      style={{ borderLeft: "3px solid var(--primary)", color: "var(--muted-foreground)", background: "#fff8f2" }}>
      {children}
    </blockquote>
  ),

  table: ({ children }) => (
    <div className="overflow-x-auto my-5 rounded-xl" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: "#f8f6f3" }}>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>{children}</tr>,
  th: ({ children, style }) => (
    <th style={{ ...style, padding: "8px 14px", textAlign: "left", fontWeight: 600, color: "var(--foreground)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={{ ...style, padding: "8px 14px", color: "var(--foreground)" }}>
      {children}
    </td>
  ),

  hr: () => <hr className="my-8" style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)" }} />,
  img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full rounded-xl my-5 shadow-sm" />,
  strong: ({ children }) => <strong className="font-semibold" style={{ color: "var(--foreground)" }}>{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del style={{ color: "var(--muted-foreground)" }}>{children}</del>,
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MarkdownViewer({
  rawMarkdown, content, frontmatter, isPremium,
}: {
  rawMarkdown: string; content: string; frontmatter: any; isPremium: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  const lineCount = rawMarkdown.split("\n").length;
  const sizeKb = (new TextEncoder().encode(rawMarkdown).length / 1024).toFixed(1);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)" }}>

      {/* Toolbar — very light warm off-white */}
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: "#f8f6f3", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        {/* Tabs */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(0,0,0,0.05)" }}>
          {(["preview", "code"] as const).map((tab) => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all duration-150"
              style={activeTab === tab
                ? { background: "#ffffff", color: "var(--foreground)", boxShadow: "0 1px 3px rgba(0,0,0,0.09)" }
                : { background: "transparent", color: "var(--muted-foreground)" }}>
              {tab === "preview" ? <Eye className="w-3 h-3" /> : <FileCode2 className="w-3 h-3" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {activeTab === "code" && (
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {lineCount.toLocaleString()} lines · {sizeKb} KB
            </span>
          )}
          <button
            onClick={handleCopy}
            disabled={isPremium}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#ffffff", color: "var(--foreground)", boxShadow: "0 1px 2px rgba(0,0,0,0.07)" }}>
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : "Copy raw"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ overflowY: "auto", maxHeight: isPremium ? undefined : "calc(100vh - 220px)", background: "#ffffff" }}>
        {activeTab === "preview" ? (
          <div className="px-8 py-7">
            {frontmatter && Object.keys(frontmatter).length > 0 && (
              <FrontmatterTable data={frontmatter} />
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: true }]]}
              components={mdComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          /* Code tab — light line numbers */
          <table className="w-full text-xs border-collapse" style={{ fontFamily: "'JetBrains Mono', monospace", background: "#ffffff" }}>
            <tbody>
              {rawMarkdown.split("\n").map((line, i) => (
                <tr key={i} className="group hover:bg-orange-50/50 transition-colors">
                  <td className="select-none text-right px-4 py-0 whitespace-nowrap align-top leading-6"
                    style={{ color: "rgba(0,0,0,0.3)", borderRight: "1px solid rgba(0,0,0,0.06)", userSelect: "none", minWidth: 44 }}>
                    {i + 1}
                  </td>
                  <td className="pl-4 pr-6 py-0 whitespace-pre-wrap break-all align-top leading-6"
                    style={{ color: "var(--foreground)" }}>
                    {line || "\u00A0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
