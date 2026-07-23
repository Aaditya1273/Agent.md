/**
 * list.js
 *
 * Handles: npx agentmd list [model[/category]]
 *
 *   npx agentmd list claude            → shows all categories in claude
 *   npx agentmd list claude/Design     → shows all presets in Design
 *   npx agentmd list claude/Design/    → same
 */

"use strict";

const pc = require("picocolors");
const { REGISTRY, listCategories, getCategoryPresets } = require("../lib/registry");

function list(args) {
  const rawArg = (args && args[0]) || "";

  // No argument — show available models
  if (!rawArg) {
    console.log(pc.bold("\nAvailable models:\n"));
    for (const model of Object.keys(REGISTRY)) {
      const cats = Object.keys(REGISTRY[model]);
      const total = cats.reduce((n, c) => n + REGISTRY[model][c].length, 0);
      console.log(`  ${pc.cyan(model)}  ${pc.dim(`(${cats.length} categories, ${total} presets)`)}`);
    }
    console.log("");
    console.log(pc.dim("  Run 'npx agentmd list claude' to see all categories."));
    console.log("");
    return;
  }

  const parts = rawArg.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const model = parts[0];
  const category = parts[1] || null;

  if (!REGISTRY[model]) {
    console.error(pc.red(`Unknown model: "${model}"`));
    process.exit(1);
  }

  if (!category) {
    // List all categories for the model
    const cats = listCategories(model);
    console.log(pc.bold(`\nCategories in ${pc.cyan(model)}:\n`));
    for (const cat of cats) {
      const count = REGISTRY[model][cat].length;
      console.log(
        `  ${pc.white(cat.padEnd(20))}  ${pc.dim(count + " preset" + (count !== 1 ? "s" : ""))}`
      );
    }
    console.log("");
    console.log(pc.dim(`  Install a category:  npx agentmd install ${model}/<category>/`));
    console.log(pc.dim(`  See a category:      npx agentmd list ${model}/<category>`));
    console.log("");
  } else {
    // List all presets in the category
    const entries = getCategoryPresets(model, category);
    if (entries.length === 0) {
      console.error(pc.red(`Category not found: ${model}/${category}`));
      console.error(pc.dim(`Run 'npx agentmd list ${model}' to see available categories.`));
      process.exit(1);
    }
    console.log(pc.bold(`\nPresets in ${pc.cyan(model + "/" + category)}:\n`));
    for (const { preset } of entries) {
      console.log(`  ${pc.white(preset)}`);
    }
    console.log("");
    console.log(pc.dim(`  Install all:    npx agentmd install ${model}/${category}/`));
    console.log(pc.dim(`  Install one:    npx agentmd install ${model}/${category}/<preset>`));
    console.log("");
  }
}

module.exports = { list };
