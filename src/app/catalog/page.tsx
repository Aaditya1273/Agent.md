"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ChevronDown, Bookmark, Download } from "lucide-react";

// ————————————————————————————————————————————————————————————————
// Mock Data
// ————————————————————————————————————————————————————————————————

const CATEGORIES = [
  { id: "all", name: "All", count: 75 },
  { id: "ai", name: "AI & LLM Platforms", count: 12 },
  { id: "dev", name: "Developer Tools & IDEs", count: 7 },
  { id: "backend", name: "Backend, Database & DevOps", count: 8 },
  { id: "saas", name: "Productivity & SaaS", count: 9 },
  { id: "design", name: "Design & Creative Tools", count: 6 },
  { id: "fintech", name: "Fintech & Crypto", count: 7 },
];

const PRESETS = [
  {
    id: "stripe-saas",
    slug: "stripe-saas",
    name: "Stripe SaaS Architecture",
    description: "Production SaaS architecture with Stripe-like design principles. Clean layouts, strong alignment, sharp typography.",
    model: "Claude 3.5",
    tags: ["New"],
    installs: "12.4k",
    bookmarked: "3.2k",
    iconColor: "#635BFF",
    iconInitials: "St",
  },
  {
    id: "apple-ui",
    slug: "apple-ui",
    name: "Apple Premium UI",
    description: "Consumer electronics aesthetics. Premium white space, SF Pro, cinematic imagery.",
    model: "DeepSeek V3",
    tags: ["Featured"],
    installs: "45.1k",
    bookmarked: "12.8k",
    iconColor: "#000000",
    iconInitials: "Ap",
  },
  {
    id: "linear-agent",
    slug: "linear-agent",
    name: "Linear AI Agent",
    description: "Precision, grid-based dark mode design. Ideal for complex workflows and high-density information.",
    model: "GPT-4o",
    tags: [],
    installs: "28.3k",
    bookmarked: "8.1k",
    iconColor: "#5E6AD2",
    iconInitials: "Li",
  },
  {
    id: "vercel-docs",
    slug: "vercel-docs",
    name: "Vercel Docs",
    description: "Mono, geometric, sharp typography. Perfect for developer documentation and technical guides.",
    model: "Gemini 1.5",
    tags: [],
    installs: "19.7k",
    bookmarked: "5.4k",
    iconColor: "#000000",
    iconInitials: "Ve",
  },
];

// ————————————————————————————————————————————————————————————————
// Page Component
// ————————————————————————————————————————————————————————————————

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPresets = PRESETS.filter(
    (preset) => preset.name.toLowerCase().includes(searchQuery.toLowerCase()) || preset.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Nav />
      
      <main className="flex-1 flex flex-col lg:flex-row max-w-[2000px] w-full mx-auto border-t border-border">
        {/* Sidebar Categories */}
        <aside className="w-full lg:w-64 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl font-semibold mb-6 font-mono tracking-tight hidden lg:block">Categories</h2>
          
          {/* Mobile Category Dropdown (Simplified) */}
          <button className="lg:hidden w-full flex items-center justify-between py-2.5 border-b border-border">
            <span className="text-sm font-medium">{CATEGORIES.find(c => c.id === activeCategory)?.name || "All"}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          
          {/* Desktop Categories */}
          <nav className="hidden lg:flex flex-col gap-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center justify-between py-2 px-2 text-left text-sm transition-colors rounded-md ${
                  activeCategory === cat.id 
                    ? "text-foreground font-medium bg-muted/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-[11px] font-mono opacity-60 ml-3">{cat.count}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Catalog Area */}
        <section className="flex-1 min-w-0 flex flex-col">
          {/* Search Bar */}
          <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2 border-b border-border">
            <div className="flex items-center flex-1">
              <Search className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
              <input
                type="search"
                placeholder="Search presets, models, or styles..."
                className="flex-1 py-3 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Table Header */}
          <div className="hidden sm:grid items-center py-3 px-4 sm:px-6 border-b border-border text-xs text-muted-foreground font-mono" style={{ gridTemplateColumns: "32px 1fr 100px 90px 90px", gap: "16px" }}>
            <span className="text-center">#</span>
            <span>Preset Configuration</span>
            <span className="text-right">Model</span>
            <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors">
              Installs <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            <button className="flex items-center justify-end gap-1 hover:text-foreground transition-colors">
              Saves <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
          </div>
          
          {/* Preset Rows */}
          <div className="flex-1 overflow-y-auto">
            {filteredPresets.map((preset) => (
              <Link
                key={preset.id}
                href={`/catalog/${preset.slug}`}
                className="grid items-center py-4 px-4 sm:px-6 border-b border-border/50 hover:bg-muted/30 transition-colors group"
                style={{ gridTemplateColumns: "32px 1fr 100px 90px 90px", gap: "16px" }}
              >
                {/* Icon */}
                <div className="flex items-center justify-center col-span-1 sm:col-span-1">
                  <div 
                    className="w-8 h-8 rounded-[6px] flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: preset.iconColor }}
                  >
                    {preset.iconInitials}
                  </div>
                </div>
                
                {/* Info */}
                <div className="col-span-4 sm:col-span-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{preset.name}</h3>
                    {preset.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] font-mono font-medium uppercase tracking-wider text-primary border border-primary/30 bg-primary/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[13px] text-muted-foreground truncate">{preset.description}</p>
                </div>
                
                {/* Model (Desktop only) */}
                <div className="hidden sm:flex items-center justify-end">
                  <span className="text-xs font-mono px-2 py-1 bg-muted/50 rounded text-muted-foreground">
                    {preset.model}
                  </span>
                </div>
                
                {/* Stats (Desktop only) */}
                <div className="hidden sm:flex items-center justify-end text-xs text-muted-foreground font-mono gap-1.5">
                  <Download className="w-3.5 h-3.5 opacity-60" /> {preset.installs}
                </div>
                <div className="hidden sm:flex items-center justify-end text-xs text-muted-foreground font-mono gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 opacity-60" /> {preset.bookmarked}
                </div>
              </Link>
            ))}
            
            {filteredPresets.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                <p>No presets found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Reused Nav Component (Simplified for Catalog)
// ————————————————————————————————————————————————————————————————

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
