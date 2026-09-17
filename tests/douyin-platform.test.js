"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

// The same platform adapter must run on Douyin, where only `tt` exists.
function withGlobals(env, fn) {
  const hadWx = Object.prototype.hasOwnProperty.call(globalThis, "wx");
  const hadTt = Object.prototype.hasOwnProperty.call(globalThis, "tt");
  const savedWx = globalThis.wx;
  const savedTt = globalThis.tt;
  delete globalThis.wx;
  delete globalThis.tt;
  Object.assign(globalThis, env);
  try {
    return fn();
  } finally {
    delete globalThis.wx;
    delete globalThis.tt;
    if (hadWx) globalThis.wx = savedWx;
    if (hadTt) globalThis.tt = savedTt;
  }
}

test("platform adapter resolves tt.* when wx is absent (Douyin)", () => {
  const store = {};
  withGlobals({
    tt: {
      getWindowInfo: () => ({ windowWidth: 393, windowHeight: 852, pixelRatio: 3, safeArea: { top: 59, bottom: 818 } }),
      getStorageSync: (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
      setStorageSync: (key, value) => { store[key] = value; },
      removeStorageSync: (key) => { delete store[key]; },
      onTouchStart() {}, onTouchMove() {}, onTouchEnd() {}, onTouchCancel() {},
      onShow() {}, onHide() {}, onWindowResize() {},
      setPreferredFramesPerSecond() {}
    }
  }, () => {
    const platform = require("../src/platform/wechat");

    const metrics = platform.getWindowMetrics();
    assert.equal(metrics.width, 393);
    assert.equal(metrics.height, 852);
    assert.equal(metrics.pixelRatio, 3);
    assert.deepEqual(metrics.safeArea, { top: 59, bottom: 818 });

    const state = { phase: "event", backgroundId: "community", seed: 1, careerYear: 1, endingId: null, roleIndex: 0, assets: 2 };
    assert.equal(platform.saveGame(state), true);
    assert.equal(platform.loadGame().backgroundId, "community");

    platform.clearGame();
    assert.equal(platform.loadGame(), null);
  });
});

test("platform adapter still prefers wx.* when both globals exist", () => {
  withGlobals({
    wx: { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568, pixelRatio: 2, safeArea: { top: 24, bottom: 548 } }) },
    tt: { getWindowInfo: () => ({ windowWidth: 999, windowHeight: 999, pixelRatio: 9, safeArea: null }) }
  }, () => {
    const platform = require("../src/platform/wechat");
    assert.equal(platform.getWindowMetrics().width, 320);
  });
});
