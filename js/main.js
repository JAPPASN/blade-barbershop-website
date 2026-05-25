/* ═══════════════════════════════════════════════
   BLADE BARBERSHOP — Main JS
   ═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   LICENSE CHECK — runs before everything
   ═══════════════════════════════════════════════ */
(function checkLicense() {
  /* License gate disabled — site opens freely */
})();

function showLicenseBar(p) {
  const days = LICENSE.daysLeft(p.e);
  const bar  = document.getElementById('licenseBar');
  bar.style.display = 'flex';
  document.getElementById('lbText').innerHTML =
    `<i class="fas fa-shield-alt" style="color:var(--gold)"></i> ` +
    `${p.n} · ${LICENSE.planLabel(p.p)} · Мерзім: ${p.e} ` +
    `<span style="color:${days < 14 ? '#e74c3c' : '#2ecc71'}">(${days} күн)</span>`;
  /* Push page down a bit for bar */
  document.querySelector('.navbar').style.top = '32px';
}

function doActivate() {
  const input = document.getElementById('lgTokenInput');
  const token = input.value.trim();
  const err   = document.getElementById('lgErr');
  err.textContent = '';

  if (!token) { err.textContent = 'Токен енгізіңіз'; return; }

  const result = LICENSE.activate(token);
  if (result.ok) {
    document.getElementById('licenseGate').style.display = 'none';
    document.body.style.overflow = '';
    showLicenseBar(result.payload);
    /* Restart intro */
    const intro = document.getElementById('intro');
    if (intro) {
      intro.style.display = 'flex';
      setTimeout(() => intro.classList.add('hidden'), 2600);
    }
  } else {
    err.textContent = result.err;
    input.style.borderColor = '#e74c3c';
    setTimeout(() => input.style.borderColor = '', 2000);
  }
}

function clearLicense() {
  if (!confirm('Токенді өшіресіз бе?')) return;
  LICENSE.clear();
  location.reload();
}

/* ─── Cinematic Intro ─── */
window.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  if (intro && intro.style.display !== 'none') {
    setTimeout(() => intro.classList.add('hidden'), 2600);
  }
});

/* ─── Navbar scroll ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
});

/* ─── Mobile burger ─── */
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ─── Smooth scroll offset for fixed nav ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ─── Scroll reveal ─── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('visible'), parseInt(delay));
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.svc-card, .master-card, .gi, .rv-card, .loc-item').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

/* ═══════════════════════════════════════════════
   BOOKING FORM — Multi-step
   ═══════════════════════════════════════════════ */
let currentStep = 1;
const totalSteps = 4;

