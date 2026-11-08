# Catalog Check Core

Small, dependency-free JavaScript utilities for auditing product CSV files. English / Türkçe diagnostics. Preview 0.1; developed with AI assistance.

## Quick start

Requires a modern Node.js runtime. No npm install, account or API key needed.

```js
const fs = require('node:fs');
const core = require('./core.js');
const rows = core.parse(fs.readFileSync('example.csv', 'utf8'), ',');
const result = core.analyze(rows, {sku: 0, name: 1, price: 2, decimal: '.'});
console.log(result);
```

Run tests: `node --test core.test.cjs`

## API

- `parse(text, delimiter)`: comma, semicolon or tab; quoted fields, multiline values and UTF-8 BOM. Returns arrays of strings, preserving leading zeros. Malformed quoting throws.
- `analyze(rows, {sku, name, price, decimal})`: zero-based, distinct column indexes; decimal is `.` or `,`. Returns `{records, flagged, issues}`.
- `serialize(rows, delimiter, safe = false)`: quoted CSV output. With `safe` enabled, prefixes formula-like strings with an apostrophe; this changes cell values.
- `validPrice(value, decimal)`: non-negative plain decimal price check.

Findings include duplicate/missing SKUs, missing names, invalid prices, surrounding whitespace, mismatched column counts and some spreadsheet formula prefixes. Record numbers include the header.

## Limits

Not a marketplace-certified validator. No XLSX, store synchronization, thousands separators, currency conversion or automatic repair. Duplicate variant codes need human review. Formula detection is not a comprehensive security filter. Callers must validate configuration and limit input sizes. Review results against a backup before importing data.

The core makes no network requests and stores no data. External spreadsheets may reinterpret leading-zero IDs. Never post customer catalogs, private data or credentials in public issues; use small synthetic examples.

## Türkçe

Ürün CSV dosyalarında yinelenen kod, boş ad, geçersiz fiyat ve sütun sayısı sorunlarını kontrol eden ücretsiz JavaScript çekirdeği. Kurulum veya ücretli API gerekmez. Yukarıdaki örneği Node.js ile çalıştırın. Üretim verisinde kullanmadan önce bir kopya üzerinde deneyin. Hata bildirirken gerçek müşteri verisi yerine küçük, uydurma bir örnek paylaşın.

## Project and support

This repository contains the reusable code library, sample data and tests. The optional [offline browser package](https://halilwave5.gumroad.com/l/cgbza) includes a graphical interface and bilingual guide. Buying the package is not required to use this library.

GitHub Sponsors application is pending; no sponsorship availability or benefits are promised. Bug reports and reproducible examples are welcome. No guaranteed response time or custom development is included.

## License status
No open-source license has been selected yet. Public visibility alone does not grant general redistribution or commercial reuse rights. An explicit license will be added after the owner chooses it.
