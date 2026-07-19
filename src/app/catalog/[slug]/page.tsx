"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Bookmark, Terminal, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ————————————————————————————————————————————————————————————————
// Mock Data
// ————————————————————————————————————————————————————————————————

const MOCK_PRESET = {
  id: "stripe-saas",
  name: "Stripe SaaS Architecture",
  author: "Agent.md Team",
  version: "1.2.0",
  lastUpdated: "2026-07-15",
  model: "Claude 3.5",
  installs: "12.4k",
  description: "Production SaaS architecture with Stripe-like design principles. Clean layouts, strong alignment, sharp typography.",
  files: [
    { name: "CLAUDE.md", content: "# Claude Configuration\\n\\nFollow these rules strictly when building..." },
    { name: "ui.md", content: "# UI System\\n\\n## Colors\\n- Primary: `#635BFF`\\n- Background: `#0A2540`" },
  ],
  markdown: `
# Stripe-Inspired SaaS Preset

> **Version:** 1.2.0
> **Target:** Claude 3.5 Sonnet
> **Domain:** B2B SaaS

## Overview

This preset configures your AI to output code that matches Stripe's legendary engineering and design quality. It forces strict adherence to clean, grid-based layouts, precise typography, and resilient API design.

## Core Directives

1. **Precision:** Never guess padding. Always use the defined 4px spacing scale (4, 8, 12, 16, 24, 32, 48, 64).
2. **Typography:** Use Inter. Titles should have tight tracking (\`-0.02em\`).
3. **Colors:** Avoid flat black. Use deep, saturated dark blues (\`#0A2540\`) for contrast.
4. **Resilience:** All API routes must handle timeouts, malformed bodies, and rate limiting gracefully.

## Component Examples

\`\`\`tsx
export function PrimaryButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-[#635BFF] hover:bg-[#0A2540] text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm"
    >
      {children}
    </button>
  );
}
\`\`\`

## Installation

Save this file as \`CLAUDE.md\` in your repository root, or use the Agent CLI:

\`\`\`bash
npx agentmd install stripe-saas
\`\`\`
`
};

// ————————————————————————————————————————————————————————————————
// Page Component
// ————————————————————————————————————————————————————————————————

export default function PresetDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const preset = MOCK_PRESET; // In a real app, fetch based on slug

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Nav />
      
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb / Back */}
        <div className="mb-8">
          <Link href="/catalog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Main Content */}
          <div className="min-w-0">
            {/* Header */}
            <header className="mb-10 pb-10 border-b border-border">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                  {preset.name}
                </h1>
                <div className="hidden sm:flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                    <Bookmark className="w-4 h-4" /> Save
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Download className="w-4 h-4" /> Download Pack
                  </button>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mb-6 text-pretty">
                {preset.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm font-mono">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded text-muted-foreground">
                  <span className="opacity-60">Model:</span> <span className="text-foreground">{preset.model}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded text-muted-foreground">
                  <span className="opacity-60">v</span>{preset.version}
                </div>
                <div className="text-muted-foreground ml-auto">
                  By <span className="text-foreground font-medium font-sans">{preset.author}</span>
                </div>
              </div>
            </header>

            {/* Markdown Body */}
            <article className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {preset.markdown}
              </ReactMarkdown>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Mobile Actions */}
            <div className="sm:hidden flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                <Download className="w-4 h-4" /> Download Pack
              </button>
              <button className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
                <Bookmark className="w-4 h-4" /> Save Preset
              </button>
            </div>

            {/* Quick Install */}
            <div className="bg-muted/30 border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Terminal className="w-4 h-4" /> Quick Install
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Run this in your terminal to initialize the preset in your project.</p>
              <div className="flex items-center justify-between bg-[#000000] border border-border/50 rounded p-3 text-xs font-mono">
                <span className="text-green-400">npx</span> agentmd init {slug}
              </div>
            </div>

            {/* Files in Pack */}
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Pack Contents</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                {preset.files.map((file, i) => (
                  <div key={file.name} className={`flex items-center justify-between p-3 text-sm font-mono hover:bg-muted/50 cursor-pointer transition-colors ${i !== preset.files.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 opacity-50">
                        {/* Fake file icon */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                      </div>
                      {file.name}
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-muted-foreground">Installs</span>
                <span className="font-mono">{preset.installs}</span>
              </div>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-mono">{preset.lastUpdated}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">License</span>
                <span className="font-mono">MIT</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-6 bg-foreground rounded-sm flex items-center justify-center">
            <div className="size-2 bg-background rotate-45" />
          </div>
          <span className="font-mono font-medium tracking-tighter text-[15px]">AGENT.MD</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link href="/catalog" className="text-foreground font-medium transition-colors">Catalog</Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 text-xs font-medium border border-border rounded-sm hover:bg-muted transition-colors">
            Sign in
          </button>
        </div>
      </div>
    </nav>
  );
}
