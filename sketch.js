/**
 * sketch.js
 * Bestiario Oracular: exploración generativa del autómata celular
 * Experimento 07: Grabado Alquímico & Códice de Patmos
 * - Homogeneidad orgánica: adiós a los cuadraditos y píxeles aislados
 * - Cavidades viscerales profundas preservadas (apoptosis y necrosis)
 * - Crestas, espinas y ocelos altamente resaltados
 * - Isolíneas topográficas continuas (Marching Squares interpolado)
 * - Substrato de códice con grano de grabado y respiración oracular
 */

const GRID_COLS = 80;
const GRID_ROWS = 80;
const CELL_SIZE = 8; // 80 * 8 = 640px

let automaton;
let currentGenome = null;
let isRunning = true;
let canvasElem = null;

// Modos y configuraciones visuales (Experimento 07)
let currentRenderMode = 'alchemical'; // 'alchemical' | 'legacy'
let showContourLines = true;
let showCrestGlow = false; // Desactivado por defecto: masa homogénea sin puntos
let bgPlate = null;

// Estado de modulación manual
let userOverrides = {
  ruleId: 'auto',
  birth: null,
  survival: null,
  paletteIndex: 1, // Fijo en "Carbón & Sangre Seca" (Rojo Sangre)
  density: 0.45,
  maxGenerations: null,
  membraneRadius: null
};

// Referencias a elementos DOM
let inputElem, btnConsult, btnPlayPause, btnStep, btnReset, btnSaveGlyph;
let readoutName, readoutHash, readoutRule, readoutGen;
let sealStatusBadge, sealStatusText;
let chkImmortal, chkApoptosis, chkSymmetry, chkMembrane, chkIndelible, selectRule, selectPalette;
let sliderFps, sliderMaxGen, sliderMembraneRad, sliderApoptosisThresh;
let valFps, valMaxGen, valMembraneRad, valApoptosisThresh;
let birthBoxesContainer, survivalBoxesContainer;
let selectRenderMode, chkContourLines, chkCrestGlow;

