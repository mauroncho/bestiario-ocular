/**
 * oracle.js
 * Módulo de traducción determinista y catálogo genético.
 * Integra:
 * - Estrategia B-1: Membrana de inhibición radial
 * - Generaciones máximas cifradas en el nombre (sellado del oráculo)
 */

// Hash determinista FNV-1a de 32 bits
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// PRNG determinista mulberry32
function createPRNG(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Catálogo Curado de Reglas No Expansivas
 */
const CURATED_RULES = [
  {
    id: 'vertebra',
    name: 'Vértebra & Calavera',
    desc: 'Crecimiento óseo filamentoso y cerrado',
    birth: [3],
    survival: [2, 3, 8]
  },
  {
    id: 'insectoide',
    name: 'Insectoide Pulsante',
    desc: 'Estructuras segmentadas y osciladores periféricos',
    birth: [3, 6],
    survival: [2, 4, 5]
  },
  {
    id: 'ameba_acotada',
    name: 'Ameba Contenida',
    desc: 'Masas biológicas redondeadas que respetan su núcleo',
    birth: [3, 5],
    survival: [1, 3, 5, 8]
  },
  {
    id: 'membrana',
    name: 'Cavidad & Membrana',
    desc: 'Bordes celulares tensos que forman cámaras internas',
    birth: [3, 7],
    survival: [2, 3]
  },
  {
    id: 'coral_denso',
    name: 'Tejido Coralino',
    desc: 'Ramificaciones calcáreas lentas y densas',
    birth: [3, 6],
    survival: [2, 3]
  },
  {
    id: 'quimera',
    name: 'Quimera Mitótica',
    desc: 'División celular compacta con equilibrio simétrico',
    birth: [3, 4],
    survival: [3, 4]
  },
  {
    id: 'nervaduras',
    name: 'Sedas & Nervaduras',
    desc: 'Filamentos sutiles que respiran desde el eje central',
    birth: [3, 6, 7],
    survival: [2, 3]
  }
];

const PALETTES = [
  {
    name: 'Pergamino & Bilis',
    bg: [13, 12, 10],
    deadTrail: [65, 52, 32],
    alive: [225, 205, 155],
    core: [255, 248, 220],
    immortal: [235, 185, 85]
  },
  {
    name: 'Carbón & Sangre Seca',
    bg: [12, 10, 11],
    deadTrail: [75, 20, 25],
    alive: [195, 42, 52],
    core: [255, 130, 120],
    immortal: [255, 210, 200]
  },
  {
    name: 'Hueso & Ceniza',
    bg: [13, 14, 15],
    deadTrail: [45, 52, 58],
    alive: [175, 188, 195],
    core: [240, 248, 255],
    immortal: [225, 235, 245]
  },
  {
    name: 'Éter & Manía Mistérica',
    bg: [10, 12, 18],
    deadTrail: [38, 45, 85],
    alive: [105, 158, 215],
    core: [200, 235, 255],
    immortal: [180, 220, 255]
  },
  {
    name: 'Cobre & Azufre',
    bg: [15, 13, 10],
    deadTrail: [75, 48, 20],
    alive: [215, 138, 48],
    core: [255, 205, 105],
    immortal: [255, 180, 75]
  }
];

/**
 * Deriva toda la configuración de la criatura a partir del nombre
 */
function deriveOracleGenome(inputString, overrides = {}) {
  const cleanStr = (inputString || '').trim();
  const seed = hashString(cleanStr.length === 0 ? 'ANÓNIMO' : cleanStr);
  const random = createPRNG(seed);

  // Regla
  let selectedRule;
  if (overrides.ruleId && overrides.ruleId !== 'auto') {
    selectedRule = CURATED_RULES.find((r) => r.id === overrides.ruleId) || CURATED_RULES[0];
  } else {
    const ruleIndex = Math.floor(random() * CURATED_RULES.length);
    selectedRule = CURATED_RULES[ruleIndex];
  }

  const birth = overrides.birth ? [...overrides.birth] : [...selectedRule.birth];
  const survival = overrides.survival ? [...overrides.survival] : [...selectedRule.survival];
  birth.sort((a, b) => a - b);
  survival.sort((a, b) => a - b);

  // Paleta fija a "Carbón & Sangre Seca" (índice 1: tonos abisales y rojo sangre)
  const paletteIndex = overrides.paletteIndex !== undefined
    ? overrides.paletteIndex
    : 1; // 1 = Carbón & Sangre Seca
  const palette = PALETTES[paletteIndex % PALETTES.length];

  // Geometría del embrión central
  const embryoWidth = overrides.embryoWidth || Math.floor(6 + random() * 8);
  const embryoHeight = overrides.embryoHeight || Math.floor(12 + random() * 16);
  const density = overrides.density !== undefined ? overrides.density : 0.4 + random() * 0.25;

  const embryoMatrix = [];
  for (let y = 0; y < embryoHeight; y++) {
    const row = [];
    for (let x = 0; x < embryoWidth; x++) {
      row.push(random() < density ? 1 : 0);
    }
    embryoMatrix.push(row);
  }

  // Generaciones máximas cifradas en el nombre (entre 80 y 160 pasos)
  // Determina la "vida útil" del oráculo antes de congelar el glifo final
  const maxGenerations = overrides.maxGenerations || Math.floor(80 + random() * 80);

  // Radio de la membrana biológica (en celdas desde el centro, máx 38 de 40 para no tocar jamás el borde)
  const membraneRadius = overrides.membraneRadius || Math.floor(28 + random() * 7); // 28 a 34 celdas

  return {
    input: cleanStr,
    seed: seed,
    hexHash: '0x' + seed.toString(16).toUpperCase().padStart(8, '0'),
    ruleId: selectedRule.id,
    ruleName: selectedRule.name,
    ruleDesc: selectedRule.desc,
    rule: { birth, survival },
    ruleString: `B${birth.join('')}/S${survival.join('')}`,
    palette,
    paletteIndex,
    maxGenerations,
    membraneRadius,
    embryo: {
      width: embryoWidth,
      height: embryoHeight,
      matrix: embryoMatrix,
      density
    }
  };
}
