/* ═══════════════════════════════════════
   charts.js — Графики на цени
   ═══════════════════════════════════════ */

let chartInst = null;  // текущият Chart.js инстанс
let chartTF   = '7';   // текущият времеви период (дни)

/**
 * Превключва към секцията с графики и зарежда избраната монета.
 * Извиква се от бутона "График" в таблицата.
 * @param {string} coinId - id на монетата (напр. "bitcoin")
 */
function gotoChart(coinId) {
  // Активирай навигацията към "Графики"
  document.querySelectorAll('#mainNav button').forEach((b, i) => {
    b.classList.toggle('active', i === 1);
  });
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-charts').classList.add('active');

  // Задай монетата и зареди графиката
  document.getElementById('coinSel').value = coinId;
  loadChart();
}

/**
 * Сменя времевия период и презарежда графиката.
 * @param {HTMLElement} btn  - натиснатият бутон
 * @param {string}      days - брой дни ('1','7','30','90','365')
 */
function setTF(btn, days) {
  document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  chartTF = days;
  loadChart();
}

/**
 * Зарежда историческите цени от CoinGecko и рисува графиката.
 */
async function loadChart() {
  const id = document.getElementById('coinSel').value;
  if (!id) return;

  try {
    const res  = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${chartTF}`
    );
    const data = await res.json();
    const pts  = data.prices; // масив от [timestamp, price]

    // Изгради етикети за оста X
    const labels = pts.map(p => {
      const d = new Date(p[0]);
      return chartTF === '1'
        ? d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
    });

    const vals  = pts.map(p => p[1]);
    const up    = vals[vals.length - 1] >= vals[0];
    const color = up ? '#00ff88' : '#ff3d71';

    // Унищожи стария chart преди да създадеш нов
    if (chartInst) chartInst.destroy();

    const ctx  = document.getElementById('priceChart').getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, color + '30');
    grad.addColorStop(1, color + '00');

    chartInst = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: vals,
          borderColor: color,
          backgroundColor: grad,
          borderWidth: 2,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#0c1118',
            borderColor: '#1a2840',
            borderWidth: 1,
            titleColor: '#4a6080',
            bodyColor: '#e2e8f0',
            callbacks: {
              label: ctx => fPrice(ctx.raw)
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,.03)' },
            ticks: {
              color: '#4a6080',
              font: { family: 'JetBrains Mono', size: 11 },
              maxTicksLimit: 8
            }
          },
          y: {
            position: 'right',
            grid: { color: 'rgba(255,255,255,.03)' },
            ticks: {
              color: '#4a6080',
              font: { family: 'JetBrains Mono', size: 11 },
              callback: v => fPrice(v)
            }
          }
        },
        interaction: { mode: 'index', intersect: false }
      }
    });

    // Обнови статистиките под графиката
    const cur  = vals[vals.length - 1];
    const chg  = ((cur - vals[0]) / vals[0]) * 100;
    const high = Math.max(...vals);
    const low  = Math.min(...vals);

    document.getElementById('csPrice').textContent = fPrice(cur);
    document.getElementById('csPrice').className   = 'val ' + pClass(chg);
    document.getElementById('csChg').textContent   = fPct(chg);
    document.getElementById('csChg').className     = 'val ' + pClass(chg);
    document.getElementById('csHigh').textContent  = fPrice(high);
    document.getElementById('csLow').textContent   = fPrice(low);

  } catch (err) {
    console.error('Грешка при зареждане на графика:', err);
  }
}