function setup() {
  const canvas = createCanvas(GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
  canvas.parent('canvas-container');
  canvasElem = canvas.elt;

  frameRate(24);
  pixelDensity(window.devicePixelRatio || 1);
  noStroke();

  automaton = new SymmetricAutomaton(GRID_COLS, GRID_ROWS);

  initDOMReferences();
  buildRuleCheckboxes();
  attachEventListeners();
  setupLabModeShortcuts();

  // Consulta inicial predeterminada
  triggerConsultation();
}

function setupLabModeShortcuts() {
  if (new URLSearchParams(window.location.search).has('dev') || new URLSearchParams(window.location.search).has('lab')) {
    document.body.classList.add('show-lab-ui');
  }

  window.addEventListener('keydown', (e) => {
    if (document.activeElement === inputElem) return;
    if (e.key === 'd' || e.key === 'D') {
      document.body.classList.toggle('show-lab-ui');
    }
  });
}

function initDOMReferences() {
  inputElem = document.getElementById('nameInput');
  btnConsult = document.getElementById('btnConsult');
  btnPlayPause = document.getElementById('btnPlayPause');
  btnStep = document.getElementById('btnStep');
  btnReset = document.getElementById('btnReset');
  btnSaveGlyph = document.getElementById('btnSaveGlyph');

  readoutName = document.getElementById('readoutName');
  readoutHash = document.getElementById('readoutHash');
  readoutRule = document.getElementById('readoutRule');
  readoutGen = document.getElementById('readoutGen');

  sealStatusBadge = document.getElementById('sealStatusBadge');
  sealStatusText = document.getElementById('sealStatusText');

  chkImmortal = document.getElementById('chkImmortal');
  chkApoptosis = document.getElementById('chkApoptosis');
  chkSymmetry = document.getElementById('chkSymmetry');
  chkMembrane = document.getElementById('chkMembrane');
  chkIndelible = document.getElementById('chkIndelible');

  selectRule = document.getElementById('selectRule');
  selectPalette = document.getElementById('selectPalette');

  sliderFps = document.getElementById('sliderFps');
  sliderMaxGen = document.getElementById('sliderMaxGen');
  sliderMembraneRad = document.getElementById('sliderMembraneRad');
  sliderApoptosisThresh = document.getElementById('sliderApoptosisThresh');

  valFps = document.getElementById('valFps');
  valMaxGen = document.getElementById('valMaxGen');
  valMembraneRad = document.getElementById('valMembraneRad');
  valApoptosisThresh = document.getElementById('valApoptosisThresh');

  birthBoxesContainer = document.getElementById('birthCheckboxes');
  survivalBoxesContainer = document.getElementById('survivalCheckboxes');

  selectRenderMode = document.getElementById('selectRenderMode');
  chkContourLines = document.getElementById('chkContourLines');
  chkCrestGlow = document.getElementById('chkCrestGlow');
}

function buildRuleCheckboxes() {
  if (!birthBoxesContainer || !survivalBoxesContainer) return;
  birthBoxesContainer.innerHTML = '';
  survivalBoxesContainer.innerHTML = '';

  for (let n = 1; n <= 8; n++) {
    const bLabel = document.createElement('label');
    bLabel.className = 'bit-box-label';
    bLabel.innerHTML = `<input type="checkbox" data-bit="${n}" class="b-bit" /><span>${n}</span>`;
    birthBoxesContainer.appendChild(bLabel);

    const sLabel = document.createElement('label');
    sLabel.className = 'bit-box-label';
    sLabel.innerHTML = `<input type="checkbox" data-bit="${n}" class="s-bit" /><span>${n}</span>`;
    survivalBoxesContainer.appendChild(sLabel);
  }
}

function syncRuleCheckboxes(birth, survival) {
  if (!birthBoxesContainer || !survivalBoxesContainer) return;
  const bInputs = birthBoxesContainer.querySelectorAll('input');
  bInputs.forEach((input) => {
    const bit = parseInt(input.dataset.bit, 10);
    const active = birth.includes(bit);
    input.checked = active;
    input.parentElement.classList.toggle('active', active);
  });

  const sInputs = survivalBoxesContainer.querySelectorAll('input');
  sInputs.forEach((input) => {
    const bit = parseInt(input.dataset.bit, 10);
    const active = survival.includes(bit);
    input.checked = active;
    input.parentElement.classList.toggle('active', active);
  });
}

function readRuleCheckboxes() {
  if (!birthBoxesContainer || !survivalBoxesContainer) return;
  const birth = [];
  birthBoxesContainer.querySelectorAll('input:checked').forEach((inp) => {
    birth.push(parseInt(inp.dataset.bit, 10));
  });

  const survival = [];
  survivalBoxesContainer.querySelectorAll('input:checked').forEach((inp) => {
    survival.push(parseInt(inp.dataset.bit, 10));
  });

  userOverrides.birth = birth;
  userOverrides.survival = survival;

  automaton.setRule({ birth, survival });

  const ruleStr = `B${birth.join('')}/S${survival.join('')}`;
  if (readoutRule) readoutRule.textContent = `Manual [${ruleStr}]`;

  birthBoxesContainer.querySelectorAll('label').forEach((lbl) => {
    lbl.classList.toggle('active', lbl.querySelector('input').checked);
  });
  survivalBoxesContainer.querySelectorAll('label').forEach((lbl) => {
    lbl.classList.toggle('active', lbl.querySelector('input').checked);
  });
}

function attachEventListeners() {
  btnConsult.addEventListener('click', () => {
    userOverrides.birth = null;
    userOverrides.survival = null;
    userOverrides.maxGenerations = null;
    userOverrides.membraneRadius = null;
    triggerConsultation();
  });

  inputElem.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      userOverrides.birth = null;
      userOverrides.survival = null;
      userOverrides.maxGenerations = null;
      userOverrides.membraneRadius = null;
      triggerConsultation();
    }
  });

  if (btnPlayPause) btnPlayPause.addEventListener('click', togglePlayPause);

  if (btnStep) {
    btnStep.addEventListener('click', () => {
      if (automaton.isSealed) return;
      isRunning = false;
      if (btnPlayPause) btnPlayPause.textContent = 'Reanudar';
      automaton.step();
      updateGenDisplay();
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (currentGenome) {
        automaton.plantEmbryo(currentGenome.embryo, currentGenome.maxGenerations, currentGenome.membraneRadius);
        updateGenDisplay();
        updateSealBadge(false);
        isRunning = true;
        if (btnPlayPause) btnPlayPause.textContent = 'Pausar';
      }
    });
  }

  // Guardar Glifo estático
  if (btnSaveGlyph) {
    btnSaveGlyph.addEventListener('click', () => {
      const modeSuffix = currentRenderMode === 'alchemical' ? 'grabado' : 'crudo';
      const filename = `bestiario_${(currentGenome.input || 'anonimo').toLowerCase()}_${currentGenome.hexHash}_${modeSuffix}`;
      saveCanvas(filename, 'png');
    });
  }

  // Toggles de laboratorio
  if (chkImmortal) chkImmortal.addEventListener('change', (e) => automaton.setImmortalCore(e.target.checked));
  if (chkApoptosis) {
    chkApoptosis.addEventListener('change', (e) => {
      automaton.setApoptosis(e.target.checked, sliderApoptosisThresh ? parseInt(sliderApoptosisThresh.value, 10) : 6);
    });
  }
  if (chkSymmetry) chkSymmetry.addEventListener('change', (e) => automaton.setSymmetry(e.target.checked));
  if (chkMembrane) chkMembrane.addEventListener('change', (e) => automaton.setMembrane(e.target.checked));
  if (chkIndelible) chkIndelible.addEventListener('change', (e) => automaton.setIndelible(e.target.checked));

  // Modos visuales de Experimento 07
  if (selectRenderMode) {
    selectRenderMode.addEventListener('change', (e) => {
      currentRenderMode = e.target.value;
      if (canvasElem) {
        if (currentRenderMode === 'legacy') {
          canvasElem.classList.add('pixelated');
        } else {
          canvasElem.classList.remove('pixelated');
        }
      }
    });
  }

  if (chkContourLines) {
    chkContourLines.addEventListener('change', (e) => {
      showContourLines = e.target.checked;
    });
  }

  if (chkCrestGlow) {
    chkCrestGlow.addEventListener('change', (e) => {
      showCrestGlow = e.target.checked;
    });
  }

  // Regla
  if (selectRule) {
    selectRule.addEventListener('change', (e) => {
      userOverrides.ruleId = e.target.value;
      userOverrides.birth = null;
      userOverrides.survival = null;
      triggerConsultation();
    });
  }

  if (birthBoxesContainer) birthBoxesContainer.addEventListener('change', readRuleCheckboxes);
  if (survivalBoxesContainer) survivalBoxesContainer.addEventListener('change', readRuleCheckboxes);

  // Paleta
  if (selectPalette) {
    selectPalette.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'auto') {
        delete userOverrides.paletteIndex;
      } else {
        userOverrides.paletteIndex = parseInt(val, 10);
      }
      if (currentGenome) {
        currentGenome.palette = userOverrides.paletteIndex !== undefined
          ? PALETTES[userOverrides.paletteIndex]
          : PALETTES[Math.floor(Math.abs(currentGenome.seed) % PALETTES.length)];
        generateBgPlate(currentGenome.palette);
      }
    });
  }

  // Sliders
  if (sliderFps) {
    sliderFps.addEventListener('input', (e) => {
      const fps = parseInt(e.target.value, 10);
      if (valFps) valFps.textContent = fps;
      frameRate(fps);
    });
  }

  if (sliderMaxGen) {
    sliderMaxGen.addEventListener('input', (e) => {
      const maxGen = parseInt(e.target.value, 10);
      if (valMaxGen) valMaxGen.textContent = maxGen;
      userOverrides.maxGenerations = maxGen;
      automaton.setMaxGenerations(maxGen);
      updateGenDisplay();
    });
  }

  if (sliderMembraneRad) {
    sliderMembraneRad.addEventListener('input', (e) => {
      const rad = parseInt(e.target.value, 10);
      if (valMembraneRad) valMembraneRad.textContent = `${rad} celdas`;
      userOverrides.membraneRadius = rad;
      automaton.setMembrane(chkMembrane ? chkMembrane.checked : true, rad);
    });
  }

  if (sliderApoptosisThresh) {
    sliderApoptosisThresh.addEventListener('input', (e) => {
      const th = parseInt(e.target.value, 10);
      if (valApoptosisThresh) valApoptosisThresh.textContent = `≥ ${th} vecinos`;
      automaton.setApoptosis(chkApoptosis ? chkApoptosis.checked : true, th);
    });
  }
}

