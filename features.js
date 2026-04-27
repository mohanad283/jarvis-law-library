// ==================== AUTOCOMPLETE ====================
function showAutocomplete() {
  const input = document.getElementById('search');
  const list = document.getElementById('autocomplete-list');
  const val = input.value.toLowerCase().trim();
  list.innerHTML = '';
  if (!val) return;
  const matches = laws.filter(l =>
    l.name.toLowerCase().includes(val) ||
    l.cat.toLowerCase().includes(val) ||
    l.formula.toLowerCase().includes(val)
  ).slice(0, 8);
  if (!matches.length) return;
  matches.forEach(l => {
    const item = document.createElement('div');
    item.className = 'autocomplete-item';
    item.innerHTML = '<strong>' + l.name + '</strong> <span style="color:#64748B;font-size:0.85rem">(' + l.cat + ')</span>';
    item.onclick = () => {
      input.value = l.name;
      list.innerHTML = '';
      input.dispatchEvent(new Event('input'));
    };
    list.appendChild(item);
  });
}
document.addEventListener('click', (e) => {
  if (e.target.id !== 'search') {
    const list = document.getElementById('autocomplete-list');
    if (list) list.innerHTML = '';
  }
});
const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("focus", showAutocomplete);
  searchInput.addEventListener("input", showAutocomplete);
}

// ==================== FAVORITES ====================
function getFavorites() {
  const favs = localStorage.getItem('jarvis_favorites');
  return favs ? JSON.parse(favs) : [];
}
function toggleFavorite(name) {
  let favs = getFavorites();
  const idx = favs.indexOf(name);
  if (idx > -1) favs.splice(idx, 1);
  else favs.push(name);
  localStorage.setItem('jarvis_favorites', JSON.stringify(favs));
  if (typeof render === 'function') render();
}
function isFavorite(name) {
  return getFavorites().includes(name);
}

// ==================== DAILY FORMULA ====================
function getDailyFormula() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('jarvis_daily');
  if (stored) {
    const data = JSON.parse(stored);
    if (data.date === today) return data.formula;
  }
  const idx = Math.floor(Math.random() * laws.length);
  const formula = laws[idx];
  localStorage.setItem('jarvis_daily', JSON.stringify({ date: today, formula: formula }));
  return formula;
}

// Initialize daily formula display when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const daily = getDailyFormula();
  if (daily) {
    const container = document.getElementById('daily-result');
    if (container) {
      container.innerHTML = `
        <div class="card" onclick="this.classList.toggle('expanded')">
          <div class="card-header">
            <span class="card-title">${daily.name}</span>
            <button class="fav-btn ${isFavorite(daily.name)?'active':''}" onclick="event.stopPropagation(); toggleFavorite('${daily.name.replace(/'/g,"\\'")}')">☆</button>
            <span class="card-badge">${daily.cat}</span>
          </div>
          <div class="card-formula">${daily.formula}</div>
          <div class="card-expand"><div class="card-detail">${daily.detail || "Standard formula."}</div></div>
        </div>
      `;
    }
  }
});

