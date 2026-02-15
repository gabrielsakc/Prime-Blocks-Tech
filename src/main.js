import './style.css'

console.log('Prime Blocks EPS Calculator: Loading...');

const app = document.querySelector('#app')

if (!app) {
  console.error('Error: #app element not found');
}

// Constants
const BLOCK_VOLUME_FT3 = 153;
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

const CONSTRUCTION_FORMATS = [
  { id: 'eifs', label: 'Wall Insulation (EIFS)', sublabel: '24"x48"', wIn: 24, hIn: 48, defaultT: 1 },
  { id: 'floors', label: 'Floor Insulation (Under Slab)', sublabel: '48"x48"/96"', wIn: 48, hIn: 48, defaultT: 2 },
  { id: 'roofs', label: 'Roof (Rigid Sheets)', sublabel: '24"x96"', wIn: 24, hIn: 96, defaultT: 1.5 },
  { id: 'caseton', label: 'Void Form / Caseton (Slab)', sublabel: 'Caseton 20"x48"', wIn: 20, hIn: 48, defaultT: 4 },
  { id: 'geofoam', label: 'Geofoam Blocks (Fills)', sublabel: '48"x96"', wIn: 48, hIn: 96, defaultT: 12 }
];

const CRAFT_FORMATS = [
  // --- Blocks & Cubes ---
  { id: 'smooth_std', category: 'Blocks & Cubes', label: 'SmoothFoM Block (Std)', wIn: 3.9, lIn: 11.9, tIn: 1.9 },
  { id: 'smooth_sq', category: 'Blocks & Cubes', label: 'SmoothFoM Block (Sq)', wIn: 11.9, lIn: 11.9, tIn: 0.6 },
  { id: 'craft_lg', category: 'Blocks & Cubes', label: 'CraftFoM Block (Lg)', wIn: 12, lIn: 19.9, tIn: 1.2 },
  { id: 'craft_md', category: 'Blocks & Cubes', label: 'CraftFoM Block (Md)', wIn: 7.8, lIn: 3.8, tIn: 1.9 },
  { id: 'foam_bricks', category: 'Blocks & Cubes', label: 'Foam Bricks', wIn: 2.8, lIn: 5.8, tIn: 1.3 },
  // --- Cake Forms ---
  { id: 'cake_10', category: 'Cake Forms', label: 'Square Base (Cake Form) 10"', wIn: 10, lIn: 10, tIn: 3 },
  { id: 'cake_8', category: 'Cake Forms', label: 'Square Base (Cake Form) 8"', wIn: 8, lIn: 8, tIn: 3 },
  { id: 'cake_6', category: 'Cake Forms', label: 'Square Base (Cake Form) 6"', wIn: 6, lIn: 6, tIn: 3 },
  // --- Rigid Panels ---
  { id: 'foam_giant', category: 'Rigid Panels', label: 'Giant Foam Board', wIn: 40, lIn: 60, tIn: 0.19 },
  { id: 'foam_lg', category: 'Rigid Panels', label: 'Large Foam Board', wIn: 32, lIn: 40, tIn: 0.12 },
  { id: 'mighty_core', category: 'Rigid Panels', label: 'Mighty Core (Heavy Duty)', wIn: 32, lIn: 40, tIn: 0.19 },
  { id: 'foam_std', category: 'Rigid Panels', label: 'Standard Foam Board', wIn: 20, lIn: 30, tIn: 0.25 },
  { id: 'foam_xtra', category: 'Rigid Panels', label: 'Extra Thick Foam Board', wIn: 20, lIn: 30, tIn: 0.50 },
  { id: 'ghostline_grid', category: 'Rigid Panels', label: 'Ghostline (Grid)', wIn: 22, lIn: 28, tIn: 0.19 },
  { id: 'ghostline_sm', category: 'Rigid Panels', label: 'Ghostline (Sm)', wIn: 11, lIn: 14, tIn: 0.19 },
  { id: 'project_fold', category: 'Rigid Panels', label: 'Project Board (Foldable)', wIn: 36, lIn: 48, tIn: 0.19 },
  // --- Rigid Sheets ---
  { id: 'sheet_thick', category: 'Rigid Sheets', label: 'Craft Foam Sheet (Thick)', wIn: 12, lIn: 48, tIn: 0.9 },
  { id: 'sheet_med', category: 'Rigid Sheets', label: 'Craft Foam Sheet (Med)', wIn: 12, lIn: 48, tIn: 0.4 },
  { id: 'sheet_white', category: 'Rigid Sheets', label: 'White Foam Sheets (Pack)', wIn: 11, lIn: 14, tIn: 0.1 }
];