/**
 * Genera el substrato del grabado: fondo abisal, viñeta profunda, velo de hollín
 * y grano táctil de placa de aguafuerte. Exagerado para mayor potencia plástica.
 * Se pre-renderiza una sola vez por paleta para mantener 60 FPS fluidos.
 */
function generateBgPlate(pal) {
  bgPlate = createGraphics(GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
  bgPlate.pixelDensity(1);

  const w = bgPlate.width;
  const h = bgPlate.height;
  const cx = w / 2;
  const cy = h / 2;

  // 1. Fondo base tintado con la paleta
  bgPlate.background(pal.bg[0], pal.bg[1], pal.bg[2]);

  // 2. Nubes de pátina / velo de hollín y pergamino quemado (Perlin Noise)
  bgPlate.noStroke();
  const step = 5;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const n1 = noise(x * 0.005, y * 0.005);
      const n2 = noise(x * 0.02, y * 0.02);
      const combined = n1 * 0.72 + n2 * 0.28;

      // Variación orgánica de densidad de tinta
      const dVal = (combined - 0.48) * 38;
      const r = Math.max(0, Math.min(255, pal.bg[0] + dVal * 1.3));
      const g = Math.max(0, Math.min(255, pal.bg[1] + dVal * 0.95));
      const b = Math.max(0, Math.min(255, pal.bg[2] + dVal * 0.75));

      bgPlate.fill(r, g, b, 95);
      bgPlate.rect(x, y, step, step);
    }
  }

  // 3. Viñeta teatral profunda: centro cálido/iluminado, periferia que cae en negro azabache
  const maxR = w * 0.74;
  bgPlate.noFill();
  for (let r = 0; r < maxR; r += 4) {
    const norm = r / maxR;
    const alpha = Math.pow(norm, 2.1) * 235;
    bgPlate.stroke(0, 0, 0, alpha);
    bgPlate.strokeWeight(5.5);
    bgPlate.ellipse(cx, cy, r * 2, r * 2);
  }

  // 4. Platemark de aguafuerte: bisel de presión de la plancha metálica sobre el papel
  const margin = 24;
  bgPlate.stroke(0, 0, 0, 180);
  bgPlate.strokeWeight(2);
  bgPlate.rect(margin, margin, w - margin * 2, h - margin * 2);

  bgPlate.stroke(pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], 45);
  bgPlate.strokeWeight(1);
  bgPlate.rect(margin + 3, margin + 3, w - (margin + 3) * 2, h - (margin + 3) * 2);

  // 5. Grano táctil de impresión mineral (alto contraste)
  bgPlate.loadPixels();
  const total = 4 * w * h;
  for (let i = 0; i < total; i += 4) {
    const grain = (Math.random() - 0.5) * 38;
    bgPlate.pixels[i] = Math.max(0, Math.min(255, bgPlate.pixels[i] + grain));
    bgPlate.pixels[i + 1] = Math.max(0, Math.min(255, bgPlate.pixels[i + 1] + grain));
    bgPlate.pixels[i + 2] = Math.max(0, Math.min(255, bgPlate.pixels[i + 2] + grain));
  }
  bgPlate.updatePixels();
}

