// The live-token view: the protocols that already trade, with the market's own figures.
//
// They are set aside rather than ranked, because a market cap is a fact and the board's value is a model:
// mixing the two would make the ranking look more certain than it is.

function liveTable() {
  var tbody = el('tbody');
  DATA.live.forEach(function (r) {
    var chains = r.chains && r.chains.length ? r.chains.slice(0, 2).join(', ') : 'an unnamed chain';
    tbody.appendChild(el('tr', null,
      el('td', { class: 'num', text: 'live' }),
      el('td', null, el('div', { class: 'name' },
        el('b', { text: r.name }),
        el('span', { class: 'sub', text: (r.category || 'Other') + ' on ' + chains })
      )),
      el('td', { class: 'num', text: fmtUsd(r.tvl_usd) }),
      el('td', { class: 'num ' + (r.change_7d !== null && r.change_7d >= 0 ? 'pos' : 'neg'), text: fmtPct(r.change_7d) }),
      el('td', { class: 'num', text: fmtUsd(r.mcap_usd) }),
      el('td', null, el('span', { class: 'status', text: 'already trades' }))
    ));
  });
  return el('div', { class: 'panel' },
    el('div', { class: 'table-wrap' },
      el('table', null,
        el('caption', { class: 'sub', text: 'Token live: these protocols already trade, so their market cap is a fact, not a model. They are set aside from the pre-token ranking.' }),
        el('thead', null, el('tr', null,
          el('th', { scope: 'col', text: 'Status' }),
          el('th', { scope: 'col', text: 'Protocol' }),
          el('th', { scope: 'col', text: 'TVL' }),
          el('th', { scope: 'col', text: '7d' }),
          el('th', { scope: 'col', text: 'Market cap' }),
          el('th', { scope: 'col', text: 'Token' })
        )),
        tbody
      )
    )
  );
}
