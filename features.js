// ==================== AUTOCOMPLETE ===================
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
  render();
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

// Initialize daily formula display
window.addEventListener('DOMContentLoaded', () => {
  const daily = getDailyFormula();
  if (daily) {
    const dailySection = document.createElement('section');
    dailySection.innerHTML = `
      <h2 class="section-title">📅 Formula of the Day</h2>
      <div class="results">
        <div class="card" onclick="this.classList.toggle('expanded')">
          <div class="card-header">
            <span class="card-title">${daily.name}</span>
            <span class="card-badge">${daily.cat}</span>
          </div>
          <div class="card-formula">${daily.formula}</div>
          <div class="card-expand"><div class="card-detail">${daily.detail || "Standard formula."}</div></div>
        </div>
      </div>
    `;
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.parentNode.insertBefore(dailySection, heroSection.nextSibling);
    }
  }
});
