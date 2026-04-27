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

// ==================== WHICH FORMULA? ====================
const formulaHints = [
  { keywords: ['speed', 'distance', 'time'], formula: 'v = d/t', explanation: 'Speed = Distance ÷ Time' },
  { keywords: ['force', 'mass', 'acceleration'], formula: 'F = ma', explanation: "Newton's Second Law" },
  { keywords: ['voltage', 'current', 'resistance'], formula: 'V = IR', explanation: "Ohm's Law" },
  { keywords: ['area', 'circle'], formula: 'A = πr²', explanation: 'Circle area' },
  { keywords: ['area', 'triangle'], formula: 'A = ½bh', explanation: 'Triangle area' },
  { keywords: ['volume', 'sphere'], formula: 'V = (4/3)πr³', explanation: 'Sphere volume' },
  { keywords: ['pythagorean', 'right', 'triangle'], formula: 'a² + b² = c²', explanation: 'Pythagorean Theorem' },
  { keywords: ['quadratic', 'equation', 'roots'], formula: 'x = (−b ± √(b²−4ac)) / 2a', explanation: 'Quadratic Formula' },
  { keywords: ['energy', 'mass'], formula: 'E = mc²', explanation: "Einstein's Mass-Energy" },
  { keywords: ['kinetic', 'energy'], formula: 'KE = ½mv²', explanation: 'Kinetic Energy' },
  { keywords: ['potential', 'energy', 'height'], formula: 'PE = mgh', explanation: 'Potential Energy' },
  { keywords: ['wave', 'speed', 'frequency'], formula: 'v = fλ', explanation: 'Wave Speed' },
  { keywords: ['ideal', 'gas'], formula: 'PV = nRT', explanation: 'Ideal Gas Law' },
  { keywords: ['derivative', 'power'], formula: "d/dx[xⁿ] = nx^(n−1)", explanation: 'Power Rule' },
  { keywords: ['integral', 'area', 'curve'], formula: 'A = ∫ₐᵇ f(x) dx', explanation: 'Area Under Curve' }
];

function findFormulaByHint(query) {
  const q = query.toLowerCase();
  const matches = formulaHints.filter(h =>
    h.keywords.some(k => q.includes(k))
  );
  if (matches.length) {
    return matches.sort((a,b) => {
      const aMatch = a.keywords.filter(k => q.includes(k)).length;
      const bMatch = b.keywords.filter(k => q.includes(k)).length;
      return bMatch - aMatch;
    })[0];
  }
  return null;
}

// ==================== FORMULA REARRANGER ====================
function rearrangeFormula(formula, solveFor) {
  // Simple rearrangements for common formulas
  const rearrangements = {
    'V = IR': { 'V': 'V = IR', 'I': 'I = V/R', 'R': 'R = V/I' },
    'a² + b² = c²': { 'c': 'c = √(a² + b²)', 'a': 'a = √(c² - b²)', 'b': 'b = √(c² - a²)' },
    'E = mc²': { 'E': 'E = mc²', 'm': 'm = E/c²', 'c': 'c = √(E/m)' },
    'F = ma': { 'F': 'F = ma', 'm': 'm = F/a', 'a': 'a = F/m' },
    'A = πr²': { 'A': 'A = πr²', 'r': 'r = √(A/π)' },
    'V = πr²h': { 'V': 'V = πr²h', 'r': 'r = √(V/(πh))', 'h': 'h = V/(πr²)' },
    'v = d/t': { 'v': 'v = d/t', 'd': 'd = v×t', 't': 't = d/v' },
    'PV = nRT': { 'P': 'P = nRT/V', 'V': 'V = nRT/P', 'n': 'n = PV/(RT)', 'T': 'T = PV/(nR)' },
    'KE = ½mv²': { 'KE': 'KE = ½mv²', 'm': 'm = 2KE/v²', 'v': 'v = √(2KE/m)' },
    'PE = mgh': { 'PE': 'PE = mgh', 'm': 'm = PE/(gh)', 'g': 'g = PE/(mh)', 'h': 'h = PE/(mg)' }
  };
  const rearr = rearrangements[formula];
  if (rearr && rearr[solveFor]) {
    return rearr[solveFor];
  }
  return `Solving for ${solveFor}: Rearrange ${formula} algebraically.`;
}

