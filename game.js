'use strict';

/* ============================================================
   SUPER PABLO BROS - EDICIÓN CRIPTO
   Toro con superpoderes vs. osos ladrones. 50 niveles, alas, balas ∞ y ayudantes.
   ============================================================ */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const TILE = 32;
const ROWS = 14;
const FLOOR = 12 * TILE;
const SMALL_W = 26, SMALL_H = 32;
const BIG_W = 30, BIG_H = 54;
const TOTAL_LEVELS = 50;
const WALLET = 'bc1qdemo0pablo0bros0toro0x7h4k9m2v';
const SATS_PER_BTC = 100000000;

/* Opciones del juego. Todo funciona sin internet; los valores son ficticios. */
const DEFAULT_OPT = {
  music: 'clasica', sfxStyle: 'retro', volume: 70, sfx: true,
  btcPrice: 65000, coinSats: 10000,
  infiniteSky: true, altcoins: true, fireworks: true,
  levelMusic: true, hiddenCoins: true, coinMagnet: true,
  infiniteFire: true, infiniteSuper: true, doubleW: true,
  autoFire: true, wings: true,
  screenMode: 'auto', touchLayout: 'auto', hudSize: 'normal'
};
const MUSIC_STYLES = ['clasica', 'arcade', 'espacial', 'off'];
const SFX_STYLES = ['retro', 'suave', 'potente'];
const SAT_CHOICES = [1000, 5000, 10000, 25000, 50000];
const PRICE_CHOICES = [25000, 65000, 100000, 250000, 500000];
const SCREEN_MODES = ['auto', 'pixel', 'suave', 'ancho', 'vertical'];
const TOUCH_LAYOUTS = ['auto', 'izquierda', 'derecha', 'compacto'];
const HUD_SIZES = ['normal', 'grande'];
const FINAL_BONUS_SATS = 1000000;
let OPT = { ...DEFAULT_OPT };
try {
  const savedOpt = JSON.parse(localStorage.getItem('spb_options') || 'null');
  if (savedOpt && typeof savedOpt === 'object') Object.assign(OPT, savedOpt);
} catch (e) { /* almacenamiento local opcional */ }
if (!MUSIC_STYLES.includes(OPT.music)) OPT.music = DEFAULT_OPT.music;
if (!SFX_STYLES.includes(OPT.sfxStyle)) OPT.sfxStyle = DEFAULT_OPT.sfxStyle;
if (!SAT_CHOICES.includes(OPT.coinSats)) OPT.coinSats = DEFAULT_OPT.coinSats;
if (!PRICE_CHOICES.includes(OPT.btcPrice)) OPT.btcPrice = DEFAULT_OPT.btcPrice;
if (!SCREEN_MODES.includes(OPT.screenMode)) OPT.screenMode = DEFAULT_OPT.screenMode;
if (!TOUCH_LAYOUTS.includes(OPT.touchLayout)) OPT.touchLayout = DEFAULT_OPT.touchLayout;
if (!HUD_SIZES.includes(OPT.hudSize)) OPT.hudSize = DEFAULT_OPT.hudSize;
OPT.volume = Math.max(0, Math.min(100, Number(OPT.volume) || 70));
function saveOpt() {
  try { localStorage.setItem('spb_options', JSON.stringify(OPT)); } catch (e) { /* ignorar */ }
}
function applyScreenMode() {
  try {
    document.body.dataset.screen = OPT.screenMode;
    document.body.dataset.touch = OPT.touchLayout;
    document.body.dataset.hud = OPT.hudSize;
    canvas.style.imageRendering = OPT.screenMode === 'suave' ? 'auto' : 'pixelated';
    ctx.imageSmoothingEnabled = OPT.screenMode === 'suave';
  } catch (e) { /* el juego sigue aunque no haya body */ }
}
applyScreenMode();
function fmt(n) { return Math.floor(n).toLocaleString('es-ES'); }
function satsTotal() { return Math.floor(coinCount) * OPT.coinSats + bonusSats; }
function btcTotal() { return satsTotal() / SATS_PER_BTC; }
function usdTotal() { return btcTotal() * OPT.btcPrice; }
function usdText() {
  return '$' + usdTotal().toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* Monedas: BTC siempre + 8 altcoins que se desbloquean del nivel 2 al 9 */
const ALT = [
  { key: 'BTC',  sym: '₿', ch: 'q', color: '#f7931a' },
  { key: 'ETH',  sym: 'Ξ', ch: 'E', color: '#8c9eff' },
  { key: 'BNB',  sym: 'B', ch: 'N', color: '#f3ba2f' },
  { key: 'SOL',  sym: 'S', ch: 'S', color: '#14f195' },
  { key: 'HYPE', sym: 'H', ch: 'H', color: '#ff6ec7' },
  { key: 'DOGE', sym: 'Ð', ch: 'D', color: '#c3a634' },
  { key: 'OP',   sym: 'O', ch: 'O', color: '#ff6b6b' },
  { key: 'USDT', sym: 'T', ch: 'T', color: '#26a17b' },
  { key: 'GRAM', sym: 'G', ch: 'G', color: '#b388ff' }
];
let WALLETS = {};
function resetWallets() { WALLETS = {}; for (const a of ALT) WALLETS[a.key] = 0; }
function addWallet(key, n = 1) { WALLETS[key] = (WALLETS[key] || 0) + n; }

/* Armas: se cambian con C. INFIERNO se desbloquea en los niveles 8-10 */
const WEAPONS = [
  { name: 'RAYO',     cd: 70, speed: 10,   life: 75,  kind: 'bolt',    color: '#8be9fd', power: 3 },
  { name: 'LLAMA',    cd: 26, speed: 7,    life: 36,  kind: 'flame',   color: '#ff9d3b', power: 1 },
  { name: 'FUEGO',    cd: 46, speed: 8.5,  life: 58,  kind: 'fireball',color: '#ff6b2e', power: 2 },
  { name: 'INFIERNO', cd: 88, speed: 11,   life: 105, kind: 'inferno', color: '#fff36b', power: 9 }
];

/* Ayudantes que se desbloquean y recogen monedas por ti */
const HELPERS = [
  { name: 'ZORRO', color: '#ff9d3b', dark: '#a34d12' },
  { name: 'CONEJO', color: '#e8e6f5', dark: '#8b88a6' },
  { name: 'PÁJARO', color: '#8be9fd', dark: '#2b8ba8' },
  { name: 'ROBOT', color: '#b388ff', dark: '#5b3a9e' }
];

/* Melodías chiptune diferentes por nivel (notas MIDI) */
const MUSIC = [
  { n: [72,76,79,76,72,69,67,69], b: [48,55,52,55], t: 9 },
  { n: [69,72,76,72,74,72,69,67], b: [45,52,50,52], t: 8 },
  { n: [76,79,83,79,76,74,72,74], b: [52,59,55,59], t: 7 },
  { n: [67,71,74,71,69,67,64,67], b: [43,50,47,50], t: 8 },
  { n: [74,78,81,78,74,72,69,72], b: [50,57,53,57], t: 7 },
  { n: [65,69,72,69,76,72,69,65], b: [41,48,45,48], t: 9 },
  { n: [79,83,86,83,79,76,74,76], b: [55,62,59,62], t: 7 },
  { n: [71,74,78,74,83,79,78,74], b: [47,54,51,54], t: 6 },
  { n: [81,84,88,84,81,79,76,79], b: [57,64,60,64], t: 6 },
  { n: [72,76,79,84,88,84,79,76], b: [48,55,52,59], t: 6 }
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);

function rect(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/* Tu foto del final */
const thanksImg = new Image();
thanksImg.src = 'gracias.jpeg';

/* ---------------- GENERADOR DE NIVELES ---------------- */

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeClassicLevel(i) {
  const R = mulberry32(90210 + i * 7919);
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const cols = 150 + ri(0, 3) * 8;
  const flag = cols - 7;

  const gaps = [];
  let gx = 18 + ri(0, 6);
  while (gx < flag - 12) {
    gaps.push([gx, gx + ri(2, 3)]);
    gx += ri(18, 28);
  }
  const inGap = x => gaps.some(g => x >= g[0] && x < g[1]);

  const groundRanges = [];
  let start = 0;
  for (const [a, b] of gaps) {
    if (a > start) groundRanges.push([start, a]);
    start = b;
  }
  groundRanges.push([start, cols]);

  const blocks = [];
  let bx = 9;
  while (bx < flag - 8) {
    if (!inGap(bx)) {
      const patterns = ['qbq', 'bqb', 'qqq', 'bsb', 'qmq', 'bbq'];
      blocks.push({ x: bx, y: ri(7, 9), p: patterns[ri(0, patterns.length - 1)] });
      /* Del nivel 2 en adelante: escaleras de bloques hacia el cielo */
      if (i >= 1) {
        blocks.push({ x: bx, y: 5, p: 'bb' });
        blocks.push({ x: bx + 1, y: 3, p: 'bb' });
        const avail = ALT.slice(1, Math.min(ALT.length, i + 1));
        const a = avail[ri(0, avail.length - 1)];
        blocks.push({ x: bx, y: ri(1, 2), p: a.ch + a.ch + 'q' });
      }
    }
    bx += ri(8, 14);
  }

  const pipes = [];
  let px = 24;
  while (px < flag - 14) {
    if (!inGap(px) && !inGap(px + 1)) pipes.push({ x: px, h: ri(1, 2) });
    px += ri(24, 38);
  }

  const springs = [];
  for (let k = 0; k < 3 + i; k++) {
    const sx = ri(16, flag - 16);
    if (!inGap(sx)) springs.push({ x: sx, y: 11 });
  }

  const platforms = [];
  for (let k = 0; k < 4 + (i % 3); k++) {
    const x = ri(12, flag - 12);
    if (!inGap(x) && !inGap(x + 2)) platforms.push({ x, y: ri(6, 8), w: ri(2, 4) });
  }

  /* Nubes viajeras a la altura del super salto */
  const clouds = [];
  for (let x = 22; x < flag - 10; x += 36) {
    if (!inGap(x)) clouds.push({ x: x * TILE, y: 3 * TILE, w: 74, h: 26, dir: ri(0, 1) ? 1 : -1 });
  }

  /* Bitcoin por todas partes: suelo, aire y cielo para la nube */
  const coins = [];
  for (let x = 3; x < flag + 2; x++) {
    if (!inGap(x)) {
      coins.push({ x: x * TILE + 8, y: 11 * TILE, taken: false });
      if (x % 2 === 0) coins.push({ x: x * TILE + 8, y: 9 * TILE, taken: false });
      if (x % 4 === 0) coins.push({ x: x * TILE + 8, y: 7 * TILE, taken: false });
      if (x % 2 === 0) coins.push({ x: x * TILE + 8, y: 3 * TILE, taken: false });
      if (x % 3 === 0) coins.push({ x: x * TILE + 8, y: 2 * TILE, taken: false });
    } else {
      coins.push({ x: x * TILE + 8, y: 10 * TILE, taken: false });
      coins.push({ x: x * TILE + 8, y: 8 * TILE, taken: false });
    }
  }

  const enemies = [];
  const bearCount = 3 + i;
  for (let k = 0; k < bearCount; k++) {
    const ex = 14 + ri(0, Math.max(1, flag - 28));
    if (!inGap(ex)) enemies.push({ x: ex });
  }

  /* Monedas ocultísimas solo en los 3 últimos niveles */
  const hidden = [];
  if (i >= 7) {
    for (let k = 0; k < 14 + i; k++) {
      const hx = ri(8, flag - 8);
      const hy = k % 3 === 0 ? ri(-16, -3) : ri(4, 11);
      const a = ALT[1 + ri(0, Math.min(7, i))];
      hidden.push({ x: hx * TILE + 8, y: hy * TILE, taken: false, key: a.key });
    }
  }

  return {
    name: 'NIVEL 1-' + (i + 1),
    short: (i + 1) + '/' + TOTAL_LEVELS,
    time: 300,
    sky: i % 2 === 0 ? ['#43a9f0', '#bfe6ff'] : ['#2f4b8f', '#f3a26b'],
    cols, flag, groundRanges, blocks, pipes, springs, platforms, clouds, coins, enemies, hidden
  };
}

/* Bloques premio en todos los niveles: balas, ropa, flor, orejas y alas. */
function addGiftBlocks(cfg, i) {
  const R = mulberry32(3311 + i * 104729);
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const gifts = ['!', '@', '*', '^', '+'];
  const onGround = x => !cfg.groundRanges || cfg.groundRanges.some(([a, b]) => x >= a && x < b - 2);
  const count = 8 + (i % 4);
  for (let k = 0; k < count; k++) {
    let x = ri(12, Math.max(13, cfg.flag - 12));
    for (let t = 0; t < 14 && !onGround(x); t++) x = ri(12, Math.max(13, cfg.flag - 12));
    cfg.blocks.push({ x, y: ri(5, 9), p: gifts[k % gifts.length] + 'q' });
  }
}
function makeLevel(i) {
  const cfg = (i >= 10 && typeof window.SPBBuildLevel === 'function')
    ? window.SPBBuildLevel(i, { TOTAL_LEVELS, ALT })
    : makeClassicLevel(i);
  if (!cfg.theme) cfg.theme = 'clasico';
  if (!cfg.themeName) cfg.themeName = 'CAMPO CRIPTO';
  addGiftBlocks(cfg, i);
  return cfg;
}

const LEVELS = Array.from({ length: TOTAL_LEVELS }, (_, i) => makeLevel(i));

/* ---------------- ESTADO ---------------- */

let state = 'title';
let levelIndex = 0;
let cfg, cols, grid, p, bears, coins, goldCoins, hiddenCoins, skyTiles, skyTop;
let clouds, powerups, particles, texts, bumps, bolts, flag, safe, helpers, car, finalCoinT;
let ladders, fallers, asteroids;
let score = 0, coinCount = 0, stolenBack = 0, pipeCoins = 0, cloudCoins = 0, secretsFound = 0, bonusSats = 0;
let timer = 300, timerTicks = 0, tick = 0, camX = 0, camY = 0;
let coyote = 0, jumpBuffer = 8;
let jumpPressed = false, superPressed = false, boltPressed = false, downPressed = false, switchPressed = false;
let superCd = 0, boltCd = 0, clearCounter = 0;
let weapon = 0;
let lastWPress = -999, dashUntil = 0, magnetUntil = 0, chargedJumps = 0;
let cloudRide = null;
let mainWorld = null, bonusExitX = 0, bonusReturnX = 0;
let walletPaid = false, walletFlash = 0;
let payoutCounter = 0, payoutQueue = [], payoutIndex = 0, payoutSparks = [], fireworks = [];
let musicPos = 0;
let bullGear = { outfit: 0, flower: false, ears: false, wings: 1, bullets: 0 };
let pausedFrom = 'playing';
let optTab = 0, optRow = 0;
let muted = false, audioCtx = null;
resetWallets();

/* ---------------- AUDIO ---------------- */

function beep(freq, dur = 0.08, type = 'square', vol = 0.05, slide = 0, isMusic = false) {
  if (muted || (!isMusic && !OPT.sfx) || (isMusic && OPT.music === 'off')) return;
  vol *= OPT.volume / 70;
  if (!isMusic) {
    if (OPT.sfxStyle === 'suave') { type = type === 'square' ? 'triangle' : type; vol *= 0.8; }
    else if (OPT.sfxStyle === 'potente') { type = type === 'triangle' ? 'sawtooth' : type; vol *= 1.15; }
  }
  if (vol <= 0.0004) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const now = audioCtx.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), now + dur);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(now); o.stop(now + dur + 0.01);
  } catch (e) { /* audio opcional */ }
}

