(() => {
  const copyStatus = document.querySelector("#hub-copy-status");
  const meetingDates = new Set(["1109", "1116", "1123", "1126"]);
  const spaceUrl = () => {
    const url = new URL(location.href);
    url.hash = "1109";
    return url.href;
  };

  async function copyText(text, status) {
    document.querySelector(".hub-share-fallback")?.remove();
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "복사했습니다. 함께 검토할 분에게 전달하세요.";
    } catch {
      // A selectable fallback also works for file:// and browsers without clipboard access.
      const field = document.createElement("textarea");
      field.className = "hub-share-fallback";
      field.value = text;
      field.readOnly = true;
      field.setAttribute("aria-label", "복사할 내용");
      status.after(field);
      field.focus();
      field.select();
      status.textContent = "아래 내용을 선택했습니다. Ctrl+C 또는 복사 메뉴를 사용하세요.";
    }
  }

  document.querySelectorAll("[data-copy-meeting-link]").forEach((button) => {
    button.addEventListener("click", () => copyText(location.href, copyStatus));
  });

  document.querySelector("#copy-feedback")?.addEventListener("click", () => {
    const feedback = document.querySelector("#hub-feedback-text").value;
    copyText(`${feedback}\n\n자료 링크: ${spaceUrl()}`, document.querySelector("#feedback-copy-status"));
  });

  document.querySelectorAll(".hub-pdf-preview").forEach((details) => {
    details.addEventListener("toggle", (event) => {
      if (!event.currentTarget.open) return;
      const preview = event.currentTarget.querySelector("[data-pdf-source]");
      if (preview && !preview.hasAttribute("data")) preview.setAttribute("data", preview.dataset.pdfSource);
    });
  });

  function updateNavigation(scrollToPanel = false) {
    const hashRoute = location.hash.slice(1);
    const route = meetingDates.has(hashRoute) ? hashRoute : location.hash.startsWith("#materials") ? "materials" : "home";
    document.querySelectorAll("[data-hub-route]").forEach((link) => {
      if (link.dataset.hubRoute === route) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    copyStatus.textContent = "";
    document.querySelector(".hub-share-fallback")?.remove();
    if (scrollToPanel && !/^#materials\//.test(location.hash)) {
      // Run after the gallery's route handler has made the selected panel visible.
      requestAnimationFrame(() => {
        const panel = document.getElementById(meetingDates.has(route) ? `meeting-${route}` : route === "materials" ? "folder-content" : "folder-home");
        panel?.scrollIntoView({block: "start", behavior: "instant"});
      });
    }
  }
  window.addEventListener("hashchange", () => updateNavigation(true));
  updateNavigation(meetingDates.has(location.hash.slice(1)) || location.hash === "#materials");
})();
