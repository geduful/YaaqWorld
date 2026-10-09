import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const ORIGINALS = path.join(ROOT, "hero-originals");
const RAW_PATTERN = /^hero.*\.(?:jpe?g|png|tiff?)$/i;
const DEBOUNCE_MS = 400;

function uniqueDest(fileName) {
  let dest = path.join(ORIGINALS, fileName);
  if (!fs.existsSync(dest)) return dest;
  const base = fileName.replace(/(\.[^.]+)$/, "");
  const ext = fileName.match(/(\.[^.]+)$/)?.[1] ?? "";
  let n = 1;
  while (fs.existsSync(path.join(ORIGINALS, `${base}-${n}${ext}`))) n++;
  return path.join(ORIGINALS, `${base}-${n}${ext}`);
}

async function convert(fileName) {
  const src = path.join(PUBLIC, fileName);
  const out = path.join(PUBLIC, fileName.replace(/\.[^.]+$/, ".avif"));
  const tmp = out + ".converting";
  try {
    const info = await sharp(src)
      .resize({ width: 1920, withoutEnlargement: true })
      .avif({ quality: 35, effort: 6 })
      .toFile(tmp);
    fs.renameSync(tmp, out);
    fs.mkdirSync(ORIGINALS, { recursive: true });
    fs.renameSync(src, uniqueDest(fileName));
    console.log(
      `[hero] ${fileName} -> ${path.basename(out)} (${Math.round(info.size / 1024)}KB, ${info.width}x${info.height}) | original kept in hero-originals/`,
    );
  } catch (err) {
    try {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    } catch {}
    console.error(`[hero] FAILED ${fileName}: ${err.message}`);
  }
}

async function scan() {
  let files;
  try {
    files = fs.readdirSync(PUBLIC);
  } catch {
    return;
  }
  for (const file of files) {
    if (RAW_PATTERN.test(file)) await convert(file);
  }
}

let timer = null;
let scanning = false;
function scheduleScan() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (scanning) return scheduleScan();
    scanning = true;
    await scan();
    scanning = false;
  }, DEBOUNCE_MS);
}

function startWatcher() {
  try {
    fs.watch(PUBLIC, (_event, fileName) => {
      if (fileName && !RAW_PATTERN.test(fileName)) return;
      scheduleScan();
    });
  } catch (err) {
    console.error(`[hero] watcher failed to start: ${err.message}`);
  }
}

await scan();
startWatcher();

const args = process.argv.slice(2);
if (args.includes("--dev")) {
  const nextBin = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextBin, "dev"], { stdio: "inherit", cwd: ROOT });
  const shutdown = (signal) => {
    if (!child.killed) child.kill(signal);
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  child.on("exit", (code) => process.exit(code ?? 0));
} else {
  console.log(`[hero] watching ${PUBLIC} for new hero-* images (jpg/png/tiff) — drop images in and they convert automatically`);
}