const SFX = {
  jump: () => beep(340, 0.12, 'square', 0.05, 320),
  super: () => { [220, 330, 440, 660, 880, 1320].forEach((f, i) => setTimeout(() => beep(f, 0.1, 'sawtooth', 0.045), i * 55)); },
  bolt: () => beep(1400, 0.09, 'sawtooth', 0.045, -900),
  coin: () => { beep(980, 0.05, 'square', 0.04); setTimeout(() => beep(1320, 0.08, 'square', 0.04), 45); },
  stomp: () => beep(260, 0.1, 'square', 0.05, -170),
  steal: () => beep(300, 0.22, 'sawtooth', 0.045, -210),
  bump: () => beep(120, 0.05, 'square', 0.035, -40),
  breakk: () => beep(180, 0.09, 'sawtooth', 0.045, -110),
  power: () => { [520, 660, 820, 1040].forEach((f, i) => setTimeout(() => beep(f, 0.09, 'square', 0.045), i * 70)); },
  flag: () => { [440, 554, 659, 880, 1108, 1320].forEach((f, i) => setTimeout(() => beep(f, 0.14, 'square', 0.05), i * 100)); },
  start: () => { [392, 523, 659].forEach((f, i) => setTimeout(() => beep(f, 0.1, 'square', 0.04), i * 80)); },
  flame: () => beep(620, 0.09, 'sawtooth', 0.035, -330),
  fireball: () => beep(380, 0.16, 'sawtooth', 0.045, 520),
  inferno: () => { beep(90, 0.3, 'sawtooth', 0.06, 260); beep(720, 0.18, 'square', 0.03, -400); },
  secret: () => { [880, 1108, 1320, 1760].forEach((f, i) => setTimeout(() => beep(f, 0.11, 'square', 0.04), i * 55)); },
  wallet: () => beep(1480, 0.04, 'square', 0.02, 240)
};

/* ---------------- CARGA ---------------- */

/* Bloques premio: 21 balas · 22 ropa · 23 flor · 24 orejas · 25 alas */
const GIFT_TILES = { '!': 21, '@': 22, '*': 23, '^': 24, '+': 25 };

function code(c) {
  const ai = ALT.findIndex(a => a.ch === c);
  if (ai > 0) return OPT.altcoins ? 12 + ai : 6;
  if (GIFT_TILES[c]) return GIFT_TILES[c];
  return c === 'q' ? 3 : c === 'm' ? 4 : c === 's' ? 5 : c === 'b' ? 2 : 6;
}
function setTile(tx, ty, v) {
  if (ty < 0) { if (!mainWorld) skyTiles.set(tx + ',' + ty, v); }
  else if (ty >= 0 && ty < ROWS && tx >= 0 && tx < cols) grid[ty][tx] = v;
}
function altTile(key) { return 12 + ALT.findIndex(a => a.key === key); }

function loadLevel(index, keepStats) {
  levelIndex = index;
  cfg = LEVELS[index];
  if (!cfg.theme) cfg.theme = 'clasico';
  if (!cfg.themeName) cfg.themeName = 'CAMPO CRIPTO';
  cols = cfg.cols;
  grid = Array.from({ length: ROWS }, () => new Array(cols).fill(0));

  cfg.groundRanges.forEach(([a, b]) => {
    for (let x = a; x < b; x++) { grid[12][x] = 1; grid[13][x] = 1; }
  });
  cfg.blocks.forEach(b => {
    b.p.split('').forEach((c, i) => {
      const x = b.x + i;
      if (x >= 0 && x < cols && b.y >= 0 && b.y < ROWS) grid[b.y][x] = code(c);
    });
  });
  cfg.pipes.forEach(pipe => {
    const top = 12 - pipe.h;
    grid[top][pipe.x] = 7; grid[top][pipe.x + 1] = 8;
    for (let y = top + 1; y < 12; y++) { grid[y][pipe.x] = 9; grid[y][pipe.x + 1] = 10; }
  });
  cfg.springs.forEach(s => { grid[s.y][s.x] = 12; });
  cfg.platforms.forEach(pl => {
    for (let x = pl.x; x < pl.x + pl.w; x++) if (x < cols) grid[pl.y][x] = 11;
  });

  coins = cfg.coins.map(c => ({ ...c }));
  goldCoins = [];
  hiddenCoins = OPT.hiddenCoins ? (cfg.hidden || []).map(c => ({ ...c })) : [];
  skyTiles = new Map();
  skyTop = -1;
  clouds = cfg.clouds.map(c => ({ ...c }));
  ladders = cfg.ladders || [];
  fallers = (cfg.fallers || []).map(f => ({ ...f, active: true, startY: f.y }));
  asteroids = (cfg.asteroids || []).map(a => ({ ...a, active: true, spin: 0, startY: a.y }));
  bears = cfg.enemies.map((e, i) => ({
    x: e.x * TILE + 3, y: FLOOR - 28, w: 28, h: 28,
    vx: (i % 2 === 0 ? -0.55 : 0.7), vy: 0,
    anim: Math.random() * 6, dead: false, squash: 0, loot: 0, stealCd: 0,
    kind: cfg.theme === 'space' ? 'drone' : cfg.theme === 'kong' ? 'worker' : cfg.theme === 'tetris' ? 'block' : 'bear'
  }));

  powerups = []; particles = []; texts = []; bumps = []; bolts = [];
  const flagScale = 1 + (index / Math.max(1, TOTAL_LEVELS - 1)) * 1.35;
  flag = {
    x: cfg.flag * TILE, bottom: FLOOR, scale: flagScale,
    top: Math.max(8, FLOOR - 6 * TILE * flagScale)
  };
  finalCoinT = -1;

  p = {
    x: 3 * TILE, y: FLOOR - SMALL_H, w: SMALL_W, h: SMALL_H,
    vx: 0, vy: 0, onGround: false, big: false,
    star: 0, shield: 0, face: 1, anim: 0,
    wingLevel: OPT.wings ? Math.max(1, bullGear.wings) : 0, wingActive: false, wingFlap: 0,
    bulletLevel: bullGear.bullets, outfit: bullGear.outfit,
    flower: bullGear.flower, ears: bullGear.ears
  };
  safe = { x: p.x, y: p.y };

  const helperCount = index >= 39 ? 4 : index >= 29 ? 3 : index >= 19 ? 2 : index >= 9 ? 1 : 0;
  helpers = [];
  for (let k = 0; k < helperCount; k++) {
    helpers.push({
      x: p.x - 34 - k * 28, y: p.y + 4, w: 18, h: 18,
      bob: k * 1.7, kind: k, cooldown: 0
    });
  }
  car = cfg.car ? { x: p.x - 12, y: p.y + p.h - 10, w: p.w + 24, h: 18, wheel: 0 } : null;

  if (!keepStats) {
    score = 0; coinCount = 0; stolenBack = 0; secretsFound = 0; bonusSats = 0;
    pipeCoins = 0; cloudCoins = 0; walletPaid = false; walletFlash = 0;
    payoutQueue = []; payoutIndex = 0; payoutSparks = []; fireworks = [];
    resetWallets();
    bullGear = { outfit: 0, flower: false, ears: false, wings: OPT.wings ? 1 : 0, bullets: 0 };
    musicPos = 0;
    weapon = 0;
  }
  timer = cfg.time;
  timerTicks = 0;
  camX = 0;
  camY = 0;
  weapon = levelIndex < 7 ? Math.min(weapon, 2) : weapon;
  coyote = 0;
  jumpBuffer = 0;
  jumpPressed = false;
  superPressed = false;
  boltPressed = false;
  switchPressed = false;
  downPressed = false;
  clearCounter = 0;
  superCd = 0;
  boltCd = 0;
  lastWPress = -999; dashUntil = 0; magnetUntil = 0; chargedJumps = 0;
  cloudRide = null;
  mainWorld = null;
}

/* ---------------- TUBERÍA SECRETA ---------------- */

function buildBonus() {
  const bc = 64;
  const g = Array.from({ length: ROWS }, () => new Array(bc).fill(0));
  for (let x = 0; x < bc; x++) { g[12][x] = 1; g[13][x] = 1; }
  for (let x = 6; x < bc - 8; x += 5) { g[9][x] = 3; g[9][x + 1] = 2; }
  for (let x = 12; x < bc - 10; x += 9) { g[6][x] = 11; g[6][x + 1] = 11; g[6][x + 2] = 11; }
  const cs = [];
  for (let x = 3; x < bc - 3; x++) {
    cs.push({ x: x * TILE + 8, y: 11 * TILE, taken: false });
    if (x % 2 === 0) cs.push({ x: x * TILE + 8, y: 9 * TILE, taken: false });
    if (x % 3 === 0) cs.push({ x: x * TILE + 8, y: 7 * TILE, taken: false });
  }
  return { grid: g, cols: bc, coins: cs, exitX: bc - 6 };
}

function enterPipe() {
  if (state !== 'playing') return;
  mainWorld = { grid, cols, coins, bears, clouds, flag, cfg, helpers, car };
  const b = buildBonus();
  grid = b.grid; cols = b.cols; coins = b.coins;
  bears = []; clouds = []; helpers = []; car = null;
  flag = { x: 1e9, top: 0, bottom: FLOOR, scale: 1 };
  bonusExitX = b.exitX;
  bonusReturnX = p.x + TILE * 2;
  state = 'bonus';
  p.x = 3 * TILE; p.y = FLOOR - p.h; p.vx = 0; p.vy = 0;
  safe = { x: p.x, y: p.y };
  camX = 0;
  cloudRide = null;
  jumpBuffer = 0;
  coyote = 0;
  SFX.power();
  spawnText(p.x, p.y - 24, '¡TÚNEL DE BITCOIN!');
  spawnParticles(p.x + 12, p.y + 12, '#43d465', 16);
}

function exitBonus() {
  if (!mainWorld) return;
  grid = mainWorld.grid; cols = mainWorld.cols;
  coins = mainWorld.coins; bears = mainWorld.bears;
  clouds = mainWorld.clouds; flag = mainWorld.flag; cfg = mainWorld.cfg;
  helpers = mainWorld.helpers || []; car = mainWorld.car || null;
  state = 'playing';
  p.x = bonusReturnX; p.y = FLOOR - p.h; p.vx = 0; p.vy = 0;
  safe = { x: p.x, y: p.y };
  camX = clamp(p.x - W * 0.38, 0, Math.max(0, cols * TILE - W));
  mainWorld = null;
  jumpBuffer = 0;
  coyote = 0;
  SFX.flag();
  spawnText(p.x, p.y - 24, '¡DE VUELTA!');
}

/* ---------------- COLISIONES ---------------- */

function tileAt(tx, ty) {
  if (tx < 0 || tx >= cols) return 0;
  if (ty < 0) return mainWorld ? 0 : (skyTiles.get(tx + ',' + ty) || 0);
  if (ty >= ROWS) return 0;
  return grid[ty][tx];
}
function solidTile(tx, ty) {
  if (tx < 0) return true;
  if (tx >= cols) return false;
  const t = tileAt(tx, ty);
  return t === 1 || t === 2 || t === 3 || t === 4 || t === 5 || t === 6 ||
         (t >= 7 && t <= 10) || t === 12 || (t >= 13 && t <= 25);
}
function solidAt(px, py) { return solidTile(Math.floor(px / TILE), Math.floor(py / TILE)); }
function rectHitsSolid(x, y, w, h) {
  const x0 = Math.floor(x / TILE), x1 = Math.floor((x + w - 1) / TILE);
  const y0 = Math.floor(y / TILE), y1 = Math.floor((y + h - 1) / TILE);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      if (solidTile(tx, ty)) return true;
  return false;
}
function moveX(ent, dx) {
  ent.x += dx;
  const x0 = Math.floor(ent.x / TILE), x1 = Math.floor((ent.x + ent.w - 1) / TILE);
  const y0 = Math.floor(ent.y / TILE), y1 = Math.floor((ent.y + ent.h - 1) / TILE);
  if (dx > 0) for (let ty = y0; ty <= y1; ty++) if (solidTile(x1, ty)) { ent.x = x1 * TILE - ent.w; ent.vx = 0; break; }
  else if (dx < 0) for (let ty = y0; ty <= y1; ty++) if (solidTile(x0, ty)) { ent.x = (x0 + 1) * TILE; ent.vx = 0; break; }
}
function moveY(ent, dy) {
  const prevBottom = ent.y + ent.h;
  ent.y += dy;
  const x0 = Math.floor(ent.x / TILE), x1 = Math.floor((ent.x + ent.w - 1) / TILE);
  const y0 = Math.floor(ent.y / TILE), y1 = Math.floor((ent.y + ent.h - 1) / TILE);
  if (dy > 0) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = tileAt(tx, y1);
      if (t === 12 && ent === p) {
        ent.y = y1 * TILE - ent.h;
        ent.vy = -17;
        ent.onGround = false;
        spawnParticles(ent.x + ent.w / 2, ent.y + ent.h, '#7be08f', 8);
        beep(660, 0.09, 'square', 0.04, 500);
        break;
      }
      if (solidTile(tx, y1)) { ent.y = y1 * TILE - ent.h; ent.vy = 0; ent.onGround = true; break; }
      if (t === 11 && prevBottom <= y1 * TILE + 3) { ent.y = y1 * TILE - ent.h; ent.vy = 0; ent.onGround = true; break; }
    }
  } else if (dy < 0) {
    for (let tx = x0; tx <= x1; tx++) {
      const t = tileAt(tx, y0);
      if (t === 11) continue;
      if (solidTile(tx, y0)) {
        ent.y = (y0 + 1) * TILE; ent.vy = 0;
        if ((t >= 2 && t <= 6) || (t >= 13 && t <= 20)) hitBlock(tx, y0);
        else beep(110, 0.03, 'square', 0.02);
        break;
      }
    }
  }
}
function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/* ---------------- BLOQUES Y PARTÍCULAS ---------------- */

