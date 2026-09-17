const notes = document.querySelector('#meeting-notes');
const status = document.querySelector('#save-status');
const checks = [...document.querySelectorAll('.agenda-item input')];
const storageKey = 'urban-scan-meeting-v1';
function progress() {
  document.querySelector('#agenda-progress').textContent = `${checks.filter(input => input.checked).length} / 5 논의 완료`;
}
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
  if (saved && typeof saved.notes === 'string') notes.value = saved.notes;
  if (saved && Array.isArray(saved.agenda)) checks.forEach((input, index) => { input.checked = saved.agenda[index] === true; });
  if (saved) status.textContent = '저장한 회의 내용을 불러왔습니다.';
} catch { status.textContent = '자동 저장 불가 · 메모를 내려받아 보관하세요.'; }
progress();
function save() {
  progress();
  try {
    localStorage.setItem(storageKey, JSON.stringify({ notes: notes.value, agenda: checks.map(input => input.checked) }));
    status.textContent = '이 브라우저에 저장되었습니다.';
  } catch { status.textContent = '자동 저장 불가 · 메모를 내려받아 보관하세요.'; }
}
notes.addEventListener('input', save);
checks.forEach(input => input.addEventListener('change', save));
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
document.querySelector('#download-notes').addEventListener('click', () => {
  const agenda = checks.map(input => `${input.checked ? '[완료]' : '[미논의]'} ${input.closest('label').querySelector('strong').textContent}`).join('\n');
  const text = `URBAN SCAN | 프로젝트 킥오프 회의\n작성일: ${new Date().toLocaleDateString('ko-KR')}\n\n[회의 안건]\n${agenda}\n\n[회의 메모]\n${notes.value || '(작성된 메모 없음)'}\n`;
  const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `urban-scan-meeting-${new Date().toLocaleDateString('sv-SE')}.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  status.textContent = '회의 메모 내려받기를 요청했습니다.';
});
