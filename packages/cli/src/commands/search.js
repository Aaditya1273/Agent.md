/**
 * search.js
 *
 * Handles: npx agentmd search <query>
 *
 * Searches preset names AND category names across the full claude registry.
 * Returns matching presets with the install command ready to copy-paste.
 */

"use strict";

const pc = require("picocolors");
const { searchPresets } = require("../lib/registry");

function search(args) {
  if (!args || args.length === 0) {
    console.error(pc.red("Usage: npx agentmd search <query>"));
    console.error(pc.dim("  Example: npx agentmd search authentication"));
    process.exit(1);
  }

  const query = args.filter((a) => !a.startsWith("--")).join(" ");
  const model = "claude"; // only claude for now

  const results = searchPresets(model, query);

  if (results.length === 0) {
    console.log(pc.yellow(`\nNo presets found for "${query}"\n`));
    console.log(pc.dim(`  Try: npx agentmd list ${model}`));
    return;
  }

  console.log(
    pc.bold(`\nFound ${pc.cyan(results.length)} preset${results.length !== 1 ? "s" : ""} matching "${pc.white(query)}":\n`)
  );

  // Group by category for readability
  const grouped = {};
  for (const entry of results) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry.preset);
  }

  for (const [category, presets] of Object.entries(grouped)) {
    console.log(pc.white(`  ${category}`));
    for (const preset of presets) {
      console.log(
        `    ${pc.dim("→")}  ${preset.padEnd(30)} ${pc.dim(`npx agentmd install ${model}/${category}/${preset}`)}`
      );
    }
    console.log("");
  }

  if (results.length > 1) {
    // Show the most relevant category-level install if all results are in same category
    const cats = Object.keys(grouped);
    if (cats.length === 1) {
      console.log(
        pc.dim(`  Install all ${results.length} at once:  npx agentmd install ${model}/${cats[0]}/`)
      );
      console.log("");
    }
  }
}

module.exports = { search };