function hitBlock(tx, ty) {
  const t = tileAt(tx, ty);
  const x = tx * TILE, y = ty * TILE;
  if (t === 3) {
    setTile(tx, ty, 6);
    btcPickup(3, x + 16, y, '#f7931a');
    spawnText(x + 16, y - 26, '+3 ₿');
    SFX.coin();
  } else if (t >= 13 && t <= 20) {
    const a = ALT[t - 12];
    setTile(tx, ty, 6);
    addWallet(a.key, 2);
    score += 500;
    spawnText(x + 16, y - 6, '+2 ' + a.key);
    spawnParticles(x + 16, y + 16, a.color, 12);
    SFX.coin();
  } else if (t >= 21 && t <= 25) {
    const types = ['bullet', 'outfit', 'flower', 'ears', 'wings'];
    const labels = ['BALAS +', 'ROPA', 'FLOR', 'OREJAS', 'ALAS +'];
    setTile(tx, ty, 6);
    powerups.push({
      type: types[t - 21], x: x + 4, y: y - 24, w: 24, h: 24,
      vx: 1.5, vy: 0, emerge: 20
    });
    spawnText(x + 16, y - 8, labels[t - 21]);
    spawnParticles(x + 16, y + 16, '#8be9fd', 10);
    SFX.power();
  } else if (t === 4 || t === 5) {
    setTile(tx, ty, 6);
    powerups.push({
      type: t === 4 ? 'mushroom' : 'star',
      x: x + 4, y: y - 24, w: 24, h: 24,
      vx: t === 5 ? -2.2 : 1.7, vy: 0, emerge: 22
    });
    SFX.power();
  } else if (t === 2) {
    if (p.big) {
      setTile(tx, ty, 0);
      btcPickup(1, x + 16, y + 8, '#c95b2b');
      SFX.breakk();
    } else { bumps.push({ tx, ty, t: 12 }); SFX.bump(); }
  } else if (t === 6) { bumps.push({ tx, ty, t: 12 }); SFX.bump(); }
}
function spawnParticles(x, y, color, n) {
  if (particles.length > 420) particles.splice(0, particles.length - 420);
  for (let i = 0; i < n; i++) particles.push({
    x, y, c: color, vx: rnd(-2.4, 2.4), vy: rnd(-3.6, -0.6),
    life: rnd(24, 46), max: 46, size: rnd(3, 6)
  });
}
function spawnText(x, y, text) { texts.push({ x, y, text, life: 60 }); }
function btcPickup(n, x, y, color = '#f7931a') {
  coinCount += n;
  addWallet('BTC', n);
  score += n * 100;
  spawnText(x, y - 12, '+' + fmt(n * OPT.coinSats) + ' sats');
  spawnParticles(x, y, color, Math.min(12, 4 + n));
}
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const q = particles[i];
    q.x += q.vx; q.y += q.vy; q.vy += 0.2; q.life--;
    if (q.life <= 0 || q.y > H + 40) particles.splice(i, 1);
  }
  for (let i = texts.length - 1; i >= 0; i--) {
    texts[i].y -= 0.7; texts[i].life--;
    if (texts[i].life <= 0) texts.splice(i, 1);
  }
  for (let i = bumps.length - 1; i >= 0; i--) {
    bumps[i].t--;
    if (bumps[i].t <= 0) bumps.splice(i, 1);
  }
}

/* ---------------- CIELO INFINITO Y MÚSICA ---------------- */

function skyHash(tx, ty) {
  const h = Math.sin(tx * 127.1 + ty * 311.7 + levelIndex * 74.7) * 43758.5453;
  return h - Math.floor(h);
}

/* Genera plataformas, bloques de altcoin y bitcoins dorados mientras el toro sube */
function ensureSky(topRow) {
  if (mainWorld) return;
  if (topRow >= skyTop) return;
  const need = Math.max(topRow, -2000);
  for (let ty = skyTop - 1; ty >= need; ty--) {
    for (let tx = 0; tx < cols; tx += 6) {
      const h = skyHash(tx, ty);
      if (h < 0.62) {
        setTile(tx, ty, 11);
        setTile(tx + 1, ty, 11);
        if (skyHash(tx, ty + 7) < 0.75) setTile(tx + 2, ty, 11);
        for (let k = 0; k < 3; k++) {
          goldCoins.push({ x: (tx + k) * TILE + 8, y: (ty - 2) * TILE, taken: false, gold: true });
        }
      } else if (h < 0.80 && levelIndex >= 1) {
        const a = ALT[1 + ((Math.abs(tx + ty) + levelIndex) % 8)];
        setTile(tx, ty, altTile(a.key));
      }
    }
    if (ty % 3 === 0) {
      for (let tx = 3; tx < cols; tx += 11) {
        const gx = tx + Math.floor(skyHash(tx, ty) * 4);
        goldCoins.push({ x: gx * TILE + 8, y: (ty - 1) * TILE, taken: false, gold: true });
      }
    }
  }
  skyTop = need;
  if (goldCoins.length > 1600) {
    goldCoins = goldCoins.filter(g => !g.taken && g.y > camY - H * 2 && g.y < camY + H * 2);
  }
}

function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

function musicStep() {
  if (muted || OPT.music === 'off' || !OPT.levelMusic) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { return; }
  const m = MUSIC[OPT.levelMusic ? ((mainWorld ? 9 : levelIndex) % MUSIC.length) : 0];
  const style = OPT.music;
  const wave = style === 'arcade' ? 'sawtooth' : style === 'espacial' ? 'sine' : 'square';
  const transpose = style === 'espacial' ? -12 : style === 'arcade' ? 12 : 0;
  const dur = style === 'espacial' ? 0.2 : style === 'arcade' ? 0.09 : 0.13;
  const n = m.n[musicPos % m.n.length] + transpose;
  beep(midi(n), dur, wave, 0.022, 0, true);
  if (musicPos % 2 === 0) {
    const bass = m.b[(musicPos / 2) % m.b.length] + transpose;
    beep(midi(bass), 0.2, 'triangle', 0.02, 0, true);
  }
  if (musicPos % 4 === 0) beep(midi(n + 12), 0.05, 'sine', 0.012, 0, true);
  musicPos++;
}

function spawnFirework(x, y, color) {
  if (!OPT.fireworks) return;
  if (fireworks.length > 34) fireworks.shift();
  fireworks.push({ x, y, c: color, life: 46, max: 46 });
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rnd(1.5, 5.5);
    particles.push({
      x, y, c: color, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: rnd(26, 52), max: 52, size: rnd(2, 5)
    });
  }
}

/* ---------------- JUGADOR Y PODERES ---------------- */

function unlockedWeapons() { return levelIndex >= 7 ? 4 : 3; }
function unlockedHelperCount() { return helpers ? helpers.length : 0; }

function registerWPress() {
  const now = performance.now();
  if (!OPT.doubleW || (state !== 'playing' && state !== 'bonus')) { lastWPress = now; return; }
  if (now - lastWPress < 320) {
    dashUntil = now + 1400;
    magnetUntil = now + 1400;
    chargedJumps = 2;
    lastWPress = -999;
    spawnText(p.x, p.y - 24, '¡W×2 TURBO!');
    spawnParticles(p.x + p.w / 2, p.y + p.h, '#8be9fd', 18);
    SFX.super();
  } else {
    lastWPress = now;
  }
}

function fireWeapon(auto = false) {
  const w = WEAPONS[weapon];
  const bl = p.bulletLevel || 0;
  boltCd = OPT.infiniteFire ? 0 : Math.max(6, w.cd - bl * 4);
  const ox = p.x + (p.face > 0 ? p.w : -4);
  const oy = p.y + 12;
  const baseShots = w.kind === 'flame' ? 3 : w.kind === 'inferno' ? 3 : 1;
  const shots = baseShots + (bl >= 2 ? 2 : bl >= 1 ? 1 : 0);
  for (let i = 0; i < shots; i++) {
    const spread = shots === 1 ? 0 : (i - (shots - 1) / 2) * (w.kind === 'inferno' ? 0.22 : 0.13);
    bolts.push({
      x: ox, y: oy + (w.kind === 'flame' ? (i - (shots - 1) / 2) * 6 : 0),
      vx: p.face * (w.speed + bl * 0.6), vy: w.kind === 'fireball' ? -2.2 : spread * 2,
      life: w.life, dir: p.face, kind: w.kind,
      color: w.color, power: w.power + bl, age: 0
    });
  }
  if (bolts.length > 48) bolts.splice(0, bolts.length - 48);
  if (!auto || tick % 8 === 0) {
    if (w.kind === 'bolt') SFX.bolt();
    else if (w.kind === 'flame') SFX.flame();
    else if (w.kind === 'fireball') SFX.fireball();
    else SFX.inferno();
  }
  spawnParticles(ox, oy, w.color, auto ? 2 : (w.kind === 'inferno' ? 14 : 5));
}

function handleInput() {
  const left = keys.ArrowLeft || keys.KeyA;
  const right = keys.ArrowRight || keys.KeyD;
  const run = keys.ShiftLeft || keys.ShiftRight;
  const dashing = OPT.doubleW && performance.now() < dashUntil;
  const kart = !!cfg && !!cfg.car && !mainWorld;
  const flying = OPT.wings && p.wingLevel > 0 && (keys.KeyV || keys.KeyB);
  p.wingActive = flying;
  p.climbing = false;
  const wingBonus = flying ? p.wingLevel * 0.55 : 0;
  const maxSpeed = (dashing ? 8.2 : run ? 5.4 : 4.0) + wingBonus + (kart ? 0.9 : 0);
  const accel = dashing ? 0.8 : flying ? 0.42 : 0.55;

  if (cloudRide) {
    if (left) cloudRide.dir = -1;
    if (right) cloudRide.dir = 1;
  } else {
    if (left && !right) { p.vx -= accel; p.face = -1; }
    else if (right && !left) { p.vx += accel; p.face = 1; }
    else if (kart) { p.vx += 0.16; p.face = 1; }
    else { p.vx *= dashing ? 0.9 : 0.78; if (Math.abs(p.vx) < 0.05) p.vx = 0; }
    p.vx = clamp(p.vx, -maxSpeed, maxSpeed);
  }

  if (jumpPressed) { jumpBuffer = 8; jumpPressed = false; }
  if (jumpBuffer > 0) jumpBuffer--;
  if (coyote > 0) coyote--;

  const jumpHeld = keys.Space || keys.ArrowUp || keys.KeyW;
  if (jumpBuffer > 0 && (p.onGround || coyote > 0 || cloudRide)) {
    const turbo = dashing && chargedJumps > 0;
    if (cloudRide) { cloudRide = null; p.vy = turbo ? -10 : -7; }
    else { p.vy = turbo ? -17.2 : -12.4; }
    if (turbo) {
      chargedJumps--;
      spawnText(p.x, p.y - 26, '¡SALTO TURBO!');
      spawnParticles(p.x + p.w / 2, p.y + p.h, '#8be9fd', 14);
      SFX.super();
    } else SFX.jump();
    p.onGround = false;
    coyote = 0; jumpBuffer = 0;
  }
  if (!jumpHeld && p.vy < -4) p.vy = -4;

  if (Math.abs(p.vx) > 0.1 && p.onGround) p.anim += Math.abs(p.vx) * 0.16;
  else p.anim = 0;

  /* SUPER SALTO: infinito por defecto, con recarga si se desactiva en opciones */
  if (superPressed) {
    superPressed = false;
    if (OPT.infiniteSuper || superCd <= 0) {
      p.vy = -23;
      p.onGround = false;
      cloudRide = null;
      if (!OPT.infiniteSuper) superCd = 240;
      SFX.super();
      spawnText(p.x, p.y - 20, '¡A LAS NUBES!');
      spawnParticles(p.x + p.w / 2, p.y + p.h, '#fff36b', 22);
    }
  }
  if (!OPT.infiniteSuper && superCd > 0) superCd--;

  /* ARMA DE FUEGO / RAYO: sin barra de recarga por defecto */
  if (switchPressed) {
    switchPressed = false;
    weapon = (weapon + 1) % unlockedWeapons();
    spawnText(p.x, p.y - 20, 'ARMA: ' + WEAPONS[weapon].name);
    SFX.wallet();
  }
  if (boltPressed) {
    boltPressed = false;
    if (OPT.infiniteFire || boltCd <= 0) fireWeapon();
  }
  if (OPT.infiniteFire) {
    if ((keys.KeyE || keys.KeyF) && tick % 5 === 0) fireWeapon(true);
  } else if (boltCd > 0) boltCd--;
  if (OPT.autoFire && tick % 7 === 0) fireWeapon(true);

  /* ESCALERAS DE LAS TORRES DE OBRAS */
  if (ladders && ladders.length) {
    for (const ladder of ladders) {
      const lr = { x: ladder.x * TILE + 10, y: ladder.y * TILE, w: 12, h: ladder.h * TILE };
      if (!overlap(p, lr)) continue;
      if (keys.ArrowUp || keys.KeyW) { p.vy = -3.2; p.climbing = true; }
      else if (keys.ArrowDown || keys.KeyS) { p.vy = 3.2; p.climbing = true; }
      if (p.climbing) { p.onGround = false; break; }
    }
  }

  /* ENTRAR EN TUBERÍA */
  if (downPressed) {
    downPressed = false;
    if (state === 'playing') {
      const tx = Math.floor((p.x + p.w / 2) / TILE);
      const ty = Math.floor((p.y + p.h + 3) / TILE);
      const t = tileAt(tx, ty);
      if ((t === 7 || t === 8) && p.onGround) enterPipe();
    }
  }
}

function updatePlayer() {
  if (state !== 'playing' && state !== 'bonus' && state !== 'flag') return;

  if (cloudRide && state === 'playing') {
    cloudRide.x += cloudRide.dir * 2.3;
    if (cloudRide.x < 0) cloudRide.dir = 1;
    if (cloudRide.x > cols * TILE - 120) cloudRide.dir = -1;
    p.x = cloudRide.x + 18;
    p.y = cloudRide.y - p.h + 18;
    p.vx = 0; p.vy = 0;
    p.onGround = true;
    safe = { x: p.x, y: p.y };
    if (Math.random() < 0.25) spawnParticles(p.x + p.w / 2, p.y + p.h, '#ffffff', 1);
  } else {
    if (p.climbing) {
      p.onGround = false;
    } else if (p.wingActive && state === 'playing') {
      p.wingFlap += 0.34;
      const thrust = keys.Space || keys.ArrowUp || keys.KeyW;
      if (thrust) p.vy -= 0.72 + p.wingLevel * 0.08;
      else p.vy += 0.18;
      p.vy = clamp(p.vy, -7.5 - p.wingLevel * 0.5, 4.2);
      p.onGround = false;
    } else {
      p.vy += 0.6;
      if (p.vy > 15) p.vy = 15;
      p.onGround = false;
    }
    moveX(p, p.vx);
    moveY(p, p.vy);
    if (p.onGround) safe = { x: p.x, y: p.y };
  }

  if (car) {
    car.x = p.x - 12;
    car.y = p.y + p.h - 10;
    car.wheel += p.vx * 0.08;
  }

  if (p.star > 0) p.star--;
  if (p.shield > 0) p.shield--;

  if (state === 'flag') {
    p.vx = 0; p.vy = 3.4;
    p.x += (flag.x - p.x) * 0.14;
    if (p.y + p.h >= FLOOR) {
      p.y = FLOOR - p.h;
      if (levelIndex === TOTAL_LEVELS - 1) {
        startFinalCoin();
      } else {
        state = 'levelclear';
        clearCounter = 160;
        coinCount += 1000;
        addWallet('BTC', 1000);
        score += Math.max(0, timer) * 10 + 100000;
        SFX.flag();
        spawnText(p.x, p.y - 30, '+1000 ₿ · ' + fmt(1000 * OPT.coinSats) + ' sats');
      }
    }
  }

  if (p.y > H + 40 && (state === 'playing' || state === 'bonus')) {
    p.x = safe.x; p.y = safe.y;
    p.vx = 0; p.vy = 0; p.shield = 60;
    cloudRide = null;
    spawnText(p.x, p.y - 16, '¡SALVADO!');
    spawnParticles(p.x + 12, p.y + 12, '#7be08f', 10);
  }
}

