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
const INFRA_COST_PER_BLOCK = 12; // Updated from 2.27
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
          <div class="input-wrapper">
            <span class="prefix">$</span>
            <input type="number" name="rawMaterialCost" value="${state.rawMaterialCost}" step="10">
          </div>
        </div>
        
        <div class="input-group">
          <label>Factory Block Density (Production Yield)</label>
          <div class="input-wrapper">
             <select name="blockDensity">
              <option value="15" ${state.blockDensity === '15' ? 'selected' : ''}>15 kgrs density</option>
              <option value="18" ${state.blockDensity === '18' ? 'selected' : ''}>18 kgrs density</option>
            </select>
          </div>
        </div>
        
        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="input-group">
            <label>Production Shift</label>
            <div class="input-wrapper">
              <select name="shift">
                <option value="8" ${state.shift === '8' ? 'selected' : ''}>8 Hours</option>
                <option value="16" ${state.shift === '16' ? 'selected' : ''}>16 Hours</option>
                <option value="24" ${state.shift === '24' ? 'selected' : ''}>24 Hours</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label>Avg. Waste (%)</label>
            <div class="input-wrapper">
              <input type="number" name="wastePercentage" value="${state.wastePercentage}" min="0" max="100" class="has-suffix">
              <span class="suffix">%</span>
            </div>
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
            <span>Infra/Credit, General costs and Insurance</span>
            <strong>$12.00</strong>
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
        <h2 class="section-title">Piece Measurements & Quantity</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          
          <div class="dimensions-grid">
            <div class="input-group">
              <label>Height (H)</label>
              <div class="input-wrapper">
                <input type="number" name="pieceH" value="${state.pieceH}" class="has-suffix">
                <span class="suffix">in</span>
              </div>
            </div>
            <div class="input-group">
              <label>Width (W)</label>
              <div class="input-wrapper">
                <input type="number" name="pieceW" value="${state.pieceW}" class="has-suffix">
                <span class="suffix">in</span>
              </div>
            </div>
            <div class="input-group">
              <label>Thickness (T)</label>
              <div class="input-wrapper">
                <input type="number" name="pieceT" value="${state.pieceT}" class="has-suffix">
                <span class="suffix">in</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="input-group">
              <label>Piece Density</label>
              <div class="input-wrapper">
                <select name="pieceDensity">
                  <option value="15" ${state.pieceDensity === '15' ? 'selected' : ''}>15 kgrs</option>
                  <option value="18" ${state.pieceDensity === '18' ? 'selected' : ''}>18 kgrs</option>
                </select>
              </div>
            </div>
            <div class="input-group">
              <label>Quantity</label>
              <div class="input-wrapper">
                <input type="number" name="pieceQuantity" value="${state.pieceQuantity}" min="1">
              </div>
            </div>
          </div>

        </div>
        <button class="btn-calculate" id="btn-calc">Recalculate Piece Cost</button>
      </div>

      <!-- Results -->
      <div class="results-section">
        <div class="result-card">
          <h3 id="block-cost-title">Full Block Cost (152 ft³)</h3>
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

  // Waste factor
  const wasteFactor = 1 + (state.wastePercentage / 100);

  // 1. Calculate the REFERENCE Block Cost (based on Global Factory Density)
  const factoryYield = DENSITY_YIELDS[state.blockDensity];
  const factoryBaseCostPerBlock = (state.rawMaterialCost / factoryYield) + FIXED_COST_SUM;
  const factoryAdjustedCostPerBlock = factoryBaseCostPerBlock * wasteFactor;

  // 2. Calculate the PIECE Cost (based on Piece Density)
  const pieceYield = DENSITY_YIELDS[state.pieceDensity];
  const pieceBaseCostPerBlock = (state.rawMaterialCost / pieceYield) + FIXED_COST_SUM;
  const pieceAdjustedCostPerBlock = pieceBaseCostPerBlock * wasteFactor;
  const pieceCostPerFt3 = pieceAdjustedCostPerBlock / BLOCK_VOLUME_FT3;

  const pieceVolIn3 = state.pieceH * state.pieceW * state.pieceT;
  const pieceVolFt3 = pieceVolIn3 / 1728;
  const unitPieceCost = pieceVolFt3 * pieceCostPerFt3;
  const totalCost = unitPieceCost * state.pieceQuantity;

  // Update DOM directly
  const capacityEl = document.getElementById('capacity-value');
  const blockCostEl = document.getElementById('block-cost-value');
  const blockTitleEl = document.getElementById('block-cost-title');
  const unitCostEl = document.getElementById('unit-cost-value');
  const finalCostEl = document.getElementById('final-cost-value');
  const finalCostTitleEl = document.getElementById('final-cost-title');

  if (capacityEl) capacityEl.innerText = `${SHIFT_BLOCKS[state.shift]} Blocks`;

  // Reference Block Cost Card
  if (blockCostEl) blockCostEl.innerText = `$${factoryAdjustedCostPerBlock.toFixed(2)}`;
  if (blockTitleEl) blockTitleEl.innerText = `Full Block Cost (${state.blockDensity}kg - 152 ft³)`;

  // Unit and Total Results
  if (unitCostEl) unitCostEl.innerText = `$${unitPieceCost.toFixed(4)}`;
  if (finalCostEl) finalCostEl.innerText = `$${totalCost.toFixed(2)}`;
  if (finalCostTitleEl) finalCostTitleEl.innerText = `ORDER TOTAL (${state.pieceQuantity} Units @ ${state.wastePercentage}% Waste)`;
}

function handleInput(e) {
  const { name, value } = e.target;
  state[name] = parseFloat(value) || value;

  // SYNC Logic: If user changes Global Density, default the Piece Density to it as well
  // but let them change it separately if they want.
  if (name === 'blockDensity') {
    state.pieceDensity = value;
    // We need to update the pieceDensity select value in the DOM
    const pieceDensitySelect = document.querySelector('select[name="pieceDensity"]');
    if (pieceDensitySelect) pieceDensitySelect.value = value;
  }

  calculate();
}

// Start everything
if (app) {
  init();
}
