// Origin-Core Mobile — tab navigation + order code generator + telegram links

// --- tab navigation (bottom nav + home quick-links both use data-goto) ---
const navButtons = document.querySelectorAll('.bottom-nav button[data-goto]');
const gotoTriggers = document.querySelectorAll('[data-goto]');
const views = document.querySelectorAll('.view');

function goto(viewName) {
  views.forEach((v) => v.classList.remove('active'));
  document.getElementById(`view-${viewName}`)?.classList.add('active');
  navButtons.forEach((b) => b.classList.toggle('active', b.dataset.goto === viewName));
  document.querySelector('.view-area').scrollTo({ top: 0, behavior: 'auto' });
}

gotoTriggers.forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    goto(el.dataset.goto);
  });
});

// --- open telegram links in the system browser/app, not the in-app webview ---
document.querySelectorAll('[data-tg]').forEach((el) => {
  el.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = el.getAttribute('href');
    try {
      if (window.Capacitor?.Plugins?.Browser) {
        await window.Capacitor.Plugins.Browser.open({ url });
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      window.open(url, '_blank');
    }
  });
});

// --- order code generator (same logic as website / desktop app) ---
const TELEGRAM_ID = '@RIDOX_Neonguard';

function randomSegment(len) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function generateOrderCode(prefix) {
  return `${prefix}-${randomSegment(4)}-${randomSegment(4)}`;
}

function buildPanel(container, code, planName) {
  container.innerHTML = `
    <div class="label">کد سفارش «${planName}»</div>
    <div class="code-row">
      <div class="code-box mono">${code}</div>
      <button class="copy-btn" type="button" aria-label="کپی کد">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>
        </svg>
      </button>
    </div>
    <div class="hint">این کد را کپی و برای خرید و تحویل به آیدی <b>${TELEGRAM_ID}</b> ارسال کنید.</div>
  `;
  const copyBtn = container.querySelector('.copy-btn');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copyBtn.classList.add('copied');
    if (navigator.vibrate) navigator.vibrate(12);
    setTimeout(() => copyBtn.classList.remove('copied'), 1500);
  });
}

document.querySelectorAll('.buy-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const prefix = btn.dataset.plan;
    const name = btn.dataset.name;
    const panel = btn.closest('.plan').querySelector('[data-panel]');
    const code = generateOrderCode(prefix);
    buildPanel(panel, code, name);
    panel.classList.add('show');
  });
});