function triggerConsultation() {
  const query = inputElem.value;
  currentGenome = deriveOracleGenome(query, userOverrides);

  // Configurar autómata
  automaton.setRule(currentGenome.rule);
  automaton.setImmortalCore(chkImmortal ? chkImmortal.checked : false);
  automaton.setApoptosis(
    chkApoptosis ? chkApoptosis.checked : true,
    sliderApoptosisThresh ? parseInt(sliderApoptosisThresh.value, 10) : 6
  );
  automaton.setSymmetry(chkSymmetry ? chkSymmetry.checked : true);
  automaton.setMembrane(
    chkMembrane ? chkMembrane.checked : true,
    currentGenome.membraneRadius
  );
  automaton.setIndelible(chkIndelible ? chkIndelible.checked : true);
  automaton.plantEmbryo(currentGenome.embryo, currentGenome.maxGenerations, currentGenome.membraneRadius);

  // Generar substrato de grabado con la paleta actual
  generateBgPlate(currentGenome.palette);

  // Sincronizar sliders si existen
  if (sliderMaxGen) sliderMaxGen.value = currentGenome.maxGenerations;
  if (valMaxGen) valMaxGen.textContent = currentGenome.maxGenerations;

  if (sliderMembraneRad) sliderMembraneRad.value = currentGenome.membraneRadius;
  if (valMembraneRad) valMembraneRad.textContent = `${currentGenome.membraneRadius} celdas`;

  syncRuleCheckboxes(currentGenome.rule.birth, currentGenome.rule.survival);

  // Actualizar UI
  if (readoutName) readoutName.textContent = currentGenome.input || '(Silencio)';
  if (readoutHash) readoutHash.textContent = currentGenome.hexHash;
  if (readoutRule) readoutRule.textContent = `${currentGenome.ruleName} [${currentGenome.ruleString}]`;

  updateGenDisplay();
  updateSealBadge(false);

  isRunning = true;
  if (btnPlayPause) btnPlayPause.textContent = 'Pausar';
}

function togglePlayPause() {
  if (automaton.isSealed) return;
  isRunning = !isRunning;
  if (btnPlayPause) {
    btnPlayPause.textContent = isRunning ? 'Pausar' : 'Reanudar';
  }
}

function updateGenDisplay() {
  if (readoutGen) {
    readoutGen.textContent = `${automaton.generation} / ${automaton.maxGenerations}`;
  }
}

function updateSealBadge(isSealed) {
  if (!sealStatusBadge || !sealStatusText) return;
  if (isSealed) {
    sealStatusBadge.className = 'seal-badge sealed';
    sealStatusText.textContent = '✦ SELLO CONSUMADO (ENIGMA FIJADO) ✦';
  } else {
    sealStatusBadge.className = 'seal-badge in-progress';
    sealStatusText.textContent = 'REVELACIÓN EN CURSO...';
  }
}

function draw() {
  if (!currentGenome) return;

  const pal = currentGenome.palette;

  // Si está corriendo y no se ha sellado, avanzamos un ciclo de vida
  if (isRunning && !automaton.isSealed) {
    automaton.step();
    updateGenDisplay();

    if (automaton.isSealed) {
      isRunning = false;
      if (btnPlayPause) btnPlayPause.textContent = 'Completado';
      updateSealBadge(true);
    }
  }

  // Renderizado según modo seleccionado
  if (currentRenderMode === 'alchemical') {
    renderAlchemicalMode(pal);
  } else {
    renderLegacyMode(pal);
  }
}

/**
 * ============================================================================
 * EXPERIMENTO 07: RENDERIZADOR DE GRABADO ALQUÍMICO (OPCIÓN 2)
 * Masa continua homogénea, cavidades viscerales profundas y crestas luminosas.
 * ============================================================================
 */
