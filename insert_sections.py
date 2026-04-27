#!/usr/bin/env python3
import re

html_path = "index.html"
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Sections to insert between Hero and Why
insert_after = '<!-- Hero Section -->\n  <section class="hero">\n    <h1>⚡ JARVIS FORMULA LIBRARY</h1>\n    <p class="hero-sub">Learn Math Laws Faster</p>\n    <p class="hero-text">Search formulas, solve problems, understand concepts instantly.</p>\n    <div class="hero-buttons">\n      <a href="#search-section" class="cta-button">Search Formula</a>\n      <a href="#calculator-section" class="cta-button cta-secondary">Solve Problem</a>\n    </div>\n  </section>'

new_sections = '''
  <!-- Daily Formula -->
  <section id="daily-section">
    <h2 class="section-title">📅 Formula of the Day</h2>
    <div class="results" id="daily-result"></div>
  </section>

  <!-- Calculator Section -->
  <section id="calculator-section">
    <h2 class="section-title">🧮 Formula Calculators</h2>
    <div class="popular-grid">
      <div class="popular-card" onclick="showCalculator('ohms')">
        <div class="icon">⚡</div>
        <div class="name">Ohm's Law Calculator</div>
      </div>
      <div class="popular-card" onclick="showCalculator('pythagorean')">
        <div class="icon">📐</div>
        <div class="name">Pythagorean Calculator</div>
      </div>
      <div class="popular-card" onclick="showCalculator('quadratic')">
        <div class="icon">📈</div>
        <div class="name">Quadratic Solver</div>
      </div>
      <div class="popular-card" onclick="showCalculator('circle')">
        <div class="icon">⭕</div>
        <div class="name">Circle Area Calculator</div>
      </div>
    </div>
    <div id="calculator-container" style="display:none; margin-top:2rem; background:rgba(30,41,59,0.8); border-radius:14px; padding:2rem;">
      <div id="calc-content"></div>
      <button onclick="document.getElementById('calculator-container').style.display='none'" style="margin-top:1rem; padding:0.8rem 1.5rem; background:#3B82F6; color:#F8FAFC; border:none; border-radius:8px; cursor:pointer;">Close Calculator</button>
    </div>
  </section>
'''

if insert_after in content:
    pos = content.find(insert_after) + len(insert_after)
    content = content[:pos] + new_sections + content[pos:]
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Sections inserted successfully.")
else:
    print("Could not find insertion point.")
