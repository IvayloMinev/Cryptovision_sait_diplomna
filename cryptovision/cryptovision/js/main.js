/* ═══════════════════════════════════════
   main.js — Инициализация и навигация
   ═══════════════════════════════════════ */

/**
 * Превключва между секциите на сайта.
 * @param {HTMLElement} btn  - натиснатият nav бутон
 * @param {string}      name - id на секцията ('market','charts','news','portfolio')
 */
function nav(btn, name) {
  // Скрий всички секции
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));

  // Деактивирай всички бутони
  document.querySelectorAll('#mainNav button').forEach(b => b.classList.remove('active'));

  // Покажи избраната секция и маркирай бутона
  document.getElementById('sec-' + name).classList.add('active');
  btn.classList.add('active');

  // Специфична логика при навигация
  if (name === 'charts' && allCoins.length && !document.getElementById('coinSel').value) {
    // Автоматично зареди Bitcoin при първо отваряне
    document.getElementById('coinSel').value = 'bitcoin';
    loadChart();
  }

  if (name === 'portfolio') {
    renderPortfolio();
  }

  if (name === 'news' && !newsLoaded) {
    loadNews();
  }
}

/* ── СТАРТ ── */
document.addEventListener('DOMContentLoaded', () => {
  loadMarket();       // зареди пазарните данни веднага
  loadNews();         // зареди новините във фонов режим

  // Автоматично опресняване на всеки 60 секунди
  setInterval(loadMarket, 60_000);
});
