// Badges: names, the Badges screen, the Home tile and the "new badge" moment.
// Which badges are earned is computed by DiveTools.badges (divetools.js).
const BADGE_TEXT = {
  n1: ['Pierwsze zanurzenie', 'First dive', 'Pierwsze nurkowanie w logbooku', 'Your first logged dive'],
  n10: ['Dziesiątka', 'Ten dives', '10 nurkowań', '10 dives'],
  n25: ['Ćwierć setki', 'Twenty-five', '25 nurkowań', '25 dives'],
  n50: ['Pół setki', 'Fifty', '50 nurkowań', '50 dives'],
  n100: ['Setka', 'Centurion', '100 nurkowań', '100 dives'],
  n250: ['Weteran', 'Veteran', '250 nurkowań', '250 dives'],
  d18: ['Poza OWD', 'Beyond OW', 'Głębiej niż 18 m', 'Deeper than 18 m'],
  d30: ['Trzydziestka', 'Thirty metres', 'Głębiej niż 30 m', 'Deeper than 30 m'],
  d40: ['Granica rekreacji', 'Recreational limit', 'Głębiej niż 40 m', 'Deeper than 40 m'],
  long60: ['Godzina pod wodą', 'The hour', 'Jedno nurkowanie 60+ min', 'One dive of 60+ min'],
  h10: ['10 godzin', '10 hours', '10 godzin pod wodą łącznie', '10 hours underwater in total'],
  h50: ['50 godzin', '50 hours', '50 godzin pod wodą łącznie', '50 hours underwater in total'],
  h100: ['100 godzin', '100 hours', '100 godzin pod wodą łącznie', '100 hours underwater in total'],
  s5: ['Odkrywca', 'Explorer', '5 różnych miejsc', '5 different sites'],
  s15: ['Kartograf', 'Cartographer', '15 różnych miejsc', '15 different sites'],
  c3: ['Podróżnik', 'Traveller', 'Nurkowania w 3 regionach', 'Dives in 3 regions'],
  b5: ['Towarzyski', 'Social diver', '5 różnych buddy', '5 different buddies'],
  cold10: ['Zimna krew', 'Cold blooded', 'Woda 10°C lub zimniej', 'Water at 10°C or colder'],
  warm28: ['Tropiki', 'Tropics', 'Woda 28°C lub cieplej', 'Water at 28°C or warmer'],
  night: ['Nocny marek', 'Night owl', 'Nurkowanie nocne', 'A night dive'],
  wreck: ['Wrakowiec', 'Wreck diver', 'Nurkowanie na wraku', 'A wreck dive'],
  cave: ['Jaskiniowiec', 'Caver', 'Nurkowanie jaskiniowe', 'A cave dive'],
  drift: ['Z prądem', 'Drifter', 'Nurkowanie z prądem', 'A drift dive'],
  tech: ['Techniczny', 'Technical', 'Nurkowanie techniczne', 'A technical dive'],
  sidemount: ['Sidemount', 'Sidemount', 'Nurkowanie w sidemount', 'A sidemount dive'],
  sac15: ['Spokojny oddech', 'Calm breather', 'SAC 15 L/min lub mniej', 'SAC of 15 L/min or less'],
  early: ['Ranny ptaszek', 'Early bird', 'Wejście do wody przed 7:00', 'In the water before 7:00'],
  year30: ['Sezon na full', 'Big season', '30 nurkowań w jednym roku', '30 dives in one year'],
};
function badgeText(b) {
  const tx = BADGE_TEXT[b.id] || [b.id, b.id, '', ''];
  return lang === 'pl' ? { title: tx[0], desc: tx[2] } : { title: tx[1], desc: tx[3] };
}
function badgeProgressText(b) {
  if (b.earned) return b.earnedOn ? formatDate(b.earnedOn) : '';
  if (b.group === 'cold' || b.group === 'sac' || b.group === 'type' || b.group === 'early') return lang === 'pl' ? 'jeszcze nie' : 'not yet';
  const v = b.group === 'hours' ? Math.floor(b.value) : Math.round(b.value * 10) / 10;
  return `${v} / ${b.goal}${b.group === 'depth' ? ' m' : b.group === 'long' ? ' min' : b.group === 'hours' ? ' h' : ''}`;
}
function medalHTML(b, size) {
  const ring = b.earned ? '' : `<svg class="medal-ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" pathLength="100" style="stroke-dasharray:${Math.round(b.progress * 100)} 100"/></svg>`;
  return `<span class="medal ${b.earned ? 'on' : 'off'} ${size || ''}">${ring}<span class="medal-ico">${b.icon}</span></span>`;
}

