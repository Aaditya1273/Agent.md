#!/usr/bin/env node

/**
 * agentmd CLI
 *
 * The npm for AI engineering presets.
 *
 * Usage:
 *   npx agentmd install claude/Design/apple      → install single preset
 *   npx agentmd install claude/Design/           → install all Design presets
 *   npx agentmd list claude                      → list all categories
 *   npx agentmd list claude/Design               → list presets in Design
 *   npx agentmd search authentication            → search presets
 *   npx agentmd --help                           → show help
 *   npx agentmd --version                        → show version
 */

"use strict";

const pc = require("picocolors");
const { install } = require("../src/commands/install");
const { list } = require("../src/commands/list");
const { search } = require("../src/commands/search");

const pkg = require("../package.json");

const HELP = `
${pc.bold("agentmd")} ${pc.dim("v" + pkg.version)} — The npm for AI engineering presets

${pc.bold("Usage:")}

  ${pc.cyan("npx agentmd install")} ${pc.white("<model/category/preset>")}
    Install a single preset into your project.
    ${pc.dim("Example:")} npx agentmd install claude/Design/apple

  ${pc.cyan("npx agentmd install")} ${pc.white("<model/category/>")}
    Install all presets in a category.
    ${pc.dim("Example:")} npx agentmd install claude/Design/

  ${pc.cyan("npx agentmd list")} ${pc.white("[model[/category]]")}
    List available models, categories, or presets.
    ${pc.dim("Example:")} npx agentmd list claude
    ${pc.dim("Example:")} npx agentmd list claude/Design

  ${pc.cyan("npx agentmd search")} ${pc.white("<query>")}
    Search presets by name or category.
    ${pc.dim("Example:")} npx agentmd search authentication

${pc.bold("Options:")}

  --force   Re-install even if already installed
  --help    Show this help message
  --version Show version number

${pc.bold("Output:")}

  Presets are saved to ${pc.white(".agentmd/presets/")} in your project.
  A manifest is kept at ${pc.white(".agentmd/manifest.json")}.

${pc.bold("Examples:")}

  ${pc.dim("# Install Apple design language preset for Claude")}
  npx agentmd install claude/Design/apple

  ${pc.dim("# Install all Security presets at once")}
  npx agentmd install claude/Security/

  ${pc.dim("# Install all Testing presets")}
  npx agentmd install claude/Testing/

  ${pc.dim("# See what's available in the Design category")}
  npx agentmd list claude/Design

  ${pc.dim("# Find auth-related presets")}
  npx agentmd search auth

${pc.dim("  More at https://agentmd.com")}
`;

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    process.exit(0);
  }

  if (argv.includes("--version") || argv.includes("-v")) {
    console.log(pkg.version);
    process.exit(0);
  }

  const command = argv[0];
  const rest = argv.slice(1);

  switch (command) {
    case "install":
    case "i":
      await install(rest);
      break;

    case "list":
    case "ls":
      list(rest);
      break;

    case "search":
    case "s":
      search(rest);
      break;

    default:
      console.error(pc.red(`Unknown command: "${command}"`));
      console.error(pc.dim("Run 'npx agentmd --help' for usage."));
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(pc.red("\nError: " + err.message));
  process.exit(1);
});
