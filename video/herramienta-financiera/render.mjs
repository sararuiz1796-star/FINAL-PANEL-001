// Renders comp.html frame by frame to MP4. Usage: node render.mjs <comp.html> <meta.json> <out.mp4> [fps] [seconds] [start]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
const require = createRequire('/opt/node22/lib/node_modules/');
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }
const [comp, metaPath, out, fpsA, secA, startA] = process.argv.slice(2);
const fps = Number(fpsA || 30), seconds = Number(secA || 48), start = Number(startA || 0);
const meta = fs.readFileSync(metaPath, 'utf8');
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await ctx.addInitScript('window.META=' + meta + ';');
const p = await ctx.newPage();
await p.goto('file://' + path.resolve(comp), { waitUntil: 'networkidle' });
await p.evaluate(async () => {
  await Promise.all(['600 40px Fredoka', '500 40px Fredoka', '400 40px Fredoka', '600 40px "Playfair Display"', 'italic 500 40px "Playfair Display"'].map((f) => document.fonts.load(f)));
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
});
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(fps), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round(seconds * fps);
for (let i = 0; i < n; i++) {
  await p.evaluate((t) => window.renderAt(t), start + i / fps);
  const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log('done', out);
