// Exporta cada animación de animaciones.html a video 1920×1080 en ./video
// Fondos: MP4 H.264. Transiciones con alfa: MOV ProRes 4444 y una vista previa en MP4.
// Uso: node ciudad-caracola/render-video.js [pagina.html] [id …]   (por defecto animaciones.html; sin ids exporta todo)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const FPS = 24;

(async () => {
  const args = process.argv.slice(2);
  const pageFile = args[0] && args[0].endsWith('.html') ? args.shift() : 'animaciones.html';
  const only = args;
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ proxy });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: !!proxy });
  await page.goto('file://' + path.join(__dirname, pageFile) + '#render');
  await page.evaluate(() => Promise.all(['200 64px Urbanist', 'italic 300 46px Urbanist', '800 190px Urbanist', 'italic 300 190px Urbanist'].map(f => document.fonts.load(f))));
  if (!(await page.evaluate(() => document.fonts.check('800 190px Urbanist')))) console.warn('Aviso: no cargó la fuente Urbanist');
  await page.evaluate(() => {
    const cv = document.createElement('canvas');
    cv.width = 1920; cv.height = 1080; cv.id = 'out';
    document.body.appendChild(cv);
  });
  const clips = await page.evaluate(() => CLIPS.map(c => ({ id: c.id, dur: c.dur, alpha: !!c.alpha, preview: !!c.preview })));
  async function encode(file, frames, id, withPreview, codec) {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...codec, '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < frames; f++) {
      const b64 = await page.evaluate(([id, t, wp]) => {
        const cv = document.getElementById('out');
        renderFrame(cv, CLIPS.find(c => c.id === id), t, 1, wp);
        return cv.toDataURL('image/png').slice(22);
      }, [id, f / FPS, withPreview]);
      if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
  }
  const outDir = path.join(__dirname, 'video');
  fs.mkdirSync(outDir, { recursive: true });

  for (const clip of clips) {
    if (only.length && !only.includes(clip.id)) continue;
    const file = path.join(outDir, clip.id + (clip.alpha ? '.mov' : '.mp4'));
    const codec = clip.alpha
      ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le']
      : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
    const frames = Math.round(clip.dur * FPS);
    await encode(file, frames, clip.id, false, codec);
    if (clip.alpha) {
      // vista previa en MP4: sobre el fondo de prueba de la página si lo tiene, si no sobre gris neutro
      const prev = path.join(outDir, clip.id + '-vista-previa.mp4');
      if (clip.preview) await encode(prev, frames, clip.id, true, ['-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']);
      else await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=0x5d6c74:s=1920x1080:r=${FPS}`, '-i', file,
        '-filter_complex', '[0][1]overlay=shortest=1', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', prev], { stdio: 'inherit' })
        .on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
    }
    console.log(path.basename(file), frames + ' cuadros');
  }
  await browser.close();
})();
