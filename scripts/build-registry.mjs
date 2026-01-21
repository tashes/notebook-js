import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "registry-src", "components");
const OUTPUT_DIR = path.join(ROOT, "components");

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });
const toTitle = (name) =>
  name
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const defaultDescription = (title) => `${title} component for the NotebookJS registry.`;

const detectFileType = (targetPath = "") => {
  if (targetPath.endsWith(".css")) return "registry:file";
  if (targetPath.endsWith(".md")) return "registry:file";
  return "registry:component";
};

const buildItem = (builderPath) => {
  const builder = JSON.parse(fs.readFileSync(builderPath, "utf8"));
  const title = builder.title ?? toTitle(builder.name);
  const description = builder.description ?? defaultDescription(title);

  const files = (builder.files ?? []).map((entry) => {
    const target = entry.target ?? entry.path;
    if (!entry.source) {
      throw new Error(`Missing 'source' for ${builder.name}:${target}`);
    }
    const sourcePath = path.join(ROOT, entry.source);
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    const content = fs.readFileSync(sourcePath, "utf8");
    const type = entry.type ?? detectFileType(target);
    const registryPath = entry.path ?? `registry/${builder.name}/${target.replace(/^components\//, "")}`;
    return {
      type,
      path: registryPath,
      target,
      content,
    };
  });

  return {
    $schema: ITEM_SCHEMA,
    name: builder.name,
    type: builder.type,
    title,
    description,
    author: builder.author,
    dependencies: builder.dependencies,
    devDependencies: builder.devDependencies,
    registryDependencies: builder.registryDependencies,
    files,
    tailwind: builder.tailwind,
    cssVars: builder.cssVars,
    css: builder.css,
    envVars: builder.envVars,
    meta: builder.meta,
    docs: builder.docs,
    categories: builder.categories,
  };
};

ensureDir(OUTPUT_DIR);

const builderFiles = fs
  .readdirSync(SOURCE_DIR)
  .filter((file) => file.endsWith(".json"))
  .sort();

const items = [];

for (const file of builderFiles) {
  const builderPath = path.join(SOURCE_DIR, file);
  const item = buildItem(builderPath);
  const outputPath = path.join(OUTPUT_DIR, file);
  fs.writeFileSync(outputPath, JSON.stringify(item, null, 2));

  // Omit content in registry index to keep file lighter
  const slimItem = {
    ...item,
    files: item.files.map(({ content, ...rest }) => rest),
  };
  items.push(slimItem);
}

const registry = {
  $schema: REGISTRY_SCHEMA,
  name: "notebookjs",
  homepage: "https://github.com/tashes/notebook-js",
  items,
};

fs.writeFileSync(path.join(ROOT, "registry.json"), JSON.stringify(registry, null, 2));

console.log(`Built ${items.length} registry item${items.length === 1 ? "" : "s"}.`);
