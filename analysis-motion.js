(() => {
  const player = document.querySelector('.analysis-player');
  if (!player) return;

  const stages = [
    { title: 'AI가 변화를 찾습니다', description: '이전·현재 영상을 비교해 건축물 외곽의 변화 후보를 표시합니다.', metric: '1', unit: '개', label: '변화 후보 · 가상 예시' },
    { title: 'GIS가 면적을 계산합니다', description: '농지 경계와 건축물 영역을 겹쳐 점유 면적과 비율을 살펴봅니다.', metric: '120', unit: '㎡', label: '농지 500㎡ 중 24% · 가상 예시' },
    { title: 'GNSS로 현장을 확인합니다', description: '경계가 맞는지 확인할 지점을 정하고, 현장 검증을 준비합니다.', metric: '3', unit: '곳', label: '현장 확인 예정 지점 · 가상 예시' },
    { title: '근거를 조사서로 연결합니다', description: '기본 정보와 지도, 확인할 항목을 모아 한 장의 조사서로 검토합니다.', metric: 'A4', unit: '1장', label: '이미지와 검토 내용을 함께 확인' }
  ];
  const stageButtons = [...document.querySelectorAll('[data-motion-step]')];
  const toggle = document.querySelector('#motion-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stage = 0;
  let playing = !reducedMotion.matches;
  let timer;

  function schedule() {
    window.clearTimeout(timer);
    if (playing && !document.hidden) timer = window.setTimeout(() => showStage((stage + 1) % stages.length), 5000);
  }

  function showStage(next) {
    stage = next;
    const value = stages[stage];
    player.dataset.motionStage = String(stage);
    document.querySelector('#motion-title').textContent = value.title;
    document.querySelector('#motion-description').textContent = value.description;
    document.querySelector('.motion-stage-number').innerHTML = `${String(stage + 1).padStart(2, '0')} <span>/ 04</span>`;
    const metric = document.querySelector('#motion-metric-value');
    metric.replaceChildren(document.createTextNode(value.metric));
    const unit = document.createElement('span');
    unit.textContent = value.unit;
    metric.append(unit);
    document.querySelector('#motion-metric-label').textContent = value.label;
    stageButtons.forEach(button => {
      const selected = Number(button.dataset.motionStep) === stage;
      button.setAttribute('aria-pressed', String(selected));
      // Restart the progress line when the user returns to a selected stage.
      const progress = button.querySelector('.timeline-progress');
      progress.style.animation = 'none';
      void progress.offsetWidth;
      progress.style.animation = '';
    });
    schedule();
  }

  function setPlaying(value) {
    playing = value;
    player.dataset.playing = String(playing);
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.querySelector('.play-symbol').textContent = playing ? 'Ⅱ' : '▶';
    toggle.querySelector('.play-label').textContent = playing ? '일시정지' : '자동 재생';
    schedule();
  }

  function useCurrentPeriod() {
    if (player.dataset.mapPeriod === 'before') document.querySelector('[data-period="after"]').click();
  }

  toggle.addEventListener('click', () => {
    const next = !playing;
    if (next) useCurrentPeriod();
    setPlaying(next);
    if (next) showStage(stage);
  });
  document.querySelector('#motion-restart').addEventListener('click', () => {
    useCurrentPeriod();
    showStage(0);
  });
  stageButtons.forEach(button => button.addEventListener('click', () => {
    useCurrentPeriod();
    setPlaying(false);
    showStage(Number(button.dataset.motionStep));
  }));
  document.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => {
    player.dataset.mapPeriod = button.dataset.period;
    setPlaying(false);
    if (button.dataset.period === 'before') {
      document.querySelector('#motion-title').textContent = '이전 시점을 기준으로 비교합니다';
      document.querySelector('#motion-description').textContent = '현재 시점으로 전환하면 변화 후보와 단계별 확인 흐름을 볼 수 있습니다.';
      document.querySelector('#motion-metric-value').textContent = '이전';
      document.querySelector('#motion-metric-label').textContent = '비교 기준 영상 · 가상 예시';
    } else showStage(stage);
  }));
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', event => { if (event.matches) setPlaying(false); });
  // Manual step navigation is available without animation, including reduced-motion preferences.
  showStage(0);
  setPlaying(playing);
})();
