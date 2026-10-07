// Captures real screens of the financial tool with example data.
// Usage: node capture.mjs <path/to/index.html> <outDir>
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire('/opt/node22/lib/node_modules/');
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node-tools/node_modules/playwright'); }

const [appPath, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const url = 'file://' + path.resolve(appPath);
const meta = { shots: {}, taps: {} };

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

async function newPage(seed) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 808 }, deviceScaleFactor: 2, locale: 'es-CO', timezoneId: 'America/Bogota' });
  // Only fonts may load. Everything else (the app's backend, SheetJS, WhatsApp) is blocked.
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith('file://') || u.includes('fonts.googleapis.com') || u.includes('fonts.gstatic.com')) return route.continue();
    return route.abort();
  });
  await ctx.addInitScript((s) => {
    localStorage.clear();
    if (s) localStorage.setItem('la-propia-state', JSON.stringify(s));
  }, seed || null);
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.dismiss());
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.screen{animation:none !important} .btn,.toggle-btn,.type-btn,.cat-btn{transition:none !important}' });
  await page.waitForTimeout(300);
  return page;
}

async function shot(page, key, { full = true } = {}) {
  await page.evaluate(() => { const n = document.getElementById('bottom-nav'); if (n) { n.dataset.prev = n.style.display; n.style.visibility = 'hidden'; } });
  const file = path.join(outDir, key + '.png');
  await page.screenshot({ path: file, fullPage: full });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate(() => { const n = document.getElementById('bottom-nav'); if (n) n.style.visibility = 'visible'; });
  meta.shots[key] = { file: key + '.png', height: full ? h : 808 };
}
async function tap(page, key, selector) {
  const b = await page.locator(selector).first().boundingBox();
  const sy = await page.evaluate(() => window.scrollY);
  meta.taps[key] = { x: b.x + b.width / 2, y: b.y + sy + b.height / 2 };
}
async function navShot(page, key) {
  await page.locator('#bottom-nav').screenshot({ path: path.join(outDir, key + '.png') });
}

// ---------- Bienvenida y mapeo (sin datos) ----------
{
  const page = await newPage(null);
  for (const [i, v] of ['', 'L', 'Lu', 'Luz'].entries()) {
    await page.fill('#user-name', v);
    await shot(page, 'ob1_' + i, { full: false });
  }
  await tap(page, 'ob1_empezar', '#btn-access');
  await page.evaluate(() => { state.name = 'Luz'; state.accessCode = 'EM-EJEMPLO'; startDiagnostico(); });
  await page.waitForTimeout(150);
  await shot(page, 'quiz1', { full: false });
  await tap(page, 'quiz1_opt', '#diag-options .btn:nth-child(2)');
  await page.evaluate(() => document.querySelector('#diag-options .btn:nth-child(2)').classList.add('selected'));
  await shot(page, 'quiz1_sel', { full: false });
  await page.evaluate(() => {
    const ans = { presupuesto: 1, ahorro: 1, deudas: 2, sistema: 1, registro: 0, costeo: 1, planeacion: 2 };
    diag = { index: 0, answers: {} };
    DIAG_QUESTIONS.forEach((q) => { diag.answers[q.cat] = ans[q.cat]; });
    diag.index = DIAG_QUESTIONS.length - 1;
    finishDiagnostico();
  });
  await page.waitForTimeout(200);
  await shot(page, 'resultado');
  await page.context().close();
}

