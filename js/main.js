'use strict';

/* ---------- SPメニュー ---------- */
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('globalNav');

function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  nav.classList.toggle('is-open', open);
}

menuBtn.addEventListener('click', () => {
  setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

/* ---------- 追従CTAボタン ---------- */
const followCta = document.getElementById('followCta');
const heroSection = document.getElementById('about');
const entrySection = document.getElementById('entry');

let pastHero = false;
let inEntry = false;

function updateFollowCta() {
  followCta.classList.toggle('is-visible', pastHero && !inEntry);
}

new IntersectionObserver(([e]) => {
  pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
  updateFollowCta();
}).observe(heroSection);

new IntersectionObserver(([e]) => {
  inEntry = e.isIntersecting;
  updateFollowCta();
}).observe(entrySection);

/* ---------- スクロール連動フェードイン＋数値カウントアップ ---------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.reveal, .reveal-group, .reveal-steps');

  const animateCount = (el) => {
    if (el.dataset.counted) return;
    el.dataset.counted = 'true';

    const target = parseFloat(el.textContent);
    if (Number.isNaN(target)) return;

    const decimals = (el.textContent.split('.')[1] || '').length;
    const duration = 1100;
    let start = null;

    // 桁数が増えても隣の要素が動かないよう、最終的な幅で固定しておく
    el.style.minWidth = el.getBoundingClientRect().width + 'px';

    const tick = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(decimals);
      }
    };
    requestAnimationFrame(tick);
  };

  const triggerCounters = (root) => {
    const hosts = [];
    if (root.hasAttribute('data-count-group')) hosts.push(root);
    root.querySelectorAll('[data-count-group]').forEach((host) => hosts.push(host));
    hosts.forEach((host) => {
      host.querySelectorAll('.num').forEach(animateCount);
    });
  };

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        triggerCounters(entry.target);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
  );

  revealTargets.forEach((el) => {
    el.classList.add('reveal-init');
    revealObserver.observe(el);
  });
}

/* ---------- 説明会／エントリーボタン → フォームの希望内容を選択 ---------- */
const purpose = document.getElementById('purpose');

document.querySelectorAll('[data-purpose]').forEach((btn) => {
  btn.addEventListener('click', () => {
    purpose.value = btn.dataset.purpose;
  });
});

/* ---------- フォーム（入力チェックのみ。送信先は未設定） ---------- */
const form = document.getElementById('form');
const message = document.getElementById('formMessage');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const el = form.elements;
  const fields = [el.namedItem('name'), el.namedItem('email'), el.namedItem('purpose')];
  let firstError = null;

  fields.forEach((field) => {
    const ok = field.checkValidity();
    field.classList.toggle('is-error', !ok);
    if (!ok && !firstError) firstError = field;
  });

  const agree = el.namedItem('agree');
  if (!agree.checked && !firstError) firstError = agree;

  if (firstError) {
    message.textContent = '未入力・入力内容に誤りのある項目があります。ご確認ください。';
    message.classList.add('is-error');
    firstError.focus();
    return;
  }

  // [仮] 送信処理は未実装。完了表示のみ。
  message.classList.remove('is-error');
  message.textContent = '[仮] 送信が完了しました。担当者よりご連絡いたします。';
  form.reset();
});
