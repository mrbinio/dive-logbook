"""Push notifications for the dive logbook (Web Push, VAPID).

Every 15 minutes, for each user who turned notifications on:
  * "OK to fly" once the no-fly time after the last dive has passed
    (same rule as DiveTools.surfaceStatus: DAN 12 / 18 / 24 h);
  * reminders for gear service and important dates at 14 days, 3 days and on
    the day / overdue, sent between 08:00 and 21:00 in the user's time zone;
  * for the active trip: a countdown (14, 7, 3, 1 days and the first day),
    the last time to surface before a flight or a high mountain road on the
    way back (trip.legs, or the older trip.flight), and a summary the day after
    the trip ends.
Every message carries the tab to open and the number of overdue reminders
for the app icon badge.

Subscriptions live in users/{uid}/push/{id} ({subscription, tz, lang});
what was already sent is kept in users/{uid}/meta/push.
"""
import json
import os
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from firebase_admin import firestore, initialize_app
from firebase_functions import https_fn, scheduler_fn
from firebase_functions.params import SecretParam
from pywebpush import WebPushException, webpush

initialize_app()
VAPID_PRIVATE_KEY = SecretParam('VAPID_PRIVATE_KEY')
VAPID_CLAIMS = {'sub': 'mailto:noreply@dive-logbook-c0b37.web.app'}
APP_URL = 'https://dive-logbook-c0b37.web.app/'

TEXT = {
    'pl': {
        'fly_t': '✈️ Możesz już lecieć', 'fly_b': 'Minęło {h} h od wynurzenia · {dive}. Bezpiecznej podróży!',
        'rem_soon': '{title} — za {n} dni', 'rem_today': '{title} — dziś', 'rem_over': '{title} — po terminie',
        'rem_b_soon': 'Termin: {date}. Dotknij, żeby zobaczyć szczegóły.', 'rem_b_today': 'Termin mija dziś ({date}).',
        'rem_b_over': 'Termin minął {date} — odnów jak najszybciej.',
        'service': 'serwis', 'medical': 'Badania lekarskie',
        'insurance': 'Ubezpieczenie (DAN)', 'other': 'Termin', 'test_t': '🤿 Powiadomienia działają',
        'test_b': 'Będę dawać znać: ✈️ kiedy możesz lecieć, 🔧 o serwisie sprzętu, 🌴 ile zostało do wyjazdu.',
        'trip': 'wyjazd', 'trip_t': '🌴 {site} za {n} dni', 'trip_t1': '🌴 {site} już jutro!',
        'trip_b': 'Spakowane {p}/{n}{plan}. Zajrzyj do checklisty.', 'trip_plan': ' · w planie {n} miejsc',
        'trip_b_empty': 'Czas zrobić checklistę i plan nurkowań.',
        'trip_t0': '🤿 Dziś startuje {site}!', 'trip_b0': 'Udanych nurkowań! Loguj każde nurkowanie — odhaczy się w planie.',
        'flight_t': '🛫 Lot {name}{when}', 'drive_t': '🚗 Przejazd {name}{when}',
        'drive_b': 'Trasa do {alt} m n.p.m. działa jak lot. Ostatnie wynurzenie najpóźniej {deadline} ({h} h).', 'flight_b': 'Ostatnie wynurzenie najpóźniej {deadline} (DAN: {h} h po nurkowaniu).',
        'flight_b_late': 'Od teraz już bez nurkowania — do lotu zostało {left} h.',
        'flight_warn_t': '⚠️ Zakaz lotu trwa dłużej niż do wyjazdu',
        'flight_warn_b': 'Możesz lecieć dopiero {fly}, a lot jest {when}. Sprawdź plan.',
        'sum_t': '📊 {site} — podsumowanie', 'sum_b': '{n} {dives} · {hrs} h pod wodą · najgłębiej {depth} m ({deep}).',
        'dives': lambda n: 'nurkowanie' if n == 1 else 'nurkowania' if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14) else 'nurkowań',
        'days': ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'niedz'],
    },
    'en': {
        'fly_t': '✈️ OK to fly', 'fly_b': '{h} h since you surfaced · {dive}. Safe travels!',
        'rem_soon': '{title} — in {n} days', 'rem_today': '{title} — today', 'rem_over': '{title} — overdue',
        'rem_b_soon': 'Due {date}. Tap for details.', 'rem_b_today': 'Due today ({date}).',
        'rem_b_over': 'It was due {date} — renew it soon.',
        'service': 'service', 'medical': 'Medical certificate',
        'insurance': 'Insurance (DAN)', 'other': 'Deadline', 'test_t': '🤿 Notifications work',
        'test_b': "I'll let you know: ✈️ when it's OK to fly, 🔧 about gear service, 🌴 how long until your trip.",
        'trip': 'Trip', 'trip_t': '🌴 {site} in {n} days', 'trip_t1': '🌴 {site} tomorrow!',
        'trip_b': '{p}/{n} packed{plan}. Check your list.', 'trip_plan': ' · {n} sites planned',
        'trip_b_empty': 'Time to make your checklist and dive plan.',
        'trip_t0': '🤿 {site} starts today!', 'trip_b0': 'Have great dives! Log each one — it ticks off your plan.',
        'flight_t': '🛫 Flight {name}{when}', 'drive_t': '🚗 Drive {name}{when}',
        'drive_b': 'A road up to {alt} m works like a flight. Surface for the last time by {deadline} ({h} h).', 'flight_b': 'Surface for the last time by {deadline} (DAN: {h} h after diving).',
        'flight_b_late': 'No more diving from now — {left} h to your flight.',
        'flight_warn_t': '⚠️ No-fly time runs past your departure',
        'flight_warn_b': "You can fly from {fly}, but your flight is {when}. Check your plans.",
        'sum_t': '📊 {site} — summary', 'sum_b': '{n} {dives} · {hrs} h underwater · deepest {depth} m ({deep}).',
        'dives': lambda n: 'dive' if n == 1 else 'dives',
        'days': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
}
ALT_LIMIT = 300   # m: a road this high after diving counts like a flight (same as trip.js)
EMOJI = {'service': '🔧', 'medical': '🩺', 'insurance': '🛡️', 'other': '📌'}


