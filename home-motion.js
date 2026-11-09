(() => {
  const player = document.querySelector('.field-player');
  if (!player) return;
  const toggle = player.querySelector('[data-home-play]');
  const buttons = [...player.querySelectorAll('[data-home-stage]')];
  const label = player.querySelector('[data-home-label]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const labels = ['AI가 건축물 후보를 찾습니다', 'GIS가 농지와의 중첩을 계산합니다', 'GNSS로 현장 확인을 준비합니다'];
  let current = 0;
  let playing = !reduced.matches;
  let timer;
  const render = () => {
    player.dataset.stage = String(current + 1);
    player.classList.toggle('is-paused', !playing);
    toggle.textContent = playing ? 'Ⅱ 일시정지' : '▶ 재생';
    toggle.setAttribute('aria-pressed', String(playing));
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    label.textContent = labels[current];
  };
  const schedule = () => {
    clearInterval(timer);
    if (playing && !document.hidden) timer = setInterval(() => { current = (current + 1) % buttons.length; render(); }, 5500);
  };
  toggle.addEventListener('click', () => { playing = !playing; render(); schedule(); });
  buttons.forEach((button, i) => button.addEventListener('click', () => { current = i; playing = false; render(); schedule(); }));
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', event => { if (event.matches) { playing = false; render(); schedule(); } });
  render(); schedule();
})();
