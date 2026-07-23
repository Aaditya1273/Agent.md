/**
 * install.js
 *
 * Handles: npx agentmd install <path>
 *
 * Supported depth rules (ONLY 2 layers max, by design):
 *
 *   claude/Design/apple    → install single preset
 *   claude/Design/         → install ALL presets in Design category
 *   claude/Design          → same as above (trailing slash optional)
 *
 *   claude/               → BLOCKED. Too broad. User must pick a category.
 *   claude                → BLOCKED. Same reason.
 *
 * This is intentional: prevents users from bulk-installing everything
 * in one shot, which would remove the reason to return to the registry.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const pc = require("picocolors");
const { getPreset, getCategoryPresets } = require("../lib/registry");
const { fetchText } = require("../lib/fetcher");
const {
  readManifest,
  writeManifest,
  ensurePresetsDir,
  upsertPreset,
  isInstalled,
} = require("../lib/manifest");

/**
 * Parse the install path argument into { model, category, preset }.
 * preset is null if only category-level was requested.
 */
function parsePath(rawArg) {
  // Normalise: strip leading/trailing slashes, split on /
  const parts = rawArg
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    // e.g. "claude" — blocked
    return { model: parts[0], category: null, preset: null, depth: 1 };
  }
  if (parts.length === 2) {
    // e.g. "claude/Design" — category-level install
    return { model: parts[0], category: parts[1], preset: null, depth: 2 };
  }
  if (parts.length === 3) {
    // e.g. "claude/Design/apple" — single preset install
    return { model: parts[0], category: parts[1], preset: parts[2], depth: 3 };
  }
  return { model: null, category: null, preset: null, depth: 0 };
}

/**
 * Write a single preset file to .agentmd/presets/ and update manifest.
 */
async function installOne({ model, category, preset, url }, cwd, manifest, opts) {
  const presetsDir = ensurePresetsDir(cwd);

  // Skip if already installed (unless --force)
  if (!opts.force && isInstalled(manifest, model, category, preset)) {
    console.log(
      pc.dim(`  skip  ${model}/${category}/${preset} (already installed, use --force to overwrite)`)
    );
    return false;
  }

  process.stdout.write(pc.cyan(`  ↓  ${model}/${category}/${preset} ...`));

  let content;
  try {
    content = await fetchText(url);
  } catch (err) {
    process.stdout.write("\n");
    console.error(pc.red(`  ✗  Failed to fetch ${preset}: ${err.message}`));
    return false;
  }

  // Filename: category-preset.md  e.g. Design-apple.md
  const filename = `${category}-${preset}.md`;
  const filePath = path.join(presetsDir, filename);
  fs.writeFileSync(filePath, content, "utf-8");

  upsertPreset(manifest, {
    model,
    category,
    preset,
    file: path.join(".agentmd", "presets", filename),
  });

  process.stdout.write(" " + pc.green("✓") + "\n");
  return true;
}

/**
 * Main install command handler.
 */
async function install(args) {
  if (!args || args.length === 0) {
    console.error(pc.red("Usage: npx agentmd install <model/category[/preset]>"));
    console.error(pc.dim("  Example: npx agentmd install claude/Design/apple"));
    console.error(pc.dim("  Example: npx agentmd install claude/Design/"));
    process.exit(1);
  }

  const rawArg = args[0];
  const opts = {
    force: args.includes("--force"),
  };

  const { model, category, preset, depth } = parsePath(rawArg);

  // Validate model
  if (!model || model !== "claude") {
    console.error(pc.red(`Unknown model: "${model}". Only "claude" is supported.`));
    process.exit(1);
  }

  // Block top-level install (depth 1): claude/ or claude
  if (depth <= 1 || !category) {
    console.error(pc.yellow("⚠  Too broad. Please specify a category."));
    console.error("");
    console.error(pc.dim("  Install a full category:  npx agentmd install claude/Design/"));
    console.error(pc.dim("  Install a single preset:  npx agentmd install claude/Design/apple"));
    console.error("");
    console.error(pc.dim("  Run 'npx agentmd list claude' to see all categories."));
    process.exit(1);
  }

  const cwd = process.cwd();
  const manifest = readManifest(cwd);

  let toInstall = [];

  if (preset) {
    // Single preset: claude/Design/apple
    const entry = getPreset(model, category, preset);
    if (!entry) {
      console.error(pc.red(`Preset not found: ${model}/${category}/${preset}`));
      console.error(pc.dim(`Run 'npx agentmd list ${model}/${category}' to see available presets.`));
      process.exit(1);
    }
    toInstall = [{ ...entry, model }];
  } else {
    // Category-level: claude/Design/
    const entries = getCategoryPresets(model, category);
    if (entries.length === 0) {
      console.error(pc.red(`Category not found: ${model}/${category}`));
      console.error(pc.dim(`Run 'npx agentmd list ${model}' to see available categories.`));
      process.exit(1);
    }
    toInstall = entries.map((e) => ({ ...e, model }));
  }

  // Print header
  const isBatch = toInstall.length > 1;
  if (isBatch) {
    console.log(
      pc.bold(`\nInstalling ${pc.cyan(toInstall.length + " presets")} from ${pc.white(model + "/" + category)}/\n`)
    );
  } else {
    console.log(
      pc.bold(`\nInstalling ${pc.cyan(model + "/" + category + "/" + toInstall[0].preset)}\n`)
    );
  }

  let installed = 0;
  let skipped = 0;

  for (const entry of toInstall) {
    const ok = await installOne(entry, cwd, manifest, opts);
    if (ok) installed++;
    else skipped++;
  }

  // Save manifest
  writeManifest(cwd, manifest);

  // Summary
  console.log("");
  if (installed > 0) {
    console.log(pc.green(`✓ ${installed} preset${installed !== 1 ? "s" : ""} installed`));
    console.log(pc.dim(`  Files saved to .agentmd/presets/`));
    console.log(pc.dim(`  Manifest updated at .agentmd/manifest.json`));
  }
  if (skipped > 0 && !opts.force) {
    console.log(pc.dim(`  ${skipped} skipped (already installed)`));
  }

  if (installed > 0) {
    console.log("");
    console.log(pc.bold("Next steps:"));
    console.log(pc.dim("  Copy the preset files into your project and reference them from your CLAUDE.md"));
    console.log(pc.dim("  or paste the content directly into your AI assistant's context."));
    console.log("");
  }
}

module.exports = { install };