function renderAlchemicalMode(pal) {
  // 1. Substrato de códice
  if (bgPlate) {
    image(bgPlate, 0, 0);
  } else {
    background(pal.bg[0], pal.bg[1], pal.bg[2]);
  }

  // Factor de respiración post-sellado (el monstruo respira sutilmente una vez fijado)
  const breath = automaton.isSealed
    ? 0.5 + 0.5 * Math.sin(frameCount * 0.045)
    : 0.0;

  // 2. Membrana Biológica Radial / Borde Sagrado de Códice
  if (automaton.membraneEnabled) {
    renderSacredMembrane(pal, breath);
  }

  // 3. Rastro Fósil / Sedimento (Manto difuso que enmarca las cavidades)
  renderFossilWash(pal);

  // 4. Manto Carnoso Continuo (Fusión anatómica de células vivas)
  renderContinuousFlesh(pal);

  // 5. Estrías e Isolíneas Topográficas de Grabado (Marching Squares)
  if (showContourLines) {
    renderTopographicIsolines(pal);
  }

  // 6. Crestas Óseas, Nodos y Ocelos Altamente Resaltados
  if (showCrestGlow) {
    renderHighlightedCrests(pal, breath);
  }

  // 7. Eje de Simetría Sagrado (Incisión de luz central)
  if (automaton.symmetryEnabled) {
    stroke(pal.alive[0], pal.alive[1], pal.alive[2], 26 + breath * 15);
    strokeWeight(1);
    const midX = automaton.halfCols * CELL_SIZE;
    line(midX, 20, midX, height - 20);
    noStroke();
  }
}

/**
 * Traza la membrana radial con delicadeza astrológica/códice
 */
function renderSacredMembrane(pal, breath) {
  const cx = width / 2;
  const cy = height / 2;
  const radPx = automaton.membraneRadius * CELL_SIZE;

  noFill();
  // Guía concéntrica interior sutil
  stroke(pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], 18 + breath * 12);
  strokeWeight(0.8);
  ellipse(cx, cy, radPx * 1.0, radPx * 1.0);

  // Anillo exterior de resplandor
  stroke(pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], 30 + breath * 22);
  strokeWeight(1);
  ellipse(cx, cy, (radPx + 8) * 2, (radPx + 8) * 2);

  // Anillo oracular principal
  stroke(pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], 65 + breath * 35);
  strokeWeight(1.4);
  ellipse(cx, cy, radPx * 2, radPx * 2);

  // Marcas cardinales de compás / astrolabio
  const tickLen = 8;
  stroke(pal.alive[0], pal.alive[1], pal.alive[2], 55 + breath * 30);
  strokeWeight(1.2);
  line(cx - radPx - tickLen, cy, cx - radPx + tickLen, cy);
  line(cx + radPx - tickLen, cy, cx + radPx + tickLen, cy);
  line(cx, cy - radPx - tickLen, cx, cy - radPx + tickLen);
  line(cx, cy + radPx - tickLen, cx, cy + radPx + tickLen);
  noStroke();
}

/**
 * Renderiza el sedimento y huella fósil como una mancha de tinta continua,
 * dejando las cavidades de necrosis rigurosamente vacías (abismo).
 */
function renderFossilWash(pal) {
  const rows = automaton.rows;
  const cols = automaton.cols;

  // Cápsulas entre vecinos con rastro activo
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const trail = automaton.trail[y][x];
      const necro = automaton.necrotized[y][x];

      if (trail <= 0.08 || necro === 1) continue;

      const cx = (x + 0.5) * CELL_SIZE;
      const cy = (y + 0.5) * CELL_SIZE;

      // Unir suavemente con vecinos cardinales que también tengan rastro
      const neighbors = [
        [x + 1, y],
        [x, y + 1]
      ];

      for (let i = 0; i < neighbors.length; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= cols || ny >= rows) continue;

        const nTrail = automaton.trail[ny][nx];
        const nNecro = automaton.necrotized[ny][nx];

        if (nTrail > 0.08 && nNecro === 0) {
          const avgTrail = (trail + nTrail) * 0.5;
          const alpha = Math.min(220, Math.floor(avgTrail * 140));
          stroke(pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], alpha);
          strokeWeight(CELL_SIZE * 1.15);
          strokeCap(ROUND);
          line(cx, cy, (nx + 0.5) * CELL_SIZE, (ny + 0.5) * CELL_SIZE);
        }
      }

      // Disco base celular
      const alpha = Math.min(220, Math.floor(trail * 125));
      fill(pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], alpha);
      noStroke();
      circle(cx, cy, CELL_SIZE * 1.1);
    }
  }
}

/**
 * Masa carnosa continua: conecta células adyacentes vivas mediante trazos
 * cilíndricos de punta redonda (capsules), logrando una forma indivisible
 * donde las cavidades de apoptosis abren fosas oscuras reales.
 */
