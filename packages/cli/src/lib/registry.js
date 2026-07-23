/**
 * registry.js
 *
 * Static registry of all free claude presets from models/claude.
 * Structure: { [model]: { [category]: [preset, ...] } }
 *
 * Rules:
 *   - npx agentmd install claude/Design/apple   → single preset
 *   - npx agentmd install claude/Design/         → all presets in Design
 *   - npx agentmd install claude/               → BLOCKED (too broad, loses retention value)
 */

"use strict";

const REGISTRY = {
  claude: {
    AI: [
      "context",
      "memory",
      "planning",
      "prompt-engineering",
      "self-review",
      "verification",
    ],
    API: [
      "filtering",
      "graphql",
      "openapi",
      "pagination",
      "rest",
      "sorting",
    ],
    Backend: [
      "express",
      "logging",
      "middlewares",
      "nextjs",
      "node",
      "validation",
    ],
    Business: [
      "branding",
      "content",
      "marketing",
      "positioning",
      "pricing",
    ],
    Checklists: [
      "deployment-checklist",
      "design-checklist",
      "production-checklist",
      "qa-checklist",
    ],
    Community: [
      "code-of-conduct",
      "contributing",
    ],
    Database: [
      "indexes",
      "mongodb",
      "mysql",
      "postgres",
      "query-optimization",
      "redis",
      "schema-design",
    ],
    Design: [
      "airbnb",
      "airtable",
      "apple",
      "binance",
      "bmw",
      "bmw-m",
      "bugatti",
      "cal",
      "claude",
      "clay",
      "clickhouse",
      "cohere",
      "coinbase",
      "composio",
      "cursor",
      "dell-1996",
      "elevenlabs",
      "expo",
      "ferrari",
      "figma",
      "framer",
      "hashicorp",
      "hp",
      "ibm",
      "intercom",
      "kraken",
      "lamborghini",
      "linear.app",
      "lovable",
      "mastercard",
      "meta",
      "minimax",
      "mintlify",
      "miro",
      "mistral.ai",
      "mongodb",
      "nike",
      "nintendo-2001",
      "notion",
      "nvidia",
      "ollama",
      "opencode.ai",
      "pinterest",
      "playstation",
      "posthog",
      "raycast",
      "renault",
      "replicate",
      "resend",
      "revolut",
      "runwayml",
      "sanity",
      "sentry",
      "shopify",
      "slack",
      "spacex",
      "spotify",
      "starbucks",
      "stripe",
      "supabase",
      "superhuman",
      "tesla",
      "theverge",
      "together.ai",
      "uber",
      "vercel",
      "vodafone",
      "voltagent",
      "warp",
      "webflow",
      "wired",
      "wise",
      "x.ai",
      "zapier",
    ],
    DevOps: [
      "cloudflare",
      "deployment",
      "docker",
      "docker-compose",
      "vercel",
    ],
    Documentation: [
      "api-docs",
      "contributing",
      "readme",
    ],
    "Open-Source": [
      "architecture-analysis",
      "dependency-analysis",
      "fork-strategy",
      "license-check",
      "modernization",
      "repository-analysis",
    ],
    Performance: [
      "bundle-size",
      "fonts",
      "images",
      "lazy-loading",
      "network",
      "rendering",
    ],
    Research: [
      "benchmark",
      "competitor-research",
      "ui-analysis",
    ],
    Review: [
      "code-review",
      "design-review",
      "security-review",
    ],
    Security: [
      "authentication",
      "authorization",
      "csrf",
      "owasp",
      "xss",
    ],
    Startup: [
      "customer-feedback",
      "mvp",
      "validation",
    ],
    "System Design": [
      "architecture",
      "caching",
      "cdn",
      "monolith",
    ],
    Templates: [
      "ai-template",
      "blockchain-template",
      "dashboard-template",
      "landing-template",
      "portfolio-template",
      "saas-template",
    ],
    Testing: [
      "e2e",
      "integration",
      "test-strategy",
      "unit",
    ],
  },
};

/**
 * Base URL where raw preset markdown is fetched from.
 * In production this points to the live registry API.
 * Falls back to raw GitHub content for open-source free presets.
 */
const RAW_BASE =
  "https://raw.githubusercontent.com/Aaditya1273/Agent.md/main/models";

/**
 * Resolve a preset path to its raw content URL.
 * Handles the special case where Design presets use DESIGN.md filename.
 */
function getPresetUrl(model, category, preset) {
  const isDesign = category === "Design";
  const filename = isDesign ? "DESIGN.md" : `${preset}.md`;
  // Encode spaces in category names (e.g. "System Design" → "System%20Design")
  const encodedCategory = encodeURIComponent(category);
  return `${RAW_BASE}/${model}/${encodedCategory}/${preset}/${filename}`;
}

/**
 * Resolve all presets for a given model + category.
 * Returns array of { category, preset, url }
 */
function getCategoryPresets(model, category) {
  const modelData = REGISTRY[model];
  if (!modelData) return [];
  const presets = modelData[category];
  if (!presets) return [];
  return presets.map((preset) => ({
    category,
    preset,
    url: getPresetUrl(model, category, preset),
  }));
}

/**
 * Look up a single preset. Returns { category, preset, url } or null.
 */
function getPreset(model, category, preset) {
  const modelData = REGISTRY[model];
  if (!modelData) return null;
  const presets = modelData[category];
  if (!presets) return null;
  // Case-insensitive match
  const match = presets.find(
    (p) => p.toLowerCase() === preset.toLowerCase()
  );
  if (!match) return null;
  return { category, preset: match, url: getPresetUrl(model, category, match) };
}

/**
 * Search all presets across all categories for a model.
 * Returns array of { category, preset, url } where name matches query.
 */
function searchPresets(model, query) {
  const modelData = REGISTRY[model];
  if (!modelData) return [];
  const q = query.toLowerCase();
  const results = [];
  for (const [category, presets] of Object.entries(modelData)) {
    for (const preset of presets) {
      if (
        preset.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q)
      ) {
        results.push({ category, preset, url: getPresetUrl(model, category, preset) });
      }
    }
  }
  return results;
}

/**
 * List all categories for a model.
 */
function listCategories(model) {
  const modelData = REGISTRY[model];
  if (!modelData) return [];
  return Object.keys(modelData);
}

module.exports = {
  REGISTRY,
  getPreset,
  getCategoryPresets,
  searchPresets,
  listCategories,
};
