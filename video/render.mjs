// Renders project/Main.dc.html frame by frame into an MP4.
// Usage: node render.mjs <Main.dc.html> <out.mp4> [fps] [seconds] [startSec]
import { createRequire } from 'module';
import fs from 'fs';
import { spawn } from 'child_process';
const require = createRequire('/opt/node22/lib/node_modules/');
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }

const [src, out, fpsArg, secArg, startArg] = process.argv.slice(2);
const fps = Number(fpsArg || 30);
const seconds = Number(secArg || 40);
const start = Number(startArg || 0);
const s = fs.readFileSync(src, 'utf8');

const helmet = s.match(/<helmet>([\s\S]*?)<\/helmet>/)[1];
const markup = s.match(/<\/helmet>([\s\S]*?)<\/x-dc>/)[1];
const logic = s.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];

const page = `<!doctype html><html lang="es"><head><meta charset="utf-8">${helmet}</head><body>
<div id="root"></div>
<script>
const TPL = ${JSON.stringify(markup)};
class DCLogic { constructor(){ this.props = {}; this.state = {}; } setState(){} }
${logic}
const comp = new Component();
const esc = (v) => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const get = (scope, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope);
function fill(tpl, scope) {
  tpl = tpl.replace(/<sc-for list="\\{\\{\\s*([\\w.]+)\\s*\\}\\}" as="(\\w+)"[^>]*>([\\s\\S]*?)<\\/sc-for>/g,
    (m, p, as, inner) => (get(scope, p) || []).map((it, i) => fill(inner, Object.assign({}, scope, { [as]: it, $index: i }))).join(''));
  tpl = tpl.replace(/<sc-if value="\\{\\{\\s*([\\w.]+)\\s*\\}\\}"[^>]*>([\\s\\S]*?)<\\/sc-if>/g,
    (m, p, inner) => (get(scope, p) ? fill(inner, scope) : ''));
  return tpl.replace(/\\{\\{\\s*([\\w.$]+)\\s*\\}\\}/g, (m, p) => { const v = get(scope, p); return v == null ? '' : esc(v); });
}
window.renderAt = (t) => {
  comp.props = { reproducir: false, segundo: t };
  document.getElementById('root').innerHTML = fill(TPL, comp.renderVals());
};
window.renderAt(0);
</script></body></html>`;

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => pw.chromium.launch());
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.setContent(page, { waitUntil: 'networkidle' });
await p.evaluate(async () => {
  await Promise.all(['700 40px Poppins', '600 40px Poppins', '500 40px Poppins', '400 40px Poppins',
    'italic 500 40px Fraunces', '600 40px Fraunces', '500 40px Fraunces'].map((f) => document.fonts.load(f)));
  await document.fonts.ready;
});

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(fps), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

const n = Math.round(seconds * fps);
for (let i = 0; i < n; i++) {
  await p.evaluate((t) => window.renderAt(t), start + i / fps);
  const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 150 === 0) console.log('frame', i, '/', n);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log('done', out);
