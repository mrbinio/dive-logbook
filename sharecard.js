// Share card: a 1080x1920 story image of one dive (underwater background,
// site, huge depth, depth profile, facts), shared through the phone's share
// sheet or downloaded when sharing files is not supported.
async function makeDiveCard(d) {
  const W = 1080, H = 1920;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  try { await Promise.all(['200 100px Manrope', '600 100px Manrope', '800 100px Manrope'].map(f => document.fonts.load(f))); } catch (e) {}
  const F = (w, px) => `${w} ${px}px Manrope, Inter, system-ui, sans-serif`;

  // Background: one frame of the underwater scene, plus a dark fade for text
  const bg = window.Ocean && Ocean.still(W, H, 0.3, 11.0);
  if (bg) {
    const img = new Image(); img.src = bg;
    await img.decode().catch(() => {});
    x.drawImage(img, 0, 0, W, H);
  } else {
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1f5f92'); g.addColorStop(.5, '#06213f'); g.addColorStop(1, '#020a16');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  const fade = x.createLinearGradient(0, 0, 0, H);
  fade.addColorStop(0, 'rgba(2,10,22,.15)'); fade.addColorStop(.55, 'rgba(2,10,22,.35)'); fade.addColorStop(1, 'rgba(2,10,22,.9)');
  x.fillStyle = fade; x.fillRect(0, 0, W, H);

  const P = 90;
  x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
  // Brand
  x.font = F(600, 34); x.letterSpacing = '10px';
  x.fillText('MR.BINIO', P, 150);
  x.fillStyle = 'rgba(226,238,255,.6)'; x.font = F(600, 26); x.letterSpacing = '8px';
  const lbl = (lang === 'pl' ? 'NURKOWANIE' : 'DIVE') + (d.num ? ' #' + d.num : '');
  x.fillText(lbl, P, 200);
  x.letterSpacing = '0px';

  // Site (shrinks to fit) and place/date
  const site = d.site || d.location || 'Dive';
  let size = 130;
  x.font = F(700, size);
  while (x.measureText(site).width > W - 2 * P && size > 60) { size -= 6; x.font = F(700, size); }
  x.fillStyle = '#fff'; x.fillText(site, P, 520);
  x.fillStyle = 'rgba(226,238,255,.72)'; x.font = F(600, 40);
  x.fillText([d.site && d.location, d.date && formatDate(d.date), d.type].filter(Boolean).join('  ·  '), P, 590);

  // Huge depth
  x.fillStyle = '#fff'; x.font = F(200, 420); x.letterSpacing = '-20px';
  const depth = String(d.depth || 0);
  x.fillText(depth, P - 14, 1010);
  const dw = x.measureText(depth).width;
  x.letterSpacing = '0px'; x.font = F(600, 70); x.fillStyle = 'rgba(226,238,255,.7)';
  x.fillText('m', P + dw + 6, 1010);

  // Depth profile (recorded, or the typical square shape when there is none)
  let pts = (d.depthProfile || []).map(p => [p.time, p.depth]);
  if (pts.length < 3) {
    const T = d.duration || 40, D = d.depth || 18;
    pts = [[0, 0], [T * .12, D], [T * .62, D * .92], [T * .82, 5], [T * .95, 5], [T, 0]];
  }
  const maxT = pts[pts.length - 1][0] || 1, maxD = Math.max(...pts.map(p => p[1])) || 1;
  const top = 1110, ph = 300;
  const px = p => [p[0] / maxT * W, top + p[1] / maxD * ph];
  x.beginPath(); pts.forEach((p, i) => { const [a, b] = px(p); i ? x.lineTo(a, b) : x.moveTo(a, b); });
  x.lineTo(W, top); x.lineTo(0, top); x.closePath();
  const pf = x.createLinearGradient(0, top, 0, top + ph);
  pf.addColorStop(0, 'rgba(255,255,255,.18)'); pf.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = pf; x.fill();
  x.setLineDash([4, 14]); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 2;
  x.beginPath(); x.moveTo(0, top); x.lineTo(W, top); x.stroke(); x.setLineDash([]);
  x.shadowColor = 'rgba(155,220,255,.9)'; x.shadowBlur = 18;
  x.strokeStyle = '#fff'; x.lineWidth = 6; x.lineJoin = 'round';
  x.beginPath(); pts.forEach((p, i) => { const [a, b] = px(p); i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.stroke();
  x.shadowBlur = 0;

  // Facts row
  const sac = window.DiveTools && DiveTools.sac(d);
  const facts = [
    d.duration && [d.duration + ' min', lang === 'pl' ? 'CZAS' : 'TIME'],
    d.temp && [d.temp + '°C', lang === 'pl' ? 'WODA' : 'WATER'],
    d.visibility && [d.visibility + ' m', lang === 'pl' ? 'WIDOCZNOŚĆ' : 'VISIBILITY'],
    sac && [sac.toFixed(1), 'SAC L/MIN'],
    d.buddy && !/^(none|null|-|—)$/i.test(String(d.buddy).trim()) && [String(d.buddy), 'BUDDY'],
  ].filter(Boolean).slice(0, 4);
  const colW = (W - 2 * P) / Math.max(facts.length, 1);
  facts.forEach((f, i) => {
    const fx = P + i * colW;
    x.fillStyle = '#fff'; x.font = F(600, 54);
    let v = f[0]; while (x.measureText(v).width > colW - 20 && v.length > 3) v = v.slice(0, -2) + '…';
    x.fillText(v, fx, 1600);
    // label shrinks until it fits its column
    let ls = 5, fs = 24;
    x.fillStyle = 'rgba(226,238,255,.6)'; x.font = F(700, fs); x.letterSpacing = ls + 'px';
    while (x.measureText(f[1]).width > colW - 24 && fs > 16) { fs -= 1; ls = Math.max(1, ls - .5); x.font = F(700, fs); x.letterSpacing = ls + 'px'; }
    x.fillText(f[1], fx, 1645); x.letterSpacing = '0px';
  });
  if (d.rating) { x.fillStyle = '#ffb38a'; x.font = F(600, 56); x.fillText('★'.repeat(d.rating), P, 1760); }
  x.fillStyle = 'rgba(226,238,255,.45)'; x.font = F(600, 26); x.textAlign = 'right';
  x.fillText('Mr.Binio Dive Logbook', W - P, 1840); x.textAlign = 'left';

  return new Promise(res => c.toBlob(res, 'image/png'));
}

async function shareDiveCard(id) {
  const d = dives.find(v => v.id === id);
  if (!d) return;
  showToast(lang === 'pl' ? 'Tworzę kartę…' : 'Creating card…');
  const blob = await makeDiveCard(d);
  if (!blob) return;
  const name = ((d.site || 'dive') + '-' + (d.date || '')).replace(/[^\w\-]+/g, '_') + '.png';
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: d.site || 'Dive' }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
