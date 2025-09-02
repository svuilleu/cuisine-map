// Simple app – no framework
const state = {
  data: {},
  codeToName: {}, // optional mapping (filled from SVG titles when available)
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
  svg?.setAttribute('focusable','false'); // a11y
  return svg;
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
  // Use any path (or element) with an id that looks like an ISO2 code (A–Z)
  const clickable = els('[id]', svg).filter(n => /^[A-Z]{2}$/.test(n.id));

  // Fill mapping from <title> of each path/group if present
  clickable.forEach(node => {
    const title = node.querySelector('title')?.textContent?.trim();
    if(title) state.codeToName[node.id] = title;
  });

  clickable.forEach(node => {
    node.style.cursor = 'pointer';
    node.addEventListener('mouseenter', () => node.dataset._oldFill = node.getAttribute('fill'));
    node.addEventListener('click', () => {
      renderCountry(node.id);
      // flash selection feedback
      node.setAttribute('fill', '#34d399');
      setTimeout(()=>{
        if(node.dataset._oldFill) node.setAttribute('fill', node.dataset._oldFill);
        else node.removeAttribute('fill');
      }, 220);
    });
  });

  // Color countries that have data
  clickable.forEach(node => {
    if(state.data[node.id]?.length){
      node.setAttribute('data-has-data', 'true');
      // Optional: subtle tint (do not override existing fill if present)
      if(!node.getAttribute('fill')) node.setAttribute('fill', '#0b3b48');
    }
  });
}

async function main(){
  try{
    const [data] = await Promise.all([
      loadJSON('data/dishes.json')
    ]);
    state.data = data;

    const svg = await injectSVG('public/world-simple-demo.svg', el('#map-container'));
    el('#map-loading')?.remove();
    if(svg) wireCountryClicks(svg);
  }catch(err){
    console.error(err);
    el('#map-loading').textContent = "Erreur de chargement. Vérifie les fichiers.";
  }
}

main();