function grow() {
  const newY = p.y + p.h - BIG_H;
  if (rectHitsSolid(p.x, newY, BIG_W, BIG_H)) return false;
  p.big = true; p.w = BIG_W; p.h = BIG_H; p.y = newY;
  return true;
}

/* ---------------- NUBES, RAYOS, OSOS ---------------- */

function updateClouds() {
  if (state !== 'playing') return;
  for (const c of clouds) {
    if (cloudRide !== c) {
      c.x += c.dir * 0.4;
      if (c.x < 0) c.dir = 1;
      if (c.x > cols * TILE - 100) c.dir = -1;
    }
    if (cloudRide !== c && p.star <= 0 &&
        overlap(p, { x: c.x + 6, y: c.y + 4, w: c.w - 12, h: c.h - 6 })) {
      cloudRide = c;
      SFX.power();
      spawnText(c.x + 20, c.y - 16, '¡VIAJE EN NUBE!');
    }
  }
}

function breakBlockWithFire(tx, ty, b) {
  const t = tileAt(tx, ty);
  if (!t || t === 1 || (t >= 7 && t <= 10)) return false;
  const canBreak = b.kind === 'inferno' ||
    (b.kind === 'fireball' && (t === 2 || (t >= 13 && t <= 20))) ||
    (b.kind === 'bolt' && t === 2);
  if (!canBreak) return false;

  const x = tx * TILE, y = ty * TILE;
  setTile(tx, ty, 0);
  coins.push({ x: x + 8, y: y - 6, taken: false });
  spawnParticles(x + 16, y + 16, b.color, 12);
  score += 100;
  return true;
}

function updateBolts() {
  if (state !== 'playing' && state !== 'bonus') return;
  const radius = (kind) => kind === 'inferno' ? 120 : kind === 'fireball' ? 34 : 20;

  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i];
    b.x += b.vx;
    if (b.kind === 'fireball') { b.vy += 0.16; b.y += b.vy; }
    else if (b.kind !== 'bolt') b.y += b.vy;
    b.life--; b.age++;
    let remove = b.life <= 0;

    /* Osos: el infierno quema a todos los que tiene cerca */
    for (const e of bears) {
      if (e.dead) continue;
      const hit = b.kind === 'inferno'
        ? Math.abs(e.x - b.x) < 170 && Math.abs(e.y - b.y) < 170
        : overlap({ x: b.x - 9, y: b.y - 10, w: 18, h: 20 }, e);
      if (hit) {
        e.dead = true; e.squash = 20;
        const recovered = e.loot + b.power;
        btcPickup(recovered, e.x + 14, e.y + 14, b.color);
        spawnText(e.x, e.y - 24, '+' + recovered + ' ₿');
        SFX.stomp();
        if (b.kind !== 'inferno') remove = true;
      }
    }

    /* Monedas BTC normales y doradas del cielo */
    if (!remove) {
      const r = radius(b.kind);
      for (const c of coins) {
        if (c.taken || Math.abs(c.x - b.x) > r || Math.abs(c.y - b.y) > r) continue;
        c.taken = true;
        btcPickup(1, c.x + 8, c.y + 10, b.color);
      }
      for (const g of goldCoins) {
        if (g.taken || Math.abs(g.x - b.x) > r || Math.abs(g.y - b.y) > r) continue;
        g.taken = true;
        btcPickup(5, g.x + 8, g.y + 10, '#ffe680');
      }
    }

    /* Monedas ocultas: solo el INFIERNO de los niveles 8-10 las descubre */
    if (!remove && b.kind === 'inferno') {
      for (const h of hiddenCoins) {
        if (h.taken) continue;
        if (Math.abs(h.x - b.x) < 210 && Math.abs(h.y - b.y) < 210) h.revealed = true;
        if (Math.abs(h.x - b.x) > 130 || Math.abs(h.y - b.y) > 130) continue;
        h.taken = true; secretsFound++;
        addWallet(h.key, 15); score += 2500;
        const a = ALT.find(z => z.key === h.key);
        spawnText(h.x, h.y - 14, '¡SECRETO! +15 ' + h.key);
        spawnFirework(h.x + rnd(-20, 20), h.y + 20, a.color);
        SFX.secret();
      }
    }

    if (!remove && solidAt(b.x, b.y)) {
      const tx = Math.floor(b.x / TILE), ty = Math.floor(b.y / TILE);
      if (!breakBlockWithFire(tx, ty, b)) {
        spawnParticles(b.x, b.y, b.color, b.kind === 'inferno' ? 10 : 4);
        if (b.kind !== 'inferno') remove = true;
      }
      if (b.kind === 'inferno' && ty < 0) {
        const codeHere = tileAt(tx, ty);
        if (codeHere && !(codeHere >= 7 && codeHere <= 10)) setTile(tx, ty, 0);
      }
    }

    if (b.age % 3 === 0) spawnParticles(b.x, b.y, b.color, 1);
    if (remove) bolts.splice(i, 1);
  }
}

function updateBears() {
  if (state !== 'playing') return;
  for (const b of bears) {
    if (b.dead) { if (b.squash > 0) b.squash--; continue; }
    if (b.stealCd > 0) b.stealCd--;

    const ahead = b.vx > 0 ? b.x + b.w + 3 : b.x - 3;
    if (solidAt(ahead, b.y + 6) || !solidAt(ahead, b.y + b.h + 5)) b.vx *= -1;
    b.x += b.vx;
    b.vy += 0.6; b.y += b.vy;
    if (b.y + b.h >= FLOOR) { b.y = FLOOR - b.h; b.vy = 0; }
    b.anim += 0.12;

    if (!overlap(p, b)) continue;
    const stomp = p.vy > 0 && (p.y + p.h) - b.y < 16;
    if (stomp || p.star > 0) {
      b.dead = true; b.squash = 20;
      p.vy = stomp ? -8 : p.vy;
      const recovered = b.loot + 3;
      coinCount += recovered; addWallet('BTC', recovered); stolenBack += b.loot;
      score += recovered * 100;
      spawnText(b.x, b.y - 12, '+' + recovered + ' BTC');
      spawnParticles(b.x + 14, b.y + 14, '#f7931a', 12);
      SFX.stomp();
    } else if (b.stealCd <= 0 && p.shield <= 0) {
      const amount = Math.min(coinCount, 3);
      if (amount > 0) {
        coinCount -= amount; b.loot += amount;
        spawnText(p.x, p.y - 14, '-' + amount + ' BTC');
        SFX.steal();
      } else { spawnText(p.x, p.y - 14, '¡NO HAY BTC!'); SFX.bump(); }
      b.stealCd = 150; p.shield = 70; p.vy = -4;
    }
  }
}

function updatePowerups() {
  if (state !== 'playing' && state !== 'bonus') return;
  for (let i = powerups.length - 1; i >= 0; i--) {
    const u = powerups[i];
    if (u.emerge > 0) { u.emerge--; u.y -= 1.2; }
    else {
      if (solidAt(u.x + u.w + 2, u.y + 4) || solidAt(u.x - 2, u.y + 4)) u.vx *= -1;
      u.x += u.vx; u.vy += 0.45; u.y += u.vy;
      if (u.y + u.h >= FLOOR) { u.y = FLOOR - u.h; u.vy = u.type === 'star' ? -7 : 0; }
    }
    if (u.y > H + 50) { powerups.splice(i, 1); continue; }
    if (overlap(p, u)) {
      if (u.type === 'mushroom') {
        grow(); btcPickup(5, u.x + 12, u.y + 12, '#ffffff');
      } else if (u.type === 'star') {
        p.star = 420; btcPickup(10, u.x + 12, u.y + 12, '#fff36b');
      } else if (u.type === 'bullet') {
        p.bulletLevel = bullGear.bullets = Math.min(3, (p.bulletLevel || 0) + 1);
        spawnText(u.x, u.y - 12, 'BALAS NIVEL ' + p.bulletLevel);
      } else if (u.type === 'outfit') {
        p.outfit = bullGear.outfit = (p.outfit + 1) % 4;
        spawnText(u.x, u.y - 12, 'ROPA NUEVA');
      } else if (u.type === 'flower') {
        p.flower = bullGear.flower = true;
        p.shield = Math.max(p.shield, 120);
        spawnText(u.x, u.y - 12, 'FLOR PROTECTORA');
      } else if (u.type === 'ears') {
        p.ears = bullGear.ears = true;
        magnetUntil = performance.now() + 4000;
        spawnText(u.x, u.y - 12, 'OREJAS IMÁN');
      } else if (u.type === 'wings') {
        p.wingLevel = bullGear.wings = Math.min(3, (p.wingLevel || 1) + 1);
        spawnText(u.x, u.y - 12, 'ALAS NIVEL ' + p.wingLevel);
      } else {
        p.star = 420; btcPickup(10, u.x + 12, u.y + 12, '#fff36b');
      }
      score += 1000; SFX.power();
      spawnParticles(u.x + 12, u.y + 12, '#ffffff', 12);
      powerups.splice(i, 1);
    }
  }
}

function updateCoins() {
  if (state !== 'playing' && state !== 'bonus') return;
  const boosted = performance.now() < magnetUntil;
  const radius = OPT.coinMagnet ? (boosted ? 155 : 108) : 0;

  for (const c of coins) {
    if (c.taken || Math.abs(c.x - p.x) > 200 || Math.abs(c.y - p.y) > 200) continue;
    let cx = c.x + 8, cy = c.y + 10;
    let dx = p.x + p.w / 2 - cx, dy = p.y + p.h / 2 - cy;
    let dist = Math.hypot(dx, dy);
    if (radius && dist < radius && dist > 1) {
      const pull = 0.14 + (1 - dist / radius) * 0.2;
      c.x += dx * pull; c.y += dy * pull;
      cx = c.x + 8; cy = c.y + 10;
      if (Math.random() < 0.12) spawnParticles(cx, cy, '#ffe680', 1);
      dist = Math.hypot(p.x + p.w / 2 - cx, p.y + p.h / 2 - cy);
    }
    if (dist < 20 || overlap(p, { x: c.x, y: c.y, w: 16, h: 20 })) {
      c.taken = true;
      btcPickup(1, cx, cy, '#f7931a');
      SFX.coin();
    }
  }

  for (const g of goldCoins) {
    if (g.taken || Math.abs(g.x - p.x) > 200 || Math.abs(g.y - p.y) > 200) continue;
    let cx = g.x + 8, cy = g.y + 10;
    let dx = p.x + p.w / 2 - cx, dy = p.y + p.h / 2 - cy;
    let dist = Math.hypot(dx, dy);
    if (radius && dist < radius && dist > 1) {
      const pull = 0.16 + (1 - dist / radius) * 0.22;
      g.x += dx * pull; g.y += dy * pull;
      cx = g.x + 8; cy = g.y + 10;
      dist = Math.hypot(p.x + p.w / 2 - cx, p.y + p.h / 2 - cy);
    }
    if (dist < 22 || overlap(p, { x: g.x, y: g.y, w: 16, h: 20 })) {
      g.taken = true;
      btcPickup(5, cx, cy, '#ffe680');
      spawnText(cx, cy - 24, '+5 ORO');
      SFX.coin();
    }
  }
}

/* ---------------- AYUDANTES Y OBJETOS TEMÁTICOS ---------------- */

function updateHelpers() {
  if (state !== 'playing' && state !== 'bonus') return;
  for (let k = 0; k < helpers.length; k++) {
    const h = helpers[k];
    h.bob += 0.14;
    const tx = p.x - 34 - k * 28 - p.vx * 0.3;
    const ty = p.y + 4 + Math.sin(h.bob) * 4;
    h.x += (tx - h.x) * 0.12;
    h.y += (ty - h.y) * 0.12;
    if (h.cooldown > 0) { h.cooldown--; continue; }
    let found = false;
    for (const c of coins) {
      if (c.taken || Math.abs(c.x - h.x) > 34 || Math.abs(c.y - h.y) > 34) continue;
      c.taken = true; btcPickup(1, c.x + 8, c.y + 10, HELPERS[k].color); found = true; break;
    }
    if (!found) {
      for (const g of goldCoins) {
        if (g.taken || Math.abs(g.x - h.x) > 34 || Math.abs(g.y - h.y) > 34) continue;
        g.taken = true; btcPickup(3, g.x + 8, g.y + 10, '#ffe680'); found = true; break;
      }
    }
    if (found) h.cooldown = 14;
  }
}

function updateThemedObjects() {
  if (state !== 'playing') return;
  for (const f of fallers) {
    if (!f.active) continue;
    f.y += 0.32;
    if (f.y > FLOOR - f.size) f.y = f.startY;
  }
  for (const a of asteroids) {
    if (!a.active) continue;
    a.spin += 0.02;
    a.y += a.vy;
    if (a.y > H + 120) a.y = a.startY;
  }
  let boltChanged = false;
  for (const b of bolts) {
    if (b.dead) continue;
    for (const f of fallers) {
      if (!f.active || Math.abs(f.x - b.x) > f.size || Math.abs(f.y - b.y) > f.size) continue;
      f.active = false; b.dead = true; boltChanged = true;
      coins.push({ x: f.x, y: f.y, taken: false });
      btcPickup(2, f.x, f.y, f.color);
      spawnParticles(f.x, f.y, f.color, 10);
      break;
    }
    if (b.dead) continue;
    for (const a of asteroids) {
      if (!a.active || Math.hypot(a.x - b.x, a.y - b.y) > a.r + 10) continue;
      a.active = false; b.dead = true; boltChanged = true;
      btcPickup(4, a.x, a.y, a.color || '#8be9fd');
      spawnFirework(a.x, a.y, a.color || '#8be9fd');
      break;
    }
  }
  if (boltChanged) bolts = bolts.filter(b => !b.dead);
}

/* ---------------- GRAN FINAL: MONEDA, FUEGOS Y BILLETERAS ---------------- */

function startFinalCoin() {
  state = 'finalCoin';
  finalCoinT = 0;
  coinCount += 50;
  addWallet('BTC', 50);
  score += 50000;
  spawnText(flag.x + 10, FLOOR - 120, '¡MONEDA FINAL! +50 ₿');
  spawnFirework(flag.x + 20, FLOOR - 150, '#f7931a');
  SFX.secret();
}

