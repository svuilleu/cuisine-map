// Simple app – no framework
const state = {
  data: {},
  codeToName: {}, // mapping ISO2 -> label (from countries.json or SVG titles)
};

const el = (sel, root=document) => root.querySelector(sel);
const els = (sel, root=document) => [...root.querySelectorAll(sel)];

async function loadJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Impossible de charger ${url}`);
  return await res.json();
}

async function injectSVG(url, mount){
  const text = await (await fetch(url)).text();
  mount.innerHTML = text;
  const svg = mount.querySelector('svg');
  if(svg){ svg.setAttribute('preserveAspectRatio','xMidYMid meet'); svg.style.width='100%'; svg.style.height='100%'; }
  return svg;
}

function buildIsoSet() {
  const iso = new Set(Object.keys(state.codeToName).map(k => k.toUpperCase()));
  // fallback minimal set in case countries.json failed for some reason
  ['FR','JP','BR','US','GB','DE','IT','ES','CN','IN','CA','AU','AR','MX','EG'].forEach(c=>iso.add(c));
  return iso;
}

/** Extract ISO2 code from id/class/data attributes, with permissive fallback */
function getIsoFromNode(node, isoSet) {
  const tryCode = (val) => {
    if(!val) return null;
    const cand = val.trim();
    if (/^[A-Za-z]{2}$/.test(cand)) return cand.toUpperCase();
    const m = cand.toUpperCase().match(/(^|[^A-Z])([A-Z]{2})(?![A-Z])/);
    return m ? m[2] : null;
  };

  // 1) direct id
  let code = tryCode(node.id);
  if (code && (isoSet.has(code))) return code;

  // 2) data-* commonly used
  for(const k of ['data-id','data-iso2','data-cc','data-iso','data-code']){
    code = tryCode(node.getAttribute?.(k));
    if (code && (isoSet.has(code) || /^[A-Z]{2}$/.test(code))) return code;
  }

  // 3) classes
  const cls = node.getAttribute?.('class') || '';
  for (const c of cls.split(/\s+/)) {
    code = tryCode(c);
    if (code && (isoSet.has(code) || /^[A-Z]{2}$/.test(code))) return code;
  }

  return null;
}

function countryDisplayName(code){
  const fromMap = state.codeToName[code];
  return fromMap || code;
}

// normalize image URL: allow bare filename, relative 'images/..', absolute, or http(s)
function normalizeImage(src){
  if (!src) return null;
  const s = String(src).trim();
  if (/^(https?:)?\/\//i.test(s)) return s;             // http(s)
  if (/^data:/i.test(s)) return s;                         // data URI
  if (s.startsWith('/images/') || s.startsWith('images/')) return s.replace(/^\/+/,''); // keep as is
  if (s.startsWith('/')) return s;                         // other absolute
  return 'images/' + s;                                    // bare filename -> images/<name>
}

// Render details panel
function renderCountry(code){
  const container = el('#details');
  const dishes = state.data[code] || [];

  if(dishes.length === 0){
    container.innerHTML = `
      <div class="placeholder">
        <div class="country-header">
          <div class="country-title"><h2>${countryDisplayName(code)}</h2></div>
          <button class="reset" id="btn-reset">Réinitialiser</button>
        </div>
        <p>Aucun plat enregistré pour ce pays pour l’instant.</p>
        <p>Ajoute-les dans <code>data/dishes.json</code> (clé <strong>"${code}"</strong>).</p>
      </div>
    `;
    el('#btn-reset')?.addEventListener('click', resetDetails);
    return;
  }

  const cards = dishes.map((d)=>{
    const tags = (d.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(' ');
    const gallery = (d.images||[]).map(s=>{
      const url = normalizeImage(s);
      return url ? `<img class="thumb" loading="lazy" src="${url}" alt="${d.name}">` : '';
    }).join('');
    return `
      <article class="card">
        <h3>${d.name}</h3>
        ${d.description ? `<p>${d.description}</p>` : ""}
        ${gallery ? `<div class="grid grid-3" style="margin-top:8px">${gallery}</div>` : ""}
        ${d.tags?.length ? `<div style="margin-top:8px">${tags}</div>` : ""}
      </article>
    `;
  }).join('');

  container.innerHTML = `
    <div class="country-header">
      <div class="country-title"><h2>${countryDisplayName(code)}</h2></div>
      <button class="reset" id="btn-reset">Réinitialiser</button>
    </div>
    <div style="margin-top:8px">${cards}</div>
  `;
  el('#btn-reset')?.addEventListener('click', resetDetails);
}

function resetDetails(){
  const container = el('#details');
  container.innerHTML = `
    <div class="placeholder">
      <h2>Bienvenue 👋</h2>
      <p>Sélectionne un pays sur la carte pour afficher ses plats.</p>
      <p class="hint">Tu peux éditer <code>data/dishes.json</code> et ajouter tes images dans <code>/images</code>.</p>
    </div>
  `;
}

function wireCountryClicks(svg){
  const isoSet = buildIsoSet();

  // Disable pointer events on obvious non-country layers that may block clicks
  ['ocean','water','graticule','borders','land','landxx','oceanxx'].forEach(id => {
    const n = svg.getElementById(id);
    if (n) n.style.pointerEvents = 'none';
  });

  // Candidate nodes: anything with id, class or data-* that could carry the code
  const candidates = new Set([
    ...els('[id]', svg),
    ...els('[class]', svg),
    ...els('[data-id]', svg),
    ...els('[data-iso2]', svg),
    ...els('[data-cc]', svg),
    ...els('[data-iso]', svg),
    ...els('[data-code]', svg)
  ]);

  const seen = new Set();

  candidates.forEach(node => {
    const iso = getIsoFromNode(node, isoSet);
    if (!iso || !/^[A-Z]{2}$/.test(iso)) return;

    // Climb to a grouping <g> to make the whole country clickable
    let target = node;
    if (node.tagName && node.tagName.toLowerCase() !== 'g') {
      let p = node.parentElement;
      while (p && p.tagName && p.tagName.toLowerCase() !== 'svg') {
        const pIso = getIsoFromNode(p, isoSet);
        if (pIso === iso){ target = p; break; }
        p = p.parentElement;
      }
    }

    const key = iso + '|' + (target.getAttribute('id') || target.tagName + '|' + target.outerHTML.length);
    if (seen.has(key)) return;
    seen.add(key);

    target.style.cursor = 'pointer';
    // ensure children receive pointer events
    els('*', target).forEach(ch => { if (!ch.style.pointerEvents) ch.style.pointerEvents = 'auto'; });

    target.addEventListener('click', (ev) => {
      ev.stopPropagation();
      renderCountry(iso);
      // simple outline flash without changing fill
      const prevStroke = target.getAttribute('stroke');
      const prevStrokeW = target.getAttribute('stroke-width');
      target.setAttribute('stroke', '#34d399');
      target.setAttribute('stroke-width', '2');
      setTimeout(()=>{
        if(prevStroke !== null) target.setAttribute('stroke', prevStroke); else target.removeAttribute('stroke');
        if(prevStrokeW !== null) target.setAttribute('stroke-width', prevStrokeW); else target.removeAttribute('stroke-width');
      }, 220);
    });

    // Mark countries that have data (CSS outlines them)
    if(state.data[iso]?.length){
      target.setAttribute('data-has-data', 'true');
    }
  });
}

async function main(){
  try{
    const [data, names] = await Promise.all([
      loadJSON('data/dishes.json'),
      loadJSON('data/countries.json')
    ]);
    state.data = data;
    state.codeToName = { ...state.codeToName, ...names };

    const svg = await injectSVG('public/world-simple.svg', el('#map-container'));
    el('#map-loading')?.remove();
    if(svg) wireCountryClicks(svg);
  }catch(err){
    console.error(err);
    const ml = el('#map-loading');
    if(ml) ml.textContent = "Erreur de chargement. Vérifie les fichiers.";
  }
}

main();
