
let portfolio = JSON.parse(localStorage.getItem('cv_portfolio') || '[]');


function addHolding() {
  const coinId = document.getElementById('pfCoin').value;
  const amt    = parseFloat(document.getElementById('pfAmt').value);
  const buy    = parseFloat(document.getElementById('pfBuy').value);

 
  if (!coinId || !amt || !buy || amt <= 0 || buy <= 0) {
    alert('Моля попълни всички полета с валидни стойности!');
    return;
  }

  const coin = allCoins.find(c => c.id === coinId);
  if (!coin) {
    alert('Зареди пазарните данни първо!');
    return;
  }

  const existing = portfolio.find(h => h.coinId === coinId);
  if (existing) {
    const newAmt        = existing.amount + amt;
    existing.buyPrice   = (existing.buyPrice * existing.amount + buy * amt) / newAmt;
    existing.amount     = newAmt;
  } else {
    portfolio.push({
      coinId,
      symbol:   coin.symbol.toUpperCase(),
      name:     coin.name,
      image:    coin.image,
      amount:   amt,
      buyPrice: buy
    });
  }

  savePortfolio();
  renderPortfolio();

  document.getElementById('pfAmt').value = '';
  document.getElementById('pfBuy').value = '';
}

/** @param {string} coinId*/

function removeHolding(coinId) {
  portfolio = portfolio.filter(h => h.coinId !== coinId);
  savePortfolio();
  renderPortfolio();
}



function savePortfolio() {
  localStorage.setItem('cv_portfolio', JSON.stringify(portfolio));
}


function renderPortfolio() {
  if (!portfolio.length) {
    document.getElementById('pfWrap').innerHTML =
      '<div class="empty"><div class="ico">💼</div>Добави крипти вдясно, за да следиш портфолиото си</div>';
    document.getElementById('pfTotal').textContent = '$0.00';
    document.getElementById('pfPnl').textContent   = '';
    return;
  }

  let totalValue = 0;
  let totalCost  = 0;

  const rows = portfolio.map(h => {
    const coin       = allCoins.find(x => x.id === h.coinId);
    const currentPrice = coin?.current_price || 0;
    const value      = currentPrice * h.amount;
    const cost       = h.buyPrice   * h.amount;
    const pnl        = value - cost;
    const pnlPct     = cost ? ((value - cost) / cost) * 100 : 0;

    totalValue += value;
    totalCost  += cost;

    return `
      <tr>
        <td>
          <div class="coin-cell">
            <img src="${h.image}" style="width:24px;height:24px;border-radius:50%" alt="">
            <div>
              <div style="font-family:'Syne';font-weight:700;font-size:.85rem">${h.name}</div>
              <div style="color:var(--dim);font-size:.7rem;font-family:'JetBrains Mono'">${h.symbol}</div>
            </div>
          </div>
        </td>
        <td>${h.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}</td>
        <td>${fPrice(currentPrice)}</td>
        <td>${fPrice(h.buyPrice)}</td>
        <td class="${pClass(pnlPct)}">
          ${fPct(pnlPct)}<br>
          <span style="font-size:.73rem">${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}</span>
        </td>
        <td style="font-weight:700">$${value.toFixed(2)}</td>
        <td><button class="btn-rm" onclick="removeHolding('${h.coinId}')">✕</button></td>
      </tr>`;
  }).join('');

  
  const totalPnl    = totalValue - totalCost;
  const totalPnlPct = totalCost ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  document.getElementById('pfTotal').textContent = '$' + totalValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  document.getElementById('pfPnl').innerHTML =
    `<span class="${pClass(totalPnl)}">
      ${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toFixed(2)}
      (${fPct(totalPnlPct)}) от покупните цени
    </span>`;

  document.getElementById('pfWrap').innerHTML = `
    <table class="pf-table">
      <thead>
        <tr>
          <th>Криптовалута</th>
          <th>Количество</th>
          <th>Тек. цена</th>
          <th>Покупна цена</th>
          <th>P&amp;L</th>
          <th>Стойност</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}
