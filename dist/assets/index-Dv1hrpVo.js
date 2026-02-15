(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))l(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&l(o)}).observe(document,{childList:!0,subtree:!0});function a(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(t){if(t.ep)return;t.ep=!0;const s=a(t);fetch(t.href,s)}})();console.log("Prime Blocks EPS Calculator: Loading...");const c=document.querySelector("#app");c||console.error("Error: #app element not found");const P=152,$=9,k=3,B=12,r=$+k+B,b={15:15,18:13},E={8:64,16:128,24:192};let e={rawMaterialCost:2e3,blockDensity:"15",shift:"8",pieceH:10,pieceW:10,pieceT:2,pieceDensity:"15",pieceQuantity:1,wastePercentage:10};function T(){console.log("Initializing UI..."),c.innerHTML=`
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
            <input type="number" name="rawMaterialCost" value="${e.rawMaterialCost}" step="10">
          </div>
        </div>
        
        <div class="input-group">
          <label>Factory Block Density (Production Yield)</label>
          <div class="input-wrapper">
             <select name="blockDensity">
              <option value="15" ${e.blockDensity==="15"?"selected":""}>15 kgrs density</option>
              <option value="18" ${e.blockDensity==="18"?"selected":""}>18 kgrs density</option>
            </select>
          </div>
        </div>
        
        <div class="row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="input-group">
            <label>Production Shift</label>
            <div class="input-wrapper">
              <select name="shift">
                <option value="8" ${e.shift==="8"?"selected":""}>8 Hours</option>
                <option value="16" ${e.shift==="16"?"selected":""}>16 Hours</option>
                <option value="24" ${e.shift==="24"?"selected":""}>24 Hours</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label>Avg. Waste (%)</label>
            <div class="input-wrapper">
              <input type="number" name="wastePercentage" value="${e.wastePercentage}" min="0" max="100" class="has-suffix">
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
            <strong style="font-size: 1.4rem;">$${r.toFixed(2)}</strong>
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
                <input type="number" name="pieceH" value="${e.pieceH}" class="has-suffix">
                <span class="suffix">in</span>
              </div>
            </div>
            <div class="input-group">
              <label>Width (W)</label>
              <div class="input-wrapper">
                <input type="number" name="pieceW" value="${e.pieceW}" class="has-suffix">
                <span class="suffix">in</span>
              </div>
            </div>
            <div class="input-group">
              <label>Thickness (T)</label>
              <div class="input-wrapper">
                <input type="number" name="pieceT" value="${e.pieceT}" class="has-suffix">
                <span class="suffix">in</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="input-group">
              <label>Piece Density</label>
              <div class="input-wrapper">
                <select name="pieceDensity">
                  <option value="15" ${e.pieceDensity==="15"?"selected":""}>15 kgrs</option>
                  <option value="18" ${e.pieceDensity==="18"?"selected":""}>18 kgrs</option>
                </select>
              </div>
            </div>
            <div class="input-group">
              <label>Quantity</label>
              <div class="input-wrapper">
                <input type="number" name="pieceQuantity" value="${e.pieceQuantity}" min="1">
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
  `,c.querySelectorAll("input, select").forEach(n=>{n.addEventListener("input",x)}),c.querySelector("#btn-calc").addEventListener("click",d),d(),console.log("UI Initialized and rendered.")}function d(){console.log("Calculating with state:",e);const n=1+e.wastePercentage/100,i=b[e.blockDensity],l=(e.rawMaterialCost/i+r)*n,t=b[e.pieceDensity],h=(e.rawMaterialCost/t+r)*n/P,p=e.pieceH*e.pieceW*e.pieceT/1728*h,C=p*e.pieceQuantity,u=document.getElementById("capacity-value"),v=document.getElementById("block-cost-value"),f=document.getElementById("block-cost-title"),m=document.getElementById("unit-cost-value"),g=document.getElementById("final-cost-value"),y=document.getElementById("final-cost-title");u&&(u.innerText=`${E[e.shift]} Blocks`),v&&(v.innerText=`$${l.toFixed(2)}`),f&&(f.innerText=`Full Block Cost (${e.blockDensity}kg - 152 ft³)`),m&&(m.innerText=`$${p.toFixed(4)}`),g&&(g.innerText=`$${C.toFixed(2)}`),y&&(y.innerText=`ORDER TOTAL (${e.pieceQuantity} Units @ ${e.wastePercentage}% Waste)`)}function x(n){const{name:i,value:a}=n.target;if(e[i]=parseFloat(a)||a,i==="blockDensity"){e.pieceDensity=a;const l=document.querySelector('select[name="pieceDensity"]');l&&(l.value=a)}d()}c&&T();
