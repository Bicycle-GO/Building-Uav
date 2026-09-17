document.querySelectorAll('[data-period]').forEach(button => {
  button.addEventListener('click', () => {
    const current = button.dataset.period === 'after';
    document.querySelectorAll('[data-period]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.querySelector('#change-area').style.display = current ? '' : 'none';
    document.querySelector('#period-label').textContent = current ? '현재 시점 · 변화 영역 표시 중' : '이전 시점 · 비교 기준 영상';
    document.querySelector('#detect-type').textContent = current ? '외곽 면적 변화' : '비교 기준 시점';
  });
});
