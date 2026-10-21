// Logbook signatures. Two ways to sign a dive:
//  1. on this phone: the buddy/instructor signs with a finger (like a paper logbook);
//  2. by QR: a one-time request (signRequests/{token}, 24 h) opens a signing page on
//     the buddy's own phone, no login; the signature then lands on the dive.
const SIG_ROLES = () => ({ buddy: 'Buddy', dm: 'Divemaster', instructor: lang === 'pl' ? 'Instruktor' : 'Instructor' });
const SL = (pl, en) => lang === 'pl' ? pl : en;

function signatureHTML(d) {
  const s = d.signature;
  if (s && s.image) {
    return `<div class="modal-section-title">${SL('Podpis', 'Signature')}</div>
      <div class="sig-box">
        <img src="${esc(s.image)}" alt="">
        <div><b>${esc(s.name || '')}</b><small>${SIG_ROLES()[s.role] || ''}${s.certNo ? ' · #' + esc(s.certNo) : ''}${s.signedAt ? ' · ' + formatDate(String(s.signedAt).slice(0, 10)) : ''}</small></div>
        <button class="sig-clear" onclick="removeSignature('${d.id}')" aria-label="Remove">✕</button>
      </div>`;
  }
  return `<div class="sig-ask-row">
    <button class="btn-edit sig-ask" onclick="openSignature('${d.id}')">✍︎ ${SL('Podpis na tym telefonie', 'Sign on this phone')}</button>
    <button class="btn-edit sig-ask" onclick="openSignatureQR('${d.id}')">▣ ${SL('Kod QR dla buddy\'ego', 'QR code for your buddy')}</button>
  </div>`;
}

// Name/role/cert fields + finger pad. Calls onSave(signature) with a small PNG.
function signatureFormHTML() {
  return `<div class="sig-fields">
      <input type="text" id="sig-name" placeholder="${SL('Imię i nazwisko', 'Full name')}" autocomplete="name" maxlength="80">
      <select id="sig-role"><option value="buddy">Buddy</option><option value="dm">Divemaster</option><option value="instructor">${SIG_ROLES().instructor}</option></select>
      <input type="text" id="sig-cert" placeholder="${SL('Nr instruktora / certyfikatu (opcjonalnie)', 'Instructor / cert no. (optional)')}" maxlength="40">
    </div>
    <canvas id="sig-pad" width="900" height="360"></canvas>
    <p class="sig-hint">${SL('Podpisz palcem w ramce', 'Sign with your finger in the box')}</p>`;
}
function wireSignaturePad(root, onSave) {
  const pad = root.querySelector('#sig-pad'), ctx = pad.getContext('2d');
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
  root.querySelector('#sig-reset').onclick = () => { ctx.clearRect(0, 0, pad.width, pad.height); inked = false; };
  root.querySelector('#sig-save').onclick = () => {
    const name = root.querySelector('#sig-name').value.trim();
    if (!name) { showToast(SL('Wpisz imię i nazwisko', 'Enter a name')); return; }
    if (!inked) { showToast(SL('Brakuje podpisu', 'Please sign first')); return; }
    const out = document.createElement('canvas'); out.width = 450; out.height = 180;
    out.getContext('2d').drawImage(pad, 0, 0, 450, 180);
    onSave({
      name, role: root.querySelector('#sig-role').value,
      certNo: root.querySelector('#sig-cert').value.trim() || null,
      image: out.toDataURL('image/png'), signedAt: new Date().toISOString()
    });
  };
}
function diveTitle(d) { return esc(d && (d.site || d.location) || '') + (d && d.date ? ' · ' + formatDate(d.date) : ''); }

// 1. On this phone
function openSignature(diveId) {
  const d = dives.find(x => x.id === diveId);
  const sheet = document.createElement('div');
  sheet.id = 'sig-sheet';
  sheet.innerHTML = `<div class="sig-card">
    <small class="eyebrow">${SL('Podpis w logbooku', 'Logbook signature')}</small>
    <h3>${diveTitle(d)}</h3>${signatureFormHTML()}
    <div class="sig-actions">
      <button class="btn-ghost" id="sig-reset">${SL('Wyczyść', 'Clear')}</button>
      <button class="btn-ghost" id="sig-cancel">${SL('Anuluj', 'Cancel')}</button>
      <button class="btn-solid" id="sig-save">${SL('Zapisz podpis', 'Save signature')}</button>
    </div></div>`;
  document.body.appendChild(sheet);
  sheet.querySelector('#sig-cancel').onclick = () => sheet.remove();
  wireSignaturePad(sheet, signature => {
    divesCol.doc(diveId).update({ signature }).catch(e => showToast('❌ ' + e.message));
    sheet.remove();
    showToast(SL('Podpis zapisany', 'Signature saved'));
    setTimeout(() => openModal(diveId), 250);
  });
}

function removeSignature(diveId) {
  if (!confirm(SL('Usunąć podpis?', 'Remove the signature?'))) return;
  divesCol.doc(diveId).update({ signature: firebase.firestore.FieldValue.delete() }).catch(e => showToast('❌ ' + e.message));
  setTimeout(() => openModal(diveId), 250);
}

