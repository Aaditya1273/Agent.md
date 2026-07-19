import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScrollReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

// ————————————————————————————————————————————————————————————————
// Data
// ————————————————————————————————————————————————————————————————

const MODELS = [
  { id: "claude", name: "Claude 3.5", file: "CLAUDE.md" },
  { id: "deepseek", name: "DeepSeek R1", file: "DEEPSEEK.md" },
  { id: "gemini", name: "Gemini 2.5", file: "GEMINI.md" },
  { id: "gpt", name: "GPT-5", file: "GPT.md" },
  { id: "grok", name: "Grok 3", file: "GROK.md" },
  { id: "qwen", name: "Qwen 3", file: "QWEN.md" },
] as const;

const WORKS = [
  { id: "ui", name: "UI" },
  { id: "landing", name: "Landing Page" },
  { id: "saas", name: "SaaS" },
  { id: "dashboard", name: "Dashboard" },
  { id: "blockchain", name: "Blockchain" },
  { id: "opensource", name: "Open Source" },
  { id: "agent", name: "AI Agent" },
] as const;

const STYLES = [
  { id: "apple", name: "Apple", note: "Precision, breath, glass" },
  { id: "linear", name: "Linear", note: "Grid, tight, dark" },
  { id: "stripe", name: "Stripe", note: "Editorial, gradient" },
  { id: "notion", name: "Notion", note: "Neutral, calm, typographic" },
  { id: "vercel", name: "Vercel", note: "Mono, geometric, sharp" },
] as const;

const CATEGORIES = [
  { code: "UI", title: "Interface Design", desc: "Premium component standards, design systems, motion specs." },
  { code: "AI", title: "Agent Architecture", desc: "RAG pipelines, MCP workflows, recursive logic guards." },
  { code: "SA", title: "SaaS Backend", desc: "Auth, multi-tenancy, secure database architecture." },
  { code: "W3", title: "Web3 & Crypto", desc: "Smart contract auditing and secure dApp patterns." },
  { code: "OS", title: "Open Source", desc: "Modernizing legacy codebases with license integrity." },
  { code: "MB", title: "Mobile", desc: "Cross-platform application standards and native feel." },
  { code: "PF", title: "Performance", desc: "Optimization budgets, edge caching, scalability rules." },
  { code: "SC", title: "Security", desc: "Secure-by-default engineering practices and audits." },
];

const ROADMAP = [
  { phase: "Phase 01", when: "Q1 2026", title: "Curated Core Library", body: "Initial release of 50 base presets across UI, SaaS, and AI verticals for the top 6 models." },
  { phase: "Phase 02", when: "Q2 2026", title: "Search, Versioning, Categories", body: "Semantic search across the registry with pinned versions and diffable changelogs." },
  { phase: "Phase 03", when: "Q3 2026", title: "AI Recommendation Assistant", body: "Guided preset selection tuned to your stack, model, and target workflow." },
  { phase: "Phase 04", when: "Q4 2026", title: "GitHub Stack Detection", body: "Point at any repository — get preset recommendations based on detected stack." },
  { phase: "Phase 05", when: "2027", title: "Community Marketplace", body: "Verified maintainers publish, rate, and version their own engineering standards." },
];

// ————————————————————————————————————————————————————————————————
// Page
// ————————————————————————————————————————————————————————————————

function LandingPage() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      <Hero />
      <Marquee />
      <SelectorSection />
      <PackAnatomy />
      <Categories />
      <Roadmap />
      <CTA />
      <Footer />
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Nav
// ————————————————————————————————————————————————————————————————

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <div className="size-6 bg-foreground rounded-sm flex items-center justify-center">
            <div className="size-2 bg-background rotate-45" />
          </div>
          <span className="font-mono font-medium tracking-tighter text-[15px]">AGENT.MD</span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#build" className="text-muted-foreground hover:text-foreground transition-colors">Build</a>
          <a href="#anatomy" className="text-muted-foreground hover:text-foreground transition-colors">Pack</a>
          <a href="#categories" className="text-muted-foreground hover:text-foreground transition-colors">Registry</a>
          <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
        </div>
        <button className="px-3.5 py-1.5 bg-foreground text-background text-sm font-medium rounded-[5px] hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </div>
    </nav>
  );
}