def fmt_when(dt, tx):
    return f"{tx['days'][dt.weekday()]} {dt.day}.{dt.month:02d} {dt:%H:%M}"


def fmt_day(d):
    return f'{d.day}.{d.month:02d}.{d.year}'


def num(x):
    try:
        return float(x or 0)
    except (TypeError, ValueError):
        return 0.0


def dive_label(d):
    depth = num(d.get('depth'))
    parts = [d.get('site') or d.get('location') or '', f'{depth:g} m' if depth else '',
             f"{num(d.get('duration')):g} min" if num(d.get('duration')) else '']
    return ', '.join(p for p in parts if p)


def dive_end(d, tz):
    """End of a dive as an aware datetime, and whether the start was estimated."""
    dur = timedelta(minutes=float(d.get('duration') or 0))
    start = d.get('startTime')
    if start:
        try:
            t = datetime.fromisoformat(str(start).replace('Z', '+00:00'))
            return (t if t.tzinfo else t.replace(tzinfo=tz)) + dur, False
        except ValueError:
            pass
    date = d.get('date')
    if date and d.get('time'):
        try:
            return datetime.fromisoformat(f"{date}T{d['time']}").replace(tzinfo=tz) + dur, False
        except ValueError:
            pass
    if date:
        try:   # date only: assume the dive ended at 23:59 that day (safe side)
            return datetime.fromisoformat(f'{date}T23:59').replace(tzinfo=tz), True
        except ValueError:
            pass
    return None, True


