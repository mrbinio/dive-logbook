// Dive briefing: a card for each dive site of the trip plan, with the site's depth band, a dive plan
// from the planner settings, your own notes and, for sites in the library below, the story of the place.
// The library is public knowledge and grows trip by trip; private notes live in the trip
// (trip.siteNotes). On a dive day of the active trip, Home shows today's sites and a push arrives at 06:30;
// once the trip is over the tile goes away, the program keeps the cards for the film afterwards.
// Library entry: { id, names: [lower-case prefixes], kind: wreck|lake|reef, depth: [top, bottom], lie,
//   facts: [[pl, en, value_pl, value_en]], story: [pl, en], see: [[pl, en]], warn: [pl, en], src: [url] }

const CORON_SRC = 'http://coronwrecks.com/narrative.htm';
const SCUBATECH_SRC = 'https://scubatechphilippines.com/scuba_blog/the-shipwrecks-of-coron-wreck-diving-philippines/';
const SITE_LIB = [
  { id: 'akitsushima', names: ['akitsushima'], kind: 'wreck', depth: [22, 36], lie: 'port',
    facts: [['Typ', 'Type', 'okręt-baza wodnosamolotów, marynarka cesarska', 'seaplane tender, Imperial Japanese Navy'],
      ['Wodowany', 'Launched', '1941', '1941'], ['Długość', 'Length', 'ok. 115 m', 'about 115 m'], ['Wyporność', 'Displacement', '4650 t', '4,650 t'],
      ['Zatonął', 'Sunk', '24.09.1944', '24 Sep 1944']],
    story: ['Okręt obsługiwał łodzie latające: miał 35-tonowy dźwig do podnoszenia samolotu z wody. Przetrwał już dwa trafienia bombami w Truk w lutym 1944, bo miał wyjątkowo mocny kadłub i grodzie. 23 września 1944 stanął na kotwicy między wyspami Lajo i Manglet. Następnego ranka amerykańscy piloci najpierw wzięli go za niszczyciel. Bomba trafiła w rufę i prawdopodobnie zapaliła paliwo lotnicze. Okręt przewrócił się w kilka minut i zatonął.',
      'She looked after flying boats: a 35-ton crane lifted the aircraft out of the water. She had already survived two bomb hits at Truk in February 1944, thanks to a very strong hull and bulkheads. On 23 September 1944 she anchored between Lajo and Manglet islands. Next morning US pilots first took her for a destroyer. A bomb hit the stern and most likely set off the aviation fuel. She capsized within minutes and sank.'],
    see: [['Leży na lewej burcie, więc widzisz cały pokład z boku.', 'She lies on her port side, so you see the whole deck side-on.'],
      ['Działka przeciwlotnicze 25 mm i pusta wieża działa 12,7 cm.', '25 mm anti-aircraft guns and an empty 12.7 cm gun turret.'],
      ['Mocne grodzie, które pozwoliły mu przetrwać Truk.', 'The strong bulkheads that got her through Truk.']],
    warn: ['Na wraku wciąż leży amunicja. Niczego nie dotykaj i nie wynoś.', 'Live ammunition is still on the wreck. Touch nothing, take nothing.'],
    src: ['https://en.wikipedia.org/wiki/Japanese_seaplane_tender_Akitsushima', CORON_SRC, SCUBATECH_SRC] },

  { id: 'irako', names: ['irako'], kind: 'wreck', depth: [28, 43], lie: 'upright',
    facts: [['Typ', 'Type', 'statek zaopatrzeniowy z chłodniami', 'refrigerated provision ship'], ['Długość', 'Length', 'ok. 145 m', 'about 145 m'],
      ['Wyporność', 'Displacement', '9570 t', '9,570 t'], ['Zatonął', 'Sunk', '24.09.1944', '24 Sep 1944']],
    story: ['Pływająca spiżarnia floty: jej magazyny mogły wykarmić 25 000 ludzi przez dwa tygodnie. Do Coron przypłynęła około 22 września 1944 z wodnosamolotami rozpoznawczymi na pokładzie i schowała się między wyspami Tangat i Lusong. Miała sporo działek i broniła się zaciekle. Bomby trafiły jednak w środek statku, mostek stanął w ogniu, a statek powoli zatonął dziobem w dół.',
      "The fleet's floating pantry: her stores could feed 25,000 men for two weeks. She reached Coron around 22 September 1944 with reconnaissance seaplanes on deck and hid between Tangat and Lusong islands. She was well armed and fought back hard, but bombs hit her midships, the bridge caught fire and she slowly went down by the bow."],
    see: [['Stoi prawie prosto, lekko na lewą burtę.', 'She sits almost upright, slightly to port.'],
      ['Sterówka, ładownie, kuchnia i kajuty załogi.', 'Wheelhouse, cargo holds, galley and crew bunk rooms.']],
    warn: ['Najgłębszy wrak w okolicy: krótki limit bezdekompresyjny, pilnuj czasu i gazu.', 'The deepest wreck around: a short no-deco limit, watch your time and gas.'],
    src: ['https://en.wikipedia.org/wiki/Japanese_supply_ship_Irako', CORON_SRC, SCUBATECH_SRC] },

  { id: 'kogyo', names: ['kogyo'], kind: 'wreck', depth: [22, 36], lie: 'starboard',
    facts: [['Typ', 'Type', 'pomocniczy statek zaopatrzeniowy', 'auxiliary supply ship'], ['Długość', 'Length', 'ok. 129 m', 'about 129 m'],
      ['Tonaż', 'Tonnage', '6352 t', '6,352 t'], ['Zatonął', 'Sunk', '24.09.1944', '24 Sep 1944']],
    story: ['Przetrwał nalot na Manilę 21 września 1944 i jeszcze tego wieczoru dostał rozkaz płynięcia do Coron. Rzucił kotwicę 23 września o 15:40, a załoga całą noc próbowała zamaskować mostek i pokład. Rano o 9:00 nadleciały bombowce nurkujące. Po kilku trafieniach statek zatonął razem z 39 marynarzami. Wiózł materiały do budowy lotniska.',
      'She survived the raid on Manila on 21 September 1944 and that evening was ordered to Coron. She dropped anchor on 23 September at 15:40, and the crew spent the night trying to camouflage the bridge and deck. At 9:00 next morning the dive bombers came. After several hits she sank with 39 seamen. She was carrying material to build an airfield.'],
    see: [['Ładunek: worki z cementem, które skamieniały, spychacz i betoniarka.', 'Cargo: bags of cement turned to stone, a bulldozer and a mixer.'],
      ['Dwa duże kotły w maszynowni.', 'Two big boilers in the engine room.'], ['Leży na prawej burcie.', 'She lies on her starboard side.']],
    warn: ['Do wnętrza tylko z przewodnikiem i latarką. W ładowniach łatwo wzbić muł.', 'Go inside only with a guide and a torch. The holds silt up easily.'],
    src: [CORON_SRC, SCUBATECH_SRC] },

  { id: 'okikawa', names: ['okikawa'], kind: 'wreck', depth: [10, 26], lie: 'upright',
    facts: [['Typ', 'Type', 'cywilny zbiornikowiec (tankowiec)', 'civilian oiler'], ['Tonaż', 'Tonnage', '10 045 t', '10,045 t'],
      ['Długość', 'Length', 'ok. 160 m', 'about 160 m'], ['Zatonął', 'Sunk', '9.10.1944', '9 Oct 1944']],
    story: ['Przez ponad 50 lat nurkowie nazywali ten wrak Taiei Maru, aż badacz Peter Heimstaedt ustalił, że to Okikawa Maru. Przypłynęła z Manili wieczorem 23 września 1944 i rzuciła kotwicę przy wiosce Concepcion na Busuandze. Rano trafiły ją bomby, zginęło 8 lub 9 ludzi, a reszta załogi opuściła statek. Ale tankowiec nie zatonął: dziób unosił się na wodzie i płonął przez ponad dwa tygodnie. Dobił go dopiero kolejny nalot 9 października.',
      'For more than 50 years divers called this wreck the Taiei Maru, until researcher Peter Heimstaedt showed she is the Okikawa Maru. She came from Manila on the evening of 23 September 1944 and anchored off Concepcion village. Bombs hit her in the morning, 8 or 9 men died and the rest abandoned ship. But she did not sink: the forecastle stayed afloat and burned for over two weeks. Another air raid finished her on 9 October.'],
    see: [['Stoi prosto, pokład na 10–16 m, więc jest dużo światła.', 'She sits upright with the deck at 10–16 m, so there is plenty of light.'],
      ['Odłamany dziób, zbiorniki na ropę i ławice ryb.', 'The broken-off bow, the oil tanks and schools of fish.']],
    warn: ['Często jest tu silny prąd. Trzymaj się liny opustowej i przewodnika.', 'Strong current is common here. Stay on the line and with your guide.'],
    src: [CORON_SRC, SCUBATECH_SRC] },

  { id: 'olympia', names: ['olympia'], kind: 'wreck', depth: [12, 25], lie: 'starboard',
    facts: [['Typ', 'Type', 'statek towarowy armii japońskiej', 'Japanese Army cargo ship'], ['Ładunek', 'Cargo', '1250 t ryżu i zaopatrzenie', '1,250 t of rice and supplies'],
      ['Zatonął', 'Sunk', '24.09.1944, 14:26', '24 Sep 1944, 14:26']],
    story: ['Wiozła ryż dla japońskich wojsk na Filipinach. Trafiona już w Manili, 23 września 1944 przypłynęła do Coron i stanęła na zachód od wyspy Tangat. Rano zdążyła podnieść kotwicę i próbowała uciekać. Atakowało ją około 40 samolotów. Dopiero trzecia fala trafiła w maszynownię i silnik stanął. Ogień ogarnął cały statek, który o 14:26 zatonął rufą w dół. Zginęło 19 osób.',
      'She carried rice for the Japanese troops in the Philippines. Already hit in Manila, she reached Coron on 23 September 1944 and anchored west of Tangat Island. In the morning she managed to weigh anchor and tried to escape. About 40 planes attacked her, and only the third wave hit the engine room and stopped the engine. Fire spread over the whole ship, and at 14:26 she sank stern first. 19 people died.'],
    see: [['Leży na prawej burcie, lewa burta na 12–16 m.', 'She lies on her starboard side, the port hull at 12–16 m.'],
      ['Kotły (silniki wyciągnięto w latach 60.) i ładownie.', 'Boilers (the engines were salvaged in the 1960s) and cargo holds.']],
    warn: ['Wiele baz nazywa ten wrak „Morazan Maru”. Na briefingu zapytaj, który wrak macie w planie.', 'Many dive centres call this wreck "Morazan Maru". Ask at the briefing which one you are diving.'],
    src: [CORON_SRC, SCUBATECH_SRC] },

  { id: 'morazan', names: ['morazan', 'morazon'], kind: 'wreck', depth: [15, 25], lie: 'starboard',
    facts: [['Typ', 'Type', 'statek towarowy, nazwa sporna', 'cargo ship, name disputed'], ['Zatonął', 'Sunk', '24.09.1944', '24 Sep 1944']],
    story: ['Prawdziwy Morazan to brytyjski statek z 1908 roku, który w 1941 przejęli Japończycy w Szanghaju i przemianowali na Ekkai Maru. Według badacza Petera Heimstaedta zatonął jednak w Manili 22 września 1944, a nie w Coron. Nazwę „Morazan Maru” w Coron wzięto ze spisu strat z 1947 roku, w którym jest ten błąd. Wrak, który bazy pokazują pod tą nazwą, to zwykle statek towarowy leżący na prawej burcie, zatopiony w nalocie 24 września 1944.',
      'The real Morazan was a British ship from 1908, seized by the Japanese in Shanghai in 1941 and renamed Ekkai Maru. According to researcher Peter Heimstaedt she sank in Manila on 22 September 1944, not in Coron. The name "Morazan Maru" came to Coron from a 1947 list of losses that has this mistake. The wreck shown under this name is usually a cargo ship lying on her starboard side, sunk in the raid of 24 September 1944.'],
    see: [['Ładownie, przez które łatwo przepłynąć.', 'Cargo holds that are easy to swim through.'], ['Dużo ryb i korali na burcie.', 'Lots of fish and coral on the hull.']],
    warn: ['Zapytaj przewodnika, który wrak nazywa Morazanem. Każda baza może mieć inaczej.', 'Ask your guide which wreck they call Morazan. It differs between dive centres.'],
    src: [CORON_SRC, 'https://en.wikipedia.org/wiki/Ekkai_Maru', SCUBATECH_SRC] },

  { id: 'ekkai', names: ['ekkai'], kind: 'wreck', depth: null, lie: null,
    facts: [['Typ', 'Type', 'nazwa używana dla różnych wraków', 'a name used for different wrecks']],
    story: ['Ekkai Maru to dawny brytyjski Manco z 1908 roku, potem Morazan, od 1942 statek japoński. Według badacza Petera Heimstaedta zatonął w Manili 22 września 1944. W Coron tą nazwą bazy określają różne wraki, między innymi Kogyo Maru. Na briefingu zapytaj, który wrak macie w planie, i wpisz to w notatkach poniżej.',
      'Ekkai Maru was the British Manco of 1908, later Morazan, Japanese from 1942. According to researcher Peter Heimstaedt she sank in Manila on 22 September 1944. In Coron dive centres use the name for different wrecks, the Kogyo Maru among them. Ask at the briefing which wreck you are diving and put it in your notes below.'],
    see: [], warn: ['', ''], src: [CORON_SRC, 'https://en.wikipedia.org/wiki/Ekkai_Maru'] },

  { id: 'kyokuzan', names: ['kyokuzan'], kind: 'wreck', depth: [22, 40], lie: 'upright',
    facts: [['Typ', 'Type', 'statek towarowy armii japońskiej', 'Japanese Army cargo ship'], ['Długość', 'Length', 'ok. 135 m', 'about 135 m'],
      ['Zatonął', 'Sunk', '24.09.1944', '24 Sep 1944']],
    story: ['Stał z dwoma innymi statkami w małej zatoce na północy Busuangi, z dala od reszty floty, i jego załoga czuła się bezpiecznie. Zaatakowało go 10 bombowców z lotniskowca USS Lexington, każdy z bombą 450 kg. Wrak jest jednak prawie nienaruszony, a żurawiki szalup są wysunięte. Dlatego badacze uważają, że załoga sama zatopiła statek i uciekła. To jedna z zagadek Coron.',
      'She lay with two other ships in a small bay on the north of Busuanga, away from the rest of the fleet, and her crew felt safe. Ten bombers from USS Lexington attacked, each with a 1,000-pound bomb. Yet the wreck is almost intact and the lifeboat davits are swung out, so researchers think the crew scuttled her and left. One of the riddles of Coron.'],
    see: [['Stoi prosto, pokład na 22–28 m.', 'She sits upright, the deck at 22–28 m.'],
      ['W ładowniach samochody i ciężarówki armii japońskiej.', 'Japanese Army cars and trucks in the holds.'],
      ['Wysunięte żurawiki szalup: ślad, że załoga uciekła.', 'The swung-out lifeboat davits: a sign the crew got away.'],
      ['Często ponad 20 m widoczności.', 'Often over 20 m visibility.']],
    warn: ['Daleko od reszty wraków, zwykle cały dzień na łodzi. Weź coś ciepłego na powrót.', 'Far from the other wrecks, usually a full day on the boat. Bring something warm for the ride back.'],
    src: [CORON_SRC, SCUBATECH_SRC] },

  { id: 'lusong', names: ['lusong'], kind: 'wreck', depth: [0, 10], lie: 'upright',
    facts: [['Typ', 'Type', 'kanonierka lub ścigacz okrętów podwodnych', 'gunboat or submarine chaser'], ['Długość', 'Length', 'ok. 25 m', 'about 25 m']],
    story: ['Mała kanonierka, którą amerykański pilot ostrzelał, gdy płynęła blisko Concepcion. Uszkodzona setkami pocisków osiadła na płyciźnie przy południowym krańcu wyspy Lusong. Rufa jest tuż pod powierzchnią, więc widać ją nawet z łodzi.',
      'A small gunboat strafed by a US pilot while cruising near Concepcion. Disabled by hundreds of bullets, she was beached in the shallows at the southern tip of Lusong Island. The stern is just below the surface, so you can see it from the boat.'],
    see: [['Wrak porośnięty koralem, dużo ryb rafowych.', 'The wreck is covered in coral, with lots of reef fish.'], ['Ogród koralowy obok.', 'A coral garden next to it.']],
    warn: ['', ''], src: [CORON_SRC, 'https://pacificwrecks.com/location/philippines_coron_bay.html'] },

  { id: 'tangat', names: ['east tangat', 'tangat'], kind: 'wreck', depth: [10, 22], lie: null,
    facts: [['Typ', 'Type', 'prawdopodobnie ścigacz okrętów podwodnych', 'probably a submarine chaser']],
    story: ['Rano 24 września 1944 na zachód od wyspy Coron patrolowały trzy japońskie ścigacze okrętów podwodnych. Amerykańskie myśliwce ostrzelały je i dwa zatonęły. Według badacza Petera Heimstaedta jeden z nich mógł jeszcze doczołgać się do wyspy Tangat i osiąść między Tangat a wyspą Apo. To jest właśnie wrak East Tangat.',
      'On the morning of 24 September 1944 three Japanese submarine chasers were patrolling west of Coron Island. US fighters strafed them and two sank. According to researcher Peter Heimstaedt, one of them may have crept to Tangat Island and run aground between Tangat and Apo Island. That is the East Tangat wreck.'],
    see: [['Mały wrak porośnięty koralem, dobry do zdjęć.', 'A small coral-covered wreck, good for photos.']],
    warn: ['', ''], src: [CORON_SRC, 'https://pacificwrecks.com/location/philippines_coron_bay.html'] },

  { id: 'skeleton', names: ['skeleton'], kind: 'wreck', depth: [5, 20], lie: null,
    facts: [['Typ', 'Type', 'nieznany, może ścigacz okrętów podwodnych', 'unknown, maybe a submarine chaser']],
    story: ['Z tego statku został tylko szkielet: wręgi i stępka. Nikt nie wie na pewno, co to był za statek. Badacz Peter Heimstaedt uważa, że to może być jeden z japońskich ścigaczy zatopionych przez amerykańskie myśliwce 24 września 1944 przy wyspie Coron. Leży płytko przy Balolo Point.',
      'Only the skeleton of this ship is left: the frames and keel. Nobody knows for sure what ship she was. Researcher Peter Heimstaedt thinks she may be one of the Japanese submarine chasers sunk by US fighters off Coron Island on 24 September 1944. She lies shallow at Balolo Point.'],
    see: [['Wręgi jak żebra wieloryba, dobre do zdjęć pod światło.', "Frames like a whale's ribs, great for photos against the light."]],
    warn: ['', ''], src: [CORON_SRC, 'https://pacificwrecks.com/location/philippines_coron_bay.html'] },

  { id: 'nanshin', names: ['nanshin', 'black island'], kind: 'wreck', depth: [21, 32], lie: 'upright',
    facts: [['Typ', 'Type', 'mały tankowiec, tożsamość niepewna', 'a small tanker, identity uncertain'], ['Długość', 'Length', 'ok. 45–50 m', 'about 45–50 m']],
    story: ['Mały tankowiec przy Black Island (Malajon) na północ od Busuangi. Japończycy mieli kilka statków o nazwie Nanshin Maru, więc nie wiadomo na pewno, który to z nich. Niektóre źródła twierdzą nawet, że to tankowiec zatopiony przez tajfun już po wojnie.',
      'A small tanker off Black Island (Malajon), north of Busuanga. The Japanese had several ships named Nanshin Maru, so nobody knows for sure which one this is. Some sources even say she is a tanker sunk by a typhoon after the war.'],
    see: [['Stoi prosto na piasku, cały wrak widać w jednym nurkowaniu.', 'She sits upright on sand, and you can see the whole wreck in one dive.']],
    warn: ['', ''], src: ['https://www.proscubadiver.net/?p=342090', 'https://pacificwrecks.com/location/philippines_coron_bay.html'] },

  { id: 'barracuda', names: ['barracuda'], kind: 'lake', depth: [0, 30], lie: null,
    facts: [['Typ', 'Type', 'jezioro w skałach wapiennych wyspy Coron', 'a lake in the limestone of Coron Island'], ['Woda', 'Water', 'słodka na wierzchu, słona niżej', 'fresh on top, salt below']],
    story: ['Tu nie ma wraku. Jezioro otaczają wapienne skały, a do wody wchodzi się po kamieniach ze sprzętem. Na wierzchu leży chłodniejsza, prawie słodka woda, a pod nią cieplejsza słona. Mniej więcej na 14 m przechodzisz przez granicę warstw: obraz faluje, a woda nagle robi się bardzo ciepła, według relacji nurków do około 38 °C.',
      'No wreck here. The lake is ringed by limestone cliffs, and you climb over rocks with your gear to get in. Cooler, almost fresh water lies on top, with warmer salt water below. At roughly 14 m you pass through the boundary: the view shimmers and the water suddenly turns very warm, up to about 38 °C by divers\' accounts.'],
    see: [['Granica słodkiej i słonej wody, którą widać jak mgłę.', 'The fresh/salt boundary, which you can see like a haze.'], ['Formacje skalne pod wodą.', 'Rock formations underwater.']],
    warn: ['Słodka woda zmienia pływalność: przed nurkowaniem sprawdź balast.', 'Fresh water changes your buoyancy: check your weights before the dive.'],
    src: ['https://scubadiverlife.com/diving-barracuda-lake/', 'https://www.scuba.com/blog/natural-dichotomy-barracuda-lake/'] },
];

