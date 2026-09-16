"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { ROLES } = require("../src/core/constants");

function layoutContext(draws) {
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

function measuredWidth(draw) {
  return [...draw.value].reduce((sum, character) =>
    sum + (/\p{Script=Han}/u.test(character) ? draw.size : draw.size * 0.58), 0);
}

for (const [width, height, safeTop, safeBottom] of [
  [320, 568, 24, 548],
  [360, 800, 32, 776],
  [375, 667, 20, 647],
  [390, 844, 47, 810],
  [393, 852, 59, 818],
  [412, 915, 24, 891],
  [430, 932, 59, 898]
]) {
  test(`appointment layout stays within ${width}x${height} with safe areas`, (t) => {
    const draws = [];
    global.wx = {
      getWindowInfo: () => ({ windowWidth: width, windowHeight: height, pixelRatio: 3, safeArea: { top: safeTop, bottom: safeBottom } }),
      getStorageSync: () => null, setStorageSync() {}, onTouchStart() {}, setPreferredFramesPerSecond() {}
    };
    t.after(() => { delete global.wx; });
    const { GameApp } = require("../src/ui/app");
    const app = new GameApp({ getContext: () => layoutContext(draws) });
    app.startGame("community");
    app.state.roleIndex = 2;
    app.state.rankIndex = 4;
    app.state.appointment = { type: "leadership", roleIndex: 2, rankIndex: 4 };
    app.panel = { id: "desk" };
    draws.length = 0;
    app.render();

    const title = ROLES[2].name;
    const titleDraws = draws.filter((draw) => title.includes(draw.value) && draw.size === 26);
    assert.ok(titleDraws.length >= (width === 320 ? 2 : 1));
    assert.equal(titleDraws.map((draw) => draw.value).join(""), title);
    for (const draw of draws) {
      if (draw.align !== "left") continue;
      const measured = [...draw.value].reduce((sum, character) =>
        sum + (/\p{Script=Han}/u.test(character) ? draw.size : draw.size * 0.58), 0);
      assert.ok(draw.x + measured <= width + 0.01, `${draw.value} exceeds ${width}px`);
    }
    for (const button of app.buttons) {
      assert.ok(button.x >= 0 && button.x + button.width <= width, button.label);
    }
    assert.ok(app.maxScroll() >= 0);
  });
}

test("annual dashboard keeps its hierarchy and content inside mainstream phone widths", (t) => {
  const devices = [
    [320, 568, 24, 548],
    [360, 800, 32, 776],
    [375, 667, 20, 647],
    [390, 844, 47, 810],
    [393, 852, 59, 818],
    [412, 915, 24, 891],
    [430, 932, 59, 898]
  ];
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");

  for (const [width, height, safeTop, safeBottom] of devices) {
    const draws = [];
    global.wx = {
      getWindowInfo: () => ({ windowWidth: width, windowHeight: height, pixelRatio: 3, safeArea: { top: safeTop, bottom: safeBottom } }),
      getStorageSync: () => null, setStorageSync() {}, onTouchStart() {}, setPointerCapture() {}, setPreferredFramesPerSecond() {}
    };
    const app = new GameApp({ getContext: () => layoutContext(draws) });
    app.startGame("community");
    app.state.roleIndex = ROLES.length - 1;
    app.state.yearsInRole = 12;
    app.state.life.relationship = "married";
    app.state.life.child = { name: "小满", bornCareerYear: 1 };
    app.panel = { id: "desk" };
    draws.length = 0;
    app.render();

    for (const draw of draws) {
      const textWidth = measuredWidth(draw);
      const left = draw.align === "right" ? draw.x - textWidth : draw.align === "center" ? draw.x - textWidth / 2 : draw.x;
      const right = draw.align === "right" ? draw.x : draw.align === "center" ? draw.x + textWidth / 2 : draw.x + textWidth;
      assert.ok(left >= -0.5 && right <= width + 0.5, `${width}px: ${draw.value}`);
    }
    for (const button of app.buttons) {
      assert.ok(button.x >= 0 && button.x + button.width <= width, `${width}px: ${button.label}`);
    }
    const actions = app.buttons.filter((button) => /^\d{2}  /.test(button.label));
    assert.equal(actions.length, 7);
    const primary = app.buttons.find((button) => button.label === "开始我的仕途");
    assert.ok(primary);
    assert.equal(primary.y, 384);
    assert.ok(primary.y < actions.find((button) => button.label.startsWith("03  ")).y);
  }
});

// Every authored story page is exercised at every supported width. Long natural
// language titles used to be drawn on a single line and overflowed 320px
// screens; the event page was not covered by the older matrix.
test("every event page keeps its title, body and choices inside the screen", (t) => {
  const { EVENTS } = require("../src/data/events");
  const devices = [
    [320, 568, 24, 548],
    [360, 800, 32, 776],
    [375, 667, 20, 647],
    [390, 844, 47, 810],
    [393, 852, 59, 818],
    [412, 915, 24, 891],
    [430, 932, 59, 898]
  ];
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");

  for (const [width, height, safeTop, safeBottom] of devices) {
    const draws = [];
    global.wx = {
      getWindowInfo: () => ({ windowWidth: width, windowHeight: height, pixelRatio: 3, safeArea: { top: safeTop, bottom: safeBottom } }),
      getStorageSync: () => null, setStorageSync() {}, onTouchStart() {}, setPreferredFramesPerSecond() {}
    };
    const app = new GameApp({ getContext: () => layoutContext(draws) });
    app.startGame("community");

    for (const event of EVENTS) {
      app.state = {
        ...app.state,
        phase: "event",
        currentEventId: event.id,
        roleIndex: event.roleLevels[0],
        appointment: null,
        startOfYearResults: [],
        queue: []
      };
      app.panel = null;
      app.screen = "play";
      draws.length = 0;
      app.render();

      for (const draw of draws) {
        const textWidth = measuredWidth(draw);
        const left = draw.align === "right" ? draw.x - textWidth : draw.align === "center" ? draw.x - textWidth / 2 : draw.x;
        const right = draw.align === "right" ? draw.x : draw.align === "center" ? draw.x + textWidth / 2 : draw.x + textWidth;
        assert.ok(left >= -0.5 && right <= width + 0.5, `${width}px ${event.id}: "${draw.value}"`);
      }
      for (const button of app.buttons) {
        assert.ok(button.x >= 0 && button.x + button.width <= width, `${width}px ${event.id}: ${button.label}`);
      }
      // The title must be fully rendered (wrapped), never truncated. Title
      // glyphs are the only text drawn at 19px or larger on this page.
      const titleText = draws.filter((draw) => draw.size >= 19).map((draw) => draw.value).join("");
      assert.equal(titleText, event.title, `${width}px ${event.id}: title not fully drawn`);
      assert.ok(app.maxScroll() >= 0);
    }
  }
});
