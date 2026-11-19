import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sourceMap from 'source-map-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixtureDir = path.resolve(__dirname, '..');
const distDir = path.resolve(fixtureDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const originalAppJs = fs.readFileSync(path.join(fixtureDir, 'app.js'), 'utf8');

// Minified 1-line version of app.js
const minifiedLines = [
  'let taskCount=0;',
  'function handleSlowButtonClick(e){const t=performance.now(),n=document.getElementById("counter"),o=document.getElementById("slow-click-btn");let c=0;for(let r=0;r<14e6;r++)c+=Math.sqrt(r)*Math.sin(r);let a=0;for(let r=0;r<100;r++){o.style.width=180+r%30+"px",a+=o.offsetHeight,o.style.paddingLeft=10+r%12+"px",a+=o.getBoundingClientRect().width}taskCount++,n.textContent=`Tasks completed: ${taskCount} (calc: ${c.toFixed(1)}, forcedLayoutSum: ${a.toFixed(0)})`}',
  'function handleSearchInput(e){const t=e.target.value,n=document.getElementById("search-results"),o=Array.from({length:5e3},((e,n)=>`Result item #${n} matching "${t}"`)).filter((e=>e.includes(t))).slice(0,5);n.textContent=o.join(", ")}',
  'function handleMenuToggle(e){document.getElementById("nav-menu").classList.toggle("open")}',
  'function injectLateBanner(){setTimeout((()=>{const e=document.getElementById("dynamic-banner-slot");if(e&&!e.hasChildNodes()){const t=document.createElement("div");t.className="injected-banner",t.textContent="⚡ Breaking Announcement: Late injected content causing layout shift!",e.appendChild(t)}}),1500)}',
  'document.addEventListener("DOMContentLoaded",(()=>{const e=document.getElementById("slow-click-btn");e&&e.addEventListener("click",handleSlowButtonClick);const t=document.getElementById("search-input");t&&t.addEventListener("input",handleSearchInput);const n=document.getElementById("menu-toggle");n&&n.addEventListener("click",handleMenuToggle);injectLateBanner()}));'
];
const minifiedCode = minifiedLines.join('');

// Generate precise source map mapping minified locations to app.js
const map = new sourceMap.SourceMapGenerator({ file: 'bundle.external.js' });
map.setSourceContent('app.js', originalAppJs);

// Map start of bundle
map.addMapping({
  generated: { line: 1, column: 0 },
  original: { line: 1, column: 0 },
  source: 'app.js'
});

// Map handleSlowButtonClick (both keyword and identifier) -> line 10 in app.js
const slowFnStart = minifiedCode.indexOf('function handleSlowButtonClick');
map.addMapping({
  generated: { line: 1, column: slowFnStart },
  original: { line: 10, column: 0 },
  source: 'app.js',
  name: 'handleSlowButtonClick'
});
const slowBtnCol = minifiedCode.indexOf('handleSlowButtonClick');
map.addMapping({
  generated: { line: 1, column: slowBtnCol },
  original: { line: 10, column: 0 },
  source: 'app.js',
  name: 'handleSlowButtonClick'
});

// Map handleSearchInput -> line 40 in app.js
const searchCol = minifiedCode.indexOf('handleSearchInput');
map.addMapping({
  generated: { line: 1, column: searchCol },
  original: { line: 40, column: 0 },
  source: 'app.js',
  name: 'handleSearchInput'
});

// Map handleMenuToggle -> line 54 in app.js
const menuCol = minifiedCode.indexOf('handleMenuToggle');
map.addMapping({
  generated: { line: 1, column: menuCol },
  original: { line: 54, column: 0 },
  source: 'app.js',
  name: 'handleMenuToggle'
});

const mapJson = map.toString();

// 1. External map bundle
const externalJs = `${minifiedCode}\n//# sourceMappingURL=bundle.external.js.map`;
fs.writeFileSync(path.join(distDir, 'bundle.external.js'), externalJs, 'utf8');
fs.writeFileSync(path.join(distDir, 'bundle.external.js.map'), mapJson, 'utf8');

// 2. Inline base64 map bundle
const base64Map = Buffer.from(mapJson).toString('base64');
const inlineJs = `${minifiedCode}\n//# sourceMappingURL=data:application/json;base64,${base64Map}`;
fs.writeFileSync(path.join(distDir, 'bundle.inline.js'), inlineJs, 'utf8');

// 3. No map bundle (for function-name matching fallback test)
fs.writeFileSync(path.join(distDir, 'bundle.nomap.js'), minifiedCode, 'utf8');

console.log('Bundled test fixtures built successfully:');
console.log(' - dist/bundle.external.js + dist/bundle.external.js.map');
console.log(' - dist/bundle.inline.js (inline base64 map)');
console.log(' - dist/bundle.nomap.js (no source map)');
