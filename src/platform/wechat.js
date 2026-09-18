"use strict";

// Keep the superseded fictional-career prototype intact under its original key.
const SAVE_KEY = "yizhi-lvli-civil-service-v2";
const { ENDINGS, migrateEndingId } = require("../data/endings");
const { ROLES, MAX_CAREER_YEARS } = require("../core/constants");

function archiveFrom(record) {
  if (!record || record.format !== "local-profile-v2" || !Array.isArray(record.archive)) return [];
  const migrated = record.archive.flatMap((item) => {
    if (!item || typeof item.id !== "string") return [];
    const endingId = migrateEndingId(item.endingId);
    if (!ENDINGS.some((ending) => ending.id === endingId) || !Number.isInteger(item.year) ||
      item.year < 1 || item.year > MAX_CAREER_YEARS || !Number.isInteger(item.roleIndex) ||
      !ROLES[item.roleIndex] || !Number.isFinite(item.assets)) return [];
    return [{ ...item, endingId }];
  });
  return migrated.filter((item, index) => migrated.findIndex((candidate) => candidate.endingId === item.endingId) === index).slice(-24);
}

// WeChat exposes wx.*, Douyin exposes tt.*. Both expose the same storage,
// window, touch and lifecycle surface used here, so one adapter serves both.
function getWx() {
  if (typeof wx !== "undefined") return wx;
  if (typeof tt !== "undefined") return tt;
  return null;
}

function getWindowMetrics() {
  const api = getWx();
  if (!api) return { width: 375, height: 667, pixelRatio: 2, safeArea: null };
  const info = api.getWindowInfo ? api.getWindowInfo() : api.getSystemInfoSync();
  return {
    width: info.windowWidth,
    height: info.windowHeight,
    pixelRatio: info.pixelRatio || 1,
    safeArea: info.safeArea || null
  };
}

function saveGame(state) {
  const api = getWx();
  if (!api) return false;
  try {
    const archive = archiveFrom(api.getStorageSync(SAVE_KEY));
    if (state.phase === "ending") {
      const id = `${state.backgroundId}:${state.seed}:${state.careerYear}:${state.endingId}`;
      if (!archive.some((item) => item.endingId === state.endingId)) archive.push({
        id, endingId: state.endingId, year: state.careerYear, roleIndex: state.roleIndex, assets: state.assets
      });
    }
    // One storage write commits progress and the collection together.
    api.setStorageSync(SAVE_KEY, { format: "local-profile-v2", state, archive: archive.slice(-24) });
    return true;
  } catch (_error) {
    return false;
  }
}

function loadGame() {
  const api = getWx();
  if (!api) return null;
  try {
    const record = api.getStorageSync(SAVE_KEY);
    const state = record && record.format === "local-profile-v2" ? record.state : record || null;
    if (state && state.phase === "ending") return { ...state, endingId: migrateEndingId(state.endingId) };
    return state;
  } catch (_error) {
    return null;
  }
}

function loadArchive() {
  const api = getWx();
  if (!api) return [];
  try { return archiveFrom(api.getStorageSync(SAVE_KEY)); } catch (_error) { return []; }
}

function clearGame() {
  const api = getWx();
  try {
    if (!api) return false;
    api.removeStorageSync(SAVE_KEY);
    return true;
  } catch (_error) {
    return false;
  }
}

// Small device-local settings that must survive with no game in progress, for
// example whether the player has seen the first-run privacy notice. Kept on a
// separate key so deleting the save never resurrects the notice needlessly.
const SETTINGS_KEY = "yizhi-lvli-civil-service-v2-settings";

function loadSettings() {
  const api = getWx();
  if (!api) return {};
  try {
    const record = api.getStorageSync(SETTINGS_KEY);
    return record && typeof record === "object" ? record : {};
  } catch (_error) {
    return {};
  }
}

function saveSettings(settings) {
  const api = getWx();
  if (!api) return false;
  try {
    api.setStorageSync(SETTINGS_KEY, settings);
    return true;
  } catch (_error) {
    return false;
  }
}

function onTouchMove(handler) {
  const api = getWx();
  if (api && api.onTouchMove) api.onTouchMove(handler);
}

function onTouchEnd(handler) {
  const api = getWx();
  if (api && api.onTouchEnd) api.onTouchEnd(handler);
}

function onTouchCancel(handler) {
  const api = getWx();
  if (api && api.onTouchCancel) api.onTouchCancel(handler);
}

function onTouchStart(handler) {
  const api = getWx();
  if (api) api.onTouchStart(handler);
}

function setPreferredFramesPerSecond(value) {
  const api = getWx();
  if (api && api.setPreferredFramesPerSecond) api.setPreferredFramesPerSecond(value);
}

// Lifecycle hooks. Each is optional so the browser preview shim and the unit
// test doubles keep working without implementing them.
function onShow(handler) {
  const api = getWx();
  if (api && api.onShow) api.onShow(handler);
}

function onHide(handler) {
  const api = getWx();
  if (api && api.onHide) api.onHide(handler);
}

function onWindowResize(handler) {
  const api = getWx();
  if (api && api.onWindowResize) api.onWindowResize(handler);
}

module.exports = {
  clearGame,
  getWindowMetrics,
  loadGame,
  loadArchive,
  loadSettings,
  onHide,
  onShow,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onWindowResize,
  saveGame,
  saveSettings,
  setPreferredFramesPerSecond
};
