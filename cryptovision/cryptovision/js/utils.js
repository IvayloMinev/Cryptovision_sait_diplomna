
function fPrice(n) {
  if (n == null) return '—';
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1)    return '$' + n.toFixed(4);
  return '$' + n.toPrecision(4);
}

function fBig(n) {
  if (!n) return '—';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2) + 'M';
  return '$' + n.toFixed(0);
}


function fPct(v) {
  if (v == null) return '—';
  return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
}


function pClass(v) {
  return v >= 0 ? 'pos' : 'neg';
}


function timeAgo(ts) {
  const s = Date.now() / 1000 - ts;
  if (s < 3600)  return Math.floor(s / 60) + ' мин. назад';
  if (s < 86400) return Math.floor(s / 3600) + ' ч. назад';
  return Math.floor(s / 86400) + ' дни назад';
}

/**
 * Рисува малка sparkline линия върху canvas елемент.
 * @param {string} id      - id на canvas елемента
 * @param {number[]} prices - масив с цени
 * @param {boolean} up     - true = зелен, false = червен
 */
function drawSpark(id, prices, up) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const mn = Math.min(...prices);
  const mx = Math.max(...prices);
  const rng = mx - mn || 1;

  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  ctx.strokeStyle = up ? '#00ff88' : '#ff3d71';
  ctx.lineWidth = 1.5;

  prices.forEach((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - mn) / rng) * (H - 4) - 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.stroke();
}
