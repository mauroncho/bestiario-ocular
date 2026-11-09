/**
 * automaton.js
 * Motor del autómata celular 2D con soporte para:
 * - A-1: Esqueleto Inmortal (hueso originario)
 * - B-1: Membrana Biológica Radial (inhibición por distancia al centro)
 * - Huella Indeleble / Sedimento fósil acumulativo
 * - Sellado del Oráculo al alcanzar N generaciones
 */

class SymmetricAutomaton {
  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.halfCols = Math.floor(cols / 2);
    this.centerX = (cols - 1) / 2;
    this.centerY = (rows - 1) / 2;

    // Grillas de estado
    this.grid = this.createGrid();
    this.nextGrid = this.createGrid();

    // Edad celular y densidad local para modulación de nitidez y sombras
    this.age = this.createGrid();
    this.neighborGrid = this.createGrid();

    // Rastro de memoria / sedimento (0.0 a 1.0)
    this.trail = this.createFloatGrid();

    // Matriz de esqueleto inmortal (A-1) y reserva germinal anti-extinción
    this.isImmortal = this.createGrid();
    this.germinalSeed = this.createGrid();
    this.necrotized = this.createGrid();
    this.immortalCoreEnabled = false; // Desactivado por defecto: las células originarias pueden morir

    // Regla 1-A: Apoptosis / Necrosis por Asfixia (Sobrepoblación Central)
    this.apoptosisEnabled = true;
    this.apoptosisThreshold = 6;

    // Membrana radial biológica (B-1)
    this.membraneRadius = 32;
    this.membraneEnabled = true;

    // Rastro indeleble
    this.indelibleEnabled = true;

    // Reglas y comportamiento
    this.birth = [3];
    this.survival = [2, 3];
    this.symmetryEnabled = true;
    this.decayRate = 0.015;

