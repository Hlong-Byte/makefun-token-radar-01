// Token Radar's dashboard shell: it reads window.RADAR (written beside dashboard/ by main.ts) and renders
// the header, the coverage facts, the filters and whichever table the reader picked. No network: every
// byte it shows is in data.js.

var DATA = window.RADAR;
var app = document.getElementById('board');
var state = { q: '', category: 'all', tab: 'pre-token', sort: 'implied', dir: -1, selected: null };

function readHash() {
  var hash = window.location.hash.replace(/^#/, '');
  if (!hash) return;
  var params = new URLSearchParams(hash);
  if (params.get('q')) state.q = params.get('q');
  if (params.get('p')) state.selected = params.get('p');
  if (params.get('category')) state.category = params.get('category');
}

function writeHash() {
  var params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.category !== 'all') params.set('category', state.category);
  if (state.selected) params.set('p', state.selected);
  var next = params.toString();
  if (next) window.history.replaceState(null, '', '#' + next);
  else window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

function header() {
  return el('header', { class: 'top' },
    el('div', { class: 'brand' }, el('span', { class: 'mark' }), el('span', { class: 'brand-name', text: 'Token Radar' })),
    el('div', { class: 'top-meta' },
      el('span', { text: 'Snapshot ' + DATA.as_of }),
      el('span', { text: 'DefiLlama protocol index' }),
      el('span', { text: DATA.model_version + ' model' })
    )
  );
}

function lede() {
  return el('section', { class: 'lede' },
    el('div', null,
      el('h1', { text: DATA.watchlist_size + ' watchlist protocols, ranked by implied value' }),
      el('p', { text: 'The watchlist is the floor: every protocol with at least $' + Math.round(DATA.floor_usd / 1e6) + 'M of TVL and no token on record. The early radar adds ' + DATA.early_size + ' pre-token protocols below that floor. Implied value is a model, not a promise.' })
    ),
    el('div', { class: 'facts' },
      el('div', { class: 'fact' }, el('span', { text: 'Watchlist covered' }), el('b', { text: DATA.watchlist_size + ' / ' + DATA.watchlist_size })),
      el('div', { class: 'fact' }, el('span', { text: 'Pre-token rows scored' }), el('b', { text: String(DATA.board_size) })),
      el('div', { class: 'fact' }, el('span', { text: 'Early rows below the floor' }), el('b', { text: String(DATA.early_size) })),
      el('div', { class: 'fact' }, el('span', { text: 'Live-token protocols set aside' }), el('b', { text: String(DATA.live_size) }))
    )
  );
}

function controls() {
  var categories = Array.from(new Set(DATA.rows.map(function (r) { return r.category || 'Other'; }))).sort();
  var search = el('input', { type: 'search', id: 'q', placeholder: 'Search name, category or chain', value: state.q, 'aria-label': 'Search the board' });
  search.addEventListener('input', function () { state.q = search.value; writeHash(); render(); });
  var select = el('select', { id: 'category', 'aria-label': 'Filter by category' },
    el('option', { value: 'all', text: 'All categories' }),
    categories.map(function (c) { return el('option', { value: c, text: c, selected: c === state.category ? 'selected' : null }); })
  );
  select.addEventListener('change', function () { state.category = select.value; writeHash(); render(); });
  var pre = el('button', { type: 'button', 'aria-pressed': state.tab === 'pre-token' ? 'true' : 'false', text: 'Pre-token', onclick: function () { state.tab = 'pre-token'; render(); } });
  var live = el('button', { type: 'button', 'aria-pressed': state.tab === 'live' ? 'true' : 'false', text: 'Live token', onclick: function () { state.tab = 'live'; render(); } });
  return el('div', { class: 'controls' },
    el('div', { class: 'field' }, el('label', { for: 'q', text: 'Search' }), search),
    el('div', { class: 'field' }, el('label', { for: 'category', text: 'Category' }), select),
    el('div', { class: 'field' }, el('span', { class: 'sub', text: 'Token status' }), el('div', { class: 'tabs' }, pre, live)),
    el('span', { class: 'count', text: state.tab === 'pre-token' ? rows().length + ' rows shown' : DATA.live.length + ' live-token protocols' })
  );
}

function render() {
  app.textContent = '';
  var shell = el('div', { class: 'shell' });
  shell.appendChild(header());
  shell.appendChild(lede());
  shell.appendChild(controls());
  shell.appendChild(state.tab === 'pre-token' ? boardTable() : liveTable());
  if (state.tab === 'pre-token') shell.appendChild(modelPanel());
  app.appendChild(shell);
  app.setAttribute('aria-busy', 'false');
  if (!dialog.isConnected) app.appendChild(dialog);
  if (state.selected) openDetail(state.selected);
}

readHash();
render();
window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && dialog.open) dialog.close();
});
