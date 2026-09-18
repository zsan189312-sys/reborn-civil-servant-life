"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const SETTINGS_KEY = "yizhi-lvli-civil-service-v2-settings";

function makeCtx(draws) {
  let fontSize = 14;
  let align = "left";
  return {
    arcTo() {}, beginPath() {}, clearRect() {}, clip() {}, closePath() {}, fill() {}, fillRect() {},
    lineTo() {}, moveTo() {}, rect() {}, restore() {}, save() {}, scale() {}, stroke() {}, translate() {},
    fillText(value, x, y) { draws.push({ value: String(value), x, y, size: fontSize, align }); },
    measureText(value) {
      const width = [...String(value)].reduce((sum, character) =>
        sum + (/\p{Script=Han}/u.test(character) ? fontSize : fontSize * 0.58), 0);
      return { width };
    },
    set fillStyle(_value) {},
    set font(value) { fontSize = Number(/(\d+(?:\.\d+)?)px/.exec(value)?.[1] || 14); },
    set globalAlpha(_value) {}, set lineWidth(_value) {}, set strokeStyle(_value) {},
    set textAlign(value) { align = value; }, set textBaseline(_value) {}
  };
}

function makeWx(store, width = 375, height = 812) {
  return {
    getWindowInfo: () => ({ windowWidth: width, windowHeight: height, pixelRatio: 2, safeArea: { top: 20, bottom: height - 20 } }),
    getStorageSync: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setStorageSync: (key, value) => { store[key] = value; },
    removeStorageSync: (key) => { delete store[key]; },
    onTouchStart() {}, onTouchMove() {}, onTouchEnd() {}, onTouchCancel() {},
    onShow() {}, onHide() {}, onWindowResize() {}, setPreferredFramesPerSecond() {}
  };
}

test("the first run shows the privacy notice once and remembers the acknowledgement", (t) => {
  const store = {};
  t.after(() => { delete global.wx; });
  global.wx = makeWx(store);
  const { GameApp } = require("../src/ui/app");

  const app = new GameApp({ getContext: () => makeCtx([]) });
  const ack = app.buttons.find((button) => button.label === "我已了解，开始游戏");
  assert.ok(ack, "a fresh install must show the privacy notice first");
  ack.onPress();
  assert.equal(app.panel, null);
  assert.equal(store[SETTINGS_KEY].privacyVersion, 1, "the acknowledgement is stored on the device");

  const second = new GameApp({ getContext: () => makeCtx([]) });
  assert.equal(second.buttons.find((button) => button.label === "我已了解，开始游戏"), undefined,
    "it must not reappear on a later launch");
});

test("the start screen carries the age rating on every width", (t) => {
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  for (const [width, height] of [[320, 568], [375, 667], [430, 932]]) {
    global.wx = makeWx({}, width, height);
    const draws = [];
    const app = new GameApp({ getContext: () => makeCtx(draws) });
    const ack = app.buttons.find((button) => button.label === "我已了解，开始游戏");
    if (ack) ack.onPress();
    draws.length = 0;
    app.render();
    const painted = draws.map((draw) => draw.value).join("");
    assert.match(painted, /适龄提示/, `${width}px: missing the age rating`);
    assert.match(painted, /16 周岁以上/, `${width}px: missing the age band`);
  }
});

test("the privacy notice and the age rating stay inside a 320px screen", (t) => {
  const store = {};
  t.after(() => { delete global.wx; });
  global.wx = makeWx(store, 320, 568);
  const { GameApp } = require("../src/ui/app");
  const draws = [];
  const app = new GameApp({ getContext: () => makeCtx(draws) });

  for (const draw of draws) {
    const textWidth = [...draw.value].reduce((sum, character) =>
      sum + (/\p{Script=Han}/u.test(character) ? draw.size : draw.size * 0.58), 0);
    const left = draw.align === "right" ? draw.x - textWidth : draw.align === "center" ? draw.x - textWidth / 2 : draw.x;
    const right = draw.align === "right" ? draw.x : draw.align === "center" ? draw.x + textWidth / 2 : draw.x + textWidth;
    assert.ok(left >= -0.5 && right <= 320.5, `privacy panel: "${draw.value}"`);
  }
  for (const button of app.buttons) {
    assert.ok(button.x >= 0 && button.x + button.width <= 320, `privacy button: ${button.label}`);
  }
});