def surface_status(dives, tz, now):
    ends = sorted(((dive_end(d, tz)[0], d) for d in dives), key=lambda x: x[0] or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    ends = [e for e in ends if e[0]]
    if not ends:
        return None
    last_end, last = ends[0]
    since = now - last_end
    if since < timedelta(0) or since > timedelta(hours=48):
        return None
    recent = [e for e in ends if last_end - e[0] < timedelta(hours=30)]
    deco = any(e[1].get('minNDL') == 0 for e in recent)
    hours = 24 if deco else 18 if len(recent) > 1 else 12
    return {'dive': last, 'fly_at': last_end + timedelta(hours=hours), 'hours': hours}


def due_items(gear, reminders, today):
    out = []
    for g in gear:
        if not g.get('lastService') or not g.get('intervalMonths'):
            continue
        try:
            last = datetime.fromisoformat(g['lastService']).date()
        except ValueError:
            continue
        m = last.month - 1 + int(g['intervalMonths'])
        y, m = last.year + m // 12, m % 12 + 1
        day = min(last.day, [31, 29 if y % 4 == 0 and (y % 100 or y % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1])
        nxt = last.replace(year=y, month=m, day=day)
        out.append({'key': 'g:' + g['id'], 'kind': 'service', 'title': g.get('name') or '', 'left': (nxt - today).days, 'date': nxt})
    for r in reminders:
        try:
            exp = datetime.fromisoformat(r.get('expires') or '').date()
        except ValueError:
            continue
        out.append({'key': 'r:' + r['id'], 'kind': r.get('kind') or 'other', 'title': r.get('title') or '', 'left': (exp - today).days, 'date': exp})
    return out


def level_of(left):
    return 'over' if left < 0 else 'today' if left == 0 else '3' if left <= 3 else '14' if left <= 14 else None


def parse_day(s):
    try:
        return datetime.fromisoformat(str(s)[:10]).date()
    except ValueError:
        return None


def trip_messages(db, uid, tx, now, dives, st, sent):
    """Countdown, flight and summary messages for the user's active trip."""
    trip = next((t for t in db.collection('trips').where('members', 'array_contains', uid).stream()
                 if (t.to_dict() or {}).get('active')), None)
    if not trip:
        return []
    t, tid, out = trip.to_dict(), trip.id, []
    site = t.get('site') or tx['trip']
    start, end = parse_day(t.get('date')), parse_day(t.get('end'))
    today = now.date()

    def once(key, msg):
        k = f'{tid}:{key}'
        if not sent.get(k):
            sent[k] = True
            out.append(msg)

    if start:
        days = (start - today).days
        if days in (14, 7, 3, 1):
            items = (t.get('shared') or []) + ((t.get('personal') or {}).get(uid) or [])
            plan = len(t.get('plan') or [])
            body = tx['trip_b'].format(p=sum(1 for i in items if i.get('checked')), n=len(items),
                                       plan=tx['trip_plan'].format(n=plan) if plan else '') if items else tx['trip_b_empty']
            once(f'c{days}', {'title': (tx['trip_t1'] if days == 1 else tx['trip_t']).format(site=site, n=days),
                              'body': body, 'tag': 'trip', 'url': APP_URL + '?tab=checklist'})
        elif days == 0:
            once('c0', {'title': tx['trip_t0'].format(site=site), 'body': tx['trip_b0'], 'tag': 'trip', 'url': APP_URL + '?tab=checklist'})

    # Flights and high roads after diving on this trip (outbound legs come before any dive)
    legs = list(t.get('legs') or [])
    if t.get('flight') and not any(l.get('dep') == t['flight'] for l in legs):
        legs.append({'mode': 'plane', 'dep': t['flight']})
    trip_ends = [e for e, _ in (dive_end(d, now.tzinfo) for d in dives if start and parse_day(d.get('date')) and parse_day(d.get('date')) >= start) if e]
    for leg in legs:
        if not (leg.get('mode') == 'plane' or (leg.get('mode') == 'car' and num(leg.get('alt')) >= ALT_LIMIT)):
            continue
        try:
            dep = datetime.fromisoformat(leg.get('dep') or '').replace(tzinfo=now.tzinfo)
        except ValueError:
            continue
        if not (timedelta(0) < dep - now <= timedelta(hours=48)) or not any(e < dep for e in trip_ends):
            continue
        when = fmt_when(dep, tx)
        name = ' → '.join(x for x in (leg.get('from'), leg.get('to')) if x)
        name = name + ' · ' if name else ''
        key = leg['dep'] + (leg.get('mode') or '')
        hours = 24 if any(d.get('minNDL') == 0 for d in dives[:6]) else 18
        deadline = dep - timedelta(hours=hours)
        if st and st['fly_at'] > dep:
            once('fw' + key, {'title': tx['flight_warn_t'], 'body': tx['flight_warn_b'].format(fly=fmt_when(st['fly_at'], tx), when=when),
                              'tag': 'flight', 'url': APP_URL + '?tab=checklist'})
        elif leg.get('mode') == 'car':
            once('f' + key, {'title': tx['drive_t'].format(name=name, when=when), 'tag': 'flight', 'url': APP_URL + '?tab=checklist',
                             'body': tx['drive_b'].format(alt=int(num(leg.get('alt'))), deadline=fmt_when(deadline, tx), h=hours) if now < deadline
                             else tx['flight_b_late'].format(left=int((dep - now).total_seconds() // 3600))})
        else:
            body = (tx['flight_b'].format(deadline=fmt_when(deadline, tx), h=hours) if now < deadline
                    else tx['flight_b_late'].format(left=int((dep - now).total_seconds() // 3600)))
            once('f' + key, {'title': tx['flight_t'].format(name=name, when=when), 'body': body, 'tag': 'flight', 'url': APP_URL + '?tab=checklist'})

    if start and end and (today - end).days == 1:
        on_trip = [d for d in dives if (lambda x: x and start <= x <= end)(parse_day(d.get('date')))]
        if on_trip:
            deep = max(on_trip, key=lambda d: num(d.get('depth')))
            hrs = round(sum(num(d.get('duration')) for d in on_trip) / 60, 1)
            once('sum', {'title': tx['sum_t'].format(site=site),
                         'body': tx['sum_b'].format(n=len(on_trip), dives=tx['dives'](len(on_trip)),
                                                    hrs=f'{hrs:g}'.replace('.', ',' if tx is TEXT['pl'] else '.'), depth=f"{num(deep.get('depth')):g}",
                                                    deep=deep.get('site') or deep.get('location') or ''),
                         'tag': 'trip', 'url': APP_URL + '?tab=checklist'})
    return out


def send(sub_ref, sub, payload):
    try:
        webpush(subscription_info=sub['subscription'], data=json.dumps(payload),
                vapid_private_key=VAPID_PRIVATE_KEY.value, vapid_claims=dict(VAPID_CLAIMS), ttl=6 * 3600)
        return True
    except WebPushException as e:
        status = getattr(e.response, 'status_code', None)
        if status in (404, 410):          # subscription is gone (app removed / permission revoked)
            sub_ref.delete()
        print('push failed', status, str(e)[:200])
        return False


def notify_user(db, uid, subs, now_utc):
    tz = ZoneInfo(subs[0][1].get('tz') or 'Europe/Stockholm')
    lang = subs[0][1].get('lang') if subs[0][1].get('lang') in TEXT else 'pl'
    tx = TEXT[lang]
    now = now_utc.astimezone(tz)
    user = db.collection('users').document(uid)
    meta_ref = user.collection('meta').document('push')
    meta = (meta_ref.get().to_dict() or {})
    messages, changes = [], {}

    dives = [dict(x.to_dict(), id=x.id) for x in user.collection('dives').order_by('date', direction=firestore.Query.DESCENDING).limit(80).stream()]
    st = surface_status(dives, tz, now)
    if st and now >= st['fly_at'] and now - st['fly_at'] < timedelta(hours=6):
        key = f"{st['dive']['id']}|{st['fly_at'].isoformat()}"
        if meta.get('flySent') != key:
            messages.append({'title': tx['fly_t'], 'body': tx['fly_b'].format(h=st['hours'], dive=dive_label(st['dive'])), 'tag': 'fly', 'url': APP_URL + '?tab=history'})
            changes['flySent'] = key

    gear = [dict(x.to_dict(), id=x.id) for x in user.collection('gear').stream()]
    rems = [dict(x.to_dict(), id=x.id) for x in user.collection('reminders').stream()]
    due = due_items(gear, rems, now.date())
    if 8 <= now.hour < 21:
        sent = dict(meta.get('remSent') or {})
        for it in due:
            lvl = level_of(it['left'])
            if not lvl or sent.get(it['key']) == lvl:
                continue
            title = (it['title'] + ' · ' + tx['service']) if it['kind'] == 'service' else (it['title'] or tx.get(it['kind'], tx['other']))
            head = tx['rem_over'] if lvl == 'over' else tx['rem_today'] if lvl == 'today' else tx['rem_soon']
            body = tx['rem_b_over'] if lvl == 'over' else tx['rem_b_today'] if lvl == 'today' else tx['rem_b_soon']
            messages.append({'title': EMOJI.get(it['kind'], EMOJI['other']) + ' ' + head.format(title=title, n=it['left']),
                             'body': body.format(date=fmt_day(it['date'])), 'tag': it['key'], 'url': APP_URL + '?tab=gear'})
            sent[it['key']] = lvl
        if sent != (meta.get('remSent') or {}):
            changes['remSent'] = sent

        trip_sent = dict(meta.get('tripSent') or {})
        messages += trip_messages(db, uid, tx, now, dives, st, trip_sent)
        if trip_sent != (meta.get('tripSent') or {}):
            changes['tripSent'] = trip_sent

    badge = sum(1 for it in due if it['left'] <= 0)
    for msg in messages:
        msg.setdefault('url', APP_URL)
        msg['badge'] = badge
        for ref, sub in subs:
            send(ref, sub, msg)
    if changes:
        meta_ref.set(changes, merge=True)
    return len(messages)


@scheduler_fn.on_schedule(schedule='every 15 minutes', secrets=[VAPID_PRIVATE_KEY], timeout_sec=120, memory=256)
def notify(event):
    db = firestore.client()
    by_user = {}
    for doc in db.collection_group('push').stream():
        uid = doc.reference.parent.parent.id
        by_user.setdefault(uid, []).append((doc.reference, doc.to_dict()))
    now = datetime.now(timezone.utc)
    for uid, subs in by_user.items():
        try:
            n = notify_user(db, uid, subs, now)
            if n:
                print(f'{uid[:6]}: sent {n}')
        except Exception as e:  # one user's problem never stops the others
            print('notify error', uid[:6], repr(e)[:200])


@https_fn.on_call(secrets=[VAPID_PRIVATE_KEY], memory=256)
def test_push(req: https_fn.CallableRequest):
    """'Send a test' button in the app: one push to the caller's own devices."""
    if not req.auth:
        raise https_fn.HttpsError('unauthenticated', 'Sign in first')
    db = firestore.client()
    subs = [(d.reference, d.to_dict()) for d in db.collection('users').document(req.auth.uid).collection('push').stream()]
    lang = (subs[0][1].get('lang') if subs else 'pl') or 'pl'
    tx = TEXT.get(lang, TEXT['pl'])
    ok = sum(send(ref, sub, {'title': tx['test_t'], 'body': tx['test_b'], 'tag': 'test', 'url': APP_URL + '?tab=gear'}) for ref, sub in subs)
    return {'devices': len(subs), 'sent': ok}
