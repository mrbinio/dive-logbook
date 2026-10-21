// Logbook signature: a buddy, divemaster or instructor signs a dive with a
// finger on this phone (like a paper logbook). Stored on the dive as a small PNG.
function signatureHTML(d) {
  const L = (pl, en) => lang === 'pl' ? pl : en;
  const s = d.signature;
  if (s && s.image) {
    const roles = { buddy: 'Buddy', dm: 'Divemaster', instructor: L('Instruktor', 'Instructor') };
    return `<div class="modal-section-title">${L('Podpis', 'Signature')}</div>
      <div class="sig-box">
        <img src="${esc(s.image)}" alt="">
        <div><b>${esc(s.name || '')}</b><small>${roles[s.role] || ''}${s.certNo ? ' · #' + esc(s.certNo) : ''}${s.signedAt ? ' · ' + formatDate(String(s.signedAt).slice(0, 10)) : ''}</small></div>
        <button class="sig-clear" onclick="removeSignature('${d.id}')" aria-label="Remove">✕</button>
      </div>`;
  }
  return `<button class="btn-edit sig-ask" onclick="openSignature('${d.id}')">✍︎ ${L('Poproś o podpis (buddy / instruktor)', 'Ask for a signature (buddy / instructor)')}</button>`;
}

function openSignature(diveId) {
  const L = (pl, en) => lang === 'pl' ? pl : en;
  const d = dives.find(x => x.id === diveId);
  const sheet = document.createElement('div');
  sheet.id = 'sig-sheet';
  sheet.innerHTML = `<div class="sig-card">
    <small class="eyebrow">${L('Podpis w logbooku', 'Logbook signature')}</small>
    <h3>${esc(d && (d.site || d.location) || '')}${d && d.date ? ' · ' + formatDate(d.date) : ''}</h3>
    <div class="sig-fields">
      <input type="text" id="sig-name" placeholder="${L('Imię i nazwisko', 'Full name')}" autocomplete="name">
      <select id="sig-role"><option value="buddy">Buddy</option><option value="dm">Divemaster</option><option value="instructor">${L('Instruktor', 'Instructor')}</option></select>
      <input type="text" id="sig-cert" placeholder="${L('Nr instruktora / certyfikatu (opcjonalnie)', 'Instructor / cert no. (optional)')}">
    </div>
    <canvas id="sig-pad" width="900" height="360"></canvas>
    <p class="sig-hint">${L('Podpisz palcem w ramce', 'Sign with your finger in the box')}</p>
    <div class="sig-actions">
      <button class="btn-ghost" id="sig-reset">${L('Wyczyść', 'Clear')}</button>
      <button class="btn-ghost" id="sig-cancel">${L('Anuluj', 'Cancel')}</button>
      <button class="btn-solid" id="sig-save">${L('Zapisz podpis', 'Save signature')}</button>
    </div></div>`;
  document.body.appendChild(sheet);

  const pad = sheet.querySelector('#sig-pad'), ctx = pad.getContext('2d');
  ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff';
  let drawing = false, inked = false, lastPt = null;
  const pt = e => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) * pad.width / r.width, (e.clientY - r.top) * pad.height / r.height]; };
  pad.addEventListener('pointerdown', e => { drawing = true; lastPt = pt(e); pad.setPointerCapture(e.pointerId); e.preventDefault(); });
  pad.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = pt(e);
    ctx.beginPath(); ctx.moveTo(lastPt[0], lastPt[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
    lastPt = p; inked = true; e.preventDefault();
  });
  ['pointerup', 'pointercancel'].forEach(t => pad.addEventListener(t, () => { drawing = false; }));
  const close = () => sheet.remove();
  sheet.querySelector('#sig-reset').onclick = () => { ctx.clearRect(0, 0, pad.width, pad.height); inked = false; };
  sheet.querySelector('#sig-cancel').onclick = close;
  sheet.querySelector('#sig-save').onclick = () => {
    const name = sheet.querySelector('#sig-name').value.trim();
    if (!name) { showToast(L('Wpisz imię i nazwisko', 'Enter a name')); return; }
    if (!inked) { showToast(L('Brakuje podpisu', 'Please sign first')); return; }
    // Small PNG: scale the 900x360 pad down to 450x180 (a few KB)
    const out = document.createElement('canvas'); out.width = 450; out.height = 180;
    out.getContext('2d').drawImage(pad, 0, 0, 450, 180);
    const signature = {
      name, role: sheet.querySelector('#sig-role').value,
      certNo: sheet.querySelector('#sig-cert').value.trim() || null,
      image: out.toDataURL('image/png'), signedAt: new Date().toISOString()
    };
    divesCol.doc(diveId).update({ signature }).catch(e => showToast('❌ ' + e.message));
    close();
    showToast(L('Podpis zapisany', 'Signature saved'));
    setTimeout(() => openModal(diveId), 250);
  };
}

function removeSignature(diveId) {
  if (!confirm(lang === 'pl' ? 'Usunąć podpis?' : 'Remove the signature?')) return;
  divesCol.doc(diveId).update({ signature: firebase.firestore.FieldValue.delete() }).catch(e => showToast('❌ ' + e.message));
  setTimeout(() => openModal(diveId), 250);
}