function bkNext(step) {
  if (!validateStep(step)) return;
  currentStep = step + 1;
  showStep(currentStep);
  if (currentStep === 4) fillSummary();
}
function bkPrev(step) {
  currentStep = step - 1;
  showStep(currentStep);
}
function showStep(n) {
  document.querySelectorAll('.fs').forEach(f => f.classList.remove('active'));
  document.getElementById('fs' + n).classList.add('active');
  document.querySelectorAll('.bk-step').forEach(s => {
    const sn = parseInt(s.dataset.s);
    s.classList.remove('active', 'done');
    if (sn === n) s.classList.add('active');
    if (sn < n)  s.classList.add('done');
  });
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep(step) {
  if (step === 1) {
    const svc = document.querySelector('input[name="service"]:checked');
    if (!svc) { alert('Қызмет таңдаңыз'); return false; }
  }
  if (step === 2) {
    const master = document.querySelector('input[name="master"]:checked');
    if (!master) { alert('Мастер таңдаңыз'); return false; }
  }
  if (step === 3) {
    if (!selectedDate) { alert('Күн таңдаңыз'); return false; }
    if (!selectedTime) { alert('Уақыт таңдаңыз'); return false; }
  }
  return true;
}

function fillSummary() {
  const svc    = document.querySelector('input[name="service"]:checked');
  const master = document.querySelector('input[name="master"]:checked');
  if (!svc || !master) return;

  const [svcName, price] = svc.value.split('|');
  const masterName = master.value;
  const dateStr = selectedDate
    ? selectedDate.toLocaleDateString('kk-KZ', { day: 'numeric', month: 'long', weekday: 'long' })
    : '—';

  document.getElementById('bkSummary').innerHTML = `
    <h4>✦ Жазылу мәліметтері</h4>
    <div class="sum-row"><span>Қызмет</span><b>${svcName}</b></div>
    <div class="sum-row"><span>Мастер</span><b>${masterName}</b></div>
    <div class="sum-row"><span>Күн</span><b>${dateStr}</b></div>
    <div class="sum-row"><span>Уақыт</span><b>${selectedTime}</b></div>
    <div class="sum-total"><span>Бағасы</span><b>${parseInt(price).toLocaleString('kk-KZ')} ₸</b></div>
  `;
}

/* ─── Form submit ─── */
document.getElementById('bkForm').addEventListener('submit', e => {
  e.preventDefault();
  const name  = document.getElementById('bkName').value.trim();
  const phone = document.getElementById('bkPhone').value.trim();
  if (!name)  { document.getElementById('bkName').focus(); return; }
  if (!phone) { document.getElementById('bkPhone').focus(); return; }

  const svc    = document.querySelector('input[name="service"]:checked');
  const master = document.querySelector('input[name="master"]:checked');
  const saveFav = document.getElementById('saveFav').checked;

  if (saveFav && svc && master) {
    localStorage.setItem('blade_fav_master', master.value);
    localStorage.setItem('blade_last_service', svc.value.split('|')[0]);
  }

  const [svcName] = svc.value.split('|');
  const dateStr = selectedDate
    ? selectedDate.toLocaleDateString('kk-KZ', { day: 'numeric', month: 'long' })
    : '';

  const waMsg = encodeURIComponent(
    `Сәлеметсіз бе! Мен запиське жазылғым келеді.\n` +
    `Аты: ${name}\n` +
    `Телефон: ${phone}\n` +
    `Қызмет: ${svcName}\n` +
    `Мастер: ${master.value}\n` +
    `Күн: ${dateStr}, ${selectedTime || ''}`
  );

  document.getElementById('bkForm').style.display = 'none';
  const succ = document.getElementById('bkSuccess');
  succ.style.display = 'block';
  document.getElementById('successMsg').textContent =
    `${name}, жазылуыңыз қабылданды! WhatsApp арқылы растаймыз.`;

  setTimeout(() => {
    window.open(`https://wa.me/77757248619?text=${waMsg}`, '_blank');
  }, 1000);
});

function bkReset() {
  currentStep = 1;
  document.getElementById('bkForm').style.display = 'block';
  document.getElementById('bkSuccess').style.display = 'none';
  document.getElementById('bkForm').reset();
  selectedDate = null;
  selectedTime = null;
  showStep(1);
}

/* ─── Pre-fill from saved fav ─── */
window.addEventListener('load', () => {
  const favMaster = localStorage.getItem('blade_fav_master');
  const lastSvc   = localStorage.getItem('blade_last_service');
  if (favMaster) {
    const radio = document.querySelector(`input[name="master"][value="${favMaster}"]`);
    if (radio) radio.checked = true;
  }
  if (lastSvc) {
    document.querySelectorAll('input[name="service"]').forEach(r => {
      if (r.value.startsWith(lastSvc)) r.checked = true;
    });
  }
});

/* ═══════════════════════════════════════════════
   CALENDAR
   ═══════════════════════════════════════════════ */
let calYear, calMonth;
let selectedDate = null;
let selectedTime = null;

const MONTHS_KK = ['Қаңтар','Ақпан','Наурыз','Сәуір','Мамыр','Маусым',
                   'Шілде','Тамыз','Қыркүйек','Қазан','Қараша','Желтоқсан'];

function initCalendar() {
  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
}

function renderCalendar() {
  document.getElementById('calTitle').textContent =
    `${MONTHS_KK[calMonth]} ${calYear}`;

  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  const first = new Date(calYear, calMonth, 1).getDay();
  const offset = (first + 6) % 7; // Monday start

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement('div');
    empty.classList.add('cal-day', 'empty');
    grid.appendChild(empty);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEl = document.createElement('div');
    dayEl.classList.add('cal-day');
    dayEl.textContent = d;

    const date = new Date(calYear, calMonth, d);
    if (date < today) {
      dayEl.classList.add('disabled');
    } else {
      if (date.toDateString() === today.toDateString()) dayEl.classList.add('today');
      if (selectedDate && date.toDateString() === selectedDate.toDateString()) dayEl.classList.add('selected');
      dayEl.addEventListener('click', () => selectDate(date, dayEl));
    }
    grid.appendChild(dayEl);
  }
}

