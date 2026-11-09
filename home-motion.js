(() => {
  const player = document.querySelector('.field-player');
  if (!player) return;

  const toggle = player.querySelector('[data-home-play]');
  const buttons = [...player.querySelectorAll('[data-home-stage]')];
  const label = player.querySelector('[data-home-label]');
  const stageTitle = player.querySelector('[data-extraction-title]');
  const stageDetail = player.querySelector('[data-extraction-detail]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stages = [
    {
      title: '지붕 표면을 판독합니다',
      detail: '실제 영상의 청색 지붕 표면을 따라 스캔합니다.',
      label: 'AI 판독 과정 · 지붕 표면 탐색',
    },
    {
      title: '지붕의 외곽을 따라 그립니다',
      detail: '지붕 가장자리 네 점을 연결해 윤곽을 추출합니다.',
      label: '윤곽 추출 · 지붕 외곽 폴리곤',
    },
    {
      title: '지붕 형상이 분리됩니다',
      detail: '판독한 지붕 표면과 윤곽을 함께 분리해 보여줍니다.',
      label: '지붕 분리 · 원영상의 지붕 형상',
    },
  ];
  let current = 0;
  let playing = !reduced.matches;
  let ready = false;
  let timer;

  function render() {
    player.dataset.stage = String(current + 1);
    player.classList.toggle('is-paused', !playing);
    player.setAttribute('aria-busy', String(!ready));
    toggle.disabled = !ready;
    toggle.textContent = playing ? 'Ⅱ 일시정지' : '▶ 재생';
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? '지붕 판독 모션 일시정지' : '지붕 판독 모션 재생');
    buttons.forEach((button, index) => {
      button.disabled = !ready;
      button.setAttribute('aria-pressed', String(index === current));
    });
    label.textContent = ready ? stages[current].label : '실제 정사영상을 불러오는 중…';
    if (stageTitle) stageTitle.textContent = stages[current].title;
    if (stageDetail) stageDetail.textContent = stages[current].detail;
  }

  function schedule() {
    clearInterval(timer);
    if (ready && playing && !document.hidden) {
      timer = setInterval(() => {
        current = (current + 1) % stages.length;
        render();
      }, 5800);
    }
  }

  toggle.addEventListener('click', () => {
    playing = !playing;
    render();
    schedule();
  });
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    current = index;
    playing = false;
    render();
    schedule();
  }));
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', event => {
    if (event.matches) {
      playing = false;
      render();
      schedule();
    }
  });

  render();
  const image = new Image();
  image.onload = () => {
    ready = true;
    render();
    schedule();
  };
  image.onerror = () => {
    playing = false;
    player.classList.add('is-paused');
    player.setAttribute('aria-busy', 'false');
    label.textContent = '정사영상을 불러오지 못했습니다. 새로고침해 주세요.';
  };
  image.src = player.querySelector('#home-ortho')?.getAttribute('href') || 'home-assets/field-orthophoto.jpg';
})();