// ==================== CALCULATORS ====================
function showCalculator(type) {
  const container = document.getElementById('calc-content');
  const wrapper = document.getElementById('calculator-container');
  if (!container || !wrapper) return;
  wrapper.style.display = 'block';

  const calculators = {
    'ohms': {
      title: "Ohm's Law Calculator (V = IR)",
      inputs: [
        { id: 'ohm-v', label: 'Voltage (V):', placeholder: 'e.g., 12' },
        { id: 'ohm-i', label: 'Current (I):', placeholder: 'e.g., 2' },
        { id: 'ohm-r', label: 'Resistance (R):', placeholder: 'e.g., 6' }
      ],
      calculate: () => {
        const v = parseFloat(document.getElementById('ohm-v').value);
        const i = parseFloat(document.getElementById('ohm-i').value);
        const r = parseFloat(document.getElementById('ohm-r').value);
        let result = '';
        if (!isNaN(v) && !isNaN(i) && !isNaN(r)) {
          if (v === i * r) result = `✅ V = I × R → ${v} = ${i} × ${r}`;
          else if (v === i * r) result = `✅ V = ${i} × ${r} = ${v}V`;
          else result = `V = I × R → ${i} × ${r} = ${i*r}V (expected ${v}V)`;
        } else {
          // Solve for missing
          if (v && i) result = `R = V / I = ${v} / ${i} = ${(v/i).toFixed(2)}Ω`;
          else if (v && r) result = `I = V / R = ${v} / ${r} = ${(v/r).toFixed(2)}A`;
          else if (i && r) result = `V = I × R = ${i} × ${r} = ${(i*r).toFixed(2)}V`;
          else result = 'Enter any two values to calculate the third.';
        }
        return result;
      }
    },
    'pythagorean': {
      title: "Pythagorean Theorem Calculator (a² + b² = c²)",
      inputs: [
        { id: 'py-a', label: 'Side a:', placeholder: 'e.g., 3' },
        { id: 'py-b', label: 'Side b:', placeholder: 'e.g., 4' },
        { id: 'py-c', label: 'Hypotenuse c:', placeholder: 'e.g., 5' }
      ],
      calculate: () => {
        const a = parseFloat(document.getElementById('py-a').value);
        const b = parseFloat(document.getElementById('py-b').value);
        const c = parseFloat(document.getElementById('py-c').value);
        if (a && b && !c) return `c = √(a² + b²) = √(${a}² + ${b}²) = ${Math.sqrt(a*a + b*b).toFixed(2)}`;
        if (a && c && !b) return `b = √(c² - a²) = √(${c}² - ${a}²) = ${Math.sqrt(c*c - a*a).toFixed(2)}`;
        if (b && c && !a) return `a = √(c² - b²) = √(${c}² - ${b}²) = ${Math.sqrt(c*c - b*b).toFixed(2)}`;
        if (a && b && c) {
          const calc = Math.sqrt(a*a + b*b);
          if (Math.abs(calc - c) < 0.01) return `✅ Right triangle: ${a}² + ${b}² = ${c}²`;
          else return `Not a right triangle: ${a}² + ${b}² = ${(a*a+b*b).toFixed(2)}, but c² = ${c*c}`;
        }
        return 'Enter two sides to find the third, or all three to verify.';
      }
    },
    'quadratic': {
      title: "Quadratic Formula Solver (ax² + bx + c = 0)",
      inputs: [
        { id: 'quad-a', label: 'Coefficient a:', placeholder: 'e.g., 1' },
        { id: 'quad-b', label: 'Coefficient b:', placeholder: 'e.g., -3' },
        { id: 'quad-c', label: 'Constant c:', placeholder: 'e.g., 2' }
      ],
      calculate: () => {
        const a = parseFloat(document.getElementById('quad-a').value);
        const b = parseFloat(document.getElementById('quad-b').value);
        const c = parseFloat(document.getElementById('quad-c').value);
        if (isNaN(a) || isNaN(b) || isNaN(c)) return 'Please enter all coefficients.';
        const disc = b*b - 4*a*c;
        if (disc < 0) return `Discriminant = ${disc} → No real roots (complex roots).`;
        const x1 = (-b + Math.sqrt(disc)) / (2*a);
        const x2 = (-b - Math.sqrt(disc)) / (2*a);
        if (disc === 0) return `One repeated root: x = ${x1.toFixed(4)}`;
        return `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`;
      }
    },
    'circle': {
      title: "Circle Area Calculator (A = πr²)",
      inputs: [
        { id: 'circ-r', label: 'Radius r:', placeholder: 'e.g., 5' }
      ],
      calculate: () => {
        const r = parseFloat(document.getElementById('circ-r').value);
        if (isNaN(r)) return 'Please enter the radius.';
        const area = Math.PI * r * r;
        return `A = πr² = π × ${r}² = ${area.toFixed(4)}`;
      }
    }
  };

  const calc = calculators[type];
  if (!calc) return;

  container.innerHTML = `
    <h3 style="color:#F8FAFC; margin-bottom:1rem;">${calc.title}</h3>
    ${calc.inputs.map(inp => `
      <div style="margin-bottom:0.8rem;">
        <label style="display:block; color:#94A3B8; margin-bottom:0.3rem; font-size:0.9rem;">${inp.label}</label>
        <input type="number" id="${inp.id}" placeholder="${inp.placeholder}" style="width:100%; padding:0.7rem; background:rgba(30,41,59,0.8); border:1px solid rgba(59,130,246,0.3); border-radius:8px; color:#F8FAFC; font-size:1rem;">
      </div>
    `).join('')}
    <button onclick="document.getElementById('calc-result').innerHTML = calculators['${type}'].calculate()" style="padding:0.7rem 1.5rem; background:linear-gradient(135deg,#3B82F6,#2563EB); color:#F8FAFC; border:none; border-radius:8px; cursor:pointer; font-weight:600; margin-top:0.5rem;">Calculate</button>
    <div id="calc-result" style="margin-top:1rem; color:#F8FAFC; font-size:1.1rem;"></div>
  `;
}

// Make showCalculator available globally
window.showCalculator = showCalculator;