function selectDate(date, el) {
  selectedDate = date;
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  selectedTime = null;
  renderTimeSlots(date);
}

function renderTimeSlots(date) {
  const wrap = document.getElementById('timeSlots');
  wrap.innerHTML = '';
  const slots = ['09:00','09:30','10:00','10:30','11:00','11:30',
                 '12:00','12:30','13:00','14:00','14:30','15:00',
                 '15:30','16:00','16:30','17:00','17:30','18:00',
                 '18:30','19:00','19:30','20:00','20:30','21:00'];

  const busySeeds = [2, 5, 9, 13, 17, 21];
  slots.forEach((t, i) => {
    const el = document.createElement('div');
    el.classList.add('ts');
    el.textContent = t;
    if (busySeeds.includes(i)) {
      el.classList.add('busy');
      el.title = 'Бос емес';
    } else {
      el.addEventListener('click', () => selectTime(t, el));
    }
    wrap.appendChild(el);
  });
}

function selectTime(time, el) {
  selectedTime = time;
  document.querySelectorAll('.ts').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
}

document.getElementById('calPrev').addEventListener('click', () => {
  calMonth--;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  renderCalendar();
});
document.getElementById('calNext').addEventListener('click', () => {
  calMonth++;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
});

initCalendar();


/* ═══════════════════════════════════════════════
   REVIEWS SLIDER
   ═══════════════════════════════════════════════ */
let rvIndex = 0;
const rvTrack = document.getElementById('rvTrack');
const rvDots  = document.getElementById('rvDots');
const rvCards = rvTrack.querySelectorAll('.rv-card');

function initReviews() {
  rvCards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('rv-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goReview(i));
    rvDots.appendChild(dot);
  });
}

function goReview(i) {
  rvIndex = Math.max(0, Math.min(i, rvCards.length - 1));
  const cardW = rvCards[0].offsetWidth + 24;
  rvTrack.style.transform = `translateX(-${rvIndex * cardW}px)`;
  document.querySelectorAll('.rv-dot').forEach((d, idx) =>
    d.classList.toggle('active', idx === rvIndex));
}

document.getElementById('rvNext').addEventListener('click', () => {
  goReview((rvIndex + 1) % rvCards.length);
});
document.getElementById('rvPrev').addEventListener('click', () => {
  goReview((rvIndex - 1 + rvCards.length) % rvCards.length);
});

let autoRv = setInterval(() => goReview((rvIndex + 1) % rvCards.length), 5000);
rvTrack.addEventListener('mouseenter', () => clearInterval(autoRv));
rvTrack.addEventListener('mouseleave', () => {
  autoRv = setInterval(() => goReview((rvIndex + 1) % rvCards.length), 5000);
});

initReviews();
window.addEventListener('resize', () => goReview(rvIndex));


/* ═══════════════════════════════════════════════
   PHONE INPUT MASK
   ═══════════════════════════════════════════════ */
const phoneInput = document.getElementById('bkPhone');
if (phoneInput) {
  phoneInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (v.startsWith('7')) {
      const p = v.slice(1, 11);
      let r = '+7';
      if (p.length > 0) r += ' (' + p.slice(0, 3);
      if (p.length >= 3) r += ') ' + p.slice(3, 6);
      if (p.length >= 6) r += '-' + p.slice(6, 8);
      if (p.length >= 8) r += '-' + p.slice(8, 10);
      e.target.value = r;
    }
  });
}
