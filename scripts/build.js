const fs = require('node:fs');
const path = require('node:path');

// Stamp the artifact at build time, never from the visitor's clock.
const date = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date()).replaceAll('-', '.');
const file = path.join(__dirname, '..', 'public', 'admin.html');
const html = fs.readFileSync(file, 'utf8');
const marker = /(<footer class="build-version" aria-label="Byggversjon">)v\d{4}\.\d{2}\.\d{2}(<\/footer>)/;
if (!marker.test(html)) throw new Error('Missing admin build-version marker');
fs.writeFileSync(file, html.replace(marker, (_, open, close) => open + 'v' + date + close));
console.log('Admin build version: v' + date);
