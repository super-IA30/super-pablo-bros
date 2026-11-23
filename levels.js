'use strict';

/* ============================================================
   SUPER PABLO BROS - GENERADOR DE NIVELES 11-50
   Archivo clásico (sin módulos). Se carga ANTES de game.js y
   expone SPB_THEMES y SPBBuildLevel en window.

   Diseño: todo determinista con mulberry32 propio. Los huecos
   siempre se reanudan y llevan monedas para saltarlos; no hay
   trampas letales. Los bloques de regalo se colocan alto para
   que no sean sobrescritos por otros generadores.
   ============================================================ */

(function () {
  const TILE = 32;
  const ROWS = 14;

  const GIFTS = ['!', '@', '*', '^', '+'];
  const ALT_CHARS = ['E', 'B', 'S', 'H', 'D', 'O', 'T', 'G'];
  const FALLER_COLORS = ['#ff477e', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff922b'];
  const ASTEROID_COLORS = ['#8d99ae', '#b8c5d9', '#6c7a89', '#9fb8ff'];

  const SHAPES = [
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[2, 0], [2, 1], [2, 2], [1, 2]],
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]]
  ];

  const THEMES = [
    { id: 'kong', name: 'Torre de Obras', sky: ['#2f3b52', '#e0a44a'] },
    { id: 'tetris', name: 'Torre de Piezas', sky: ['#241a4a', '#8a63ff'] },
    { id: 'space', name: 'Frente Estelar', sky: ['#050816', '#223a7a'] },
    { id: 'kart', name: 'Circuito Toro', sky: ['#ff8f3c', '#ffe6a0'] }
  ];

  window.SPB_THEMES = THEMES;

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function pickTheme(i) {
    if (i <= 18) return THEMES[0];
    if (i <= 28) return THEMES[1];
    if (i <= 38) return THEMES[2];
    return THEMES[3];
  }

  window.SPBBuildLevel = function (i, info) {
    const R = mulberry32(424242 + i * 7919);
    const ri = (a, b) => a + Math.floor(R() * (b - a + 1));

    const total = (info && Number(info.TOTAL_LEVELS)) || 50;
    let altKeys = info && Array.isArray(info.ALT)
      ? info.ALT.map(a => a && a.key).filter(Boolean)
      : [];
    if (altKeys.length < 2) altKeys = ['ETH', 'BNB', 'SOL', 'HYPE', 'DOGE', 'OP', 'USDT', 'GRAM'];

    const theme = pickTheme(i);
    const cols = theme.id === 'kart' ? 190 + ri(0, 4) * 10 : 132 + ri(0, 4) * 8;
    const flag = cols - 7;
    const time = theme.id === 'kart' ? 300 : 320 + ri(0, 40);

    /* Huecos: pocos, cortos y siempre con monedas encima. */
    const gaps = [];
    const gapCount = theme.id === 'kart' ? ri(1, 3) : ri(2, 4);
    let gx = 20 + ri(0, 6);
    while (gaps.length < gapCount && gx < flag - 12) {
      const gw = ri(2, 3);
      gaps.push([gx, gx + gw]);
      gx += theme.id === 'kart' ? ri(30, 42) : ri(20, 30);
    }
    const inGap = x => gaps.some(g => x >= g[0] && x < g[1]);
    function rangeClear(a, b) {
      for (let x = a; x < b; x++) if (inGap(x)) return false;
      return true;
    }

    const groundRanges = [];
    let start = 0;
    for (const g of gaps) {
      if (g[0] > start) groundRanges.push([start, g[0]]);
      start = g[1];
    }
    groundRanges.push([start, cols]);

    /* Tuberías: se generan antes que las vigas para no solaparlas. */
    const pipes = [];
    let px = 22 + ri(0, 6);
    while (px < flag - 14) {
      if (rangeClear(px, px + 2)) pipes.push({ x: px, h: ri(1, 2) });
      px += theme.id === 'kart' ? ri(38, 52) : ri(26, 38);
    }

    const platforms = [];
    const ladders = [];

    function addPlatform(x, y, w) {
      if (x < 8 || x + w >= flag - 4 || y < 2 || y > 10 || w < 1) return false;
      if (!rangeClear(x, x + w)) return false;
      if (platforms.some(pl => pl.y === y && x < pl.x + pl.w && x + w > pl.x)) return false;
      if (pipes.some(pp => y >= 12 - pp.h && y <= 11 && x < pp.x + 2 && x + w > pp.x)) return false;
      platforms.push({ x, y, w });
      return true;
    }

    function addLadder(x, y, h) {
      if (x < 1 || x >= flag - 2 || y < 0 || y + h > 11) return false;
      if (ladders.some(l => l.x === x && l.y === y)) return false;
      ladders.push({ x, y, h });
      return true;
    }

    if (theme.id === 'kong') {
      /* Andamiaje: vigas escalonadas y escaleras entre alturas. */
      for (let m = 10; m < flag - 16; m += 16) {
        const low = addPlatform(m + 1, 9, 6);
        const mid = addPlatform(m + 2, 7, 7);
        const high = addPlatform(m + 1, 5, 6);
        const top = addPlatform(m + 4, 3, 6);
        if (low && mid) addLadder(m + 6, 7, 2);
        if (mid && high) addLadder(m + 3, 5, 2);
        if (high && top) addLadder(m + 5, 3, 2);
      }
      for (let k = 0; platforms.length < 12 && k < 40; k++) addPlatform(10 + k * 5, 8, 4);
      for (let k = 0; ladders.length < 8 && k < 40; k++) addLadder(12 + k * 6, 5, 2);
    } else if (theme.id === 'tetris') {
      for (let k = 0; k < 5 + ri(0, 3); k++) addPlatform(ri(12, flag - 14), ri(7, 9), ri(2, 4));
    } else if (theme.id === 'space') {
      for (let k = 0; k < 5 + ri(0, 4); k++) addPlatform(ri(12, flag - 14), ri(6, 8), ri(2, 3));
    } else {
      /* Circuito: rampas de impulso cerca del suelo. */
      for (let x = 16; x < flag - 12; x += ri(18, 26)) addPlatform(x, ri(8, 10), ri(2, 3));
    }

    const springs = [];
    const springCount = theme.id === 'kart' ? 5 + ri(0, 2) : 3 + ri(0, 2);
    for (let k = 0; k < springCount; k++) {
      for (let t = 0; t < 14; t++) {
        const sx = ri(12, flag - 12);
        if (inGap(sx) || inGap(sx + 1)) continue;
        if (pipes.some(pp => sx >= pp.x - 2 && sx <= pp.x + 3)) continue;
        if (springs.some(sp => Math.abs(sp.x - sx) < 3)) continue;
        springs.push({ x: sx, y: 11 });
        break;
      }
    }

    /* Bloques: se registra cada casilla ocupada para no sobrescribir premios. */
    const blocks = [];
    const used = new Set();
    const cellKey = (x, y) => x + ',' + y;

    function placeRun(x, y, p) {
      if (!p || x < 6 || y < 0 || y > 9 || x + p.length >= flag - 3) return false;
      for (let i = 0; i < p.length; i++) {
        const tx = x + i;
        if (inGap(tx) || used.has(cellKey(tx, y))) return false;
        if (platforms.some(pl => pl.y === y && tx >= pl.x && tx < pl.x + pl.w)) return false;
        if (pipes.some(pp => y >= 12 - pp.h && y <= 11 && tx >= pp.x && tx <= pp.x + 1)) return false;
      }
      for (let i = 0; i < p.length; i++) used.add(cellKey(x + i, y));
      blocks.push({ x, y, p });
      return true;
    }

    const patterns = ['qbq', 'bqb', 'qqq', 'bsb', 'qmq', 'q?b', 'qs?', 'bqq', 'qsq'];
    for (let bx = 9; bx < flag - 9; bx += ri(8, 13)) {
      if (inGap(bx)) continue;
      placeRun(bx, ri(6, 8), patterns[ri(0, patterns.length - 1)]);
      if (ri(0, 1) === 1) {
        const n = 2 + ri(0, 1);
        let p = '';
        for (let a = 0; a < n; a++) p += ALT_CHARS[ri(0, ALT_CHARS.length - 1)];
        placeRun(bx + ri(0, 2), ri(1, 3), p);
      }
    }

    if (theme.id === 'tetris') {
      /* Piezas originales de cuatro casillas, apiladas como rompecabezas. */
      const chars = ['q', 'q', 'q', 'E', 'S', 'H', 'D', 'O', 'T', 'G', 'B'];
      for (let k = 0; k < 12 + ri(0, 5); k++) {
        const shape = SHAPES[ri(0, SHAPES.length - 1)];
        const bx = ri(10, flag - 16);
        const by = ri(3, 6);
        for (const cell of shape) placeRun(bx + cell[0], by + cell[1], chars[ri(0, chars.length - 1)]);
      }
    }

    /* Bordes de hueco con monedas sólidas: ayudan a calcular el salto. */
    for (const g of gaps) {
      placeRun(Math.max(6, g[0] - 3), 8, 'qq');
      placeRun(Math.min(flag - 6, g[1] + 1), 8, 'qq');
    }

    /* Regalos obligatorios, en filas altas para preservarlos. */
    function placeGifts() {
      for (let gi = 0; gi < GIFTS.length; gi++) {
        const ch = GIFTS[gi];
        let made = 0;
        for (let n = 0; n < 2; n++) {
          const base = 10 + Math.floor((flag - 26) * ((gi * 2 + n) / 10));
          for (let t = 0; t < 10 && made < n + 1; t++) {
            if (placeRun(Math.max(6, base + ri(-3, 3)), ri(2, 4), ch + ch)) made++;
          }
        }
        for (let x = 8; x < flag - 12 && made < 2; x++) {
          if (inGap(x)) continue;
          for (let y = 2; y <= 4 && made < 2; y++) if (placeRun(x, y, ch + ch)) made++;
        }
      }
    }

    function ensureChar(ch, minTiles) {
      let count = 0;
      for (const b of blocks) for (const c of b.p) if (c === ch) count++;
      while (count < minTiles) {
        let placed = false;
        for (let x = 9; x < flag - 10 && !placed; x++) {
          if (inGap(x)) continue;
          for (let y = 2; y <= 4 && !placed; y++) {
            if (placeRun(x, y, ch + ch)) { count += 2; placed = true; }
          }
        }
        if (!placed) break;
      }
    }

    placeGifts();
    ensureChar('q', 2);
    ensureChar('b', 2);
    ensureChar('m', 2);
    ensureChar('s', 2);
    ensureChar('?', 1);
    for (let k = 0; k < 4; k++) ensureChar(ALT_CHARS[k], 1);

    const clouds = [];
    for (let x = 22; x < flag - 10; x += 36) {
      if (inGap(x)) continue;
      clouds.push({ x: x * TILE, y: 3 * TILE, w: 74, h: 26, dir: ri(0, 1) ? 1 : -1 });
    }

    /* Bitcoin por todas partes: suelo, aire, cielo y sobre los huecos. */
    const coins = [];
    function addCoin(tx, ty) { coins.push({ x: tx * TILE + 8, y: ty * TILE, taken: false }); }
    for (let x = 3; x <= flag + 2; x++) {
      if (inGap(x)) {
        addCoin(x, 10);
        addCoin(x, 8);
        if (theme.id === 'space') addCoin(x, 6);
        if (theme.id === 'kart') addCoin(x, 9);
        continue;
      }
      addCoin(x, 11);
      if (x % 2 === 0) addCoin(x, 9);
      if (x % 4 === 0) addCoin(x, 7);
      if (x % 2 === 0) addCoin(x, 3);
      if (x % 3 === 0) addCoin(x, 2);
      if (theme.id === 'tetris' && x % 3 === 1) addCoin(x, 6);
      if (theme.id === 'kong' && x % 5 === 0) addCoin(x, 5);
      if (theme.id === 'space') {
        if (x % 2 === 1) addCoin(x, 6);
        if (x % 3 === 0) addCoin(x, 5);
        if (x % 4 === 1) addCoin(x, 4);
      }
      if (theme.id === 'kart') {
        if (x % 3 === 0) addCoin(x, 5);
        if (x % 5 === 0) addCoin(x, 4);
      }
    }

    const enemies = [];
    const bearCount = theme.id === 'tetris' ? 4 + ri(0, 3)
      : theme.id === 'space' ? 6 + ri(0, 3)
        : 5 + ri(0, 3);
    for (let k = 0; k < bearCount; k++) {
      for (let t = 0; t < 18; t++) {
        const ex = ri(10, flag - 10);
        if (inGap(ex) || inGap(ex + 1)) continue;
        if (pipes.some(pp => ex >= pp.x - 1 && ex <= pp.x + 2)) continue;
        if (enemies.some(e => Math.abs(e.x - ex) < 4)) continue;
        enemies.push({ x: ex });
        break;
      }
    }

    /* Monedas ocultas: siempre se usan claves de ALT desde ALT[1]. */
    const hidden = [];
    const hiddenCount = 10 + ri(0, 4);
    for (let k = 0; k < hiddenCount; k++) {
      const hx = ri(8, flag - 8);
      const hy = k % 4 === 0 ? ri(-4, -1) : ri(4, 10);
      const key = altKeys[1 + ri(0, altKeys.length - 2)];
      hidden.push({ x: hx * TILE + 8, y: hy * TILE, taken: false, key });
    }

    const fallers = [];
    if (theme.id === 'tetris') {
      const n = 10 + ri(0, 6);
      for (let k = 0; k < n; k++) {
        fallers.push({
          x: ri(8, flag - 8) * TILE + ri(0, 20),
          y: ri(-2, 5) * TILE + ri(0, 18),
          size: 16 + ri(0, 3) * 4,
          color: FALLER_COLORS[ri(0, FALLER_COLORS.length - 1)]
        });
      }
    }

    const asteroids = [];
    if (theme.id === 'space') {
      const n = 12 + ri(0, 6);
      for (let k = 0; k < n; k++) {
        asteroids.push({
          x: ri(6, flag - 6) * TILE + ri(0, 20),
          y: ri(-3, 4) * TILE + ri(0, 16),
          r: 10 + ri(0, 12),
          vy: 0.35 + R() * 0.75,
          color: ASTEROID_COLORS[ri(0, ASTEROID_COLORS.length - 1)]
        });
      }
    }

    return {
      name: 'NIVEL ' + (i + 1) + '-' + total,
      short: (i + 1) + '/' + total,
      time,
      sky: theme.sky.slice(),
      cols,
      flag,
      groundRanges,
      blocks,
      pipes,
      springs,
      platforms,
      clouds,
      coins,
      enemies,
      hidden,
      theme: theme.id,
      themeName: theme.name,
      ladders,
      fallers,
      asteroids,
      car: theme.id === 'kart'
    };
  };
})();