function startPayout() {
  state = 'payout';
  payoutCounter = 300;
  payoutQueue = [];
  payoutIndex = 0;
  payoutSparks = [];
  walletFlash = 300;
  for (const a of ALT) {
    const n = a.key === 'BTC' ? 90 : 30;
    for (let i = 0; i < n; i++) payoutQueue.push({ key: a.key, color: a.color, sym: a.sym, delay: i * 2 });
  }
  payoutQueue.sort((a, b) => a.delay - b.delay);
  SFX.flag();
}

function walletTarget(i) {
  return { x: W / 2 - 190 + i * 47, y: H - 46 };
}

function updatePayout() {
  payoutCounter--;
  const elapsed = 300 - payoutCounter;

  while (payoutIndex < payoutQueue.length && payoutQueue[payoutIndex].delay <= elapsed) {
    const q = payoutQueue[payoutIndex++];
    addWallet(q.key, 1);
    if (q.key === 'BTC') coinCount++;
    const idx = ALT.findIndex(a => a.key === q.key);
    const t = walletTarget(idx);
    payoutSparks.push({
      x: p.x - camX + p.w / 2 + rnd(-14, 14),
      y: p.y - camY + p.h / 2 + rnd(-14, 14),
      tx: t.x, ty: t.y, color: q.color, sym: q.sym,
      t: 0, life: 34 + Math.random() * 14
    });
    if (payoutIndex % 6 === 0) SFX.wallet();
  }

  if (tick % 7 === 0) {
    const a = ALT[Math.floor(rnd(0, ALT.length))];
    spawnFirework(camX + rnd(40, W - 40), camY + rnd(30, H * 0.62), a.color);
  }

  for (let i = payoutSparks.length - 1; i >= 0; i--) {
    const s = payoutSparks[i];
    s.t += 0.045;
    const k = Math.min(1, s.t);
    s.x += (s.tx - s.x) * 0.09;
    s.y += (s.ty - s.y) * 0.09 + Math.sin(k * Math.PI) * -30 * 0.02;
    s.life--;
    if (s.life <= 0) payoutSparks.splice(i, 1);
  }
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].life--;
    if (fireworks[i].life <= 0) fireworks.splice(i, 1);
  }

  if (payoutCounter <= 0 && payoutIndex >= payoutQueue.length && payoutSparks.length === 0) {
    state = 'victory';
    bonusSats += FINAL_BONUS_SATS;
    score += 10000000;
    walletPaid = true;
    walletFlash = 0;
    SFX.flag();
  }
}

function checkFlag() {
  if (state !== 'playing') return;
  if (p.x + p.w >= flag.x - 6) { state = 'flag'; p.vy = 3.4; cloudRide = null; }
}
function checkBonusExit() {
  if (state === 'bonus' && p.x > bonusExitX * TILE) exitBonus();
}

/* ---------------- UPDATE ---------------- */

function update() {
  tick++;
  if (state === 'title' || state === 'paused') return;

  if (state === 'victory') {
    if (walletFlash > 0) walletFlash--;
    return;
  }
  if (state === 'finalCoin') {
    finalCoinT++;
    if (finalCoinT % 18 === 0) spawnFirework(camX + rnd(60, W - 60), camY + rnd(40, H * 0.6), '#ffd166');
    if (finalCoinT > 170) startPayout();
    updateParticles();
    return;
  }
  if (state === 'payout') {
    updatePayout();
    updateParticles();
    camX = clamp(p.x - W * 0.38, 0, Math.max(0, cols * TILE - W));
    camY = clamp(p.y - H * 0.55, -Infinity, 0);
    return;
  }

  if (state === 'playing' || state === 'bonus') handleInput();
  updatePlayer();
  updateClouds();
  updateBolts();
  updateBears();
  updatePowerups();
  updateCoins();
  updateHelpers();
  updateThemedObjects();
  checkFlag();
  checkBonusExit();
  updateParticles();

  camX = clamp(p.x - W * 0.38, 0, Math.max(0, cols * TILE - W));
  camY = clamp(p.y - H * 0.55, -Infinity, 0);

  if (OPT.infiniteSky && !mainWorld && levelIndex >= 1) ensureSky(Math.floor((p.y - H) / TILE) - 4);

  const m = MUSIC[(mainWorld ? 9 : levelIndex) % MUSIC.length];
  if (tick % m.t === 0) musicStep();

  if (state === 'playing' || state === 'bonus') {
    timerTicks++;
    if (timerTicks >= 24) { timerTicks = 0; if (timer > 0) timer--; }
  }

  if (state === 'levelclear') {
    clearCounter--;
    if (clearCounter <= 0) {
      loadLevel(levelIndex + 1, true);
      state = 'playing';
    }
  }
}

/* ---------------- RENDER ---------------- */

function drawSky() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  const bonus = !!mainWorld;
  g.addColorStop(0, bonus ? '#1a1035' : (cfg ? cfg.sky[0] : '#43a9f0'));
  g.addColorStop(1, bonus ? '#3b2359' : (cfg ? cfg.sky[1] : '#bfe6ff'));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  if (!bonus) {
    const sunX = W - 110 - (camX * 0.02) % 120;
    ctx.fillStyle = 'rgba(255,238,150,0.85)';
    ctx.beginPath(); ctx.arc(sunX, 78, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,210,0.22)';
    ctx.beginPath(); ctx.arc(sunX, 78, 50, 0, Math.PI * 2); ctx.fill();
  }
}