// ---------- La app con datos de ejemplo ----------
const now = new Date();
const daysAgo = (d, h = 10) => { const x = new Date(now); x.setDate(x.getDate() - d); x.setHours(h, 15, 0, 0); return x.toISOString(); };
const yest = new Date(now); yest.setDate(yest.getDate() - 1);
const key = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const seed = {
  onboarded: true, track: 2, firstGoal: 'Saber cuánto necesito vender cada mes', accessCode: 'EM-EJEMPLO', name: 'Luz', llaveVista: true,
  homeScreenStatus: 'yes', scope: 'personal', regScope: 'personal', regType: 'Gasto', regCategory: null,
  month: 'OCTUBRE 2026', streak: 6, lastVisit: key(yest), joinedAt: daysAgo(30),
  diagnostico: { answers: { presupuesto: 1, ahorro: 1, deudas: 2, sistema: 1, registro: 0, costeo: 1, planeacion: 2 }, completedAt: daysAgo(20) },
  funds: [
    { id: 11, name: 'Fondo de emergencia', scope: 'personal', current: 620000, goal: 1500000 },
    { id: 12, name: 'Plancha nueva', scope: 'negocio', current: 900000, goal: 2400000 },
    { id: 13, name: 'Útiles del colegio', scope: 'personal', current: 180000, goal: 400000 },
  ],
  debts: [
    { id: 21, name: 'Crédito de la cooperativa', type: 'formal', original: 3000000, remaining: 1800000 },
    { id: 22, name: 'Préstamo de mi hermana', type: 'informal', original: 500000, remaining: 200000 },
  ],
  fundsTab: 'ahorro',
  fixedCosts: [
    { id: 31, name: 'Arriendo del puesto', value: 450000 },
    { id: 32, name: 'Gas y servicios', value: 120000 },
    { id: 33, name: 'Plan de celular', value: 60000 },
  ],
  costPrice: 3500, costVariable: 1400, costosTab: 'equilibrio',
  products: [
    { id: 41, name: 'Arepa con queso', price: 3500, variable: 1400 },
    { id: 42, name: 'Combo arepa + bebida', price: 6000, variable: 2600 },
  ],
  transactions: {
    personal: { ingresos: 1850000, gastos: 1120000, historial: [
      { id: 101, type: 'Gasto', scope: 'personal', category: 'Comida', amount: 64000, date: daysAgo(0, 13) },
      { id: 102, type: 'Gasto', scope: 'personal', category: 'Transporte', amount: 12000, date: daysAgo(1) },
      { id: 103, type: 'Ingreso', scope: 'personal', category: 'Ingreso', amount: 900000, date: daysAgo(3) },
      { id: 104, type: 'Gasto', scope: 'personal', category: 'Hogar', amount: 210000, date: daysAgo(5) },
    ] },
    negocio: { ingresos: 3200000, gastos: 1450000, historial: [
      { id: 201, type: 'Venta', scope: 'negocio', category: 'Ventas', amount: 142000, date: daysAgo(1, 18) },
      { id: 202, type: 'Gasto', scope: 'negocio', category: 'Insumos', amount: 96000, date: daysAgo(2) },
      { id: 203, type: 'Venta', scope: 'negocio', category: 'Ventas', amount: 118000, date: daysAgo(2, 19) },
      { id: 204, type: 'Gasto', scope: 'negocio', category: 'Marketing', amount: 30000, date: daysAgo(4) },
    ] },
  },
};
{
  const page = await newPage(seed);
  for (const n of ['home', 'registrar', 'fondos', 'costos', 'aprender']) {
    await page.evaluate((id) => navTo('screen-' + id), n);
    await page.waitForTimeout(80);
    await navShot(page, 'nav_' + n);
  }
  await page.evaluate(() => navTo('screen-home'));
  await page.waitForTimeout(150);
  await shot(page, 'home_personal');
  await tap(page, 'home_tab_negocio', '#tab-negocio');
  await page.evaluate(() => switchScope('negocio'));
  await shot(page, 'home_negocio');
  await tap(page, 'nav_registrar', '#bottom-nav .nav-item:nth-child(2)');

  await page.evaluate(() => { switchScope('personal'); navTo('screen-registrar'); });
  await page.waitForTimeout(100);
  await shot(page, 'reg_0');
  await tap(page, 'reg_venta', '.type-btn[data-val="Venta"]');
  await page.click('.type-btn[data-val="Venta"]');
  await tap(page, 'reg_negocio', '#reg-tab-negocio');
  await page.click('#reg-tab-negocio');
  await shot(page, 'reg_1');
  for (const [i, v] of ['8', '85', '850', '8500', '85000'].entries()) {
    await page.fill('#reg-amount', v);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await shot(page, 'reg_a' + (i + 1));
  }
  await tap(page, 'reg_cat', '.cat-btn[data-id="ventas"]');
  await page.click('.cat-btn[data-id="ventas"]');
  await shot(page, 'reg_cat');
  await tap(page, 'reg_guardar', '#screen-registrar .btn-primary');
  await page.evaluate(() => { saveTransaction(); });
  await page.waitForTimeout(450);
  await page.locator('#toast').screenshot({ path: path.join(outDir, 'toast_reg.png') });
  await page.evaluate(() => { state.scope = 'negocio'; navTo('screen-home'); switchScope('negocio'); document.getElementById('toast').classList.remove('show'); });
  await page.waitForTimeout(450);
  await shot(page, 'home_negocio_after');

  await page.evaluate(() => navTo('screen-fondos'));
  await page.evaluate(() => switchFundsTab('ahorro'));
  await shot(page, 'fondos_ahorro');
  await tap(page, 'fondos_tab_deudas', '#tab-deudas');
  await page.evaluate(() => switchFundsTab('deudas'));
  await shot(page, 'fondos_deudas');

  await page.evaluate(() => navTo('screen-costos'));
  await page.evaluate(() => switchCostosTab('equilibrio'));
  await shot(page, 'costos_eq');
  const be = await page.locator('.breakeven-visual').first().boundingBox();
  meta.taps.costos_breakeven_top = { x: be.x + be.width / 2, y: be.y + (await page.evaluate(() => window.scrollY)) };
  await tap(page, 'costos_tab_productos', '#tab-productos');
  await page.evaluate(() => switchCostosTab('productos'));
  await shot(page, 'costos_productos');

  await page.evaluate(() => navTo('screen-aprender'));
  await shot(page, 'aprender');
  await tap(page, 'aprender_first', '#lessons-list .lesson-card');
  await page.evaluate(() => openLesson(document.querySelector('#lessons-list .lesson-card').getAttribute('onclick').match(/\d+/)[0] * 1));
  await shot(page, 'leccion');
  await page.context().close();
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 1));
console.log('ok', Object.keys(meta.shots).length, 'shots');