let state = {
  rawMaterialCost: 2000,
  blockDensity: '15',
  shift: '8',
  pieceH: 10,
  pieceW: 10,
  pieceT: 2,
  pieceDensity: '15',
  pieceQuantity: 1,
  wastePercentage: 10,
  // Sales Prediction State
  salesPrices: {
    eifs: 8.5,
    floors: 7.5,
    roofs: 8.0,
    caseton: 6.5,
    geofoam: 5.5
  },
  salesQuantities: {},
  salesThicknesses: {},
  craftPricePerFt3: 15.0,
  craftQuantities: {}
};

// Initialize sales maps
CONSTRUCTION_FORMATS.forEach(f => {
  if (!state.salesPrices[f.id]) state.salesPrices[f.id] = 8.0;
  state.salesQuantities[f.id] = 0;
  state.salesThicknesses[f.id] = f.defaultT;
});

CRAFT_FORMATS.forEach(f => {
  state.craftQuantities[f.id] = 0;
});

function init() {
  console.log('Initializing UI...');
  app.innerHTML = `
    <div class="header">
      <h1>Prime Blocks Tech</h1>
      <p>EPS Piece Cost Calculator</p>
    </div>

    <div class="dashboard-container">
      <!-- Manufacturing Assumptions -->
      <div class="glass-card">
        <h2 class="section-title">1. Manufacturing Assumptions</h2>
        
        <div class="input-group">
          <label>Raw Material Cost (USD/Ton)</label>
          <div class="input-wrapper">
            <span class="prefix">$</span>
            <input type="number" name="rawMaterialCost" value="${state.rawMaterialCost}" step="10">
          </div>
        </div>

        <div class="grid-2">
          <div class="input-group">
            <label>Factory Block Density</label>
            <select name="blockDensity">
              <option value="15" ${state.blockDensity === '15' ? 'selected' : ''}>15 kg Density</option>
              <option value="18" ${state.blockDensity === '18' ? 'selected' : ''}>18 kg Density</option>
            </select>
          </div>
          <div class="input-group">
            <label>Production Shift</label>
            <select name="shift">
              <option value="8" ${state.shift === '8' ? 'selected' : ''}>8 Hours (64 Blocks)</option>
              <option value="16" ${state.shift === '16' ? 'selected' : ''}>16 Hours (128 Blocks)</option>
              <option value="24" ${state.shift === '24' ? 'selected' : ''}>24 Hours (192 Blocks)</option>
            </select>
          </div>
        </div>

        <div class="assumptions-grid" style="margin-top: 1.5rem; border-top: 1px dashed var(--border-glass); padding-top: 1.5rem;">
          <div class="assumption-item">
            <span>Reference Block Vol.</span>
            <strong>153 ft³</strong>
          </div>
          <div class="assumption-item">
            <span>Labor Cost/Block</span>
            <strong>$${LABOR_COST_PER_BLOCK.toFixed(2)}</strong>
          </div>
          <div class="assumption-item">
            <span>Energy Cost/Block</span>
            <strong>$${ENERGY_COST_PER_BLOCK.toFixed(2)}</strong>
          </div>
          <div class="assumption-item">
            <span>Infra & Insurance</span>
            <strong>$${INFRA_COST_PER_BLOCK.toFixed(2)}</strong>
          </div>
          <div class="assumption-item" style="grid-column: 1 / -1; margin-top: 1rem; border-top: 1px solid var(--border-glass); padding-top: 1rem;">
            <span>Total Fixed Costs per Block</span>
            <strong style="font-size: 1.4rem; color: var(--accent-neon);">$${FIXED_COST_SUM.toFixed(2)}</strong>
          </div>
          <div class="assumption-item" style="grid-column: 1 / -1;">
            <span>Current Shift Capacity</span>
            <strong id="capacity-value">-</strong>
          </div>
        </div>
      </div>

      <!-- Piece Specifications -->
      <div class="glass-card">
        <h2 class="section-title">2. Piece Specifications</h2>
        
        <div class="dimensions-grid">
          <div class="input-group">
            <label>Height</label>
            <div class="input-wrapper">
              <input type="number" name="pieceH" value="${state.pieceH}" step="0.5">
              <span class="suffix">in</span>
            </div>
          </div>
          <div class="input-group">
            <label>Width</label>
            <div class="input-wrapper">
              <input type="number" name="pieceW" value="${state.pieceW}" step="0.5">
              <span class="suffix">in</span>
            </div>
          </div>
          <div class="input-group">
            <label>Thickness</label>
            <div class="input-wrapper">
              <input type="number" name="pieceT" value="${state.pieceT}" step="0.1">
              <span class="suffix">in</span>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="input-group">
            <label>Target Piece Density</label>
            <select name="pieceDensity">
              <option value="15" ${state.pieceDensity === '15' ? 'selected' : ''}>15 kg Density</option>
              <option value="18" ${state.pieceDensity === '18' ? 'selected' : ''}>18 kg Density</option>
            </select>
          </div>
          <div class="input-group">
            <label>Safety Waste Margin</label>
            <div class="input-wrapper">
              <input type="number" name="wastePercentage" value="${state.wastePercentage}" min="0">
              <span class="suffix">%</span>
            </div>
          </div>
        </div>

        <div class="input-group">
          <label>Quantity to Produce (Units)</label>
          <input type="number" name="pieceQuantity" value="${state.pieceQuantity}" min="1">
        </div>

        <button class="btn-calculate" id="btn-calc">Recalculate Piece Cost</button>
      </div>

      <!-- Sales Prediction Module -->
      <div class="glass-card sales-section">
        <h2 class="section-title">3. Sales Prediction Module</h2>
        
        <div class="market-header">
          <h3>Construction Market</h3>
          <p class="format-sublabel">Define quantities and selling price per ft³</p>
        </div>

        <table class="sales-table">
          <thead>
            <tr>
              <th>Format / Product</th>
              <th>Qty</th>
              <th>Thick (in)</th>
              <th>Volume (ft³)</th>
              <th>Sale ($/ft³)</th>
              <th>Mfg Cost</th>
              <th>Total Sale</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            ${CONSTRUCTION_FORMATS.map(f => `
              <tr>
                <td>
                  <span class="format-label">${f.label}</span>
                  <span class="format-sublabel">${f.wIn}"x${f.hIn}"</span>
                </td>
                <td>
                  <div class="input-wrapper" style="width: 80px;">
                    <input type="number" data-type="qty" data-id="${f.id}" value="${state.salesQuantities[f.id]}" min="0">
                  </div>
                </td>
                <td>
                  <div class="input-wrapper" style="width: 70px;">
                    <input type="number" data-type="thickness" data-id="${f.id}" value="${state.salesThicknesses[f.id]}" min="0.1" step="0.5">
                  </div>
                </td>
                <td>
                  <span id="vol-${f.id}" class="format-label">0</span>
                </td>
                <td>
                  <div class="input-wrapper" style="width: 90px;">
                    <span class="prefix">$</span>
                    <input type="number" data-type="price" data-id="${f.id}" value="${state.salesPrices[f.id]}" step="0.5">
                  </div>
                </td>
                <td>
                  <span id="cost-${f.id}" class="format-sublabel">$0.00</span>
                </td>
                <td>
                   <strong id="revenue-${f.id}">$0.00</strong>
                </td>
                <td>
                   <strong id="profit-${f.id}">$0.00</strong>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="market-header" style="margin-top: 2rem;">
          <h3>Craft Market</h3>
          <div class="input-group" style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <label style="margin: 0; font-size: 0.85rem; color: var(--text-dim);">Sale Price per ft³:</label>
            <div class="input-wrapper" style="width: 120px;">
              <span class="prefix">$</span>
              <input type="number" name="craftPricePerFt3" value="${state.craftPricePerFt3}" step="0.5">
            </div>
          </div>
        </div>

        <table class="sales-table">
          <thead>
            <tr>
              <th>Format / Product</th>
              <th>Qty</th>
              <th>Volume (ft³)</th>
              <th>Sale Price</th>
              <th>Mfg Cost</th>
              <th>Total Sale</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            ${CRAFT_FORMATS.map(f => `
              <tr>
                <td>
                  <span class="format-label">${f.label}</span>
                  <span class="format-sublabel">${f.wIn}"x${f.lIn}"x${f.tIn}"</span>
                </td>
                <td>
                  <div class="input-wrapper" style="width: 80px;">
                    <input type="number" data-type="craft-qty" data-id="${f.id}" value="${state.craftQuantities[f.id]}" min="0">
                  </div>
                </td>
                <td>
                  <span id="craft-vol-${f.id}" class="format-label">0</span>
                </td>
                <td>
                  <span id="craft-price-${f.id}" class="format-sublabel">$0.00</span>
                </td>
                <td>
                  <span id="craft-cost-${f.id}" class="format-sublabel">$0.00</span>
                </td>
                <td>
                   <strong id="craft-revenue-${f.id}">$0.00</strong>
                </td>
                <td>
                   <strong id="craft-profit-${f.id}">$0.00</strong>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="revenue-summary">
          <div class="summary-card">
            <span>Total Sales Revenue</span>
            <strong id="total-revenue-value">$0.00</strong>
          </div>
          <div class="summary-card">
            <span>Production Volume Required</span>
            <strong id="total-volume-value">0 ft³</strong>
          </div>
          <div class="summary-card">
            <span>Total Blocks Required</span>
            <strong id="total-blocks-value">0.00</strong>
          </div>
          <div class="summary-card">
            <span>Production Days (Est.)</span>
            <strong id="total-days-value">0.00</strong>
          </div>
          <div class="summary-card profit">
            <span>Net Profit Projection</span>
            <strong id="total-profit-value">$0.00</strong>
          </div>
        </div>
      </div>

      <!-- Results (Moved to bottom or kept for piece only) -->
      <div class="results-section">
        <div class="result-card">
          <h3 id="block-cost-title">Full Block Cost (153 ft³)</h3>
          <div class="value" id="block-cost">$0.00</div>
          <div id="cost-per-ft3" style="font-size: 1.1rem; color: var(--accent-neon); margin-top: 0.5rem; font-weight: 500;">$0.00 / ft³</div>
          <div class="label">Total manufacturing cost per block</div>
        </div>
        
        <div class="result-card highlight">
          <h3>Piece Unit Cost</h3>
          <div class="value" id="unit-cost">$0.0000</div>
          <div class="label">Manufacturing cost per individual unit</div>
        </div>

        <div class="result-card">
          <h3 id="final-cost-title">ORDER TOTAL</h3>
          <div class="value" id="final-cost">$0.00</div>
          <div class="label">Total order production cost</div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners for main state
  app.querySelectorAll('input:not([data-id]), select').forEach(el => {
    el.addEventListener('input', handleInput);
  });

  // Attach event listeners for sales inputs
  app.querySelectorAll('input[data-id]').forEach(el => {
    el.addEventListener('input', handleSalesInput);
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
  const blockCostEl = document.getElementById('block-cost');
  const blockTitleEl = document.getElementById('block-cost-title');
  const unitCostEl = document.getElementById('unit-cost');
  const finalCostEl = document.getElementById('final-cost');
  const finalCostTitleEl = document.getElementById('final-cost-title');

  if (capacityEl) capacityEl.innerText = `${SHIFT_BLOCKS[state.shift]} Blocks`;

  // Reference Block Cost Card
  if (blockCostEl) blockCostEl.innerText = `$${factoryAdjustedCostPerBlock.toFixed(2)}`;
  if (blockTitleEl) blockTitleEl.innerText = `Full Block Cost (${state.blockDensity}kg - 153 ft³)`;

  // Display Cost per Cubic Foot (Block Cost / 153)
  const costPerFt3El = document.getElementById('cost-per-ft3');
  if (costPerFt3El) {
    const costPerFt3Val = factoryAdjustedCostPerBlock / 153;
    costPerFt3El.innerText = `$${costPerFt3Val.toFixed(2)} / ft³`;
  }

  // Unit and Total Results
  if (unitCostEl) unitCostEl.innerText = `$${unitPieceCost.toFixed(4)}`;
  if (finalCostEl) finalCostEl.innerText = `$${totalCost.toFixed(2)}`;
  if (finalCostTitleEl) finalCostTitleEl.innerText = `ORDER TOTAL (${state.pieceQuantity} Units @ ${state.wastePercentage}% Waste)`;

  // --- Sales Prediction Logic ---
  let totalRevenue = 0;
  let totalVolumeFt3 = 0;
  let totalMfgCost = 0;

  // Use the Factory Block Density to determine our internal "Cost per ft3" (Reusing variables from above)
  const internalCostPerBlock = (state.rawMaterialCost / factoryYield) + FIXED_COST_SUM;
  const internalCostPerFt3 = internalCostPerBlock / BLOCK_VOLUME_FT3;

  CONSTRUCTION_FORMATS.forEach(f => {
    const qty = state.salesQuantities[f.id] || 0;
    const thickness = state.salesThicknesses[f.id] || 1;
    const salePrice = state.salesPrices[f.id] || 0;

    // 1. Calculate Volume for this line (L * W * T / 1728) * Qty
    const itemVolFt3 = (f.wIn * f.hIn * thickness / 1728) * qty;

    // 2. Calculate Revenue (Vol * SalePrice)
    const itemRevenue = itemVolFt3 * salePrice;

    // 3. Calculate Our Manufacturing Cost (Vol * internalCostPerFt3)
    const itemMfgCost = itemVolFt3 * internalCostPerFt3;

    // 4. Profit
    const itemProfit = itemRevenue - itemMfgCost;

    totalRevenue += itemRevenue;
    totalVolumeFt3 += itemVolFt3;
    totalMfgCost += itemMfgCost;

    // Update Row DOM
    const volEl = document.getElementById(`vol-${f.id}`);
    const costEl = document.getElementById(`cost-${f.id}`);
    const revenueEl = document.getElementById(`revenue-${f.id}`);
    const profitEl = document.getElementById(`profit-${f.id}`);

    if (volEl) volEl.innerText = itemVolFt3.toFixed(2);
    if (costEl) costEl.innerText = `$${itemMfgCost.toFixed(2)}`;
    if (revenueEl) revenueEl.innerText = `$${itemRevenue.toFixed(2)}`;
    if (profitEl) {
      profitEl.innerText = `$${itemProfit.toFixed(2)}`;
      profitEl.style.color = itemProfit >= 0 ? 'var(--accent-neon)' : '#ff4d4d';
    }
  });

  // --- Craft Market Section ---
  CRAFT_FORMATS.forEach(f => {
    const qty = state.craftQuantities[f.id] || 0;
    const salePricePerFt3 = state.craftPricePerFt3 || 0;

    // 1. Calculate Volume for this item (W * L * T / 1728) * Qty
    const itemVolFt3 = (f.wIn * f.lIn * f.tIn / 1728) * qty;

    // 2. Calculate Revenue (ItemVol * SalePricePerFt3)
    const itemRevenue = itemVolFt3 * salePricePerFt3;

    // 3. Calculate Our Manufacturing Cost (ItemVol * internalCostPerFt3)
    const itemMfgCost = itemVolFt3 * internalCostPerFt3;

    // 4. Profit
    const itemProfit = itemRevenue - itemMfgCost;

    totalRevenue += itemRevenue;
    totalVolumeFt3 += itemVolFt3;
    totalMfgCost += itemMfgCost;

    // Update Row DOM
    const volEl = document.getElementById(`craft-vol-${f.id}`);
    const priceEl = document.getElementById(`craft-price-${f.id}`);
    const costEl = document.getElementById(`craft-cost-${f.id}`);
    const revenueEl = document.getElementById(`craft-revenue-${f.id}`);
    const profitEl = document.getElementById(`craft-profit-${f.id}`);

    if (volEl) volEl.innerText = itemVolFt3.toFixed(3);
    if (priceEl) priceEl.innerText = `$${salePricePerFt3.toFixed(2)}`;
    if (costEl) costEl.innerText = `$${itemMfgCost.toFixed(2)}`;
    if (revenueEl) revenueEl.innerText = `$${itemRevenue.toFixed(2)}`;
    if (profitEl) {
      profitEl.innerText = `$${itemProfit.toFixed(2)}`;
      profitEl.style.color = itemProfit >= 0 ? 'var(--accent-neon)' : '#ff4d4d';
    }
  });

  // Global Sales Summary
  const totalRevenueEl = document.getElementById('total-revenue-value');
  const totalVolumeEl = document.getElementById('total-volume-value');
  const totalBlocksEl = document.getElementById('total-blocks-value');
  const totalDaysEl = document.getElementById('total-days-value');
  const totalProfit = totalRevenue - totalMfgCost;
  const totalBlocks = totalVolumeFt3 / 153;
  const blocksPerDay = SHIFT_BLOCKS[state.shift] || 64;
  const totalDays = totalBlocks / blocksPerDay;

  if (totalRevenueEl) totalRevenueEl.innerText = `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (totalVolumeEl) totalVolumeEl.innerText = `${totalVolumeFt3.toLocaleString()} ft³`;
  if (totalBlocksEl) totalBlocksEl.innerText = totalBlocks.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (totalDaysEl) totalDaysEl.innerText = totalDays.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (totalProfitEl) {
    totalProfitEl.innerText = `$${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Update Profit Card if it existed or just console log for now
  console.log(`Summary: Total Rev $${totalRevenue.toFixed(2)}, Total Cost $${totalMfgCost.toFixed(2)}, Profit $${totalProfit.toFixed(2)}`);
}

function handleInput(e) {
  const { name, value } = e.target;
  state[name] = parseFloat(value) || 0;

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

function handleSalesInput(e) {
  const { dataset, value } = e.target;
  const id = dataset.id;
  const type = dataset.type; // 'qty', 'price', or 'thickness'

  if (type === 'qty') {
    state.salesQuantities[id] = parseFloat(value) || 0;
  } else if (type === 'price') {
    state.salesPrices[id] = parseFloat(value) || 0;
  } else if (type === 'thickness') {
    state.salesThicknesses[id] = parseFloat(value) || 0.1;
  } else if (type === 'craft-qty') {
    state.craftQuantities[id] = parseFloat(value) || 0;
  }

  calculate();
}

// Start everything
if (app) {
  init();
}