function renderContinuousFlesh(pal) {
  const rows = automaton.rows;
  const cols = automaton.cols;

  // 1. Conexiones anatómicas entre células vivas adyacentes
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (automaton.grid[y][x] !== 1) continue;

      const cx = (x + 0.5) * CELL_SIZE;
      const cy = (y + 0.5) * CELL_SIZE;
      const neighborsCount = automaton.neighborGrid[y][x];

      // Determinar color de carne base según densidad local
      let r, g, b;
      if (neighborsCount >= 5) {
        // Penumbra visceral profunda / sombra interna previa a la asfixia
        r = lerp(pal.bg[0], pal.alive[0], 0.26);
        g = lerp(pal.bg[1], pal.alive[1], 0.26);
        b = lerp(pal.bg[2], pal.alive[2], 0.26);
      } else {
        // Carne viva y elástica en saturación de códice
        r = lerp(pal.deadTrail[0], pal.alive[0], 0.82);
        g = lerp(pal.deadTrail[1], pal.alive[1], 0.82);
        b = lerp(pal.deadTrail[2], pal.alive[2], 0.82);
      }

      // Conectar con vecinos vivos (derecha, abajo, diagonal abajo-der, diagonal abajo-izq)
      const targets = [
        [x + 1, y],
        [x, y + 1],
        [x + 1, y + 1],
        [x - 1, y + 1]
      ];

      for (let i = 0; i < targets.length; i++) {
        const tx = targets[i][0];
        const ty = targets[i][1];

        if (tx >= 0 && tx < cols && ty < rows && automaton.grid[ty][tx] === 1) {
          const tnx = (tx + 0.5) * CELL_SIZE;
          const tny = (ty + 0.5) * CELL_SIZE;

          stroke(r, g, b);
          strokeWeight(CELL_SIZE * 1.32);
          strokeCap(ROUND);
          line(cx, cy, tnx, tny);
        }
      }

      // Disco basal de unión para que la masa sea sólida
      fill(r, g, b);
      noStroke();
      circle(cx, cy, CELL_SIZE * 1.32);
    }
  }
}

/**
 * Algoritmo Marching Squares con interpolación lineal sobre el campo escalar
 * de densidad, produciendo isolíneas orgánicas de xilografía que rodean
 * el cuerpo y bordean las cavidades internas.
 */
function renderTopographicIsolines(pal) {
  const rows = automaton.rows;
  const cols = automaton.cols;

  // Construcción del campo escalar continuo V(y, x)
  const field = Array.from({ length: rows }, () => new Float32Array(cols));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (automaton.necrotized[y][x] === 1) {
        field[y][x] = 0.0; // Cavidad estricta
      } else if (automaton.grid[y][x] === 1) {
        const n = automaton.neighborGrid[y][x];
        const a = automaton.age[y][x];
        if (n >= 5) {
          field[y][x] = 0.82; // Masa densa profunda
        } else if (a >= 3 && (n === 2 || n === 3)) {
          field[y][x] = 0.94; // Cresta estructural
        } else {
          field[y][x] = 0.72 + Math.min(0.18, a * 0.03);
        }
      } else if (automaton.trail[y][x] > 0.05) {
        field[y][x] = automaton.trail[y][x] * 0.44;
      } else {
        field[y][x] = 0.0;
      }
    }
  }

  // Suavizado 3x3 para curvas de contorno perfectamente fluidas
  const smoothField = Array.from({ length: rows }, () => new Float32Array(cols));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (automaton.necrotized[y][x] === 1) {
        smoothField[y][x] = 0.0;
        continue;
      }
      let sum = field[y][x] * 4;
      let count = 4;

      if (y > 0) { sum += field[y - 1][x] * 2; count += 2; }
      if (y < rows - 1) { sum += field[y + 1][x] * 2; count += 2; }
      if (x > 0) { sum += field[y][x - 1] * 2; count += 2; }
      if (x < cols - 1) { sum += field[y][x + 1] * 2; count += 2; }

      smoothField[y][x] = sum / count;
    }
  }

  // Tres estratos topográficos de grabado (Aura, Piel Exterior, Cresta Ósea)
  const isovals = [
    { iso: 0.22, color: [pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], 145], weight: 1.0 },
    { iso: 0.48, color: [pal.alive[0], pal.alive[1], pal.alive[2], 195], weight: 1.4 },
    { iso: 0.72, color: [pal.core[0], pal.core[1], pal.core[2], 180], weight: 1.1 }
  ];

  for (let i = 0; i < isovals.length; i++) {
    const { iso, color, weight } = isovals[i];
    stroke(color[0], color[1], color[2], color[3]);
    strokeWeight(weight);
    strokeCap(ROUND);

    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        traceMarchingSquare(smoothField, x, y, iso);
      }
    }
  }
  noStroke();
}

/**
 * Traza los segmentos lineales interpolados de una celda para el valor iso
 */