// 2. QR: create a one-time request and wait for the buddy to sign it
function signRequests() { return db.collection('signRequests'); }
function loadQRLib() {
  if (window.qrcode) return Promise.resolve();
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    s.onload = ok; s.onerror = fail; document.head.appendChild(s);
  });
}
async function openSignatureQR(diveId) {
  const d = dives.find(x => x.id === diveId);
  if (!d) return;
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const token = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const url = location.origin + location.pathname + '?sign=' + token;
  const sheet = document.createElement('div');
  sheet.id = 'sig-sheet';
  sheet.innerHTML = `<div class="sig-card sig-qr">
    <small class="eyebrow">${SL('Podpis przez kod QR', 'Sign by QR code')}</small>
    <h3>${diveTitle(d)}</h3>
    <div class="qr-box" id="qr-box"><span class="muted">…</span></div>
    <p class="sig-hint">${SL('Buddy skanuje kod aparatem swojego telefonu i podpisuje się u siebie. Kod działa 24 godziny i tylko raz.', 'Your buddy scans this with their phone camera and signs there. Valid once, for 24 hours.')}</p>
    <p class="qr-status" id="qr-status">${SL('Czekam na podpis…', 'Waiting for the signature…')}</p>
    <div class="sig-actions">
      <button class="btn-ghost" id="qr-copy">${SL('Kopiuj link', 'Copy link')}</button>
      <button class="btn-ghost" id="qr-close">${SL('Zamknij', 'Close')}</button>
    </div></div>`;
  document.body.appendChild(sheet);
  let unsub = null;
  const close = () => { if (unsub) unsub(); sheet.remove(); };
  sheet.querySelector('#qr-close').onclick = close;
  sheet.querySelector('#qr-copy').onclick = () => {
    if (navigator.share) navigator.share({ url, title: SL('Podpisz moje nurkowanie', 'Sign my dive') }).catch(() => {});
    else navigator.clipboard.writeText(url).then(() => showToast(SL('Link skopiowany', 'Link copied')));
  };
  try {
    await signRequests().doc(token).set({
      uid: myUid(), diveId, owner: (auth.currentUser && auth.currentUser.displayName) || '',
      dive: { site: d.site || '', location: d.location || '', date: d.date || '', depth: d.depth || null, duration: d.duration || null },
      status: 'open', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      expires: firebase.firestore.Timestamp.fromMillis(Date.now() + 24 * 3600e3)
    });
  } catch (e) {
    sheet.querySelector('#qr-status').textContent = '❌ ' + e.message;
    return;
  }
  try {
    await loadQRLib();
    const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
    sheet.querySelector('#qr-box').innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  } catch (e) {
    sheet.querySelector('#qr-box').innerHTML = `<a href="${url}" class="link-btn">${url}</a>`;
  }
  unsub = signRequests().doc(token).onSnapshot(snap => {
    const r = snap.data();
    if (r && r.status === 'signed' && r.signature) {
      applySignedRequest(token, r);
      close();
      showToast(SL('Podpis dodany!', 'Signature added!'));
      setTimeout(() => openModal(diveId), 300);
    }
  }, () => {});
}

// Copy a signed request onto its dive and delete the request
function applySignedRequest(token, r) {
  db.collection('users').doc(r.uid).collection('dives').doc(r.diveId).update({ signature: r.signature })
    .then(() => signRequests().doc(token).delete())
    .catch(e => console.warn('apply signature:', e));
}
// On login: pick up signatures that came in while the QR window was closed
function collectSignedRequests() {
  const uid = myUid();
  if (!uid) return;
  signRequests().where('uid', '==', uid).where('status', '==', 'signed').get()
    .then(snap => snap.forEach(doc => applySignedRequest(doc.id, doc.data())))
    .catch(e => console.warn('signed requests:', e));
}

// The buddy's side: index.html?sign=<token>, no login
function checkSignPage() {
  const token = new URLSearchParams(location.search).get('sign');
  if (!token || !/^[0-9a-f]{20,64}$/.test(token)) return false;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-header').style.display = 'none';
  const page = document.createElement('div');
  page.id = 'sign-page';
  page.innerHTML = `<div class="sig-card"><p class="muted">…</p></div>`;
  document.body.appendChild(page);
  const card = page.querySelector('.sig-card');
  const fail = msg => { card.innerHTML = `<small class="eyebrow">Mr.Binio Dive Logbook</small><h3>${msg}</h3>`; };
  signRequests().doc(token).get().then(snap => {
    const r = snap.data();
    if (!r) return fail(SL('Ten link jest nieaktualny.', 'This link is no longer valid.'));
    if (r.status !== 'open') return fail(SL('To nurkowanie jest już podpisane. Dziękujemy!', 'This dive is already signed. Thank you!'));
    if (r.expires && r.expires.toMillis() < Date.now()) return fail(SL('Link wygasł — poproś o nowy kod.', 'The link expired — ask for a new code.'));
    const dv = r.dive || {};
    card.innerHTML = `<small class="eyebrow">${SL('Podpis w logbooku', 'Logbook signature')}${r.owner ? ' · ' + esc(r.owner) : ''}</small>
      <h3>${esc(dv.site || dv.location || '')}${dv.date ? ' · ' + formatDate(dv.date) : ''}</h3>
      <p class="sig-dive">${[dv.depth && dv.depth + ' m', dv.duration && dv.duration + ' min', dv.location].filter(Boolean).map(esc).join(' · ')}</p>
      ${signatureFormHTML()}
      <div class="sig-actions">
        <button class="btn-ghost" id="sig-reset">${SL('Wyczyść', 'Clear')}</button>
        <button class="btn-solid" id="sig-save">${SL('Podpisz nurkowanie', 'Sign this dive')}</button>
      </div>`;
    wireSignaturePad(card, signature => {
      card.querySelector('#sig-save').disabled = true;
      signRequests().doc(token).update({ status: 'signed', signature })
        .then(() => fail(SL('Dziękujemy! Podpis został wysłany. ✍︎', 'Thank you! Your signature was sent. ✍︎')))
        .catch(e => { card.querySelector('#sig-save').disabled = false; showToast('❌ ' + e.message); });
    });
  }).catch(e => fail('❌ ' + esc(e.message)));
  return true;
}
