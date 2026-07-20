import fs from "fs";
import path from "path";

const MODELS_DIR = path.join(process.cwd(), "models");

// Convert any string to a URL-safe slug (spaces → hyphens, lowercase)
function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Given a directory path and a slug, find the actual folder on disk
// (folder may have spaces while slug has hyphens)
function resolveFolder(parentPath: string, slug: string): string | null {
  if (!fs.existsSync(parentPath)) return null;
  const entries = fs.readdirSync(parentPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && toSlug(entry.name) === slug) {
      return entry.name; // return the real folder name
    }
  }
  return null;
}

export function getModels() {
  if (!fs.existsSync(MODELS_DIR)) return [];
  const entries = fs.readdirSync(MODELS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      let logoName = entry.name;
      if (entry.name === "open-ai") logoName = "chatgpt";
      return {
        id: toSlug(entry.name),   // slug for URL
        name: formatName(entry.name),
        logo: `/models/${logoName}.png`,
      };
    });
}

export function getWorksForModel(modelId: string) {
  const realModel = resolveFolder(MODELS_DIR, modelId);
  if (!realModel) return [];
  const modelPath = path.join(MODELS_DIR, realModel);
  const entries = fs.readdirSync(modelPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      id: toSlug(entry.name),   // slug for URL
      name: formatName(entry.name),
    }));
}

export function getPresetsForWork(modelId: string, workId: string) {
  const realModel = resolveFolder(MODELS_DIR, modelId);
  if (!realModel) return [];
  const realWork = resolveFolder(path.join(MODELS_DIR, realModel), workId);
  if (!realWork) return [];
  const workPath = path.join(MODELS_DIR, realModel, realWork);
  const entries = fs.readdirSync(workPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      id: toSlug(entry.name),   // slug for URL
      name: formatName(entry.name),
    }));
}

export function getPresetData(modelId: string, workId: string, presetId: string) {
  // Resolve each path segment from slug → real folder name
  const realModel = resolveFolder(MODELS_DIR, modelId);
  if (!realModel) return null;
  const realWork = resolveFolder(path.join(MODELS_DIR, realModel), workId);
  if (!realWork) return null;
  const realPreset = resolveFolder(path.join(MODELS_DIR, realModel, realWork), presetId);
  if (!realPreset) return null;

  const presetPath = path.join(MODELS_DIR, realModel, realWork, realPreset);

  let markdown = "";
  let readme = "";
  const isPremium = false;

  const designMdPath  = path.join(presetPath, "DESIGN.md");
  const readmeMdPath  = path.join(presetPath, "README.md");
  // fallback: try both slug form and space form of the filename
  const fallbackSlug  = path.join(presetPath, `${toSlug(realPreset)}.md`);
  const fallbackRaw   = path.join(presetPath, `${realPreset}.md`);

  if (fs.existsSync(designMdPath)) {
    markdown = fs.readFileSync(designMdPath, "utf-8");
  } else if (fs.existsSync(fallbackSlug)) {
    markdown = fs.readFileSync(fallbackSlug, "utf-8");
  } else if (fs.existsSync(fallbackRaw)) {
    markdown = fs.readFileSync(fallbackRaw, "utf-8");
  } else {
    const files = fs.readdirSync(presetPath).filter((f) => f.endsWith(".md") && f !== "README.md");
    if (files.length > 0) {
      markdown = fs.readFileSync(path.join(presetPath, files[0]), "utf-8");
    }
  }

  if (fs.existsSync(readmeMdPath)) {
    readme = fs.readFileSync(readmeMdPath, "utf-8");
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const matter = require("gray-matter");
  const parsed = matter(markdown);

  return {
    id: presetId,
    name: formatName(realPreset),
    model: formatName(realModel),
    work: formatName(realWork),
    isPremium,
    rawMarkdown: markdown,
    content: parsed.content,
    frontmatter: parsed.data,
    readme,
  };
}

function formatName(slug: string): string {
  // Handle both hyphen-separated and space-separated names
  return slug
    .split(/[-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
