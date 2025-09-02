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
  return new Set(Object.keys(state.codeToName).map(k => k.toUpperCase()));
}

/** Try to extract ISO2 code from a node's id/class/data attributes */
function getIsoFromNode(node, isoSet) {
  // id first
  if (node.id) {
    const cand = node.id.trim().toUpperCase();
    if (isoSet.has(cand)) return cand;
    // Some maps prefix/suffix ids, try to extract 2-letter token
    const m = cand.match(/(^|[^A-Z])([A-Z]{2})(?![A-Z])/);
    if (m && isoSet.has(m[2])) return m[2];
  }
  // data-iso2 / data-cc / data-iso
  const d = node.getAttribute && (node.getAttribute('data-iso2') || node.getAttribute('data-cc') || node.getAttribute('data-iso'));
  if (d) {
    const cand = d.trim().toUpperCase();
    if (isoSet.has(cand)) return cand;
  }
  // class names
  const cls = (node.getAttribute && node.getAttribute('class')) || '';
  if (cls) {
    for (const c of cls.split(/\s+/)) {
      const up = c.trim().toUpperCase();
      if (isoSet.has(up)) return up;
      if (/^[A-Z]{2}$/.test(up) && isoSet.has(up)) return up;
    }
  }
  return null;
}

function countryDisplayName(code){
  const fromMap = state.codeToName[code];
  return fromMap || code;
}

// Render details panel
function renderCountry(code){
  const container = el('#details');
  const dishes = state.data[code] || [];

  if(dishes.length === 0){
    container.innerHTML = `
      <div class="placeholder">
        <div class="country-header">
          <div class="country-title">
            <h2>${countryDisplayName(code)}</h2>
          </div>
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
    const gallery = (d.images||[]).map(src=>`<img class="thumb" loading="lazy" src="${src}" alt="${d.name}">`).join('');
    return `
      <article class="card">
        <h3>${d.name}</h3>
        ${d.description ? `<p>${d.description}</p>` : ""}
        ${d.images?.length ? `<div class="grid grid-3" style="margin-top:8px">${gallery}</div>` : ""}
        ${d.tags?.length ? `<div style="margin-top:8px">${tags}</div>` : ""}
      </article>
    `;
  }).join('');

  container.innerHTML = `
    <div class="country-header">
      <div class="country-title">
        <h2>${countryDisplayName(code)}</h2>
      </div>
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
  const blockers = ['ocean','water','graticule','borders','land','landxx','oceanxx'];
  blockers.forEach(id => {
    const n = svg.getElementById(id);
    if (n) n.style.pointerEvents = 'none';
  });

  // Collect potential country nodes: any element with an id/class that maps to ISO2
  const nodesWithId = els('[id]', svg);
  const nodesWithClass = els('[class]', svg);
  const candidates = new Set([...nodesWithId, ...nodesWithClass]);

  const clickable = [];
  const seenKeys = new Set();

  candidates.forEach(node => {
    const iso = getIsoFromNode(node, isoSet);
    if (!iso) return;
    // Prefer grouping elements (<g>) when available to capture all subpaths
    let target = node;
    if (node.tagName.toLowerCase() !== 'g') {
      let p = node.parentElement;
      while (p && p.tagName && p.tagName.toLowerCase() !== 'svg') {
        const pIso = getIsoFromNode(p, isoSet);
        if (pIso === iso){ target = p; break; }
        p = p.parentElement;
      }
    }
    const key = iso + '|' + (target.getAttribute('id') || target.tagName + '|' + target.outerHTML.length);
    if (seenKeys.has(key)) return;
    seenKeys.add(key);

    target.style.cursor = 'pointer';
    els('*', target).forEach(ch => { if (!ch.style.pointerEvents) ch.style.pointerEvents = 'auto'; });
    target.addEventListener('mouseenter', () => target.dataset._oldFill = target.getAttribute('fill'));
    target.addEventListener('click', (ev) => {
      ev.stopPropagation();
      renderCountry(iso);
      target.setAttribute('fill', '#34d399');
      setTimeout(()=>{
        if(target.dataset._oldFill) target.setAttribute('fill', target.dataset._oldFill);
        else target.removeAttribute('fill');
      }, 220);
    });

    // Tint if data exists
    if(state.data[iso]?.length){
      target.setAttribute('data-has-data', 'true');
      if(!target.getAttribute('fill')) target.setAttribute('fill', '#0b3b48');
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
