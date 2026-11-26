// The small formatters and the element builder every other dashboard file uses.
//
// Values stay in the shape the snapshot gives them: these functions only decide how many digits a reader
// sees, and the element builder keeps every value out of innerHTML so a protocol name cannot inject markup.

var USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function fmtUsd(n) {
  if (n === null || n === undefined || !isFinite(n)) return 'n/a';
  if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return USD.format(n);
}

function fmtPct(n) {
  if (n === null || n === undefined || !isFinite(n)) return 'n/a';
  return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
}

function fmtAge(days) {
  if (days === null || days === undefined) return 'unknown';
  if (days >= 365) return (days / 365).toFixed(1) + 'y';
  return Math.max(0, Math.round(days)) + 'd';
}

function el(tag, attrs) {
  var node = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
    });
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (!child) continue;
    if (Array.isArray(child)) child.forEach(function (c) { if (c) node.appendChild(c); });
    else if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else node.appendChild(child);
  }
  return node;
}
