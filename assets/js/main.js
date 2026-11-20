(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  $('#yr').textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  const bar = $('.progress span');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 30);
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    drawRoute();
  };
  addEventListener('scroll', onScroll, { passive: true });

  // active link
  const sections = $$('main section[id]');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('a', links).forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- cursor glow + card spotlight ---------- */
  const glow = $('.cursor-glow');
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    addEventListener('pointermove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });
  } else glow.style.display = 'none';
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.classList.contains('stat')) countUp(e.target.querySelector('[data-count]'));
    io.unobserve(e.target);
  }), { threshold: .18 });
  $$('.reveal').forEach(el => io.observe(el));

  function countUp(el) {
    if (!el) return;
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = reduce ? 1 : 1600;
    const fmt = v => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN');
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- role rotator ---------- */
  const roles = ['fraud analytics for banks', 'Power BI dashboards that ship', 'star-schema data models', 'DAX that runs fast', 'reports that replace Excel', 'AI into BI with Claude'];
  const rt = $('#roleText');
  if (!reduce) {
    let ri = 0, ci = roles[0].length, del = true;
    const tick = () => {
      const w = roles[ri];
      if (del) { ci--; if (ci === 0) { del = false; ri = (ri + 1) % roles.length; } }
      else { ci++; if (ci === roles[ri].length) { del = true; rt.textContent = roles[ri]; return setTimeout(tick, 2000); } }
      rt.textContent = roles[ri].slice(0, ci) || ' ';
      setTimeout(tick, del ? 28 : 55);
    };
    setTimeout(tick, 2400);
  }

  /* ---------- journey route (curvy line that draws on scroll) ---------- */
  const route = $('#route'), svg = $('.route-line', route);
  let base, live, len = 0;
  function buildRoute() {
    const rb = route.getBoundingClientRect();
    const pins = $$('.stop-pin', route).map(p => { const r = p.getBoundingClientRect(); return [r.left + r.width / 2 - rb.left, r.top + r.height / 2 - rb.top]; });
    if (pins.length < 2) return;
    svg.setAttribute('viewBox', `0 0 ${rb.width} ${rb.height}`);
    const mobile = innerWidth <= 760;
    let d = `M${pins[0][0]} ${pins[0][1]}`;
    for (let i = 1; i < pins.length; i++) {
      const [x0, y0] = pins[i - 1], [x1, y1] = pins[i], my = (y0 + y1) / 2, sway = mobile ? 0 : (i % 2 ? 70 : -70);
      d += ` C${x0 + sway} ${my} ${x1 - sway} ${my} ${x1} ${y1}`;
    }
    svg.innerHTML = `<defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22D3EE"/><stop offset=".55" stop-color="#F2C811"/><stop offset="1" stop-color="#E8875F"/></linearGradient></defs><path class="base" d="${d}"/><path class="live" d="${d}" style="stroke:url(#rg)"/>`;
    base = svg.querySelector('.base'); live = svg.querySelector('.live');
    len = live.getTotalLength();
    live.style.strokeDasharray = len; drawRoute();
  }
  function drawRoute() {
    if (!live) return;
    const r = route.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * .6 - r.top) / r.height, 0), 1);
    live.style.strokeDashoffset = len * (1 - p);
  }
  addEventListener('load', buildRoute);
  addEventListener('resize', () => { clearTimeout(buildRoute.t); buildRoute.t = setTimeout(buildRoute, 150); });
  setTimeout(buildRoute, 300);

  /* ---------- certifications ---------- */
  const ML = 'https://learn.microsoft.com/en-us/users/rupamkumar-5926/credentials/';
  const CR = 'https://www.credly.com/badges/';
  const G = {
    claude: ['linear-gradient(135deg,#F0A07F,#C15F3C)', '#F0A07F'],
    claudePro: ['linear-gradient(135deg,#FFD9A8,#E8875F 45%,#9E3F22)', '#FFD9A8'],
    pbi: ['linear-gradient(135deg,#F2C811,#E8A300)', '#F2C811', 'dark'],
    pp: ['linear-gradient(135deg,#E879F9,#9D174D)', '#E879F9'],
    fabric: ['linear-gradient(135deg,#14B8A6,#0E7490)', '#2DD4BF'],
    azure: ['linear-gradient(135deg,#38BDF8,#2563EB)', '#38BDF8'],
    gh: ['linear-gradient(135deg,#C084FC,#7C3AED)', '#C084FC'],
    aws: ['linear-gradient(135deg,#FFB547,#E07B00)', '#FFB547', 'dark'],
    gcp: ['linear-gradient(135deg,#4285F4,#34A853)', '#60A5FA']
  };
  const certs = [
    { cat: 'claude', g: 'claudePro', code: '✦ PRO', name: 'Claude Certified Architect – Professional', org: 'Anthropic', date: 'Nov 2026', url: CR + '935d75a4-44a8-4e57-a72f-d6c7a69c0cc8', feature: true },
    { cat: 'claude', g: 'claude', code: '✦ ARCH', name: 'Claude Certified Architect – Foundations', org: 'Anthropic', date: 'Nov 2026', url: CR + '8af8099a-3699-4fb5-9a7f-3edbd76dca10' },
    { cat: 'claude', g: 'claude', code: '✦ DEV', name: 'Claude Certified Developer – Foundations', org: 'Anthropic', date: 'Nov 2026', url: CR + 'ff1071c6-ca2c-411a-9e12-f2b1057051c2' },
    { cat: 'claude', g: 'claude', code: '✦ ASSOC', name: 'Claude Certified Associate – Foundations', org: 'Anthropic', date: 'Nov 2026', url: CR + '74cf707d-ac15-49f9-8ae8-217d592e62cd' },
    { cat: 'ms', g: 'pbi', code: 'PL-300', name: 'Power BI Data Analyst Associate', org: 'Microsoft', date: 'Apr 2025', url: ML + '95eb4d33326d736f' },
    { cat: 'ms', g: 'fabric', code: 'DP-600', name: 'Fabric Analytics Engineer Associate', org: 'Microsoft', date: 'Feb 2026', url: ML + 'e51cc738389eff3d' },
    { cat: 'ms', g: 'fabric', code: 'DP-700', name: 'Fabric Data Engineer Associate', org: 'Microsoft', date: 'Mar 2026', url: ML + 'b5a0776a4ff5be77' },
    { cat: 'ms', g: 'azure', code: 'DP-100', name: 'Azure Data Scientist Associate', org: 'Microsoft', date: 'Jun 2026', url: ML + '297eb3bab4fa7f10' },
    { cat: 'ms', g: 'pp', code: 'PL-400', name: 'Power Platform Developer Associate', org: 'Microsoft', date: '2026' },
    { cat: 'ms', g: 'azure', code: 'AZ-204', name: 'Azure Developer Associate', org: 'Microsoft', date: '2026' },
    { cat: 'ms', g: 'azure', code: 'AI-900', name: 'Azure AI Fundamentals', org: 'Microsoft', date: 'Mar 2026', url: ML + '77ee16febee88e93' },
    { cat: 'ms', g: 'azure', code: 'DP-900', name: 'Azure Data Fundamentals', org: 'Microsoft', date: '2026' },
    { cat: 'ms', g: 'gh', code: 'GH-900', name: 'GitHub Foundations', org: 'Microsoft · GitHub', date: 'Dec 2025', url: ML + '99cb0494b3122fd3' },
    { cat: 'ms', g: 'gh', code: 'GH-300', name: 'GitHub Copilot', org: 'Microsoft · GitHub', date: '2026' },
    { cat: 'cloud', g: 'aws', code: 'AWS AI', name: 'AWS Certified AI Practitioner', org: 'Amazon Web Services', date: 'Jul 2026', url: CR + '4a172bd5-753a-44bd-bec2-8411f9e3bf14' },
    { cat: 'cloud', g: 'gcp', code: 'GEMINI', name: 'Build with Gemini', org: 'Google Cloud', date: 'Sep 2026', url: CR + '059bb14f-bb8f-4d92-8614-7bc450a30d85' },
    { cat: 'cloud', g: 'gcp', code: 'ANTI GRAVITY', name: 'Accelerate Development with Antigravity', org: 'Google Cloud', date: 'Oct 2026', url: CR + '97bcb517-134a-4e9d-b840-1d4c5dce0624' }
  ];
  const grid = $('#certGrid');
  function renderCerts(f) {
    grid.innerHTML = certs.filter(c => f === 'all' || c.cat === f).map((c, i) => {
      const [bg, col, ink] = G[c.g];
      return `<article class="cert${c.feature ? ' feature' : ''}" style="--cg:${bg};--cc:${col};animation-delay:${i * 40}ms">
        <div class="cert-badge${ink ? ' dark' : ''}">${c.code}</div>
        <div class="cert-body"><h4>${c.name}</h4><small>${c.org} · ${c.date}</small>
        ${c.url ? `<a href="${c.url}" target="_blank" rel="noopener">Verify credential ↗</a>` : ''}</div></article>`;
    }).join('');
  }
  renderCerts('all');
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => { x.classList.toggle('active', x === t); x.setAttribute('aria-selected', x === t); });
    renderCerts(t.dataset.filter);
  }));

  /* ---------- globe ---------- */
  const cv = $('#globe');
  const ctx = cv.getContext('2d');
  const D2R = Math.PI / 180;
  const places = [
    { n: 'Patna', lat: 25.59, lon: 85.13, y: '2016', ox: 12, oy: 20, al: 'l' },
    { n: 'Bikaner', lat: 28.02, lon: 73.31, y: '2019', ox: -12, oy: 4, al: 'r' },
    { n: 'Noida', lat: 28.54, lon: 77.39, y: '2022', ox: 0, oy: -16, al: 'c' },
    { n: 'Dublin', lat: 53.35, lon: -6.26, y: '2024 → now', ox: 12, oy: -8, al: 'l' }
  ];
  const legs = [[0, 1], [1, 2], [2, 3]];
  let W, H, R, cx, cy, dpr;
  let rotLon = -45, rotLat = 28, vel = 0, dragging = false, lastX = 0, t0 = performance.now(), idle = 0;
  const pts = [];
  function prep() {
    const a = window.LAND_PTS || [];
    for (let i = 0; i < a.length; i += 2) pts.push(toV(a[i + 1], a[i]));
    places.forEach(p => p.v = toV(p.lat, p.lon));
    legs.forEach(l => l.path = arc(places[l[0]].v, places[l[1]].v));
  }
  function toV(lat, lon) { lat *= D2R; lon *= D2R; return [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)]; }
  function arc(a, b) {
    const dot = Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]), om = Math.acos(dot), out = [], n = 60;
    const lift = 0.06 + om * 0.18;
    for (let i = 0; i <= n; i++) {
      const t = i / n, s = Math.sin(om) || 1, k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
      const h = 1 + Math.sin(t * Math.PI) * lift;
      out.push([(a[0] * k1 + b[0] * k2) * h, (a[1] * k1 + b[1] * k2) * h, (a[2] * k1 + b[2] * k2) * h]);
    }
    return out;
  }
  function rot(v) {
    const cl = Math.cos(rotLon * D2R), sl = Math.sin(rotLon * D2R), cp = Math.cos(rotLat * D2R), sp = Math.sin(rotLat * D2R);
    let x = v[0] * cl + v[2] * sl, z = -v[0] * sl + v[2] * cl, y = v[1];
    const y2 = y * cp - z * sp, z2 = y * sp + z * cp;
    return [x, y2, z2];
  }
  function size() {
    const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = r.width * dpr; H = cv.height = r.height * dpr; R = Math.min(W, H) * 0.4; cx = W / 2; cy = H / 2;
  }
  function frame(now) {
    const t = (now - t0) / 1000;
    if (!dragging) { idle += 1; rotLon += vel; vel *= 0.95; if (Math.abs(vel) < 0.02) rotLon = rotLon + (Math.sin(t * 0.25) * 0.06); }
    // keep the India–Ireland story in view by easing back
    if (!dragging && idle > 240) rotLon += ((-38 + Math.sin(t * .2) * 22) - rotLon) * 0.01;
    ctx.clearRect(0, 0, W, H);
    // atmosphere
    const g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.25);
    g.addColorStop(0, 'rgba(242,200,17,0.0)'); g.addColorStop(0.8, 'rgba(242,200,17,0.08)'); g.addColorStop(1, 'rgba(242,200,17,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, 7); ctx.fill();
    const body = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    body.addColorStop(0, '#16202f'); body.addColorStop(1, '#0a0f18');
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(242,200,17,0.25)'; ctx.lineWidth = 1 * dpr; ctx.stroke();
    // land dots
    const ds = 1.25 * dpr;
    for (const v of pts) {
      const [x, y, z] = rot(v);
      if (z < 0) continue;
      ctx.fillStyle = `rgba(${z > .3 ? '233,237,243' : '151,161,178'},${0.18 + z * 0.55})`;
      ctx.fillRect(cx + x * R - ds / 2, cy - y * R - ds / 2, ds, ds);
    }
    // arcs (animated sequentially)
    const cycle = 9, ph = (t % cycle) / cycle;
    legs.forEach((l, i) => {
      const s = i / legs.length, e = (i + 1) / legs.length;
      let p = Math.min(Math.max((ph - s) / (e - s), 0), 1);
      const n = Math.floor(p * (l.path.length - 1));
      ctx.lineWidth = 2 * dpr; ctx.lineCap = 'round';
      ctx.strokeStyle = i === 2 ? '#22D3EE' : '#F2C811';
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 10 * dpr;
      ctx.beginPath(); let started = false;
      for (let k = 0; k <= n; k++) {
        const [x, y, z] = rot(l.path[k]);
        if (z < -0.05) { started = false; continue; }
        const X = cx + x * R, Y = cy - y * R;
        started ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); started = true;
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      if (p > 0 && p < 1) { // comet head
        const [x, y, z] = rot(l.path[n]);
        if (z > -0.05) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + x * R, cy - y * R, 3 * dpr, 0, 7); ctx.fill(); }
      }
    });
    // places
    ctx.font = `600 ${11 * dpr}px Inter, sans-serif`;
    places.forEach((pl, i) => {
      const [x, y, z] = rot(pl.v);
      if (z < 0) return;
      const X = cx + x * R, Y = cy - y * R, pulse = (t * 1.2 + i * .3) % 1;
      ctx.strokeStyle = `rgba(242,200,17,${1 - pulse})`; ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath(); ctx.arc(X, Y, (4 + pulse * 12) * dpr, 0, 7); ctx.stroke();
      ctx.fillStyle = i === 3 ? '#22D3EE' : '#F2C811'; ctx.beginPath(); ctx.arc(X, Y, 4 * dpr, 0, 7); ctx.fill();
      const label = `${pl.n} · ${pl.y}`, tw = ctx.measureText(label).width;
      let lx = X + pl.ox * dpr; const ly = Y + pl.oy * dpr;
      if (pl.al === 'r') lx -= tw; else if (pl.al === 'c') lx -= tw / 2;
      ctx.globalAlpha = Math.min(1, z * 3);
      ctx.fillStyle = 'rgba(7,9,15,.8)'; roundRect(lx - 6 * dpr, ly - 13 * dpr, tw + 12 * dpr, 19 * dpr, 6 * dpr); ctx.fill();
      ctx.fillStyle = '#e9edf3'; ctx.fillText(label, lx, ly);
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(frame);
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  cv.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; idle = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; rotLon -= dx * 0.4; vel = -dx * 0.4; });
  ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { dragging = false; idle = 0; }));
  function startGlobe() { prep(); size(); requestAnimationFrame(frame); }
  addEventListener('resize', size);
  if (window.LAND_PTS) startGlobe(); else addEventListener('load', startGlobe);

  onScroll();
})();
