/**
 * manifest.js
 *
 * Reads and writes .agentmd/manifest.json in the user's project root (cwd).
 * Tracks which presets are installed, their versions, and file paths.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const MANIFEST_DIR = ".agentmd";
const MANIFEST_FILE = "manifest.json";
const PRESETS_DIR = ".agentmd/presets";

function getManifestPath(cwd) {
  return path.join(cwd, MANIFEST_DIR, MANIFEST_FILE);
}

function getPresetsDir(cwd) {
  return path.join(cwd, PRESETS_DIR);
}

/**
 * Read existing manifest or return a fresh one.
 */
function readManifest(cwd) {
  const manifestPath = getManifestPath(cwd);
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    } catch {
      // Corrupt manifest — start fresh
    }
  }
  return {
    version: "1",
    installedAt: new Date().toISOString(),
    presets: [],
  };
}

/**
 * Write manifest to disk. Creates .agentmd/ dir if needed.
 */
function writeManifest(cwd, manifest) {
  const dir = path.join(cwd, MANIFEST_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    getManifestPath(cwd),
    JSON.stringify(manifest, null, 2),
    "utf-8"
  );
}

/**
 * Ensure .agentmd/presets/ directory exists.
 */
function ensurePresetsDir(cwd) {
  const dir = getPresetsDir(cwd);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Add or update a preset entry in the manifest.
 */
function upsertPreset(manifest, entry) {
  const id = `${entry.model}/${entry.category}/${entry.preset}`;
  const existing = manifest.presets.findIndex((p) => p.id === id);
  const record = {
    id,
    model: entry.model,
    category: entry.category,
    preset: entry.preset,
    installedAt: new Date().toISOString(),
    file: entry.file,
  };
  if (existing >= 0) {
    manifest.presets[existing] = record;
  } else {
    manifest.presets.push(record);
  }
}

/**
 * Check if a preset is already installed.
 */
function isInstalled(manifest, model, category, preset) {
  const id = `${model}/${category}/${preset}`;
  return manifest.presets.some((p) => p.id === id);
}

module.exports = {
  readManifest,
  writeManifest,
  ensurePresetsDir,
  upsertPreset,
  isInstalled,
  getPresetsDir,
  MANIFEST_DIR,
  PRESETS_DIR,
};
