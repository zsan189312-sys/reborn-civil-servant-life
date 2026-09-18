"use strict";
const canvas = document.getElementById("game");
const device = document.getElementById("device");
const requested = new URLSearchParams(location.search).get("size");
if ([...device.options].some((option) => option.value === requested)) device.value = requested;
const [width, height] = device.value.split("x").map(Number);
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;
device.addEventListener("change", () => { location.search = `?size=${device.value}`; });
const handlers = {};
window.wx = {
  createCanvas: () => canvas,
  getWindowInfo: () => ({ windowWidth: width, windowHeight: height, pixelRatio: Math.min(2, devicePixelRatio || 1), safeArea: { top: 0, bottom: height - 20 } }),
  getStorageSync: (key) => JSON.parse(localStorage.getItem(`internal-preview:${key}`) || "null"),
  setStorageSync: (key, value) => localStorage.setItem(`internal-preview:${key}`, JSON.stringify(value)),
  removeStorageSync: (key) => localStorage.removeItem(`internal-preview:${key}`),
  onTouchStart: (handler) => { handlers.start = handler; },
  onTouchMove: (handler) => { handlers.move = handler; },
  onTouchEnd: (handler) => { handlers.end = handler; },
  onTouchCancel: (handler) => { handlers.cancel = handler; },
  // Mirror the WeChat lifecycle so the browser preview exercises the same
  // foreground/resize repaint path a real device uses.
  onShow: (handler) => { document.addEventListener("visibilitychange", () => { if (!document.hidden) handler(); }); },
  onHide: (handler) => { document.addEventListener("visibilitychange", () => { if (document.hidden) handler(); }); },
  onWindowResize: (handler) => { window.addEventListener("resize", () => handler()); },
  setPreferredFramesPerSecond() {}
};
function point(event) {
  const box = canvas.getBoundingClientRect();
  return { clientX: (event.clientX - box.left) * width / box.width, clientY: (event.clientY - box.top) * height / box.height };
}
let pointer = null;
canvas.addEventListener("pointerdown", (event) => {
  if (pointer !== null) return;
  pointer = event.pointerId;
  canvas.setPointerCapture(pointer);
  handlers.start?.({ touches: [point(event)] });
});
canvas.addEventListener("pointermove", (event) => {
  if (pointer === event.pointerId) handlers.move?.({ touches: [point(event)] });
});
canvas.addEventListener("pointerup", (event) => {
  if (pointer !== event.pointerId) return;
  handlers.end?.({ touches: [], changedTouches: [point(event)] });
  pointer = null;
});
canvas.addEventListener("pointercancel", () => { pointer = null; handlers.cancel?.({}); });
canvas.addEventListener("wheel", (event) => {
  if (pointer !== null) return;
  event.preventDefault();
  const start = { clientX: width / 2, clientY: height / 2 };
  handlers.start?.({ touches: [start] });
  handlers.move?.({ touches: [{ ...start, clientY: start.clientY - event.deltaY }] });
  handlers.cancel?.({});
}, { passive: false });
window.addEventListener("error", (event) => { document.getElementById("error").textContent = `试玩遇到错误：${event.message}`; });

// The internal preview is often kept open while source files change. Reload
// the in-memory game bundle after a save-safe source update so an old tab does
// not keep exercising rules that have already been fixed on disk.
let loadedVersion = null;
async function refreshWhenSourceChanges() {
  try {
    const response = await fetch("/version", { cache: "no-store" });
    if (!response.ok) return;
    const version = await response.text();
    if (loadedVersion !== null && loadedVersion !== version) location.reload();
    loadedVersion = version;
  } catch (_error) {
    // The local server may be restarting. The next interval retries quietly.
  }
}
refreshWhenSourceChanges();
setInterval(refreshWhenSourceChanges, 1500);
