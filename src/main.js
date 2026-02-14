import './style.css'

console.log('Prime Blocks EPS Calculator: Loading...');

const app = document.querySelector('#app')

if (!app) {
  console.error('Error: #app element not found');
}

// Constants
const BLOCK_VOLUME_FT3 = 152;
const LABOR_COST_PER_BLOCK = 9;
const ENERGY_COST_PER_BLOCK = 3;
const INFRA_COST_PER_BLOCK = 2.27;
const FIXED_COST_SUM = LABOR_COST_PER_BLOCK + ENERGY_COST_PER_BLOCK + INFRA_COST_PER_BLOCK;

const DENSITY_YIELDS = {
  '15': 15, // 15 blocks per ton
  '18': 13  // 13 blocks per ton
};

const SHIFT_BLOCKS = {
  '8': 64,
  '16': 128,
  '24': 192
};

let state = {
  rawMaterialCost: 2000,
  blockDensity: '15',
  shift: '8',
  pieceH: 10,
  pieceW: 10,
  pieceT: 2,
  pieceDensity: '15',
  pieceQuantity: 1,
  wastePercentage: 10
};

function init() {
  console.log('Initializing UI...');
  app.innerHTML = `
    <div class="header">
      <h1>Prime Blocks Tech</h1>
      <p>EPS Piece Cost Calculator</p>
    </div>

    <div class="dashboard-container">
      <!-- Global Settings -->
      <div class="glass-card">
        <h2 class="section-title">Global Settings & Waste</h2>
        
        <div class="input-group">
          <label>Raw Material Cost (USD/Ton)</label>
          <input type="number" name="rawMaterialCost" value="${state.rawMaterialCost}" step="10">
        </div>
        
        <div class="input-group">
          <label>Factory Block Density (Production Yield)</label>
          <select name="blockDensity">
            <option value="15" ${state.blockDensity === '15' ? 'selected' : ''}>15 kgrs density</option>
            <option value="18" ${state.blockDensity === '18' ? 'selected' : ''}>18 kgrs density</option>
          </select>
        </div>
        
        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="input-group">
            <label>Production Shift</label>
            <select name="shift">
              <option value="8" ${state.shift === '8' ? 'selected' : ''}>8 Hours</option>
              <option value="16" ${state.shift === '16' ? 'selected' : ''}>16 Hours</option>
              <option value="24" ${state.shift === '24' ? 'selected' : ''}>24 Hours</option>
            </select>
          </div>
          <div class="input-group">
            <label>Avg. Waste (%)</label>
            <input type="number" name="wastePercentage" value="${state.wastePercentage}" min="0" max="100">
          </div>
        </div>
      </div>

      <!-- Manufacturing Assumptions -->
      <div class="glass-card">
        <h2 class="section-title">Manufacturing Assumptions - Fixed cost per block</h2>
        <div class="assumptions-grid">
          <div class="assumption-item">
            <span>Volume/Block</span>
            <strong>152 ft³</strong>
          </div>
          <div class="assumption-item">
            <span>Labor Cost</span>
            <strong>$9.00</strong>
          </div>
          <div class="assumption-item">
            <span>Energy Cost</span>
            <strong>$3.00</strong>
          </div>
          <div class="assumption-item">
            <span>Infra/Credit</span>
            <strong>$2.27</strong>
          </div>
          <div class="assumption-item" style="grid-column: 1 / -1; margin-top: 1rem; border-top: 1px dashed var(--border-glass); padding-top: 1.5rem;">
            <span>Total Fixed Costs per Block</span>
            <strong style="font-size: 1.4rem;">$${FIXED_COST_SUM.toFixed(2)}</strong>
          </div>
          <div class="assumption-item" style="grid-column: 1 / -1; margin-top: 0.5rem;">
            <span>Factory Capacity (Selected Shift)</span>
            <strong id="capacity-value">-</strong>
          </div>
        </div>
      </div>

      <!-- Piece Calculator -->
      <div class="glass-card" style="grid-column: 1 / -1;">
        <h2 class="section-title">Piece Measurements & Quantity (Inches)</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem;">
          <div class="input-group">
            <label>Height (H)</label>
            <input type="number" name="pieceH" value="${state.pieceH}">
          </div>
          <div class="input-group">
            <label>Width (W)</label>
            <input type="number" name="pieceW" value="${state.pieceW}">
          </div>
          <div class="input-group">
            <label>Thickness (T)</label>
            <input type="number" name="pieceT" value="${state.pieceT}">
          </div>
          <div class="input-group">
            <label>Piece Density</label>
            <select name="pieceDensity">
              <option value="15" ${state.pieceDensity === '15' ? 'selected' : ''}>15 kgrs</option>
              <option value="18" ${state.pieceDensity === '18' ? 'selected' : ''}>18 kgrs</option>
            </select>
          </div>
          <div class="input-group">
            <label>Quantity</label>
            <input type="number" name="pieceQuantity" value="${state.pieceQuantity}" min="1">
          </div>
        </div>
        <button class="btn-calculate" id="btn-calc">Recalculate Now</button>
      </div>

      <!-- Results -->
      <div class="results-section">
        <div class="result-card">
          <h3>Full Block Cost (152 ft³)</h3>
          <div class="value" id="block-cost-value">$0.00</div>
        </div>
        <div class="result-card">
          <h3>Unit Piece Cost</h3>
          <div class="value" id="unit-cost-value">$0.00</div>
        </div>
        <div class="result-card highlight">
          <h3 id="final-cost-title">TOTAL ORDER COST</h3>
          <div class="value" id="final-cost-value">$0.00</div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  app.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', handleInput);
  });

  app.querySelector('#btn-calc').addEventListener('click', calculate);

  // Run initial calculation
  calculate();
  console.log('UI Initialized and rendered.');
}

function calculate() {
  console.log('Calculating with state:', state);

  const yield_blq = DENSITY_YIELDS[state.pieceDensity];
  const baseCostPerBlock = (state.rawMaterialCost / yield_blq) + FIXED_COST_SUM;

  // Apply waste factor
  const wasteFactor = 1 + (state.wastePercentage / 100);
  const adjustedCostPerBlock = baseCostPerBlock * wasteFactor;
  const costPerFt3Adjusted = adjustedCostPerBlock / BLOCK_VOLUME_FT3;

  const pieceVolIn3 = state.pieceH * state.pieceW * state.pieceT;
  const pieceVolFt3 = pieceVolIn3 / 1728;
  const unitPieceCostWithWaste = pieceVolFt3 * costPerFt3Adjusted;
  const totalCost = unitPieceCostWithWaste * state.pieceQuantity;

  // Update DOM directly
  const capacityEl = document.getElementById('capacity-value');
  const blockCostEl = document.getElementById('block-cost-value');
  const unitCostEl = document.getElementById('unit-cost-value');
  const finalCostEl = document.getElementById('final-cost-value');
  const finalCostTitleEl = document.getElementById('final-cost-title');

  if (capacityEl) capacityEl.innerText = `${SHIFT_BLOCKS[state.shift]} Blocks`;
  if (blockCostEl) blockCostEl.innerText = `$${adjustedCostPerBlock.toFixed(2)}`;
  if (unitCostEl) unitCostEl.innerText = `$${unitPieceCostWithWaste.toFixed(4)}`;
  if (finalCostEl) finalCostEl.innerText = `$${totalCost.toFixed(2)}`;
  if (finalCostTitleEl) finalCostTitleEl.innerText = `ORDER TOTAL (${state.pieceQuantity} Units @ ${state.wastePercentage}% Waste)`;
}

function handleInput(e) {
  const { name, value } = e.target;
  state[name] = parseFloat(value) || value;
  calculate();
}

// Start everything
if (app) {
  init();
}