// ————————————————————————————————————————————————————————————————
// Hero
// ————————————————————————————————————————————————————————————————

function Hero() {
  return (
    <section id="top" className="relative max-w-7xl mx-auto px-6 pt-28 pb-24 sm:pt-40 sm:pb-32">
      {/* faint blueprint grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26,26,26,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,26,26,0.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center top, black 40%, transparent 75%)",
        }}
      />
      <div className="max-w-[880px] animate-reveal-lg">
        <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-[4px] border border-primary/25 bg-primary/5 text-primary font-mono text-[10px] uppercase tracking-[0.14em] mb-8">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          v1.0.4 · Open Beta
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-balance leading-[0.92] mb-8">
          The Open Registry for
          <br />
          <span className="text-muted-foreground">AI Engineering Presets.</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-[620px] leading-relaxed mb-10">
          Configure any AI coding model with production-ready engineering standards in seconds.
          No prompt engineering. No trial and error. Just tested presets.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#build"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-[6px] hover:opacity-90 transition-opacity"
          >
            Build a pack
            <span className="font-mono opacity-60">↓</span>
          </a>
          <a
            href="#categories"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-medium rounded-[6px] hover:bg-muted transition-colors"
          >
            Browse registry
          </a>
        </div>
      </div>

      {/* mechanical spec strip */}
      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-md overflow-hidden reveal-on-scroll" data-reveal>
        {[
          ["01", "Models", "12"],
          ["02", "Workflows", "24"],
          ["03", "Styles", "18"],
          ["04", "Docs / Pack", "10"],
        ].map(([n, k, v]) => (
          <div key={n} className="bg-background p-5">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{n}</span>
              <span className="size-1.5 rounded-full bg-primary/60" />
            </div>
            <div className="font-mono text-3xl font-medium tabular-nums">{v}</div>
            <div className="text-xs text-muted-foreground mt-1">{k}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Marquee
// ————————————————————————————————————————————————————————————————

function Marquee() {
  const items = ["CLAUDE", "DEEPSEEK", "GEMINI", "GPT", "GROK", "QWEN", "KIMI", "MISTRAL", "LLAMA"];
  return (
    <section className="border-y border-border bg-foreground text-background py-5 overflow-hidden">
      <div className="flex items-center gap-16 whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items].map((x, i) => (
          <span key={i} className="font-mono text-sm tracking-[0.2em] opacity-70 flex items-center gap-16">
            {x}
            <span className="size-1 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Selector — sticky control panel, live preview
// ————————————————————————————————————————————————————————————————

function SelectorSection() {
  const [model, setModel] = useState<(typeof MODELS)[number]["id"]>("deepseek");
  const [work, setWork] = useState<(typeof WORKS)[number]["id"]>("ui");
  const [style, setStyle] = useState<(typeof STYLES)[number]["id"]>("apple");
  const [step, setStep] = useState(1);

  const modelObj = MODELS.find((m) => m.id === model)!;
  const workObj = WORKS.find((w) => w.id === work)!;
  const styleObj = STYLES.find((s) => s.id === style)!;

  const zipName = `${model}-${work}-${style}.zip`;

  return (
    <section id="build" className="max-w-7xl mx-auto px-6 py-24 sm:py-32">
      <div className="mb-16 reveal-on-scroll" data-reveal>
        <span className="font-mono text-xs text-primary uppercase tracking-[0.24em]">§ Build</span>
        <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight max-w-[22ch]">
          Snap your stack into place.
        </h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-[54ch]">
          Three clicks. One preset pack. Every AI model gets consistent, production-grade output.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Sticky Control Panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-8">
          <StepBlock
            n="01"
            title="Choose AI Model"
            hint="Select your primary inference engine."
            active={step >= 1}
          >
            <ChipGroup
              items={MODELS.map((m) => ({ id: m.id, label: m.name }))}
              value={model}
              onChange={(v) => {
                setModel(v as typeof model);
                setStep(Math.max(step, 2));
              }}
            />
          </StepBlock>

          <StepBlock
            n="02"
            title="Choose Work"
            hint="What are you shipping today?"
            active={step >= 2}
          >
            <ChipGroup
              items={WORKS.map((w) => ({ id: w.id, label: w.name }))}
              value={work}
              onChange={(v) => {
                setWork(v as typeof work);
                setStep(Math.max(step, 3));
              }}
            />
          </StepBlock>

          <StepBlock
            n="03"
            title="Choose Style"
            hint="Design language for generated output."
            active={step >= 3}
          >
            <div className="grid grid-cols-1 gap-2">
              {STYLES.map((s) => {
                const selected = style === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setStyle(s.id);
                      setStep(4);
                    }}
                    className={`text-left px-4 py-3 rounded-md border transition-all flex items-center justify-between ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/40 hover:bg-muted"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium">{s.name}-Inspired</div>
                      <div className={`text-xs mt-0.5 ${selected ? "text-background/60" : "text-muted-foreground"}`}>
                        {s.note}
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] ${selected ? "text-background/60" : "text-muted-foreground"}`}>
                      {selected ? "SELECTED" : "SELECT"}
                    </span>
                  </button>
                );
              })}
            </div>
          </StepBlock>
        </div>

        {/* Terminal preview */}
        <div className="lg:col-span-7">
          <TerminalPreview model={modelObj} work={workObj} style={styleObj} zipName={zipName} />
        </div>
      </div>
    </section>
  );
}

function StepBlock({
  n,
  title,
  hint,
  active,
  children,
}: {
  n: string;
  title: string;
  hint: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`transition-all duration-500 ${active ? "opacity-100" : "opacity-40"}`}>
      <div className="flex items-baseline gap-4 mb-4">
        <span className={`font-mono text-sm tabular-nums ${active ? "text-primary" : "text-muted-foreground"}`}>
          {n}
        </span>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h3>
          <p className="text-muted-foreground text-sm mt-1">{hint}</p>
        </div>
      </div>
      <div className="pl-10">{children}</div>
    </div>
  );
}

function ChipGroup({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const selected = it.id === value;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={`px-3 py-1.5 text-sm rounded-[5px] border font-mono transition-all ${
              selected
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function TerminalPreview({
  model,
  work,
  style,
  zipName,
}: {
  model: (typeof MODELS)[number];
  work: (typeof WORKS)[number];
  style: (typeof STYLES)[number];
  zipName: string;
}) {
  const script = useMemo(
    () => [
      { c: "text-primary", t: `$ agentmd build --model ${model.id} --work ${work.id} --style ${style.id}` },
      { c: "text-white/40", t: `→ resolving preset ${model.file}` },
      { c: "text-white/40", t: `→ loading ${style.name.toLowerCase()}-inspired standard` },
      { c: "text-white/40", t: `→ compiling 10 documents` },
      { c: "text-emerald-400", t: `✓ pack ready · ${zipName}` },
    ],
    [model, work, style, zipName],
  );

  const [visible, setVisible] = useState(script.length);
  useEffect(() => {
    setVisible(0);
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setVisible(i);
      if (i >= script.length) window.clearInterval(id);
    }, 220);
    return () => window.clearInterval(id);
  }, [script]);

  return (
    <div className="bg-foreground rounded-[10px] p-1 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35)]">
      <div className="bg-[#0A0A0A] rounded-[8px] overflow-hidden">
        {/* window bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
            <div className="size-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.22em]">
              {zipName}
            </span>
          </div>
          <span className="text-[10px] font-mono text-white/30">◆</span>
        </div>

        {/* body */}
        <div className="p-6 font-mono text-[13px] leading-relaxed text-white/70 min-h-[440px]">
          <div className="space-y-1">
            {script.slice(0, visible).map((l, i) => (
              <div key={i} className={l.c}>
                {l.t}
              </div>
            ))}
            {visible < script.length && <span className="inline-block w-2 h-4 bg-white/60 animate-caret align-middle" />}
          </div>

          {visible >= script.length && (
            <div className="mt-6 animate-reveal">
              <div className="text-white/40"># PRESET: {style.name.toUpperCase()}-INSPIRED · {work.name.toUpperCase()}</div>
              <div className="text-white/40"># MODEL: {model.name.toUpperCase()}</div>
              <div className="h-4" />
              <div className="text-white/90">## Layout Principles</div>
              <div>- Tight tracking on display type (-0.02em)</div>
              <div>- 8px spatial grid, 80px section rhythm</div>
              <div>- Radius ceiling: 12px absolute</div>
              <div className="h-4" />
              <div className="text-white/90">## Motion Specification</div>
              <div>- Standard duration: 400ms</div>
              <div>- Easing: cubic-bezier(0.32, 0.72, 0, 1)</div>
              <div className="h-4" />
              <div className="text-white/90">## Implementation</div>
              <div className="pl-4 text-emerald-400">@theme &#123; --radius: 12px; &#125;</div>
              <div className="pl-4 text-emerald-400">.animate-in &#123; opacity: 1; ... &#125;</div>

              <div className="mt-10 p-4 border border-white/10 bg-white/[0.03] rounded flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Ready</div>
                  <div className="text-xs text-white/70">10 files · 1.2 MB · MIT</div>
                </div>
                <button className="bg-white text-black px-4 py-2 text-xs font-bold rounded uppercase tracking-tighter hover:bg-white/90 transition-colors">
                  Download Pack
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Pack Anatomy
// ————————————————————————————————————————————————————————————————

function PackAnatomy() {
  const files = [
    ["01", "engineering-principles.md", "Foundations"],
    ["02", "ui-system.md", "Interface"],
    ["03", "design-system.md", "Tokens"],
    ["04", "components.md", "Library"],
    ["05", "motion.md", "Movement"],
    ["06", "performance.md", "Budget"],
    ["07", "security.md", "Guardrails"],
    ["08", "testing.md", "Coverage"],
    ["09", "review.md", "Quality"],
    ["10", "production-checklist.md", "Ship"],
  ];
  return (
    <section id="anatomy" className="border-t border-border py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 reveal-on-scroll" data-reveal>
            <span className="font-mono text-xs text-primary uppercase tracking-[0.24em]">§ Anatomy</span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight">Inside the pack.</h2>
            <p className="mt-4 text-muted-foreground">
              Every preset contains a set of carefully designed markdown documents. Each file
              covers one engineering concern — no bloat, no ambiguity.
            </p>
            <div className="mt-8 flex items-center gap-3 font-mono text-xs text-muted-foreground">
              <span>10 FILES</span>
              <span className="size-1 rounded-full bg-border" />
              <span>1.2 MB</span>
              <span className="size-1 rounded-full bg-border" />
              <span>MIT LICENSE</span>
            </div>
          </div>

          <ul className="lg:col-span-8 divide-y divide-border border-y border-border">
            {files.map(([n, name, tag], i) => (
              <li
                key={n}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 py-4 reveal-on-scroll transition-colors hover:bg-muted/60 px-2 -mx-2 rounded-sm"
                data-reveal
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <span className="font-mono text-xs text-muted-foreground tabular-nums">{n}</span>
                <span className="font-mono text-sm">{name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Categories
// ————————————————————————————————————————————————————————————————

function Categories() {
  return (
    <section id="categories" className="bg-foreground text-background py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-16 reveal-on-scroll" data-reveal>
          <div>
            <span className="font-mono text-xs text-primary uppercase tracking-[0.24em]">§ Registry</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">Planned Categories</h2>
          </div>
          <span className="font-mono text-xs opacity-60">TOTAL PRESETS · 1,204</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((c, i) => (
            <div
              key={c.code}
              className="group p-6 border border-white/10 rounded-lg hover:bg-white/5 transition-all reveal-on-scroll"
              data-reveal
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="size-9 mb-8 border border-primary text-primary flex items-center justify-center font-mono text-xs">
                {c.code}
              </div>
              <h4 className="text-lg font-bold mb-2">{c.title}</h4>
              <p className="text-sm opacity-60 leading-relaxed">{c.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">
                Browse →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Roadmap
// ————————————————————————————————————————————————————————————————

function Roadmap() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height + vh * 0.4;
      const passed = Math.min(Math.max(vh - r.top, 0), total);
      setProgress(Math.min(passed / total, 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="roadmap" className="max-w-3xl mx-auto py-32 sm:py-48 px-6">
      <div className="text-center mb-16 reveal-on-scroll" data-reveal>
        <span className="font-mono text-xs text-primary uppercase tracking-[0.3em]">§ The Horizon</span>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight">Roadmap</h2>
      </div>

      <div ref={ref} className="relative pl-8">
        {/* rail */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
        <div
          className="absolute left-0 top-0 w-px bg-primary transition-[height] duration-300"
          style={{ height: `${progress * 100}%` }}
        />

        {ROADMAP.map((r, i) => {
          const activated = progress > i / ROADMAP.length;
          return (
            <div
              key={r.phase}
              className="relative pb-14 reveal-on-scroll"
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div
                className={`absolute -left-[33px] top-1 size-2.5 rounded-full transition-all ${
                  activated ? "bg-primary scale-110" : "bg-background border border-border"
                }`}
              />
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {r.phase}
                </span>
                <span className="size-1 rounded-full bg-border" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {r.when}
                </span>
              </div>
              <h4 className="text-xl font-bold mb-2">{r.title}</h4>
              <p className="text-muted-foreground">{r.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// CTA
// ————————————————————————————————————————————————————————————————

function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-24 sm:pb-32">
      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-foreground text-background p-10 sm:p-16 reveal-on-scroll"
        data-reveal
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-2xl">
          <span className="font-mono text-[10px] text-primary uppercase tracking-[0.24em]">§ Ship</span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-balance">
            Install engineering standards.
            <br />
            Not another prompt.
          </h2>
          <p className="mt-6 opacity-70 max-w-md">
            Join the open registry. Contribute presets, remix packs, and ship AI-assisted code
            with a floor — not a ceiling.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#build"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              Build your first pack
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-3 border border-white/20 text-sm font-medium rounded-md hover:bg-white/5 transition-colors"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ————————————————————————————————————————————————————————————————
// Footer
// ————————————————————————————————————————————————————————————————

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-5 bg-foreground rounded-sm" />
            <span className="font-mono font-bold tracking-tight">AGENT.MD</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
            The engineering floor for the next generation of AI-assisted development.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-16">
          {[
            ["Registry", ["Browse Packs", "Benchmarks", "Contributing"]],
            ["Product", ["Docs", "Changelog", "Roadmap"]],
            ["Social", ["Twitter", "GitHub", "Discord"]],
          ].map(([h, links]) => (
            <div key={h as string} className="space-y-3">
              <h5 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {h as string}
              </h5>
              <ul className="text-sm space-y-2">
                {(links as string[]).map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-primary transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-6 border-t border-border flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        <span>© 2026 Agent Engineering Labs</span>
        <span>EST. 2024 · PROTOCOL 001</span>
      </div>
    </footer>
  );
}