    // Sellado / límite de generaciones
    this.generation = 0;
    this.maxGenerations = 120;
    this.isSealed = false;
  }

  createGrid() {
    return Array.from({ length: this.rows }, () => new Uint8Array(this.cols));
  }

  createFloatGrid() {
    return Array.from({ length: this.rows }, () => new Float32Array(this.cols));
  }

  setRule(rule) {
    this.birth = [...rule.birth];
    this.survival = [...rule.survival];
  }

  setImmortalCore(enabled) {
    this.immortalCoreEnabled = !!enabled;
  }

  setApoptosis(enabled, threshold) {
    this.apoptosisEnabled = !!enabled;
    if (threshold !== undefined) {
      this.apoptosisThreshold = Math.max(3, Math.min(8, threshold));
    }
  }

  setSymmetry(enabled) {
    this.symmetryEnabled = !!enabled;
  }

  setMembrane(enabled, radius) {
    this.membraneEnabled = !!enabled;
    if (radius !== undefined) {
      this.membraneRadius = Math.max(10, Math.min(this.halfCols - 2, radius));
    }
  }

  setIndelible(enabled) {
    this.indelibleEnabled = !!enabled;
  }

  setDecayRate(rate) {
    this.decayRate = Math.max(0.001, Math.min(0.2, rate));
  }

  setMaxGenerations(maxGen) {
    this.maxGenerations = Math.max(20, maxGen);
    this.checkSealStatus();
  }

  checkSealStatus() {
    this.isSealed = this.generation >= this.maxGenerations;
  }

  /**
   * Distancia euclidiana normalizada al centro de la grilla
   */
  distToCenter(x, y) {
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Deposita el embrión inicial y resetea contadores
   */
  plantEmbryo(embryoData, maxGen, membraneRad) {
    this.clear();
    const { width: ew, height: eh, matrix } = embryoData;

    if (maxGen) this.maxGenerations = maxGen;
    if (membraneRad) this.membraneRadius = membraneRad;

    const startY = Math.floor((this.rows - eh) / 2);
    const midX = this.halfCols;

    for (let ey = 0; ey < eh; ey++) {
      const y = startY + ey;
      if (y < 0 || y >= this.rows) continue;

      for (let ex = 0; ex < ew; ex++) {
        const val = matrix[ey][ex];
        if (val === 1) {
          const xLeft = midX - 1 - ex;
          const xRight = midX + ex;

          if (xLeft >= 0) {
            this.grid[y][xLeft] = 1;
            this.age[y][xLeft] = 1;
            this.trail[y][xLeft] = 0.22;
            this.isImmortal[y][xLeft] = 1;
            this.germinalSeed[y][xLeft] = 1;
          }
          if (xRight < this.cols) {
            this.grid[y][xRight] = 1;
            this.age[y][xRight] = 1;
            this.trail[y][xRight] = 0.22;
            this.isImmortal[y][xRight] = 1;
            this.germinalSeed[y][xRight] = 1;
          }
        }
      }
    }

    this.refreshNeighborGrid();
    this.generation = 0;
    this.isSealed = false;
  }

  clear() {
    for (let y = 0; y < this.rows; y++) {
      this.grid[y].fill(0);
      this.nextGrid[y].fill(0);
      this.age[y].fill(0);
      this.neighborGrid[y].fill(0);
      this.trail[y].fill(0);
      this.isImmortal[y].fill(0);
      this.germinalSeed[y].fill(0);
      this.necrotized[y].fill(0);
    }
    this.generation = 0;
    this.isSealed = false;
  }

  countNeighbors(x, y, sourceGrid = this.grid) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= this.rows) continue;

      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        if (nx < 0 || nx >= this.cols) continue;

        if (sourceGrid[ny][nx] === 1) {
          count++;
        }
      }
    }
    return count;
  }

  refreshNeighborGrid() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.neighborGrid[y][x] = this.countNeighbors(x, y, this.grid);
      }
    }
  }

  /**
   * Ciclo de evolución celular
   */
  step() {
    if (this.isSealed) return;

    if (this.symmetryEnabled) {
      this.stepSymmetric();
    } else {
      this.stepFull();
    }

    // Aplicar Membrana Biológica Radial (B-1) y contabilizar población resultante
    let currentAlive = 0;
    let nextAlive = 0;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === 1) currentAlive++;

        if (this.membraneEnabled && this.distToCenter(x, y) > this.membraneRadius) {
          this.nextGrid[y][x] = 0;
        }
        if (this.nextGrid[y][x] === 1) nextAlive++;
      }
    }

    // Garantía Anti-Vacío: nunca permitir que el canvas quede vacío al terminar o colapsar
    if (nextAlive < 16) {
      if (!this.immortalCoreEnabled && this.generation >= 8 && currentAlive >= 14) {
        // Si el esqueleto inmortal está desactivado y la forma está por extinguirse,
        // congelamos inmediatamente el estado vivo actual para preservar la criatura
        this.isSealed = true;
        return;
      }

      // Rescate por latido germinal hueco: reactivar solo costillas periféricas del embrión
      // (vecindad germinal entre 1 y 4), dejando el centro hueco
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (this.germinalSeed[y][x] === 1) {
            const gNeighbors = this.countNeighbors(x, y, this.germinalSeed);
            if (gNeighbors >= 1 && gNeighbors <= 4) {
              this.nextGrid[y][x] = 1;
              this.necrotized[y][x] = 0;
            }
          }
        }
      }
    }

    // Actualización de estado, edad y rastro con preservación de huecos
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.grid[y][x] = this.nextGrid[y][x];
      }
    }

    this.refreshNeighborGrid();

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const state = this.grid[y][x];
        const neighbors = this.neighborGrid[y][x];

        if (state === 1) {
          this.age[y][x] = Math.min(255, this.age[y][x] + 1);
          // Acumulación progresiva (evita saturar todo de inmediato a 1.0)
          this.trail[y][x] = Math.min(0.95, this.trail[y][x] + 0.09);
        } else {
          this.age[y][x] = 0;
          if (this.trail[y][x] > 0) {
            if (this.necrotized[y][x] === 1 || neighbors === 0) {
              // Las cavidades por apoptosis o zonas interiores vacías excavan el rastro hasta 0 (huecos reales)
              this.trail[y][x] = Math.max(0, this.trail[y][x] - 0.045);
            } else if (this.indelibleEnabled) {
              if (this.trail[y][x] >= 0.42 && neighbors >= 1) {
                // Tejido contiguo a estructuras vivas mantiene penumbra fósil suave (0.24 a 0.55)
                this.trail[y][x] = Math.max(0.24, this.trail[y][x] - 0.012);
              } else {
                // Paso efímero se limpia hasta 0 para permitir huecos limpios en la figura
                this.trail[y][x] = Math.max(0, this.trail[y][x] - this.decayRate);
              }
            } else {
              this.trail[y][x] = Math.max(0, this.trail[y][x] - this.decayRate);
            }
          }
        }
      }
    }

    this.generation++;
    this.checkSealStatus();
  }

  evaluateCellNextState(x, y) {
    const neighbors = this.countNeighbors(x, y);
    const state = this.grid[y][x];
    let nextState = state === 1
      ? (this.survival.includes(neighbors) ? 1 : 0)
      : (this.birth.includes(neighbors) ? 1 : 0);

    // Regla 1-A: Apoptosis / Necrosis por Asfixia celular ante sobrepoblación
    if (this.apoptosisEnabled && state === 1 && neighbors >= this.apoptosisThreshold) {
      nextState = 0;
      // La asfixia necrosa permanentemente ese punto del hueso para tallar cavidades/huecos reales
      this.isImmortal[y][x] = 0;
      this.necrotized[y][x] = 1;
    }

    // Regla A-1: Esqueleto Inmortal (solo sostiene trabéculas/costillas no saturadas)
    if (this.immortalCoreEnabled && this.isImmortal[y][x] === 1 && this.necrotized[y][x] === 0) {
      if (this.apoptosisEnabled && neighbors >= this.apoptosisThreshold) {
        nextState = 0;
        this.isImmortal[y][x] = 0;
        this.necrotized[y][x] = 1;
      } else if (neighbors >= 1 && neighbors <= 3) {
        nextState = 1;
      }
    }

    return nextState;
  }

  stepSymmetric() {
    const isOdd = this.cols % 2 !== 0;

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.halfCols; x++) {
        this.nextGrid[y][x] = this.evaluateCellNextState(x, y);
      }
    }

    if (isOdd) {
      const midX = this.halfCols;
      for (let y = 0; y < this.rows; y++) {
        this.nextGrid[y][midX] = this.evaluateCellNextState(midX, y);
      }
    }

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.halfCols; x++) {
        const mirrorX = this.cols - 1 - x;
        this.nextGrid[y][mirrorX] = this.nextGrid[y][x];
        this.isImmortal[y][mirrorX] = this.isImmortal[y][x];
        this.necrotized[y][mirrorX] = this.necrotized[y][x];
      }
    }
  }

  stepFull() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.nextGrid[y][x] = this.evaluateCellNextState(x, y);
      }
    }
  }
}