function traceMarchingSquare(field, x, y, iso) {
  const v0 = field[y][x];
  const v1 = field[y][x + 1];
  const v2 = field[y + 1][x + 1];
  const v3 = field[y + 1][x];

  const b0 = v0 >= iso ? 1 : 0;
  const b1 = v1 >= iso ? 2 : 0;
  const b2 = v2 >= iso ? 4 : 0;
  const b3 = v3 >= iso ? 8 : 0;
  const caseIdx = b0 | b1 | b2 | b3;

  if (caseIdx === 0 || caseIdx === 15) return;

  function edgePt(edge) {
    const c0x = (x + 0.5) * CELL_SIZE;
    const c0y = (y + 0.5) * CELL_SIZE;
    const c1x = (x + 1.5) * CELL_SIZE;
    const c1y = (y + 0.5) * CELL_SIZE;
    const c2x = (x + 1.5) * CELL_SIZE;
    const c2y = (y + 1.5) * CELL_SIZE;
    const c3x = (x + 0.5) * CELL_SIZE;
    const c3y = (y + 1.5) * CELL_SIZE;

    let t = 0.5;
    switch (edge) {
      case 0: // top
        if (Math.abs(v1 - v0) > 0.0001) t = (iso - v0) / (v1 - v0);
        t = Math.max(0, Math.min(1, t));
        return [c0x + t * (c1x - c0x), c0y];
      case 1: // right
        if (Math.abs(v2 - v1) > 0.0001) t = (iso - v1) / (v2 - v1);
        t = Math.max(0, Math.min(1, t));
        return [c1x, c1y + t * (c2y - c1y)];
      case 2: // bottom
        if (Math.abs(v2 - v3) > 0.0001) t = (iso - v3) / (v2 - v3);
        t = Math.max(0, Math.min(1, t));
        return [c3x + t * (c2x - c3x), c3y];
      case 3: // left
        if (Math.abs(v3 - v0) > 0.0001) t = (iso - v0) / (v3 - v0);
        t = Math.max(0, Math.min(1, t));
        return [c0x, c0y + t * (c3y - c0y)];
    }
    return [c0x, c0y];
  }

  function drawSeg(eA, eB) {
    const pA = edgePt(eA);
    const pB = edgePt(eB);
    line(pA[0], pA[1], pB[0], pB[1]);
  }

  switch (caseIdx) {
    case 1: drawSeg(3, 0); break;
    case 2: drawSeg(0, 1); break;
    case 3: drawSeg(3, 1); break;
    case 4: drawSeg(1, 2); break;
    case 5: drawSeg(3, 0); drawSeg(1, 2); break;
    case 6: drawSeg(0, 2); break;
    case 7: drawSeg(3, 2); break;
    case 8: drawSeg(2, 3); break;
    case 9: drawSeg(2, 0); break;
    case 10: drawSeg(0, 1); drawSeg(2, 3); break;
    case 11: drawSeg(1, 2); break;
    case 12: drawSeg(1, 3); break;
    case 13: drawSeg(0, 1); break;
    case 14: drawSeg(3, 0); break;
  }
}

/**
 * Renderiza las partes fuertemente resaltadas de la criatura:
 * espinas luminosas, vértebras de marfil/oro y ocelos sagrados con pupilas abisales.
 */
