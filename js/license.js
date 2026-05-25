/* ═══════════════════════════════════════════════════════
   BLADE LICENSE SYSTEM — Token validation engine
   ═══════════════════════════════════════════════════════ */

const LICENSE = (() => {

  /* ─── Change this key in your copy — keep it private ─── */
  const _SK = 'BLADE_SYSTEM_2025_xK9#mP2@vL7$nQ4';

  const STORAGE_KEY = 'blade_license_v1';
  const PLANS = { basic: 'Базовый', full: 'Полный', vip: 'VIP' };

  /* ─── MurmurHash2 (fast, reliable) ─── */
  function _hash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const n = (4294967296 * (2097151 & h2) + (h1 >>> 0));
    return Math.abs(n).toString(36).toUpperCase().padStart(10, '0');
  }

  /* ─── Sign payload ─── */
  function _sign(encoded) {
    return _hash(encoded + _SK).slice(0, 10);
  }

  /* ─── Generate token ─── */
  function generate({ client, domain = '*', plan = 'full', expires, note = '' }) {
    const uid = Math.random().toString(36).slice(2, 8).toUpperCase();
    const payload = {
      n: client,
      d: domain || '*',
      p: plan,
      e: expires,
      i: uid,
      t: Math.floor(Date.now() / 1000),
      x: note
    };
    const json    = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const sig     = _sign(encoded);
    return `BLD-${encoded}.${sig}`;
  }

  /* ─── Validate token ─── */
  function validate(token) {
    if (!token || typeof token !== 'string') return { ok: false, err: 'Токен енгізіңіз' };
    token = token.trim();
    if (!token.startsWith('BLD-')) return { ok: false, err: 'Токен форматы қате (BLD- басталуы керек)' };

    const body = token.slice(4);
    const dot  = body.lastIndexOf('.');
    if (dot < 0) return { ok: false, err: 'Токен бүлінген' };

    const encoded = body.slice(0, dot);
    const sig     = body.slice(dot + 1);

    if (_sign(encoded) !== sig) return { ok: false, err: 'Токен жалған немесе өзгертілген' };

    let payload;
    try {
      payload = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    } catch {
      return { ok: false, err: 'Токен оқылмайды' };
    }

    /* Expiry check */
    const now    = new Date(); now.setHours(0,0,0,0);
    const expiry = new Date(payload.e);
    if (isNaN(expiry)) return { ok: false, err: 'Мерзім форматы қате' };
    if (now > expiry) return {
      ok: false,
      err: `Токен мерзімі өткен (${payload.e})`,
      expired: true,
      payload
    };

    /* Domain check (if not wildcard) */
    if (payload.d && payload.d !== '*') {
      const host = location.hostname.replace(/^www\./, '');
      const expected = payload.d.replace(/^www\./, '');
      if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== expected) {
        return { ok: false, err: `Бұл домен үшін токен жарамды емес (${payload.d})` };
      }
    }

    return { ok: true, payload };
  }

  /* ─── Activate (save to localStorage) ─── */
  function activate(token) {
    const result = validate(token);
    if (!result.ok) return result;
    localStorage.setItem(STORAGE_KEY, token);
    return result;
  }

  /* ─── Get current license ─── */
  function current() {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) return null;
    const result = validate(token);
    if (!result.ok) {
      if (result.expired) return { ok: false, expired: true, payload: result.payload };
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return result;
  }

  /* ─── Clear license ─── */
  function clear() { localStorage.removeItem(STORAGE_KEY); }

  /* ─── Days remaining ─── */
  function daysLeft(expiresStr) {
    const diff = new Date(expiresStr) - new Date();
    return Math.ceil(diff / 86400000);
  }

  /* ─── Plan label ─── */
  function planLabel(code) { return PLANS[code] || code; }

  return { generate, validate, activate, current, clear, daysLeft, planLabel };
})();