function drawCloudShape(x, y, s, color) {
  ctx.fillStyle = color || '#fff';
  ctx.beginPath();
  ctx.arc(x, y, 14 * s, 0, Math.PI * 2);
  ctx.arc(x + 16 * s, y - 8 * s, 19 * s, 0, Math.PI * 2);
  ctx.arc(x + 36 * s, y, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 18 * s, y + 8 * s, 17 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawHill(x, base, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, base, 70 * s, 52 * s, 0, Math.PI, 0); ctx.fill();
}
function drawBush(x, base, s) {
  ctx.fillStyle = '#2e9e4f';
  ctx.beginPath();
  ctx.arc(x, base, 13 * s, 0, Math.PI * 2);
  ctx.arc(x + 15 * s, base - 6 * s, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 34 * s, base, 14 * s, 0, Math.PI * 2);
  ctx.fill();
}
function drawBackground() {
  if (mainWorld) return;
  const hillOff = (camX * 0.35) % 300;
  for (let i = -1; i < 6; i++) drawHill(i * 300 - hillOff, FLOOR + 6, 1.25, '#4fa85a');
  const bushOff = (camX * 0.6) % 210;
  for (let i = -1; i < 7; i++) drawBush(i * 210 - bushOff, FLOOR + 4, 1);
  const cloudOff = (camX * 0.14) % 240;
  for (let i = -1; i < 6; i++) drawCloudShape(i * 240 - cloudOff + 40, 70 + (i % 2) * 34, 0.9);
}

function bumpOffset(tx, ty) {
  for (const b of bumps) if (b.tx === tx && b.ty === ty) return -Math.sin((12 - b.t) / 12 * Math.PI) * 6;
  return 0;
}

function drawTile(tx, ty, t) {
  const x = tx * TILE, y = ty * TILE + bumpOffset(tx, ty);
  if (t === 1) {
    rect(x, y, TILE, TILE, '#b5651d');
    rect(x, y, TILE, 7, '#4fc45a');
    rect(x, y + 7, TILE, 3, '#348f42');
    rect(x + 6, y + 15, 4, 4, '#8c4a12');
    rect(x + 20, y + 23, 4, 4, '#8c4a12');
  } else if (t === 2) {
    rect(x, y, TILE, TILE, '#c9632d');
    rect(x, y, TILE, 3, '#e88b4f');
    rect(x, y + 15, TILE, 3, '#8c3d18');
    rect(x + 15, y + 3, 3, 12, '#8c3d18');
    rect(x + 6, y + 18, 3, 12, '#8c3d18');
  } else if (t === 3 || t === 4 || t === 5) {
    const glow = 0.7 + 0.3 * Math.sin(tick * 0.08 + tx);
    const base = t === 3 ? '#f7a928' : t === 4 ? '#57c95a' : '#f2e8c9';
    const edge = t === 3 ? '#a86a12' : t === 4 ? '#2e8f3a' : '#bdb08a';
    rect(x, y, TILE, TILE, edge);
    rect(x + 3, y + 3, TILE - 6, TILE - 6, base);
    ctx.globalAlpha = glow;
    if (t === 3) drawBitcoinGlyph(x + TILE / 2, y + TILE / 2 + 1, 20, '#5a3410');
    else {
      ctx.fillStyle = '#5a3410';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', x + TILE / 2, y + TILE / 2 + 1);
    }
    ctx.globalAlpha = 1;
  } else if (t === 6) {
    rect(x, y, TILE, TILE, '#8a5a30');
    rect(x, y, TILE, 3, '#b07a44');
    rect(x + 5, y + 8, 5, 4, '#6e4522');
    rect(x + 19, y + 18, 5, 4, '#6e4522');
  } else if (t >= 7 && t <= 10) {
    const left = t === 7 || t === 9;
    rect(x, y, TILE, TILE, '#1d7a35');
    rect(x + (left ? 4 : 0), y, left ? TILE - 4 : TILE - 2, TILE, '#2fbc52');
    rect(x + (left ? 9 : 3), y, 5, TILE, '#7be08f');
    rect(x, y, TILE, 3, '#155f2a');
    if (t === 7 || t === 8) rect(x, y, TILE, 5, '#43d465');
  } else if (t === 11) {
    rect(x, y, TILE, 14, '#d08b45');
    rect(x, y, TILE, 3, '#f0b76a');
    rect(x, y + 11, TILE, 3, '#8a5324');
  } else if (t === 12) {
    rect(x, y + 8, TILE, 24, '#256b2f');
    rect(x + 4, y + 6, TILE - 8, 5, '#7be08f');
    rect(x + 4, y + 14, TILE - 8, 4, '#5ccf72');
    rect(x + 4, y + 22, TILE - 8, 4, '#5ccf72');
    rect(x, y + 30, TILE, 2, '#174d21');
  } else if (t >= 13 && t <= 20) {
    const a = ALT[t - 12];
    rect(x, y, TILE, TILE, '#5b3d16');
    rect(x + 2, y + 2, TILE - 4, TILE - 4, a.color);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 17px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(a.sym, x + TILE / 2, y + TILE / 2 + 1);
  } else if (t >= 21 && t <= 25) {
    const gift = [
      { c: '#8be9fd', s: 'B' }, { c: '#ff6ec7', s: 'R' },
      { c: '#7be08f', s: 'F' }, { c: '#ffd166', s: 'O' },
      { c: '#b388ff', s: 'A' }
    ][t - 21];
    const glow = 0.72 + 0.28 * Math.sin(tick * 0.12 + tx);
    rect(x, y, TILE, TILE, '#243049');
    rect(x + 2, y + 2, TILE - 4, TILE - 4, gift.c);
    ctx.globalAlpha = glow;
    ctx.fillStyle = '#141824';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(gift.s, x + TILE / 2, y + TILE / 2 + 1);
    ctx.globalAlpha = 1;
  }
}

function drawTiles() {
  const from = Math.max(0, Math.floor(camX / TILE) - 1);
  const to = Math.min(cols - 1, Math.ceil((camX + W) / TILE) + 1);
  const top = Math.floor(camY / TILE) - 1;
  if (!mainWorld && skyTiles) {
    for (let ty = top; ty < 0; ty++)
      for (let tx = from - 1; tx <= to + 1; tx++) {
        const t = skyTiles.get(tx + ',' + ty);
        if (t) drawTile(tx, ty, t);
      }
  }
  for (let ty = Math.max(0, top); ty < ROWS; ty++)
    for (let tx = from; tx <= to; tx++) {
      const t = tileAt(tx, ty);
      if (t) drawTile(tx, ty, t);
    }
}

/* Símbolo Bitcoin dibujado a mano (sin depender de fuentes) */
function drawBitcoinGlyph(x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.fillStyle = color || '#7a3d00';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('B', 0, 1);
  ctx.fillRect(-6, -10, 2, 4.5);
  ctx.fillRect(-6, 5.5, 2, 4.5);
  ctx.restore();
}

function drawBTC(c) {
  if (c.taken || Math.abs(c.x - p.x) > W) return;
  const x = c.x + 8, y = c.y + 10;
  const w = 0.35 + 0.65 * Math.abs(Math.sin(tick * 0.08 + c.x * 0.04));
  ctx.save();
  ctx.translate(x, y); ctx.scale(w, 1);
  ctx.fillStyle = '#b5660c'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f7931a'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(0, 0, 6.8, 0, Math.PI * 2); ctx.fill();
  drawBitcoinGlyph(0, 1, 15, '#7a3d00');
  ctx.restore();
}

function drawGoldCoin(c) {
  if (c.taken || Math.abs(c.x - p.x) > W || Math.abs(c.y - p.y) > H) return;
  const x = c.x + 8, y = c.y + 10;
  const w = 0.35 + 0.65 * Math.abs(Math.sin(tick * 0.1 + c.x * 0.03));
  ctx.save();
  ctx.translate(x, y); ctx.scale(w, 1);
  ctx.shadowColor = '#ffe680'; ctx.shadowBlur = 12;
  ctx.fillStyle = '#b8860b'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff3a8'; ctx.beginPath(); ctx.arc(0, 0, 6.6, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  drawBitcoinGlyph(0, 1, 15, '#8a5a00');
  ctx.restore();
}

function drawHiddenCoin(h) {
  if (h.taken || Math.abs(h.x - p.x) > W || Math.abs(h.y - p.y) > H) return;
  const a = ALT.find(z => z.key === h.key) || ALT[1];
  const pulse = (1 + Math.sin(tick * 0.12 + h.x * 0.05)) / 2;
  ctx.save();
  ctx.globalAlpha = weapon === 3 ? 0.18 + pulse * 0.28 : 0.04 + pulse * 0.07;
  ctx.fillStyle = a.color;
  ctx.beginPath(); ctx.arc(h.x + 8, h.y + 8, 8, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(a.sym, h.x + 8, h.y + 9);
  ctx.restore();
}

function drawFlag() {
  if (mainWorld) return;
  const x = flag.x, s = flag.scale || 1, top = flag.top;
  rect(x, top - 8 * s, 5 * s, FLOOR - top + 8 * s, '#d8dee9');
  rect(x - 2 * s, top - 10 * s, 9 * s, 8 * s, '#8b95a7');
  rect(x - 20 * s, FLOOR - 6 * s, 40 * s, 6 * s, '#e9eef7');
  const wave = Math.sin(tick * 0.12) * 6 * s;
  const tipX = x + 62 * s + wave;
  ctx.fillStyle = '#f7931a';
  ctx.beginPath();
  ctx.moveTo(x + 5 * s, top);
  ctx.lineTo(tipX, top + 13 * s);
  ctx.lineTo(x + 5 * s, top + 16 * s);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(x + 5 * s, top + 16 * s);
  ctx.lineTo(tipX, top + 13 * s);
  ctx.lineTo(x + 5 * s, top + 32 * s);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x + 31 * s, top + 16 * s, 12 * s, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f7931a';
  ctx.beginPath(); ctx.arc(x + 31 * s, top + 16 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
  drawBitcoinGlyph(x + 31 * s, top + 17 * s, 19 * s, '#7a3d00');
}

function drawLadders() {
  if (mainWorld || !ladders) return;
  for (const L of ladders) {
    const x = L.x * TILE + 10, y = L.y * TILE, w = 12, h = L.h * TILE;
    rect(x, y, 3, h, '#ffd166');
    rect(x + w - 3, y, 3, h, '#ffd166');
    for (let r = 4; r < h; r += 10) rect(x, y + r, w, 3, '#e88b4f');
  }
}

function drawFaller(f) {
  if (!f.active) return;
  rect(f.x, f.y, f.size, f.size, '#141824');
  rect(f.x + 2, f.y + 2, f.size - 4, f.size - 4, f.color);
  rect(f.x + 4, f.y + 4, f.size - 8, 3, 'rgba(255,255,255,0.45)');
}

function drawAsteroid(a) {
  if (!a.active) return;
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.spin);
  ctx.fillStyle = '#6c7890';
  ctx.beginPath(); ctx.arc(0, 0, a.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#485266';
  ctx.beginPath(); ctx.arc(-a.r * 0.3, -a.r * 0.2, a.r * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(a.r * 0.35, a.r * 0.25, a.r * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawHelper(h, k) {
  const info = HELPERS[k % HELPERS.length];
  const x = h.x, y = h.y + Math.sin(h.bob) * 2;
  rect(x + 2, y + 5, 14, 11, info.color);
  rect(x + 4, y + 1, 10, 8, info.color);
  rect(x + 5, y + 4, 2, 2, '#141824');
  rect(x + 11, y + 4, 2, 2, '#141824');
  if (k === 0) { rect(x + 1, y, 4, 6, info.dark); rect(x + 13, y, 4, 6, info.dark); }
  else if (k === 1) { rect(x + 4, y - 5, 4, 8, info.color); rect(x + 10, y - 5, 4, 8, info.color); }
  else if (k === 2) { rect(x + 3, y + 1, 4, 3, '#ffd166'); rect(x + 11, y + 1, 4, 3, '#ffd166'); }
  else { rect(x + 8, y - 4, 2, 5, '#8be9fd'); ctx.fillStyle = '#8be9fd'; ctx.fillRect(x + 6, y - 6, 6, 2); }
  ctx.fillStyle = info.dark;
  ctx.font = 'bold 8px "Courier New", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('₿', x + 9, y + 13);
}

function drawCar(car) {
  const x = car.x, y = car.y, w = car.w, h = car.h;
  if (performance.now() < dashUntil) {
    ctx.fillStyle = '#8be9fd';
    ctx.beginPath();
    ctx.moveTo(x, y + h - 5); ctx.lineTo(x - 18 - Math.random() * 8, y + h - 9);
    ctx.lineTo(x - 2, y + h - 1); ctx.closePath(); ctx.fill();
  }
  rect(x + 4, y, w - 10, 10, '#e33b3b');
  rect(x, y + 6, w, 9, '#c92d2d');
  rect(x + 10, y - 6, w - 24, 8, '#8be9fd');
  rect(x + 4, y - 2, 6, 5, '#f7931a');
  rect(x + w - 12, y - 2, 6, 5, '#f7931a');
  rect(x + 6, y + h - 5, 12, 8, '#1a1d26');
  rect(x + w - 20, y + h - 5, 12, 8, '#1a1d26');
  ctx.fillStyle = '#ffd166';
  ctx.beginPath(); ctx.arc(x + 12, y + h - 1, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + w - 14, y + h - 1, 4, 0, Math.PI * 2); ctx.fill();
}

function drawFinalCoinWorld() {
  if (finalCoinT < 0) return;
  const k = clamp(finalCoinT / 60, 0, 1);
  const fade = finalCoinT > 145 ? clamp((170 - finalCoinT) / 25, 0, 1) : 1;
  const r = 18 + k * 52 + Math.sin(finalCoinT * 0.16) * 3;
  const x = flag.x + 10, y = FLOOR - 120 - k * 40;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 30;
  ctx.fillStyle = '#b5660c'; ctx.beginPath(); ctx.arc(x, y, r + 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f7931a'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(x, y, r - 9, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  drawBitcoinGlyph(x, y + 2, r * 1.15, '#7a3d00');
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBonusExit() {
  const x = bonusExitX * TILE;
  rect(x, FLOOR - 64, 64, 64, '#1d7a35');
  rect(x + 6, FLOOR - 64, 52, 64, '#2fbc52');
  rect(x + 12, FLOOR - 64, 10, 64, '#7be08f');
  rect(x, FLOOR - 70, 64, 10, '#43d465');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SALIDA', x + 32, FLOOR - 34);
}

function drawRideCloud(c) {
  drawCloudShape(c.x + 34, c.y + 12, 1.25, cloudRide === c ? '#fff6b0' : '#ffffff');
  rect(c.x + 16, c.y + 22, 44, 6, 'rgba(0,0,0,0.08)');
  if (cloudRide !== c) {
    ctx.fillStyle = '#8b5cf6';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✦', c.x + 36, c.y + 10);
  }
}

function drawBolt(b) {
  const kind = b.kind || 'bolt';
  const color = b.color || '#fff36b';
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  if (kind === 'bolt') {
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - 8 * b.dir, b.y - 7);
    ctx.lineTo(b.x + 3 * b.dir, b.y + 1);
    ctx.lineTo(b.x - 7 * b.dir, b.y + 8);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke();
  } else if (kind === 'flame') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(b.x + 7 * b.dir, b.y);
    ctx.quadraticCurveTo(b.x - 3 * b.dir, b.y - 9, b.x - 13 * b.dir, b.y);
    ctx.quadraticCurveTo(b.x - 3 * b.dir, b.y + 9, b.x + 7 * b.dir, b.y);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath(); ctx.arc(b.x - 2 * b.dir, b.y, 3, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'fireball') {
    ctx.fillStyle = '#ff4d1a';
    ctx.beginPath(); ctx.arc(b.x, b.y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(b.x - b.dir, b.y - 1, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3a8';
    ctx.beginPath(); ctx.arc(b.x - 2 * b.dir, b.y - 2, 3, 0, Math.PI * 2); ctx.fill();
  } else {
    const r = 16 + Math.sin(b.age * 0.4) * 3;
    ctx.fillStyle = '#ff3b1f'; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff9d3b'; ctx.beginPath(); ctx.arc(b.x, b.y, r - 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(b.x, b.y, r - 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(b.x, b.y, r - 13, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawBull() {
  if (p.star > 0 && Math.floor(tick / 3) % 2 === 0 && p.shield === 0) return;
  if (p.shield > 0 && Math.floor(tick / 4) % 2 === 0 && p.star === 0) return;

  const x = p.x, y = p.y, w = p.w, h = p.h;
  const star = p.star > 0;
  const OUTFITS = [
    { cream: '#f3e3c6', brown: '#8b4a2b' },
    { cream: '#dff1ff', brown: '#2b6ca3' },
    { cream: '#ffe6f2', brown: '#b2376f' },
    { cream: '#e7ffd8', brown: '#3e8b35' }
  ];
  const look = OUTFITS[p.outfit % OUTFITS.length] || OUTFITS[0];
  const cream = star ? '#ffe9a8' : look.cream;
  const brown = star ? '#c25be0' : look.brown;
  const dark = '#5b2f1a';
  const hoof = '#3d2417';

  if (p.wingLevel > 0) {
    const flap = Math.sin(p.wingFlap) * (p.wingActive ? 9 : 4);
    const wingColor = ['#b388ff', '#8be9fd', '#ffd166'][Math.min(2, p.wingLevel - 1)];
    ctx.fillStyle = wingColor;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 16); ctx.lineTo(x - 12 - p.wingLevel * 2, y + 2 - flap);
    ctx.lineTo(x - 8, y + 26 + flap * 0.4); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w - 8, y + 16); ctx.lineTo(x + w + 12 + p.wingLevel * 2, y + 2 - flap);
    ctx.lineTo(x + w + 8, y + 26 + flap * 0.4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 7, y + 16); ctx.lineTo(x - 8, y + 12 - flap * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - 7, y + 16); ctx.lineTo(x + w + 8, y + 12 - flap * 0.5); ctx.stroke();
  }

  rect(x + (p.face > 0 ? -5 : w + 2), y + h - 26, 6, 3, dark);
  rect(x + (p.face > 0 ? -7 : w + 4), y + h - 32, 4, 7, dark);

  const step = p.onGround && Math.abs(p.vx) > 0.3 ? Math.sin(p.anim * 1.4) * 4 : 0;
  rect(x + 3, y + h - 8, 8, 8, hoof);
  rect(x + w - 11, y + h - 8, 8, 8, hoof);
  if (p.onGround) {
    rect(x + 3, y + h - 8 + step, 8, 8, hoof);
    rect(x + w - 11, y + h - 8 - step, 8, 8, hoof);
  }

  rect(x + 1, y + h - 30, w - 2, 23, cream);
  rect(x + 2, y + h - 29, 8, 12, brown);
  rect(x + w - 10, y + h - 18, 8, 10, brown);

  const hy = y + 2;
  rect(x + 1, hy + 2, w - 2, 20, brown);
  rect(x + 2, hy + 3, 6, 6, dark);
  rect(x + (p.face > 0 ? w - 8 : 2), hy + 3, 6, 6, dark);

  ctx.fillStyle = '#fff3cf';
  ctx.beginPath();
  if (p.face > 0) {
    ctx.moveTo(x + 3, hy + 4); ctx.lineTo(x + 1, hy - 7); ctx.lineTo(x + 11, hy + 2);
    ctx.moveTo(x + w - 4, hy + 4); ctx.lineTo(x + w - 1, hy - 6); ctx.lineTo(x + w - 12, hy + 2);
  } else {
    ctx.moveTo(x + 4, hy + 4); ctx.lineTo(x + 1, hy - 6); ctx.lineTo(x + 12, hy + 2);
    ctx.moveTo(x + w - 3, hy + 4); ctx.lineTo(x + w - 1, hy - 7); ctx.lineTo(x + w - 11, hy + 2);
  }
  ctx.fill();

  /* chispa en los cuernos cuando el rayo está listo */
  if (boltCd <= 0) {
    const hx = p.face > 0 ? x + w - 1 : x + 1;
    ctx.fillStyle = Math.floor(tick / 6) % 2 ? '#fff36b' : '#ffffff';
    ctx.fillRect(hx - 2, hy - 9, 4, 4);
  }

  if (p.ears) {
    rect(x + 1, hy + 7, 7, 12, brown);
    rect(x + w - 8, hy + 7, 7, 12, brown);
    rect(x + 3, hy + 10, 3, 6, '#e8a2a2');
    rect(x + w - 6, hy + 10, 3, 6, '#e8a2a2');
  }
  if (p.flower) {
    const fx = x + w / 2, fy = hy - 8;
    rect(fx - 1, fy + 4, 2, 8, '#2e9e4f');
    ctx.fillStyle = '#ff6ec7';
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5 + tick * 0.02;
      ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 5, fy + Math.sin(a) * 5, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(fx, fy, 2.5, 0, Math.PI * 2); ctx.fill();
  }

  const nx = p.face > 0 ? x + w - 10 : x + 2;
  rect(nx, hy + 13, 10, 8, '#e8a2a2');
  rect(nx + 2, hy + 15, 2, 2, '#7a3f3f');
  rect(nx + 6, hy + 15, 2, 2, '#7a3f3f');
  rect(nx + 1, hy + 20, 8, 2, '#d4af37');

  const ex = p.face > 0 ? x + w - 8 : x + 5;
  rect(ex, hy + 8, 3, 4, '#fff');
  rect(ex + (p.face > 0 ? 2 : 0), hy + 9, 2, 3, '#111');
}

function drawBear(b) {
  if (b.dead && b.squash <= 0) return;
  const squash = b.dead ? Math.max(1, b.squash / 20) : 1;
  const h = 28 * squash;
  const y = FLOOR - h;
  const x = b.x;
  const step = Math.sin(b.anim) > 0 ? 2 : -2;

  if (b.kind === 'drone') {
    const hover = Math.sin(tick * 0.12 + b.anim) * 4;
    const dy = y + hover;
    ctx.fillStyle = '#8be9fd';
    ctx.beginPath(); ctx.arc(x + 14, dy + 14, 13, 0, Math.PI * 2); ctx.fill();
    rect(x + 1, dy + 10, 26, 8, '#485266');
    rect(x + 6, dy + 12, 5, 4, '#ff6b6b');
    rect(x + 17, dy + 12, 5, 4, '#ff6b6b');
    rect(x + 11, dy + 2, 6, 5, '#ffd166');
    ctx.fillStyle = '#8be9fd'; ctx.fillRect(x + 3, dy + 24, 5, 3); ctx.fillRect(x + 20, dy + 24, 5, 3);
    if (b.loot > 0) {
      ctx.fillStyle = '#f7931a'; ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('₿' + b.loot, x + 14, dy - 10);
    }
    return;
  }

  rect(x + 3, y + h - 6, 8, 6, '#4a2d16');
  rect(x + 16, y + h - 6 + step * 0.3, 8, 6, '#4a2d16');
  rect(x + 1, y + 7, 26, 16 * squash, '#7d4a24');
  rect(x + 4, y + 2, 8, 8, '#8b5a2b');
  rect(x + 17, y + 2, 8, 8, '#8b5a2b');
  rect(x + 6, y + 4, 4, 4, '#5b3218');
  rect(x + 19, y + 4, 4, 4, '#5b3218');
  rect(x + 7, y + 14, 6, 9, '#c99a63');
  rect(x + 16, y + 14, 6, 9, '#c99a63');
  rect(x + 5, y + 12, 18, 3, '#5b3218');
  rect(x + 12, y + 17, 5, 4, '#2b160b');
  rect(x + 8, y + 9, 4, 3, '#2b160b');
  rect(x + 18, y + 9, 4, 3, '#2b160b');
  if (b.kind === 'worker') {
    rect(x + 2, y, 24, 6, '#ffd166');
    rect(x + 6, y - 4, 16, 5, '#ffd166');
    rect(x + 11, y - 7, 6, 4, '#f7931a');
  }
  if (b.kind === 'block') {
    rect(x, y + 6, 28, 22, '#8be9fd');
    rect(x + 15, y + 6, 13, 11, '#ff6ec7');
    rect(x + 2, y + 8, 11, 9, '#7be08f');
    rect(x + 15, y + 17, 11, 9, '#f7931a');
  }
  if (b.loot > 0) {
    ctx.fillStyle = '#f7931a';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('₿' + b.loot, x + 14, y - 8 + Math.sin(tick * 0.1) * 2);
  }
}

function drawPowerup(u) {
  const x = u.x, y = u.y;
  if (u.type === 'bullet') {
    rect(x + 4, y + 8, 16, 9, '#8be9fd');
    rect(x + 18, y + 10, 5, 5, '#ffffff');
    rect(x + 2, y + 10, 3, 5, '#2b8ba8');
  } else if (u.type === 'outfit') {
    rect(x + 4, y + 5, 16, 17, '#ff6ec7');
    rect(x + 8, y + 2, 8, 5, '#ff6ec7');
    rect(x + 7, y + 9, 10, 3, '#ffffff');
  } else if (u.type === 'flower') {
    rect(x + 11, y + 12, 3, 11, '#2e9e4f');
    ctx.fillStyle = '#ff6ec7';
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      ctx.beginPath(); ctx.arc(x + 12 + Math.cos(a) * 6, y + 9 + Math.sin(a) * 6, 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(x + 12, y + 9, 3, 0, Math.PI * 2); ctx.fill();
  } else if (u.type === 'ears') {
    rect(x + 2, y + 8, 8, 12, '#ffd166');
    rect(x + 14, y + 8, 8, 12, '#ffd166');
    rect(x + 4, y + 11, 4, 6, '#e88b4f');
    rect(x + 16, y + 11, 4, 6, '#e88b4f');
  } else if (u.type === 'wings') {
    ctx.fillStyle = '#b388ff';
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 12); ctx.lineTo(x, y + 3); ctx.lineTo(x + 3, y + 17); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 12); ctx.lineTo(x + 24, y + 3); ctx.lineTo(x + 21, y + 17); ctx.closePath(); ctx.fill();
  } else if (u.type === 'mushroom') {
    rect(x + 3, y + 12, 18, 12, '#f2e4c9');
    rect(x, y + 4, 24, 12, '#e33b3b');
    rect(x + 5, y + 7, 5, 5, '#fff');
    rect(x + 15, y + 6, 5, 5, '#fff');
    rect(x + 9, y + 15, 3, 4, '#111');
    rect(x + 15, y + 15, 3, 4, '#111');
  } else {
    const wob = Math.sin(tick * 0.2) * 2;
    ctx.fillStyle = '#ffd83d';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const r = i % 2 ? 8 : 13 + wob;
      i ? ctx.lineTo(x + 12 + Math.cos(a) * r, y + 12 + Math.sin(a) * r)
        : ctx.moveTo(x + 12 + Math.cos(a) * r, y + 12 + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
    rect(x + 8, y + 10, 3, 4, '#7a4a00');
    rect(x + 14, y + 10, 3, 4, '#7a4a00');
  }
}

function drawParticles() {
  for (const q of particles) { ctx.globalAlpha = clamp(q.life / q.max, 0, 1); rect(q.x, q.y, q.size, q.size, q.c); }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.textAlign = 'center';
  for (const t of texts) { ctx.globalAlpha = clamp(t.life / 60, 0, 1); ctx.fillText(t.text, t.x, t.y); }
  ctx.globalAlpha = 1;
}

function pad(n, len) { return String(Math.floor(n)).padStart(len, '0'); }

function drawPowerBar(x, y, label, cd, max, color) {
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#000'; ctx.fillText(label, x + 1, y + 1);
  ctx.fillStyle = '#fff'; ctx.fillText(label, x, y);
  const bw = 92;
  rect(x, y + 14, bw, 7, 'rgba(0,0,0,0.55)');
  const ready = cd <= 0;
  rect(x + 1, y + 15, (bw - 2) * (ready ? 1 : 1 - cd / max), 5, ready ? color : '#8892a6');
}

function drawInfiniteTag(x, y, label, color) {
  const text = label + ' ∞';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x - 4, y - 2, 106, 17);
  ctx.fillStyle = '#000'; ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}

function drawHUD() {
  const hs = OPT.hudSize === 'grande' ? 1.18 : 1;
  ctx.font = `bold ${14 * hs}px "Courier New", monospace`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  function shadow(t, x, y) {
    ctx.fillStyle = '#000'; ctx.fillText(t, x + 2, y + 2);
    ctx.fillStyle = '#fff'; ctx.fillText(t, x, y);
  }
  shadow('SCORE ' + pad(score, 6), 16, 14);
  shadow('₿ ' + pad(coinCount, 3) + ' · ' + fmt(satsTotal()) + ' sats', 16, 34);
  shadow(mainWorld ? 'TÚNEL SECRETO' : cfg.themeName, W / 2 - 70, 14);
  shadow('NIVEL ' + cfg.short, W - 118, 14);
  shadow('USD ' + usdText(), W - 160, 34);
  if (helpers && helpers.length) shadow('AYUDANTES ' + helpers.length, 16, 100);

  if (OPT.infiniteSuper) drawInfiniteTag(16, 58, 'Q SUPER SALTO', '#fff36b');
  else drawPowerBar(16, 58, 'Q SUPER SALTO', superCd, 240, '#fff36b');
  const wpn = WEAPONS[weapon];
  if (OPT.infiniteFire) drawInfiniteTag(124, 58, 'E ' + wpn.name, wpn.color);
  else drawPowerBar(124, 58, 'E ' + wpn.name, boltCd, wpn.cd, wpn.color);
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  const turbo = OPT.doubleW && performance.now() < dashUntil ? ' · W×2 TURBO' : '';
  const help = 'C ARMA · V ALAS · P OPCIONES' + (OPT.autoFire ? ' · FUEGO AUTO' : '') + turbo;
  ctx.fillStyle = '#000'; ctx.fillText(help, 17, 81);
  ctx.fillStyle = '#ffe9a8'; ctx.fillText(help, 16, 80);

  const wlist = ALT.slice(0, levelIndex >= 1 ? 9 : 1);
  ctx.font = 'bold 10px "Courier New", monospace';
  ctx.textAlign = 'right'; ctx.textBaseline = 'top';
  for (let r = 0; r < 2; r++) {
    const part = wlist.slice(r * 5, r * 5 + 5);
    if (!part.length) continue;
    const s = part.map(a => a.key + ' ' + Math.floor(WALLETS[a.key] || 0)).join(' · ');
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(s, W - 9, 57 + r * 13);
    ctx.fillStyle = '#ffe9a8'; ctx.fillText(s, W - 10, 56 + r * 13);
  }

  if (state === 'playing') {
    const tx = Math.floor((p.x + p.w / 2) / TILE);
    const ty = Math.floor((p.y + p.h + 3) / TILE);
    const t = tileAt(tx, ty);
    if ((t === 7 || t === 8) && p.onGround) {
      ctx.fillStyle = '#000'; ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESIONA ↓ PARA ENTRAR EN LA TUBERÍA', W / 2 + 2, H - 27 + 2);
      ctx.fillStyle = '#fff36b';
      ctx.fillText('PRESIONA ↓ PARA ENTRAR EN LA TUBERÍA', W / 2, H - 27);
    }
    if (cloudRide) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VIAJANDO EN NUBE · ESPACIO PARA BAJAR', W / 2, H - 27);
    }
  }
}

function centerText(text, y, size, color) {
  ctx.fillStyle = '#000';
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2 + 3, y + 3);
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, y);
}
function shade(alpha = 0.62) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

/* ---------------- MENÚ DE OPCIONES EN PAUSA ---------------- */

const OPT_TABS = [
  {
    name: 'JUEGO',
    rows: [
      { key: 'infiniteFire', label: 'FUEGO INFINITO', values: [true, false], fmt: v => v ? 'ACTIVADO · SIN BARRA' : 'CON RECARGA' },
      { key: 'autoFire', label: 'FUEGO AUTOMÁTICO', values: [true, false], fmt: v => v ? 'DISPARA SOLO' : 'SOLO CON E' },
      { key: 'wings', label: 'ALAS PARA VOLAR', values: [true, false], fmt: v => v ? 'ACTIVADAS · V' : 'DESACTIVADAS' },
      { key: 'infiniteSuper', label: 'SUPER SALTO ∞', values: [true, false], fmt: v => v ? 'ACTIVADO · SIN BARRA' : 'CON RECARGA' },
      { key: 'doubleW', label: 'DOBLE W TURBO', values: [true, false], fmt: v => v ? 'ACTIVADO' : 'DESACTIVADO' },
      { key: 'coinMagnet', label: 'IMÁN DE MONEDAS', values: [true, false], fmt: v => v ? 'ACTIVADO' : 'DESACTIVADO' },
      { key: 'infiniteSky', label: 'CIELO INFINITO', values: [true, false], fmt: v => v ? 'ACTIVADO' : 'SOLO NIVELES 1-7' },
      { key: 'hiddenCoins', label: 'MONEDAS OCULTAS', values: [true, false], fmt: v => v ? 'ACTIVADAS' : 'DESACTIVADAS' }
    ]
  },
  {
    name: 'SONIDO',
    rows: [
      { key: 'music', label: 'MÚSICA', values: MUSIC_STYLES, fmt: v => ({ clasica: 'CLÁSICA', arcade: 'ARCADE', espacial: 'ESPACIAL', off: 'SILENCIADA' })[v] },
      { key: 'sfxStyle', label: 'EFECTOS', values: SFX_STYLES, fmt: v => ({ retro: 'RETRO', suave: 'SUAVE', potente: 'POTENTE' })[v] },
      { key: 'levelMusic', label: 'TEMA POR NIVEL', values: [true, false], fmt: v => v ? '10 MELODÍAS' : 'UNA SOLA MELODÍA' },
      { key: 'sfx', label: 'SONIDOS', values: [true, false], fmt: v => v ? 'ACTIVADOS' : 'SILENCIADOS' },
      { key: 'volume', label: 'VOLUMEN', values: [0, 20, 40, 60, 70, 85, 100], fmt: v => v + '%' }
    ]
  },
  {
    name: 'ECONOMÍA',
    rows: [
      { key: 'coinSats', label: 'VALOR POR MONEDA', values: SAT_CHOICES, fmt: v => fmt(v) + ' sats' },
      { key: 'btcPrice', label: 'PRECIO BTC FICTICIO', values: PRICE_CHOICES, fmt: v => '$' + fmt(v) }
    ]
  },
  {
    name: 'PANTALLA',
    rows: [
      { key: 'screenMode', label: 'MODO DE PANTALLA', values: SCREEN_MODES, fmt: v => ({ auto: 'AUTO 16:9', pixel: 'PIXELADO', suave: 'SUAVE', ancho: 'PANORÁMICO', vertical: 'VERTICAL MÓVIL' })[v] },
      { key: 'touchLayout', label: 'CONTROLES TÁCTILES', values: TOUCH_LAYOUTS, fmt: v => ({ auto: 'AUTO', izquierda: 'AGRUPADOS IZQ.', derecha: 'AGRUPADOS DER.', compacto: 'COMPACTOS' })[v] },
      { key: 'hudSize', label: 'TAMAÑO DEL HUD', values: HUD_SIZES, fmt: v => v === 'grande' ? 'GRANDE' : 'NORMAL' },
      { info: true, label: 'RESOLUCIÓN LÓGICA', fmt: () => W + '×' + H + ' · 16:9' }
    ]
  },
  {
    name: 'EXTRAS',
    rows: [
      { key: 'altcoins', label: 'ALTCOINS', values: [true, false], fmt: v => v ? '8 MONEDAS' : 'SOLO BTC' },
      { key: 'fireworks', label: 'FUEGOS ARTIFICIALES', values: [true, false], fmt: v => v ? 'ACTIVADOS' : 'DESACTIVADOS' },
      { info: true, label: 'BTC FICTICIO', fmt: () => btcTotal().toFixed(8) + ' BTC' },
      { info: true, label: 'VALOR ESTIMADO', fmt: () => usdText() },
      { action: 'reset', label: 'RESTAURAR OPCIONES', fmt: () => 'PULSA ENTER' }
    ]
  }
];

function currentOptRow() {
  const tab = OPT_TABS[optTab];
  return tab.rows[Math.min(optRow, tab.rows.length - 1)];
}

function applyOption(step = 1) {
  const row = currentOptRow();
  if (!row) return;
  if (row.action === 'reset') {
    OPT = { ...DEFAULT_OPT };
    saveOpt();
    applyScreenMode();
    optTab = 0; optRow = 0;
    SFX.wallet();
    return;
  }
  if (row.info || !row.values) return;
  let i = row.values.indexOf(OPT[row.key]);
  if (i < 0) i = 0;
  i = (i + step + row.values.length) % row.values.length;
  OPT[row.key] = row.values[i];
  saveOpt();
  if (row.key === 'screenMode' || row.key === 'touchLayout' || row.key === 'hudSize') applyScreenMode();
  SFX.wallet();
}

function navigateOptions(dx, dy) {
  if (dx) {
    optTab = (optTab + dx + OPT_TABS.length) % OPT_TABS.length;
    optRow = 0;
    SFX.wallet();
  }
  if (dy) {
    const n = OPT_TABS[optTab].rows.length;
    optRow = (optRow + dy + n) % n;
    SFX.wallet();
  }
}

function togglePause() {
  if (state === 'playing' || state === 'bonus' || state === 'victory' || state === 'finalCoin' || state === 'payout') {
    pausedFrom = state;
    state = 'paused';
  } else if (state === 'paused') {
    state = pausedFrom;
  }
}

function optTabRect(i) {
  const gap = 6, total = 686;
  const w = Math.floor((total - gap * (OPT_TABS.length - 1)) / OPT_TABS.length);
  return { x: 58 + i * (w + gap), y: 64, w, h: 24 };
}

function drawOptionsPanel() {
  shade(0.78);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#151b2b';
  ctx.fillRect(40, 18, 720, 414);
  ctx.restore();
  ctx.strokeStyle = '#f7931a'; ctx.lineWidth = 2;
  ctx.strokeRect(40, 18, 720, 414);

  centerText('PAUSA · OPCIONES', 44, 24, '#ffd23f');

  for (let i = 0; i < OPT_TABS.length; i++) {
    const r = optTabRect(i), active = i === optTab;
    ctx.fillStyle = active ? '#f7931a' : '#222a3d';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    if (active) {
      ctx.shadowColor = '#f7931a'; ctx.shadowBlur = 12;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = active ? '#141824' : '#cfd8ea';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(OPT_TABS[i].name, r.x + r.w / 2, r.y + r.h / 2 + 1);
  }

  const rows = OPT_TABS[optTab].rows;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], y = 100 + i * 27, selected = i === optRow;
    if (selected) {
      ctx.fillStyle = 'rgba(247,147,26,0.18)';
      ctx.fillRect(56, y - 3, 688, 24);
      ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1;
      ctx.strokeRect(56, y - 3, 688, 24);
    }
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = selected ? '#ffffff' : '#aeb7cc';
    ctx.fillText(r.label, 70, y + 8);
    ctx.textAlign = 'right';
    ctx.fillStyle = selected ? '#8be9fd' : '#ffd23f';
    const value = r.fmt ? r.fmt(OPT[r.key]) : '';
    ctx.fillText(value, 730, y + 8);
    if (selected && r.key === 'coinSats') {
      ctx.font = '10px "Courier New", monospace';
      ctx.fillStyle = '#7be08f';
      ctx.fillText('1 ₿ = ' + fmt(SATS_PER_BTC / OPT.coinSats) + ' monedas', 730, y + 20);
    }
  }

  ctx.fillStyle = '#6e7891';
  ctx.font = '11px "Courier New", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const note = 'Precio y sats ficticios · sin internet · se guardan en este dispositivo';
  ctx.fillText(note, W / 2, 344);

  const bx = 300, by = 362, bw = 200, bh = 30;
  ctx.fillStyle = '#f7931a';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = '#141824';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('REANUDAR', bx + bw / 2, by + bh / 2 + 1);
  ctx.fillStyle = '#8b95a7';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('← → pestaña   ↑ ↓ opción   ENTER cambiar   P volver', W / 2, 414);
  ctx.textBaseline = 'alphabetic';
}

function optionsPointer(x, y) {
  if (state !== 'paused') return false;
  for (let i = 0; i < OPT_TABS.length; i++) {
    const r = optTabRect(i);
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
      optTab = i; optRow = 0; SFX.wallet(); return true;
    }
  }
  const rows = OPT_TABS[optTab].rows;
  for (let i = 0; i < rows.length; i++) {
    const ry = 100 + i * 27;
    if (x >= 56 && x <= 744 && y >= ry - 3 && y <= ry + 21) {
      optRow = i; applyOption(1); return true;
    }
  }
  if (x >= 300 && x <= 500 && y >= 362 && y <= 392) {
    togglePause(); return true;
  }
  return false;
}

function drawOverlay() {
  const blink = Math.floor(tick / 30) % 2 === 0;
  if (state === 'title') {
    shade(0.35);
    centerText('SUPER PABLO BROS', 104, 40, '#f7931a');
    centerText('EL TORO CON PODERES VS. LOS OSOS LADRONES', 146, 15, '#ffffff');
    centerText('50 NIVELES · NUNCA PIERDES · MILLONES DE BTC', 168, 13, '#bfe3ff');
    centerText('Q = SUPER SALTO ∞   E = BALAS ∞   V = ALAS   C = ARMA', 196, 13, '#fff36b');
    centerText('W DOS VECES = TURBO · BLOQUES ! @ * ^ + = PREMIOS', 220, 12, '#8be9fd');
    centerText('↓ EN UNA TUBERÍA = TÚNEL SECRETO DE BITCOIN', 244, 12, '#8be9fd');
    centerText('AYUDANTES NUEVOS EN NIVELES 10, 20, 30 Y 40', 268, 12, '#b388ff');
    centerText('← → mover   ESPACIO/W saltar   SHIFT correr', 292, 12, '#d7deea');
    if (blink) centerText('PRESIONA ENTER PARA EMPEZAR', 330, 18, '#ffffff');
    centerText('P = OPCIONES Y PANTALLA   R reiniciar   M silenciar', 400, 12, '#d7deea');
  } else if (state === 'paused') {
    drawOptionsPanel();
  } else if (state === 'levelclear') {
    shade(0.5);
    centerText('¡NIVEL COMPLETADO!', H / 2 - 40, 34, '#f7931a');
    centerText('+1000 BTC DE BONO', H / 2 + 4, 18, '#fff36b');
    centerText('TOTAL: ' + pad(coinCount, 3) + ' BTC', H / 2 + 34, 16, '#ffffff');
  } else if (state === 'finalCoin') {
    shade(0.24);
    centerText('¡LA MONEDA FINAL!', 40, 30, '#ffd166');
    centerText('BAJANDO LA BANDERA DEL ÚLTIMO NIVEL', 74, 13, '#ffffff');
  } else if (state === 'payout') {
    shade(0.32);
    centerText('¡FUEGOS ARTIFICIALES!', 36, 27, '#ffd23f');
    centerText('TODAS TUS MONEDAS VUELAN A SUS BILLETERAS', 68, 13, '#ffffff');
    for (let i = 0; i < ALT.length; i++) {
      const a = ALT[i], t = walletTarget(i);
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(t.x - 20, t.y - 12, 40, 24);
      ctx.strokeStyle = a.color; ctx.lineWidth = 2;
      ctx.strokeRect(t.x - 20, t.y - 12, 40, 24);
      ctx.fillStyle = a.color;
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(a.sym, t.x, t.y);
    }
    ctx.textBaseline = 'alphabetic';
    centerText('TRABAJANDO... ' + Math.min(100, Math.floor(payoutIndex / payoutQueue.length * 100)) + '%', 388, 13, '#7be08f');
  } else if (state === 'victory') {
    shade(0.88);
    centerText('¡GRACIAS POR JUGAR!', 16, 22, '#ffd23f');
    constPhoto:
    {
      const dh = 174;
      const s = thanksImg.naturalHeight ? dh / thanksImg.naturalHeight : 0.11;
      const dw = thanksImg.naturalWidth ? thanksImg.naturalWidth * s : 96;
      const dx = W / 2 - 118, dy = 30;
      if (thanksImg.complete && thanksImg.naturalWidth > 0) {
        ctx.drawImage(thanksImg, dx, dy, dw, dh);
        ctx.strokeStyle = '#f7931a'; ctx.lineWidth = 3;
        ctx.strokeRect(dx - 3, dy - 3, dw + 6, dh + 6);
        /* Lentes negros dibujados sobre la foto */
        const ly = dy + dh * 0.20, lw = dw * 0.29, lh = dh * 0.055;
        rect(dx + dw * 0.14, ly, lw, lh, '#0b0d12');
        rect(dx + dw * 0.55, ly, lw, lh, '#0b0d12');
        rect(dx + dw * 0.43, ly + lh * 0.35, dw * 0.14, lh * 0.3, '#0b0d12');
        rect(dx + dw * 0.17, ly + 2, lw - 5, 2, 'rgba(139,233,253,0.55)');
        rect(dx + dw * 0.58, ly + 2, lw - 5, 2, 'rgba(139,233,253,0.55)');
      }
      /* Pulgar gigante de OK dibujado por código */
      const hx = dx + dw + 24, hy = dy + 108;
      rect(hx + 10, hy + 28, 22, 46, '#e0a56d');
      rect(hx + 4, hy + 16, 34, 34, '#f0bd85');
      rect(hx + 12, hy - 4, 22, 30, '#f0bd85');
      ctx.fillStyle = '#f0bd85';
      ctx.beginPath(); ctx.arc(hx + 23, hy + 8, 13, 0, Math.PI * 2); ctx.fill();
      rect(hx + 4, hy + 44, 34, 18, '#f0bd85');
      rect(hx + 4, hy + 58, 34, 16, '#2b6ca3');
      /* Burbuja de texto */
      rect(hx + 44, dy + 18, 150, 44, '#111826');
      ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2;
      ctx.strokeRect(hx + 44, dy + 18, 150, 44);
      ctx.fillStyle = '#111826';
      ctx.beginPath();
      ctx.moveTo(hx + 48, dy + 62); ctx.lineTo(hx + 30, dy + 82); ctx.lineTo(hx + 64, dy + 62);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('¡LO LOGRASTE!', hx + 119, dy + 40);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText('EL TORO Y TÚ LO HICISTES', hx + 119, dy + 55);
    }
    centerText('TUS MONEDAS YA ESTÁN EN SUS BILLETERAS', 216, 14, '#fff36b');
    for (let i = 0; i < ALT.length; i++) {
      const a = ALT[i];
      const tx = W / 2 + ((i % 3) - 1) * 152, ty = 234 + Math.floor(i / 3) * 17;
      const label = a.key + ' ' + Math.floor(WALLETS[a.key] || 0).toLocaleString('es-ES') + ' ' + a.sym;
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000'; ctx.fillText(label, tx + 1, ty + 1);
      ctx.fillStyle = a.color; ctx.fillText(label, tx, ty);
    }
    centerText('TOTAL: ' + fmt(satsTotal()) + ' SATOSHIS', 280, 14, '#ffffff');
    centerText('BTC EQUIVALENTE: ' + btcTotal().toFixed(8), 298, 12, '#ffd166');
    centerText('PRECIO FICTICIO: $' + fmt(OPT.btcPrice) + ' / BTC', 316, 11, '#8be9fd');
    centerText('VALOR ESTIMADO: ' + usdText(), 334, 12, '#7be08f');
    centerText('BONO FINAL: ' + fmt(FINAL_BONUS_SATS) + ' sats', 352, 10, '#cdd6e8');
    centerText('WALLET BTC (DEMO): ' + WALLET, 370, 10, '#8be9fd');
    centerText('TRANSFERENCIA SIMULADA - NO ES DINERO REAL', 388, 10, '#ff9d9d');
    if (blink) centerText('R JUGAR DE NUEVO · P OPCIONES', 418, 11, '#ffffff');
    ctx.textBaseline = 'alphabetic';
  }
}

function render() {
  drawSky();
  ctx.save();
  ctx.translate(0, -Math.round(camY * 0.25));
  drawBackground();
  ctx.restore();

  ctx.save();
  ctx.translate(-Math.round(camX), -Math.round(camY));
  drawTiles();
  drawLadders();
  for (const f of fallers || []) drawFaller(f);
  for (const a of asteroids || []) drawAsteroid(a);
  if (mainWorld) drawBonusExit(); else drawFlag();
  for (const c of coins) drawBTC(c);
  for (const g of goldCoins) drawGoldCoin(g);
  for (const h of hiddenCoins) if (!h.taken && h.revealed) drawHiddenCoin(h);
  for (const c of clouds) drawRideCloud(c);
  for (const u of powerups) drawPowerup(u);
  for (const b of bears) drawBear(b);
  for (let k = 0; k < (helpers || []).length; k++) drawHelper(helpers[k], k);
  if (car) drawCar(car);
  for (const b of bolts) drawBolt(b);
  drawBull();
  if (state === 'finalCoin') drawFinalCoinWorld();
  for (const f of fireworks) {
    ctx.globalAlpha = f.life / f.max * 0.5;
    ctx.strokeStyle = f.c;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(f.x, f.y, (1 - f.life / f.max) * 60 + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  drawParticles();
  ctx.restore();

  for (const s of payoutSparks) {
    ctx.globalAlpha = clamp(s.life / 18, 0, 1);
    ctx.fillStyle = s.color;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(s.sym, s.x, s.y);
  }
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'alphabetic';

  if (state !== 'title') drawHUD();
  drawOverlay();
}

/* ---------------- INPUT ---------------- */

const keys = {};

window.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();

  if (state === 'paused') {
    if (e.repeat) return;
    if (['ArrowLeft', 'KeyA'].includes(e.code)) { navigateOptions(-1, 0); return; }
    if (['ArrowRight', 'KeyD'].includes(e.code)) { navigateOptions(1, 0); return; }
    if (['ArrowUp', 'KeyW'].includes(e.code)) { navigateOptions(0, -1); return; }
    if (['ArrowDown', 'KeyS'].includes(e.code)) { navigateOptions(0, 1); return; }
    if (['Enter', 'Space', 'KeyE'].includes(e.code)) { applyOption(1); return; }
    if (['KeyP', 'Escape'].includes(e.code)) { togglePause(); return; }
    if (e.code === 'KeyM') { muted = !muted; return; }
    return;
  }

  if (!e.repeat && ['Space', 'ArrowUp', 'KeyW'].includes(e.code)) jumpPressed = true;
  if (!e.repeat && e.code === 'KeyW') registerWPress();
  if (!e.repeat && ['KeyQ', 'KeyZ'].includes(e.code)) superPressed = true;
  if (!e.repeat && ['KeyE', 'KeyF'].includes(e.code)) boltPressed = true;
  if (!e.repeat && ['KeyC', 'KeyX'].includes(e.code)) switchPressed = true;
  if (!e.repeat && ['ArrowDown', 'KeyS'].includes(e.code)) downPressed = true;

  if (e.code === 'Enter' && state === 'title') {
    state = 'playing'; loadLevel(0, false); SFX.start(); canvas.focus();
  }
  if (e.code === 'KeyP') togglePause();
  if (e.code === 'KeyM') muted = !muted;
  if (e.code === 'KeyR') {
    if (state === 'victory') { state = 'playing'; loadLevel(0, false); }
    else if (state !== 'title') {
      if (mainWorld) exitBonus();
      state = 'playing'; loadLevel(levelIndex, true);
    }
    SFX.start();
  }
  keys[e.code] = true;
});

window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
  if (state === 'playing' || state === 'bonus') togglePause();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  for (const k in keys) keys[k] = false;
  if (state === 'playing' || state === 'bonus' || state === 'finalCoin' || state === 'payout') togglePause();
});