function renderHighlightedCrests(pal, breath) {
  const rows = automaton.rows;
  const cols = automaton.cols;

  // 1. Filamentos luminosos continuos que unen nodos resaltados vecinos
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (automaton.grid[y][x] !== 1) continue;

      const neighbors = automaton.neighborGrid[y][x];
      const age = automaton.age[y][x];
      const isBone = automaton.immortalCoreEnabled && automaton.isImmortal[y][x] === 1;

      const isCurrentHigh = (isBone && neighbors <= 3) || (age >= 3 && (neighbors === 2 || neighbors === 3));
      if (!isCurrentHigh) continue;

      const cx = (x + 0.5) * CELL_SIZE;
      const cy = (y + 0.5) * CELL_SIZE;

      // Buscar si el vecino a la derecha o abajo también es cresta resaltada
      const adjacents = [
        [x + 1, y],
        [x, y + 1],
        [x + 1, y + 1]
      ];

      for (let i = 0; i < adjacents.length; i++) {
        const nx = adjacents[i][0];
        const ny = adjacents[i][1];

        if (nx < cols && ny < rows && automaton.grid[ny][nx] === 1) {
          const nNeighbors = automaton.neighborGrid[ny][nx];
          const nAge = automaton.age[ny][nx];
          const nIsBone = automaton.immortalCoreEnabled && automaton.isImmortal[ny][nx] === 1;

          const isNeighborHigh = (nIsBone && nNeighbors <= 3) || (nAge >= 3 && (nNeighbors === 2 || nNeighbors === 3));
          if (isNeighborHigh) {
            const ncx = (nx + 0.5) * CELL_SIZE;
            const ncy = (ny + 0.5) * CELL_SIZE;

            // Filamento continuo de luz/hueso
            stroke(pal.core[0], pal.core[1], pal.core[2], 215 + breath * 35);
            strokeWeight(2.4);
            strokeCap(ROUND);
            line(cx, cy, ncx, ncy);
          }
        }
      }
    }
  }

  // 2. Nodos focales y ocelos
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (automaton.grid[y][x] !== 1) continue;

      const neighbors = automaton.neighborGrid[y][x];
      const age = automaton.age[y][x];
      const isBone = automaton.immortalCoreEnabled && automaton.isImmortal[y][x] === 1;

      const isHighlight = (isBone && neighbors <= 3) || (age >= 3 && (neighbors === 2 || neighbors === 3));
      if (!isHighlight) continue;

      const cx = (x + 0.5) * CELL_SIZE;
      const cy = (y + 0.5) * CELL_SIZE;

      // Halo radiante suave
      noStroke();
      fill(pal.alive[0], pal.alive[1], pal.alive[2], 34 + breath * 22);
      circle(cx, cy, CELL_SIZE * 2.1);

      // Cáliz del ocelo
      fill(pal.alive[0], pal.alive[1], pal.alive[2], 240);
      circle(cx, cy, CELL_SIZE * 0.95);

      // Núcleo incandescente (Marfil para equilibrio, Oro para hueso inmortal)
      if (isBone) {
        fill(pal.immortal[0], pal.immortal[1], pal.immortal[2]);
      } else {
        fill(pal.core[0], pal.core[1], pal.core[2]);
      }
      circle(cx, cy, CELL_SIZE * 0.55);

      // Pupila abisal (conecta con la profundidad del fondo)
      fill(pal.bg[0], pal.bg[1], pal.bg[2]);
      circle(cx, cy, CELL_SIZE * 0.22);
    }
  }
}

/**
 * ============================================================================
 * RENDERIZADOR LEGACY: MATRIZ CRUDA (PÍXELES)
 * Preservado exactamente para comparación y análisis en el panel de laboratorio.
 * ============================================================================
 */
function renderLegacyMode(pal) {
  background(pal.bg[0], pal.bg[1], pal.bg[2]);

  if (automaton.membraneEnabled) {
    noFill();
    stroke(pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], 30);
    strokeWeight(1);
    const radiusPx = automaton.membraneRadius * CELL_SIZE * 2;
    ellipse(width / 2, height / 2, radiusPx, radiusPx);
    noStroke();
  }

  for (let y = 0; y < automaton.rows; y++) {
    for (let x = 0; x < automaton.cols; x++) {
      const state = automaton.grid[y][x];
      const trail = automaton.trail[y][x];
      const age = automaton.age[y][x];
      const neighbors = automaton.neighborGrid[y][x];
      const isBone = automaton.immortalCoreEnabled && automaton.isImmortal[y][x] === 1;

      const px = x * CELL_SIZE;
      const py = y * CELL_SIZE;

      if (state === 1) {
        if (neighbors >= 5) {
          const r = lerp(pal.deadTrail[0], pal.alive[0], 0.38);
          const g = lerp(pal.deadTrail[1], pal.alive[1], 0.38);
          const b = lerp(pal.deadTrail[2], pal.alive[2], 0.38);
          fill(r, g, b);
          rect(px, py, CELL_SIZE, CELL_SIZE);
        } else if (isBone && neighbors <= 3) {
          fill(pal.immortal[0], pal.immortal[1], pal.immortal[2]);
          rect(px, py, CELL_SIZE, CELL_SIZE);
          fill(pal.core[0], pal.core[1], pal.core[2]);
          rect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else if (age >= 3 && (neighbors === 2 || neighbors === 3)) {
          fill(pal.alive[0], pal.alive[1], pal.alive[2]);
          rect(px, py, CELL_SIZE, CELL_SIZE);
          fill(pal.core[0], pal.core[1], pal.core[2]);
          rect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else {
          const tone = age === 1 ? 0.62 : 0.78;
          const r = lerp(pal.deadTrail[0], pal.alive[0], tone);
          const g = lerp(pal.deadTrail[1], pal.alive[1], tone);
          const b = lerp(pal.deadTrail[2], pal.alive[2], tone);
          fill(r, g, b);
          rect(px, py, CELL_SIZE, CELL_SIZE);
        }
      } else if (trail > 0.05) {
        const r = lerp(pal.bg[0], pal.deadTrail[0], trail);
        const g = lerp(pal.bg[1], pal.deadTrail[1], trail);
        const b = lerp(pal.bg[2], pal.deadTrail[2], trail);
        fill(r, g, b);
        rect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }

  if (automaton.symmetryEnabled) {
    stroke(pal.alive[0], pal.alive[1], pal.alive[2], 20);
    strokeWeight(1);
    const midX = automaton.halfCols * CELL_SIZE;
    line(midX, 0, midX, height);
    noStroke();
  }
}
