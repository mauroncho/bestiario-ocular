/**
 * sketch.js
 * Oráculo: exploración generativa del autómata celular
 * - B-1: Membrana Biológica Radial
 * - Huella Indeleble Fósil
 * - Sellado del Oráculo (N generaciones ligadas al nombre)
 * - Exportación de glifo estático
 */

const GRID_COLS = 80;
const GRID_ROWS = 80;
const CELL_SIZE = 8; // 80 * 8 = 640px

let automaton;
let currentGenome = null;
let isRunning = true;

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

function setup() {
  const canvas = createCanvas(GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
  canvas.parent('canvas-container');

  frameRate(24);
  pixelDensity(1);
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
  // Activar modo laboratorio si la URL incluye ?dev=true o ?lab=true
  if (new URLSearchParams(window.location.search).has('dev') || new URLSearchParams(window.location.search).has('lab')) {
    document.body.classList.add('show-lab-ui');
  }

  // Atajo de teclado: Presionar 'D' fuera del input de texto alterna la visibilidad de la UI de laboratorio
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
      const filename = `glifo_${(currentGenome.input || 'anonimo').toLowerCase()}_${currentGenome.hexHash}`;
      saveCanvas(filename, 'png');
    });
  }

  // Toggles
  if (chkImmortal) chkImmortal.addEventListener('change', (e) => automaton.setImmortalCore(e.target.checked));
  if (chkApoptosis) {
    chkApoptosis.addEventListener('change', (e) => {
      automaton.setApoptosis(e.target.checked, sliderApoptosisThresh ? parseInt(sliderApoptosisThresh.value, 10) : 6);
    });
  }
  if (chkSymmetry) chkSymmetry.addEventListener('change', (e) => automaton.setSymmetry(e.target.checked));
  if (chkMembrane) chkMembrane.addEventListener('change', (e) => automaton.setMembrane(e.target.checked));
  if (chkIndelible) chkIndelible.addEventListener('change', (e) => automaton.setIndelible(e.target.checked));

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

  // Fondo abisal
  background(pal.bg[0], pal.bg[1], pal.bg[2]);

  // Si está corriendo y no se ha sellado, avanzamos
  if (isRunning && !automaton.isSealed) {
    automaton.step();
    updateGenDisplay();

    if (automaton.isSealed) {
      isRunning = false;
      if (btnPlayPause) btnPlayPause.textContent = 'Completado';
      updateSealBadge(true);
    }
  }

  // Visualización del halo de la Membrana Biológica (B-1)
  if (automaton.membraneEnabled) {
    noFill();
    stroke(pal.deadTrail[0], pal.deadTrail[1], pal.deadTrail[2], 30);
    strokeWeight(1);
    const radiusPx = automaton.membraneRadius * CELL_SIZE * 2;
    ellipse(width / 2, height / 2, radiusPx, radiusPx);
    noStroke();
  }

  // Renderizado del cuerpo celular, sombras internas y sedimento
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
          // Tejido visceral profundo / penumbra previa a la asfixia (sombra interna)
          const r = lerp(pal.deadTrail[0], pal.alive[0], 0.38);
          const g = lerp(pal.deadTrail[1], pal.alive[1], 0.38);
          const b = lerp(pal.deadTrail[2], pal.alive[2], 0.38);
          fill(r, g, b);
          rect(px, py, CELL_SIZE, CELL_SIZE);
        } else if (isBone && neighbors <= 3) {
          // Costilla / Hueso focal con alta nitidez
          fill(pal.immortal[0], pal.immortal[1], pal.immortal[2]);
          rect(px, py, CELL_SIZE, CELL_SIZE);

          fill(pal.core[0], pal.core[1], pal.core[2]);
          rect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else if (age >= 3 && (neighbors === 2 || neighbors === 3)) {
          // Nodos maduros en equilibrio estructural (alta nitidez focal)
          fill(pal.alive[0], pal.alive[1], pal.alive[2]);
          rect(px, py, CELL_SIZE, CELL_SIZE);

          fill(pal.core[0], pal.core[1], pal.core[2]);
          rect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else {
          // Carne media / brotes periféricos (tono orgánico intermedio sin saturar a nitidez total)
          const tone = age === 1 ? 0.62 : 0.78;
          const r = lerp(pal.deadTrail[0], pal.alive[0], tone);
          const g = lerp(pal.deadTrail[1], pal.alive[1], tone);
          const b = lerp(pal.deadTrail[2], pal.alive[2], tone);
          fill(r, g, b);
          rect(px, py, CELL_SIZE, CELL_SIZE);
        }
      } else if (trail > 0.05) {
        // Rastro / Sedimento fósil en penumbra (deja huecos vacíos donde trail <= 0.05)
        const r = lerp(pal.bg[0], pal.deadTrail[0], trail);
        const g = lerp(pal.bg[1], pal.deadTrail[1], trail);
        const b = lerp(pal.bg[2], pal.deadTrail[2], trail);
        fill(r, g, b);
        rect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }

  // Eje de simetría sutil
  if (automaton.symmetryEnabled) {
    stroke(pal.alive[0], pal.alive[1], pal.alive[2], 20);
    strokeWeight(1);
    const midX = automaton.halfCols * CELL_SIZE;
    line(midX, 0, midX, height);
    noStroke();
  }
}