function renderBadges() {
  const el = document.getElementById('badges-content');
  if (!el) return;
  const all = DiveTools.badges(dives);
  const got = all.filter(b => b.earned).sort((a, b) => (b.earnedOn || '').localeCompare(a.earnedOn || ''));
  const todo = all.filter(b => !b.earned).sort((a, b) => b.progress - a.progress);
  const card = b => {
    const tx = badgeText(b);
    return `<div class="badge-card ${b.earned ? 'on' : 'off'}" ${b.diveId ? `onclick="openModal('${b.diveId}')"` : ''}>
      ${medalHTML(b)}<b>${tx.title}</b><small>${tx.desc}</small><span>${badgeProgressText(b)}</span></div>`;
  };
  el.innerHTML = `
    <section class="tile badges-summary"><b>${got.length}</b><span>/ ${all.length}</span><small>${lang === 'pl' ? 'zdobytych odznak' : 'badges earned'}</small>
      <div class="rank-bar"><i style="width:${got.length / all.length * 100}%"></i></div></section>
    ${got.length ? `<h3 class="sec-title badges-h">${lang === 'pl' ? 'Zdobyte' : 'Earned'}</h3><div class="badge-grid">${got.map(card).join('')}</div>` : ''}
    <h3 class="sec-title badges-h">${lang === 'pl' ? 'Do zdobycia' : 'To earn'}</h3><div class="badge-grid">${todo.map(card).join('')}</div>`;
}

function homeBadgesTile() {
  const all = DiveTools.badges(dives);
  const got = all.filter(b => b.earned).sort((a, b) => (b.earnedOn || '').localeCompare(a.earnedOn || ''));
  const next = all.filter(b => !b.earned && b.progress > 0).sort((a, b) => b.progress - a.progress)[0];
  return `<section class="tile tile-badges" onclick="switchTab('badges')">
    <small>${lang === 'pl' ? 'Odznaki' : 'Badges'} · ${got.length}/${all.length}</small>
    <div class="tb-row">${got.slice(0, 5).map(b => medalHTML(b, 'sm')).join('')}${got.length > 5 ? `<span class="tb-more">+${got.length - 5}</span>` : ''}</div>
    ${next ? `<span class="tb-next">${lang === 'pl' ? 'Następna' : 'Next'}: <b>${badgeText(next).title}</b> · ${badgeProgressText(next)}</span>` : ''}
  </section>`;
}

// Celebrate badges earned since the last time this browser saw the logbook.
// The first run only records what is already earned, so nothing floods in.
let badgeQueue = [];
function checkNewBadges() {
  const uid = typeof myUid === 'function' ? myUid() : '';
  if (!uid || !dives.length) return;
  const key = 'badges_seen_' + uid;
  const earned = DiveTools.badges(dives).filter(b => b.earned);
  let seen = null;
  try { seen = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
  try { localStorage.setItem(key, JSON.stringify(earned.map(b => b.id))); } catch (e) {}
  if (!seen) return;
  const fresh = earned.filter(b => !seen.includes(b.id));
  if (!fresh.length) return;
  badgeQueue.push(...fresh);
  if (!document.getElementById('badge-pop')) showNextBadge();
}
function showNextBadge() {
  const b = badgeQueue.shift();
  if (!b) return;
  const tx = badgeText(b);
  const pop = document.createElement('div');
  pop.id = 'badge-pop';
  pop.innerHTML = `<div class="bp-card">
    <div class="bp-rays"></div>${medalHTML(b, 'xl')}
    <small>${lang === 'pl' ? 'Nowa odznaka' : 'New badge'}</small><b>${tx.title}</b><span>${tx.desc}</span>
    <button class="btn-solid">${lang === 'pl' ? 'Super!' : 'Nice!'}</button></div>
    ${Array.from({ length: 14 }, (_, i) => `<i class="bp-bubble" style="left:${(i * 37) % 100}%;--d:${(i % 5) * .25}s;--s:${8 + (i * 7) % 16}px"></i>`).join('')}`;
  const close = () => { pop.classList.add('out'); setTimeout(() => { pop.remove(); showNextBadge(); }, 300); };
  pop.addEventListener('click', close);
  document.body.appendChild(pop);
  if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
}