function siteLib(name) {
  const n = norm(name);
  if (!n) return null;
  return SITE_LIB.find(s => s.names.some(k => n.startsWith(k) || n.includes(' ' + k) || (k.length >= 5 && n.split(' ')[0].startsWith(k.slice(0, 5))))) || null;
}
const siteNoteKey = name => norm(name).replace(/ /g, '_').slice(0, 60);

// --- which sites are planned for which day ---
function tripDayAt(t, ms) {
  const d1 = t && t.program && (t.program.days || []).length ? programDay1(t) : null;
  if (d1 == null) return null;
  const n = Math.round((new Date(new Date(ms).toDateString()).getTime() - d1) / dayMs) + 1;
  return (t.program.days || []).find(d => d.n === n) || null;
}
function sitePlanEntry(t, name) {
  const lib = siteLib(name);
  return (t.plan || []).find(p => norm(p.name) === norm(name) || (lib && siteLib(p.name) === lib)) || null;
}
function siteDepth(t, name) {
  const p = sitePlanEntry(t, name), lib = siteLib(name);
  if (p && p.depth) return [p.min != null ? +p.min : null, +p.depth];
  return lib && lib.depth ? lib.depth : null;
}
// The server sends the morning briefing; it needs day 1 of the program (arrival), which the app knows
function briefSyncDay1(t) {
  if (!t || !t.program || !(t.program.days || []).length || !currentTripId) return;
  const d1 = programDay1(t);
  if (d1 == null) return;
  const iso = new Date(d1 - new Date(d1).getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (t.program.day1 !== iso) tripRef().update({ 'program.day1': iso }).catch(() => {});
}

// --- Home: today's dives, only on dive days of the active trip ---
function homeBriefTile() {
  const t = currentTrip;
  if (!t) return '';
  briefSyncDay1(t);
  const day = tripDayAt(t, Date.now());
  if (!day || !(day.sites || []).length) return '';
  return `<section class="tile tile-brief" onclick="briefOpenToday()">
    <small>🤿 ${TL('Dziś nurkujesz', 'Diving today')} · ${TL('dzień', 'day')} ${day.n}</small>
    <b>${day.sites.map(esc).join(' · ')}</b>
    <span>${day.sites.map(s => { const d = siteDepth(t, s); return d ? `${d[0] != null ? d[0] + '–' : ''}${d[1]} m` : '—'; }).join(' · ')}</span>
    <span class="tb-go">${TL('Odprawa i historia', 'Briefing and history')} →</span>
  </section>`;
}
function openBriefDay(n, i) {
  const day = currentTrip && ((currentTrip.program || {}).days || []).find(d => d.n === n);
  if (day) openBrief(day.sites, i, day);
}
function briefOpenToday(tries = 0) {
  const day = currentTrip && tripDayAt(currentTrip, Date.now());
  if (!currentTrip && tries < 20) { setTimeout(() => briefOpenToday(tries + 1), 400); return; }
  if (day && (day.sites || []).length) openBrief(day.sites, 0, day);
}

// --- the briefing card ---
function briefDepthSVG(depth, lib) {
  const top = depth && depth[0] != null ? depth[0] : 0, bot = depth ? depth[1] : 0;
  const max = Math.max(45, Math.ceil((bot + 5) / 5) * 5), H = 220, y = m => 14 + m / max * (H - 28);
  const ticks = []; for (let m = 0; m <= max; m += 10) ticks.push(m);
  // a ship in side view across the band, bow to the right; lying on its side it shows no superstructure
  const ship = lib && lib.kind === 'wreck', yt = y(top), yb = y(bot), h = Math.max(10, yb - yt);
  const deck = yb - h * .55, onSide = lib && (lib.lie === 'port' || lib.lie === 'starboard');
  const shape = !ship ? '' : `<path d="M62 ${deck} L236 ${deck - 4} L222 ${yb - 2} L76 ${yb - 2} Z" class="bd-ship"/>`
    + (onSide ? '' : `<path d="M140 ${deck} v-${h * .3} h34 v${h * .3} M188 ${deck - 2} v-${h * .2} h10 v${h * .2} M96 ${deck} v-${h * .18} h16 v${h * .18}" class="bd-ship"/>`);
  return `<svg viewBox="0 0 260 ${H}" class="brief-depth" role="img" aria-label="${top}–${bot} m">
    <defs><linearGradient id="bdsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a9fd8" stop-opacity=".55"/><stop offset="1" stop-color="#04182e" stop-opacity=".9"/></linearGradient></defs>
    <rect x="40" y="14" width="210" height="${H - 28}" rx="10" fill="url(#bdsea)"/>
    ${ticks.map(m => `<line x1="40" x2="250" y1="${y(m)}" y2="${y(m)}" class="bd-tick"/><text x="32" y="${y(m) + 4}" class="bd-lab">${m}</text>`).join('')}
    ${depth ? `<rect x="40" y="${y(top)}" width="210" height="${Math.max(3, y(bot) - y(top))}" class="bd-band"/>${shape}
      <text x="244" y="${y(top) + 14}" class="bd-val" text-anchor="end">${top} m</text><text x="244" y="${y(bot) - 6}" class="bd-val" text-anchor="end">${bot} m</text>` : ''}
    <path d="M40 ${H - 14} q50 -8 105 -2 t105 -4 v6 h-210 z" class="bd-floor"/>
  </svg>`;
}
function briefPlanHTML(depth) {
  if (!depth || typeof limitsAt !== 'function') return '';
  const d = Math.round(depth[1]);
  const keep = planner.o2;
  const air = (planner.o2 = 21, limitsAt(d));
  const mix = bestMix(d);
  const nx = mix > 21 ? (planner.o2 = mix, limitsAt(d)) : null;
  planner.o2 = keep;
  const t = v => v === Infinity ? '200+' : v;
  const row = (name, r) => `<div><b>${t(r.max)} min</b><small>${name}: NDL ${t(r.ndl)} · ${TL('gaz', 'gas')} ${r.gas} min</small></div>`;
  return `<div class="brief-sec">⏱ ${TL('Plan na najgłębszy punkt', 'Plan for the deepest point')}: ${d} m</div>
    <div class="brief-plan">${row(TL('Powietrze', 'Air'), air)}${nx ? row('EAN' + mix, nx) : ''}</div>
    <p class="brief-note">${TL(`Butla ${fmt1(planner.tank)} L, ${planner.start} bar, SAC ${fmt1(plannerSac())} L/min. Czas na dnie do rozpoczęcia wynurzania. Słuchaj komputera i przewodnika.`,
      `${fmt1(planner.tank)} L tank, ${planner.start} bar, SAC ${fmt1(plannerSac())} L/min. Bottom time until you start up. Follow your computer and guide.`)}</p>
    <button class="chip-btn" onclick="briefClose(); planAtDepth(${d})">${TL('Otwórz w kalkulatorze', 'Open in the planner')}</button>`;
}
function briefCardHTML(name, day) {
  const t = currentTrip || {}, lib = siteLib(name), depth = siteDepth(t, name);
  const pl = lang === 'pl' ? 0 : 1;
  const note = (t.siteNotes || {})[siteNoteKey(name)] || '';
  const when = day && programDay1(t) != null ? new Date(programDay1(t) + (day.n - 1) * dayMs).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
  const facts = lib ? lib.facts.map(f => [f[pl], f[2 + pl]]) : [];
  const warn = lib && lib.warn && lib.warn[pl];
  return `<article class="brief-card">
    <div class="brief-eyebrow">${TL('Odprawa', 'Briefing')}${day ? ` · ${TL('dzień', 'day')} ${day.n}` : ''}${when ? ' · ' + when : ''}</div>
    <h2 class="brief-name">${esc(name)}</h2>
    ${facts.length ? `<div class="brief-sub">${esc(facts[0][1])}</div>` : ''}
    <div class="brief-top">${briefDepthSVG(depth, lib)}
      <div class="brief-facts">${facts.slice(1).map(f => `<div><small>${esc(f[0])}</small><b>${esc(f[1])}</b></div>`).join('')}
        ${depth ? `<div><small>${TL('Głębokość', 'Depth')}</small><b>${depth[0] != null ? depth[0] + '–' : ''}${depth[1]} m</b></div>` : ''}
        ${lib && lib.lie ? `<div><small>${TL('Leży', 'Lies')}</small><b>${{ upright: TL('prosto, na stępce', 'upright'), port: TL('na lewej burcie', 'on her port side'), starboard: TL('na prawej burcie', 'on her starboard side') }[lib.lie]}</b></div>` : ''}</div></div>
    ${lib ? `<div class="brief-sec">📜 ${TL('Historia', 'The story')}</div><p class="brief-story">${esc(lib.story[pl])}</p>` : ''}
    ${lib && lib.see.length ? `<div class="brief-sec">👀 ${TL('Co zobaczysz', 'What you will see')}</div><ul class="brief-see">${lib.see.map(s => `<li>${esc(s[pl])}</li>`).join('')}</ul>` : ''}
    ${warn ? `<p class="brief-warn">⚠️ ${esc(warn)}</p>` : ''}
    ${briefPlanHTML(depth)}
    <div class="brief-sec">✍️ ${TL('Moje notatki', 'My notes')}</div>
    <textarea class="edit-input brief-notes" rows="3" placeholder="${TL('Co mówił przewodnik, co widziałeś, co chcesz zapamiętać…', 'What the guide said, what you saw, what to remember…')}"
      oninput="briefSaveNote(${esc(JSON.stringify(name))}, this.value)">${esc(note)}</textarea>
    ${!lib ? `<p class="brief-note">${TL('Tego miejsca nie ma jeszcze w bibliotece historii. Plan i notatki działają.', 'This site is not in the history library yet. The plan and notes work.')}</p>` : ''}
    ${lib ? `<p class="brief-src">${TL('Źródła', 'Sources')}: ${lib.src.map((u, i) => `<a href="${esc(u)}" target="_blank" rel="noopener">${i + 1}</a>`).join(' · ')}</p>` : ''}
  </article>`;
}
let briefNoteTimer = null;
function briefSaveNote(name, text) {
  clearTimeout(briefNoteTimer);
  briefNoteTimer = setTimeout(() => {
    if (!currentTripId) return;
    tripRef().update({ ['siteNotes.' + siteNoteKey(name)]: text.slice(0, 4000) }).catch(e => showToast('❌ ' + e.message));
  }, 700);
}

function openBrief(names, at = 0, day = null) {
  if (typeof names === 'string') names = [names];
  if (!names.length || document.querySelector('.brief-view')) return;
  const ov = document.createElement('div');
  ov.className = 'brief-view';
  ov.innerHTML = `<div class="brief-bar">${names.length > 1 ? names.map((n, i) => `<button data-i="${i}" class="${i === at ? 'on' : ''}">${esc(n)}</button>`).join('') : ''}
      <button class="brief-x" aria-label="${TL('Zamknij', 'Close')}">✕</button></div>
    <div class="brief-scroll">${briefCardHTML(names[at], day)}</div>`;
  document.body.appendChild(ov);
  document.body.classList.add('modal-open');
  const scroll = ov.querySelector('.brief-scroll');
  ov.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('brief-x')) return briefClose();
    if (b.dataset.i != null) {
      ov.querySelectorAll('.brief-bar [data-i]').forEach(x => x.classList.toggle('on', x === b));
      scroll.innerHTML = briefCardHTML(names[+b.dataset.i], day);
      scroll.scrollTo(0, 0);
    }
  });
  requestAnimationFrame(() => ov.classList.add('on'));
}
function briefClose() {
  const ov = document.querySelector('.brief-view');
  if (!ov) return;
  document.body.classList.remove('modal-open');
  ov.classList.remove('on');
  setTimeout(() => ov.remove(), 250);
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') briefClose(); });
