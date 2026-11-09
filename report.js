(() => {
  const printButton = document.querySelector('#print-report');
  const status = document.querySelector('#report-status');
  const fields = document.querySelectorAll('[data-print-field]');

  function synchronizeFields() {
    fields.forEach(field => {
      const output = document.querySelector(`[data-print-value="${field.dataset.printField}"]`);
      if (output) output.textContent = field.value;
    });
  }

  fields.forEach(field => field.addEventListener('input', synchronizeFields));
  window.addEventListener('beforeprint', synchronizeFields);

  async function waitForImages() {
    await Promise.all(Array.from(document.querySelectorAll('.report-sheet img')).map(image => {
      if (image.complete) {
        if (!image.naturalWidth) throw new Error('image unavailable');
        return image.decode ? image.decode() : Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', reject, { once: true });
      });
    }));
  }

  printButton?.addEventListener('click', async () => {
    printButton.disabled = true;
    status.textContent = '';
    try {
      synchronizeFields();
      await waitForImages();
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      window.print();
    } catch {
      status.textContent = '위치도 이미지를 불러오지 못했습니다. 인터넷 연결을 확인한 뒤 새로고침해 주세요.';
    } finally {
      printButton.disabled = false;
    }
  });
})();