canvas.addEventListener('pointerdown', e => {
  if (state !== 'paused') return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * W / r.width;
  const y = (e.clientY - r.top) * H / r.height;
  if (optionsPointer(x, y)) { e.preventDefault(); canvas.focus(); }
});

document.querySelectorAll('#touchControls button').forEach(btn => {
  const code = btn.dataset.key;
  const down = e => {
    e.preventDefault();
    if (state === 'paused') {
      if (['ArrowLeft', 'KeyA'].includes(code)) navigateOptions(-1, 0);
      else if (['ArrowRight', 'KeyD'].includes(code)) navigateOptions(1, 0);
      else if (['ArrowUp', 'KeyW'].includes(code)) navigateOptions(0, -1);
      else if (['ArrowDown', 'KeyS'].includes(code)) navigateOptions(0, 1);
      else if (['Space', 'KeyE'].includes(code)) applyOption(1);
      else if (code === 'KeyP') togglePause();
      return;
    }
    if (code === 'Space') jumpPressed = true;
    if (code === 'KeyW') { jumpPressed = true; registerWPress(); }
    if (code === 'KeyQ') superPressed = true;
    if (code === 'KeyE') boltPressed = true;
    if (code === 'KeyC') switchPressed = true;
    if (code === 'ArrowDown') downPressed = true;
    if (code === 'KeyP') { togglePause(); return; }
    keys[code] = true;
    if (state === 'title') { state = 'playing'; loadLevel(0, false); SFX.start(); }
  };
  const up = e => { e.preventDefault(); keys[code] = false; };
  btn.addEventListener('pointerdown', down);
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
  btn.addEventListener('pointerleave', up);
});

/* ---------------- LOOP ---------------- */

let last = performance.now();
let acc = 0;
const STEP = 1000 / 60;

function loop(now) {
  requestAnimationFrame(loop);
  let dt = now - last;
  last = now;
  if (dt > 100) dt = 100;
  acc += dt;
  while (acc >= STEP) { update(); acc -= STEP; }
  render();
}

loadLevel(0, false);
requestAnimationFrame(loop);
