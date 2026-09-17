const galleryTitles = [
  "AI·GIS·GNSS 플랫폼 체계도",
  "문제 정의와 추진 배경",
  "데이터 역할 구분",
  "AI 건축물 학습·추론 과정",
  "GIS 점유면적·점유율 계산",
  "GNSS 검증과 공간불확실성",
  "플랫폼 구조와 데이터 흐름",
  "학생·LX·지도교수 역할",
  "14주 캡스톤 로드맵",
  "기대성과와 회의 포인트",
];
const viewer = document.querySelector("#image-viewer");
const fullImage = document.querySelector("#full-image");
const imageStatus = document.querySelector("#image-status");
const zoom = document.querySelector("#zoom-image");
const imageArea = document.querySelector("#viewer-image-area");
let current = 1;
let returnFocus;
// The user requested removal of all old meeting contents. Remove only this site's legacy meeting key.
try {
  localStorage.removeItem("urban-scan-meeting-v1");
} catch {
  /* Storage may be disabled. */
}
function resetZoom() {
  imageArea.classList.remove("zoomed");
  zoom.setAttribute("aria-pressed", "false");
  zoom.textContent = "확대";
  imageArea.scrollTo(0, 0);
}
function showImage(number) {
  current = number;
  const file = String(number).padStart(2, "0");
  document.querySelector("#viewer-title").textContent =
    galleryTitles[number - 1];
  document.querySelector("#viewer-count").textContent = `${number} / 10`;
  document.querySelector("#previous-image").disabled = number === 1;
  document.querySelector("#next-image").disabled = number === 10;
  document.querySelector("#download-image").href =
    `meeting-materials/${file}.png`;
  document.querySelector("#download-image").download = `${number}.png`;
  resetZoom();
  fullImage.hidden = true;
  imageStatus.textContent = "원본 이미지를 불러오는 중입니다…";
  fullImage.alt = `${number}번 회의자료 · ${galleryTitles[number - 1]}`;
  fullImage.src = `meeting-materials/${file}.png`;
  if (!viewer.open) {
    returnFocus = document.querySelector(
      `.material-preview[href="#materials/${number}"]`,
    );
    viewer.showModal();
    document.querySelector("#close-viewer").focus();
  }
}
fullImage.addEventListener("load", () => {
  fullImage.hidden = false;
  imageStatus.textContent = "";
});
fullImage.addEventListener("error", () => {
  imageStatus.textContent =
    "이미지를 불러오지 못했습니다. 원본 다운로드를 이용하거나 다시 열어주세요.";
});
function syncRoute() {
  const inFolder =
    location.hash === "#materials" ||
    /^#materials\/(?:[1-9]|10)$/.test(location.hash);
  document.querySelector("#folder-home").hidden = inFolder;
  document.querySelector("#folder-content").hidden = !inFolder;
  const match = location.hash.match(/^#materials\/([1-9]|10)$/);
  if (match) showImage(Number(match[1]));
  else if (viewer.open) viewer.close();
}
function closeViewer() {
  history.replaceState(null, "", "#materials");
  syncRoute();
}
function changeImage(delta) {
  const number = current + delta;
  if (number < 1 || number > 10) return;
  history.replaceState(null, "", `#materials/${number}`);
  showImage(number);
}
document.querySelector("#close-viewer").addEventListener("click", closeViewer);
viewer.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeViewer();
});
viewer.addEventListener("close", () => {
  if (location.hash.startsWith("#materials/"))
    history.replaceState(null, "", "#materials");
  if (!document.querySelector("#folder-content").hidden) returnFocus?.focus();
});
viewer.addEventListener("click", (event) => {
  if (event.target === viewer) closeViewer();
});
viewer.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    changeImage(1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    changeImage(-1);
  }
  if (event.key === "Home") {
    event.preventDefault();
    changeImage(1 - current);
  }
  if (event.key === "End") {
    event.preventDefault();
    changeImage(10 - current);
  }
});
document
  .querySelector("#previous-image")
  .addEventListener("click", () => changeImage(-1));
document
  .querySelector("#next-image")
  .addEventListener("click", () => changeImage(1));
zoom.addEventListener("click", () => {
  const expanded = imageArea.classList.toggle("zoomed");
  zoom.setAttribute("aria-pressed", String(expanded));
  zoom.textContent = expanded ? "화면에 맞춤" : "확대";
});
window.addEventListener("hashchange", syncRoute);
syncRoute();
