
let allCoins = [];


async function loadMarket() {
  try {
    const [coinsRes, globalRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h'),
      fetch('https://api.coingecko.com/api/v3/global')
    ]);

    allCoins      = await coinsRes.json();
    const gData   = (await globalRes.json()).data;

    
    document.getElementById('sMktCap').textContent = fBig(gData.total_market_cap.usd);
    document.getElementById('sVol').textContent    = fBig(gData.total_volume.usd);
    document.getElementById('sBtcDom').textContent = gData.market_cap_percentage.btc.toFixed(1) + '%';
    document.getElementById('sActive').textContent = gData.active_cryptocurrencies.toLocaleString();

    
    const btc = allCoins.find(c => c.id === 'bitcoin');
    if (btc) {
      document.getElementById('hBtc').textContent = fPrice(btc.current_price);
    }

    renderMarket(allCoins);
    buildTicker(allCoins);
    fillSelectors(allCoins);
    renderPortfolio(); 

  } catch (err) {
    console.error('Грешка при зареждане на пазара:', err);
    document.getElementById('marketWrap').innerHTML =
      '<div class="loading">⚠️ Грешка при зареждане. Провери интернет връзката.</div>';
  }
}

/**
 * Рендерира таблицата с монети.
 * @param {Array} coins - масив с монети за показване
 */
function renderMarket(coins) {
  if (!coins.length) {
    document.getElementById('marketWrap').innerHTML =
      '<div class="empty"><div class="ico">🔍</div>Няма резултати</div>';
    return;
  }

  const rows = coins.map(c => `
    <tr>
      <td class="rank-num">${c.market_cap_rank}</td>
      <td>
        <div class="coin-cell">
          <img src="${c.image}" alt="${c.name}" loading="lazy">
          <div>
            <div class="coin-name">${c.name}</div>
            <div class="coin-sym">${c.symbol.toUpperCase()}</div>
          </div>
        </div>
      </td>
      <td class="tr">${fPrice(c.current_price)}</td>
      <td class="tr ${pClass(c.price_change_percentage_24h)}">${fPct(c.price_change_percentage_24h)}</td>
      <td class="tr hide">${fBig(c.market_cap)}</td>
      <td class="tr hide">${fBig(c.total_volume)}</td>
      <td class="tr">
        <canvas id="sp-${c.id}" width="80" height="30"></canvas>
      </td>
      <td>
        <button class="chart-btn-sm" onclick="gotoChart('${c.id}')">График</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('marketWrap').innerHTML = `
    <table class="crypto-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Криптовалута</th>
          <th class="tr">Цена</th>
          <th class="tr">24ч. %</th>
          <th class="tr hide">Пазарна кап.</th>
          <th class="tr hide">Обем</th>
          <th class="tr">7Д</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  
  coins.forEach(c => {
    if (c.sparkline_in_7d?.price) {
      drawSpark('sp-' + c.id, c.sparkline_in_7d.price, (c.price_change_percentage_24h || 0) >= 0);
    }
  });
}


function filterCoins() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = q
    ? allCoins.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    : allCoins;
  renderMarket(filtered);
}

/**
 * Изгражда движещата се лента с цени (ticker).
 * @param {Array} coins
 */
function buildTicker(coins) {
  const items = coins.slice(0, 20).map(c => {
    const ch = c.price_change_percentage_24h || 0;
    return `
      <span class="ticker-item">
        <span class="sym">${c.symbol.toUpperCase()}</span>
        <span>${fPrice(c.current_price)}</span>
        <span class="${pClass(ch)}">${fPct(ch)}</span>
      </span>`;
  }).join('');

  
  document.getElementById('tickerTrack').innerHTML = items + items;
}

/**
 * Попълва dropdown менютата в секциите Графики и Портфолио.
 * @param {Array} coins
 */
function fillSelectors(coins) {
  const opts = coins.map(c =>
    `<option value="${c.id}">${c.name} (${c.symbol.toUpperCase()})</option>`
  ).join('');

  document.getElementById('coinSel').innerHTML =
    '<option value="">— Избери криптовалута —</option>' + opts;

  document.getElementById('pfCoin').innerHTML =
    '<option value="">— Избери —</option>' + opts;
}
