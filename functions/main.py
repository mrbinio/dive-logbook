"""Push notifications for the dive logbook (Web Push, VAPID).

Every 15 minutes, for each user who turned notifications on:
  * "OK to fly" once the no-fly time after the last dive has passed
    (same rule as DiveTools.surfaceStatus: DAN 12 / 18 / 24 h);
  * reminders for gear service and important dates at 14 days, 3 days and on
    the day / overdue, sent between 08:00 and 21:00 in the user's time zone.

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
        'fly_t': 'Możesz już lecieć ✈️', 'fly_b': 'Minęło {h} h od nurkowania {site}.',
        'rem_soon': '{title} — za {n} dni', 'rem_today': '{title} — dziś', 'rem_over': '{title} — po terminie',
        'rem_b': 'Sprawdź w aplikacji: Sprzęt → Ważne daty.', 'service': 'serwis', 'medical': 'Badania lekarskie',
        'insurance': 'Ubezpieczenie (DAN)', 'other': 'Termin', 'test_t': 'Powiadomienia działają 🤿',
        'test_b': 'Tak będą wyglądać przypomnienia z Twojego logbooka.',
    },
    'en': {
        'fly_t': 'OK to fly ✈️', 'fly_b': '{h} h have passed since your dive at {site}.',
        'rem_soon': '{title} — in {n} days', 'rem_today': '{title} — today', 'rem_over': '{title} — overdue',
        'rem_b': 'Check the app: Gear → Important dates.', 'service': 'service', 'medical': 'Medical certificate',
        'insurance': 'Insurance (DAN)', 'other': 'Deadline', 'test_t': 'Notifications work 🤿',
        'test_b': 'This is how your logbook reminders will look.',
    },
}


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
        out.append({'key': 'g:' + g['id'], 'kind': 'service', 'title': g.get('name') or '', 'left': (nxt - today).days})
    for r in reminders:
        try:
            exp = datetime.fromisoformat(r.get('expires') or '').date()
        except ValueError:
            continue
        out.append({'key': 'r:' + r['id'], 'kind': r.get('kind') or 'other', 'title': r.get('title') or '', 'left': (exp - today).days})
    return out


def level_of(left):
    return 'over' if left < 0 else 'today' if left == 0 else '3' if left <= 3 else '14' if left <= 14 else None


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

    dives = [dict(x.to_dict(), id=x.id) for x in user.collection('dives').order_by('date', direction=firestore.Query.DESCENDING).limit(40).stream()]
    st = surface_status(dives, tz, now)
    if st and now >= st['fly_at'] and now - st['fly_at'] < timedelta(hours=6):
        key = f"{st['dive']['id']}|{st['fly_at'].isoformat()}"
        if meta.get('flySent') != key:
            messages.append({'title': tx['fly_t'], 'body': tx['fly_b'].format(h=st['hours'], site=st['dive'].get('site') or ''), 'tag': 'fly'})
            changes['flySent'] = key

    if 8 <= now.hour < 21:
        gear = [dict(x.to_dict(), id=x.id) for x in user.collection('gear').stream()]
        rems = [dict(x.to_dict(), id=x.id) for x in user.collection('reminders').stream()]
        sent = dict(meta.get('remSent') or {})
        for it in due_items(gear, rems, now.date()):
            lvl = level_of(it['left'])
            if not lvl or sent.get(it['key']) == lvl:
                continue
            title = (it['title'] + ' · ' + tx['service']) if it['kind'] == 'service' else (it['title'] or tx.get(it['kind'], tx['other']))
            head = tx['rem_over'] if lvl == 'over' else tx['rem_today'] if lvl == 'today' else tx['rem_soon']
            messages.append({'title': head.format(title=title, n=it['left']), 'body': tx['rem_b'], 'tag': it['key']})
            sent[it['key']] = lvl
        if sent != (meta.get('remSent') or {}):
            changes['remSent'] = sent

    for msg in messages:
        msg['url'] = APP_URL
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
    ok = sum(send(ref, sub, {'title': tx['test_t'], 'body': tx['test_b'], 'tag': 'test', 'url': APP_URL}) for ref, sub in subs)
    return {'devices': len(subs), 'sent': ok}
