

let newsLoaded = false; 


async function loadNews() {
  newsLoaded = true;

  try {
    const res  = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest');
    const data = await res.json();
    const articles = (data.Data || []).slice(0, 24); 

    if (!articles.length) {
      document.getElementById('newsWrap').innerHTML =
        '<div class="empty"><div class="ico">📰</div>Няма налични новини в момента.</div>';
      return;
    }

    const cards = articles.map(a => `
      <a href="${a.url}" target="_blank" rel="noopener" class="news-card">
        <img
          class="news-img"
          src="${a.imageurl}"
          alt="${a.title}"
          loading="lazy"
          onerror="this.style.display='none'"
        >
        <div class="news-body">
          <div class="news-src">${a.source_info?.name || a.source || 'Крипто'}</div>
          <div class="news-title">${a.title}</div>
          <div class="news-time">${timeAgo(a.published_on)}</div>
        </div>
      </a>
    `).join('');

    document.getElementById('newsWrap').innerHTML =
      `<div class="news-grid">${cards}</div>`;

  } catch (err) {
    console.error('Грешка при зареждане на новините:', err);
    document.getElementById('newsWrap').innerHTML =
      '<div class="loading">⚠️ Грешка при зареждане на новините.</div>';
  }
}
