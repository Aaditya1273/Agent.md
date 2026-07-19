import fs from "fs";
import path from "path";

const MODELS_DIR = path.join(process.cwd(), "models");

export function getModels() {
  if (!fs.existsSync(MODELS_DIR)) return [];
  const entries = fs.readdirSync(MODELS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      let logoName = entry.name;
      if (entry.name === "open-ai") logoName = "chatgpt";
      return {
        id: entry.name,
        name: formatName(entry.name),
        logo: `/models/${logoName}.png`,
      };
    });
}

export function getWorksForModel(modelId: string) {
  const modelPath = path.join(MODELS_DIR, modelId);
  if (!fs.existsSync(modelPath)) return [];
  const entries = fs.readdirSync(modelPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      id: entry.name,
      name: formatName(entry.name),
    }));
}

export function getPresetsForWork(modelId: string, workId: string) {
  const workPath = path.join(MODELS_DIR, modelId, workId);
  if (!fs.existsSync(workPath)) return [];
  const entries = fs.readdirSync(workPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      id: entry.name,
      name: formatName(entry.name),
    }));
}

export function getPresetData(modelId: string, workId: string, presetId: string) {
  const presetPath = path.join(MODELS_DIR, modelId, workId, presetId);
  if (!fs.existsSync(presetPath)) return null;
  
  let markdown = "";
  let readme = "";
  let isPremium = false;
  
  // All content in /models is free. Premium content (power-prompts etc.) 
  // is served from a separate directory not yet in this repo.

  const designMdPath = path.join(presetPath, "DESIGN.md");
  const readmeMdPath = path.join(presetPath, "README.md");
  const fallbackMdPath = path.join(presetPath, `${presetId}.md`);

  if (fs.existsSync(designMdPath)) markdown = fs.readFileSync(designMdPath, "utf-8");
  else if (fs.existsSync(fallbackMdPath)) markdown = fs.readFileSync(fallbackMdPath, "utf-8");
  else {
    const files = fs.readdirSync(presetPath).filter(f => f.endsWith('.md'));
    if (files.length > 0) {
      markdown = fs.readFileSync(path.join(presetPath, files[0]), "utf-8");
    }
  }

  if (fs.existsSync(readmeMdPath)) readme = fs.readFileSync(readmeMdPath, "utf-8");

  const matter = require("gray-matter");
  const parsed = matter(markdown);

  return {
    id: presetId,
    name: formatName(presetId),
    model: formatName(modelId),
    work: formatName(workId),
    isPremium,
    rawMarkdown: markdown,
    content: parsed.content,
    frontmatter: parsed.data,
    readme,
  };
}

function formatName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