// ==================== STEP-BY-STEP SOLVER ====================
function solveStepByStep(formula, variable, values) {
  let steps = [];
  const f = formula.trim();

  if (f === 'V = IR') {
    if (variable === 'V') {
      steps = [
        `Given: I = ${values.I}, R = ${values.R}`,
        `Formula: V = I × R`,
        `Substitute: V = ${values.I} × ${values.R}`,
        `Calculate: V = ${(values.I * values.R).toFixed(2)} V`
      ];
    } else if (variable === 'I') {
      steps = [
        `Given: V = ${values.V}, R = ${values.R}`,
        `Formula: I = V / R`,
        `Substitute: I = ${values.V} / ${values.R}`,
        `Calculate: I = ${(values.V / values.R).toFixed(2)} A`
      ];
    } else if (variable === 'R') {
      steps = [
        `Given: V = ${values.V}, I = ${values.I}`,
        `Formula: R = V / I`,
        `Substitute: R = ${values.V} / ${values.I}`,
        `Calculate: R = ${(values.V / values.I).toFixed(2)} Ω`
      ];
    }
  } else if (f === 'a² + b² = c²') {
    if (variable === 'c') {
      steps = [
        `Given: a = ${values.a}, b = ${values.b}`,
        `Formula: c = √(a² + b²)`,
        `Substitute: c = √(${values.a}² + ${values.b}²)`,
        `Calculate: c = √(${(values.a*values.a).toFixed(2)} + ${(values.b*values.b).toFixed(2)})`,
        `Result: c = ${Math.sqrt(values.a*values.a + values.b*values.b).toFixed(2)}`
      ];
    }
  } else {
    steps = [`Step-by-step solver for "${formula}" is coming soon.`, `Try: V=IR, a²+b²=c², E=mc², etc.`];
  }
  return steps;
}

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
        if (!isNaN(v) && !isNaN(i) && !isNaN(r)) {
          if (Math.abs(v - i*r) < 0.01) return `✅ V = I × R → ${v} = ${i} × ${r}`;
        }
        if (v && i) return `R = V / I = ${v} / ${i} = ${(v/i).toFixed(2)}Ω`;
        if (v && r) return `I = V / R = ${v} / ${r} = ${(v/r).toFixed(2)}A`;
        if (i && r) return `V = I × R = ${i} × ${r} = ${(i*r).toFixed(2)}V`;
        return 'Enter any two values to calculate the third.';
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
          return `Not a right triangle: ${a}² + ${b}² = ${(a*a+b*b).toFixed(2)}, but c² = ${c*c}`;
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
    },
    'which-formula': {
      title: "Which Formula Do I Use? 🤖",
      inputs: [
        { id: 'hint-query', label: 'Describe your problem:', placeholder: 'e.g., speed distance time, force mass acceleration' }
      ],
      calculate: () => {
        const query = document.getElementById('hint-query').value;
        if (!query.trim()) return 'Please describe what you need.';
        const result = findFormulaByHint(query);
        if (result) {
          return `🎯 <strong>Recommended Formula:</strong> ${result.formula}<br><br>
                  📝 <strong>Explanation:</strong> ${result.explanation}<br><br>
                  💡 <strong>Try searching:</strong> "${result.formula}"`;
        }
        return `🔍 No specific formula found. Try searching for: "pythagorean", "ohm", "quadratic", "energy", etc.`;
      }
    },
    'rearrange': {
      title: "Formula Rearranger 🔄",
      inputs: [
        { id: 'rearr-formula', label: 'Formula:', placeholder: 'e.g., V = IR, E = mc², a² + b² = c²' },
        { id: 'rearr-solve', label: 'Solve for:', placeholder: 'e.g., V, m, c' }
      ],
      calculate: () => {
        const formula = document.getElementById('rearr-formula').value;
        const solveFor = document.getElementById('rearr-solve').value;
        if (!formula || !solveFor) return 'Please enter both formula and variable to solve for.';
        return `🔄 <strong>Rearranged:</strong> ${rearrangeFormula(formula, solveFor)}`;
      }
    },
    'step-solver': {
      title: "Step-by-Step Solver 📝",
      inputs: [
        { id: 'step-formula', label: 'Formula:', placeholder: 'e.g., V = IR' },
        { id: 'step-variable', label: 'Solve for:', placeholder: 'e.g., V' },
        { id: 'step-v1-name', label: 'Known variable 1 name:', placeholder: 'e.g., I' },
        { id: 'step-v1-val', label: 'Known variable 1 value:', placeholder: 'e.g., 2' },
        { id: 'step-v2-name', label: 'Known variable 2 name:', placeholder: 'e.g., R' },
        { id: 'step-v2-val', label: 'Known variable 2 value:', placeholder: 'e.g., 6' }
      ],
      calculate: () => {
        const formula = document.getElementById('step-formula').value;
        const variable = document.getElementById('step-variable').value;
        const values = {};
        const v1Name = document.getElementById('step-v1-name').value;
        const v1Val = parseFloat(document.getElementById('step-v1-val').value);
        const v2Name = document.getElementById('step-v2-name').value;
        const v2Val = parseFloat(document.getElementById('step-v2-val').value);
        if (v1Name) values[v1Name] = v1Val;
        if (v2Name) values[v2Name] = v2Val;
        const steps = solveStepByStep(formula, variable, values);
        return steps.map((s, i) => `${i+1}. ${s}`).join('<br>');
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
        <input type="text" id="${inp.id}" placeholder="${inp.placeholder}" style="width:100%; padding:0.7rem; background:rgba(30,41,59,0.8); border:1px solid rgba(59,130,246,0.3); border-radius:8px; color:#F8FAFC; font-size:1rem;">
      </div>
    `).join('')}
    <button onclick="document.getElementById('calc-result').innerHTML = calculators['${type}'].calculate()" style="padding:0.7rem 1.5rem; background:linear-gradient(135deg,#3B82F6,#2563EB); color:#F8FAFC; border:none; border-radius:8px; cursor:pointer; font-weight:600; margin-top:0.5rem;">Calculate</button>
    <div id="calc-result" style="margin-top:1rem; color:#F8FAFC; font-size:1.1rem;"></div>
  `;
}

// Make showCalculator available globally
window.showCalculator = showCalculator;
