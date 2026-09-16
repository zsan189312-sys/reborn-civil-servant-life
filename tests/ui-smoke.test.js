"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

function createContext() {
  return {
    arcTo() {},
    beginPath() {},
    clearRect() {},
    clip() {},
    closePath() {},
    fill() {},
    fillRect() {},
    fillText() {},
    lineTo() {},
    measureText(value) { return { width: String(value).length * 8 }; },
    moveTo() {},
    rect() {},
    restore() {},
    save() {},
    scale() {},
    stroke() {},
    translate() {},
    set fillStyle(_value) {},
    set font(_value) {},
    set globalAlpha(_value) {},
    set lineWidth(_value) {},
    set strokeStyle(_value) {},
    set textAlign(_value) {},
    set textBaseline(_value) {}
  };
}

function finishAnnualWork(state, engine, events) {
  let next = state;
  while (["event", "result"].includes(next.phase)) {
    next = next.phase === "event" ? engine.selectChoice(next, events, 0) : engine.advanceAfterResult(next, events);
  }
  return next;
}

function reachReview(state, engine, events) {
  const next = finishAnnualWork(state, engine, events);
  return next.phase === "planning" ? engine.finalizeAnnualPlanning(next) : next;
}

test("small-screen follow-ups recall the real prior choice, scroll and preserve the chosen consequence", (t) => {
  let stored = null;
  const painted = [];
  global.wx = { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }), getStorageSync: () => stored, setStorageSync: (_key, value) => { stored = value; }, onTouchStart() {} };
  t.after(() => { delete global.wx; });
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const { GameApp } = require("../src/ui/app");
  const engine = require("../src/core/engine");
  const { EVENTS } = require("../src/data/events");
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  app.state.queue = [];
  app.state.currentEventId = "town_last_stamp"; app.state.seen.town_last_stamp = 1;
  app.state = engine.selectChoice(app.state, EVENTS, 0);
  app.state = reachReview(app.state, engine, EVENTS);
  app.state = engine.completeReview(app.state, EVENTS);
  assert.equal(app.state.currentEventId, "followup_stamp_together");
  app.state.appointment = null; app.state.startOfYearResults = [];
  app.saveAndRender(); app.panel = null; painted.length = 0; app.render();
  const text = painted.join("");
  assert.ok(text.includes("往事回响 · 第 1 年「差一枚章」"), text);
  assert.ok(text.includes("当时你选择：留下核对两张清单，约齐两个窗口一次说清"));
  const restored = new GameApp({ getContext: () => ctx }); restored.continueGame();
  restored.panel = null; restored.render();
  assert.ok(restored.maxScroll() > 0);
  restored.scrollY = restored.maxScroll(); restored.render();
  const target = restored.buttons.find((button) => button.label.startsWith("2."));
  const point = { clientX: target.x + target.width / 2, clientY: target.y + target.height / 2 + restored.topInset - restored.scrollY };
  assert.ok(point.clientY > restored.topInset && point.clientY < 568);
  restored.handleTouch({ touches: [point] }); restored.handleEnd({ changedTouches: [point] });
  assert.equal(restored.state.phase, "result");
  assert.equal(stored.state.history.at(-1).eventId, "followup_stamp_together");
  assert.equal(stored.state.history.at(-1).choiceIndex, 1);
  assert.equal(engine.validateSavedGame(stored.state), true);
});

test("a project temptation reads clearly, pays only the authored game cash and restores its consequence", (t) => {
  let stored = null;
  const painted = [];
  global.wx = { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }), getStorageSync: () => stored, setStorageSync: (_key, value) => { stored = value; }, onTouchStart() {} };
  t.after(() => { delete global.wx; });
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const { GameApp } = require("../src/ui/app");
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  app.state.roleIndex = 3; app.state.currentEventId = "county_friend_project"; app.state.seen.county_friend_project = 1;
  app.panel = null; painted.length = 0; app.render();
  assert.ok(painted.join("").includes("利益抉择 · 虚构剧情"));
  assert.ok(painted.join("").includes("酒在后备箱里"));
  assert.ok(painted.join("").includes("五万咨询费"));
  assert.ok(app.maxScroll() > 0);
  app.buttons.find((button) => button.label.startsWith("3.")).onPress();
  assert.equal(app.state.assets, 7);
  assert.equal(app.state.stats.integrity, 43);
  assert.ok(painted.join("").includes("项目推进得异常顺利"));
  assert.ok(painted.join("").includes("积蓄 +5"));
  const restored = new GameApp({ getContext: () => ctx }); restored.continueGame(); restored.panel = null; painted.length = 0; restored.render();
  assert.ok(painted.join("").includes("项目推进得异常顺利"));
  assert.equal(restored.state.history.at(-1).eventId, "county_friend_project");
});

test("annual desk is the default, shows honest account status and routes numbered actions", (t) => {
  const painted = [];
  global.wx = { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }), getStorageSync: () => null, setStorageSync() {}, onTouchStart() {} };
  t.after(() => { delete global.wx; });
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const { GameApp } = require("../src/ui/app");
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("study");
  assert.equal(app.panel.id, "desk");
  for (const text of ["党政办公室 · 青禾镇", "仕途阶段：基层起步", "公积金 0.00", "年金 0.00", "当前目标", "晋升风声", "本年收入", "本年支出", "本年预计结余", "可支配现金", "家庭净资产", "能力", "政绩", "民望", "廉洁", "家庭", "健康"]) assert.ok(painted.join("").includes(text), text);
  assert.equal(app.buttons.filter((button) => /^\d{2}  /.test(button.label)).length, 7);
  assert.ok(painted.join("").includes("22岁，到青禾镇报到。第一件事在等你。"));
  const original = JSON.stringify(app.state);
  app.buttons.find((button) => button.label.startsWith("02  ")).onPress();
  assert.equal(app.panel.id, "lifeActions");
  assert.ok(app.buttons.some((button) => button.label.includes("安排：认真认识")));
  app.buttons.find((button) => button.label === "返回").onPress();
  assert.equal(app.panel.id, "desk");
  assert.equal(JSON.stringify(app.state), original);
  app.buttons.find((button) => button.label === "开始我的仕途").onPress();
  assert.equal(app.panel, null);
  assert.ok(app.buttons.some((button) => button.label.startsWith("1.")));

  app.savedGame = { ...app.state, careerYear: 15, roleIndex: 2 };
  app.state = null; app.panel = null; app.screen = "home"; painted.length = 0; app.render();
  assert.ok(painted.join("").includes("青禾镇党委委员、副镇长"));
  assert.ok(app.buttons.some((button) => button.label === "继续第 15 年"));
  assert.ok(!app.buttons.some((button) => button.label.includes("党委副书记")));
});

test("entry labels guide all backgrounds and saved phases without restarting progress", (t) => {
  let stored = null;
  const painted = [];
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }),
    getStorageSync: () => stored,
    setStorageSync: (_key, value) => { stored = value; },
    onTouchStart() {}
  };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const engine = require("../src/core/engine");
  const { EVENTS } = require("../src/data/events");
  const { BACKGROUNDS } = require("../src/core/constants");
  const ctx = createContext();
  ctx.fillText = (value) => painted.push(String(value));
  for (const background of BACKGROUNDS) {
    stored = null;
    const app = new GameApp({ getContext: () => ctx });
    app.screen = "background"; app.render();
    assert.ok(painted.join("").includes("选择你的前世经历"));
    app.startGame(background.id);
    const before = JSON.stringify(app.state);
    app.buttons.find((button) => button.label === "开始我的仕途").onPress();
    assert.equal(app.panel, null);
    assert.ok(app.buttons.some((button) => /^1\./.test(button.label)));
    assert.equal(JSON.stringify(app.state), before);
    const restored = new GameApp({ getContext: () => ctx });
    restored.continueGame();
    assert.ok(restored.buttons.some((button) => button.label === "开始我的仕途"));
    restored.buttons.find((button) => button.label === "开始我的仕途").onPress();
    restored.buttons.find((button) => /^1\./.test(button.label)).onPress();
    restored.panel = { id: "desk" }; restored.render();
    const resultBefore = JSON.stringify(restored.state);
    restored.buttons.find((button) => button.label === "继续剧情").onPress();
    assert.equal(restored.state.phase, "result");
    assert.equal(JSON.stringify(restored.state), resultBefore);
    restored.state = reachReview(restored.state, engine, EVENTS);
    restored.panel = { id: "desk" }; restored.render();
    restored.buttons.find((button) => button.label === "查看年终结果").onPress();
    assert.equal(restored.state.phase, "review");
    restored.state = engine.completeReview(restored.state, EVENTS);
    restored.panel = null; restored.render();
    if (restored.state.appointment) {
      restored.buttons.find((button) => button.label === "赴任，开始新一年" || button.label === "接受调整，重新履职").onPress();
    }
    restored.panel = { id: "desk" }; restored.render();
    assert.ok(restored.buttons.some((button) => button.label === "继续剧情"));
    assert.ok(!restored.buttons.some((button) => button.label === "开始我的仕途"));
    restored.state.appointment = null;
    restored.state = engine.leaveCareer(restored.state);
    restored.panel = { id: "desk" }; restored.render();
    restored.buttons.find((button) => button.label === "查看人生结局").onPress();
    assert.equal(restored.state.phase, "ending");
  }
});

test("account pages show forecasts, restricted balances and funding splits without silently spending", (t) => {
  let stored = null;
  const painted = [];
  global.wx = { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }), getStorageSync: () => stored, setStorageSync: (_key, value) => { stored = value; }, onTouchStart() {} };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const engine = require("../src/core/engine");
  const { EVENTS } = require("../src/data/events");
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  const before = JSON.stringify(app.state);
  for (const token of ["50.00", "20%", "1/11", "−1.40"]) {
    const lines = app.measureWrappedLines(`甲乙丙${token}万，丁`, 64, 14);
    assert.ok(lines.some((line) => line.includes(token)), token);
    assert.equal(lines.join(""), `甲乙丙${token}万，丁`);
  }
  app.buttons.find((b) => b.label.includes("财务账户")).onPress();
  assert.equal(app.panel.focus, "housingFund");
  assert.ok(painted.join("").includes("本年预计入账 +1.40 万"));
  app.buttons.find((b) => b.label === "职业年金").onPress();
  assert.ok(painted.join("").includes("不设退休领取"));
  assert.ok(!app.buttons.some((b) => /提取|提现/.test(b.label)));
  assert.equal(JSON.stringify(app.state), before);
  app.state = reachReview(app.state, engine, EVENTS);
  app.state = engine.completeReview(app.state, EVENTS);
  app.state.appointment = null; app.state.startOfYearResults = []; app.state.assets = 48.6;
  app.state = finishAnnualWork(app.state, engine, EVENTS);
  app.saveAndRender();
  app.panel = { id: "lifeActions", focus: "home" }; app.render();
  app.buttons.find((b) => b.label === "安排：购置自住住房").onPress();
  assert.ok(painted.join("").includes("现金支付 48.60 万"));
  const prePurchase = JSON.stringify(app.state);
  app.buttons.find((b) => b.label === "取消").onPress();
  assert.equal(JSON.stringify(app.state), prePurchase);
  app.panel = { id: "lifeActions", focus: "home" }; app.render();
  app.buttons.find((b) => b.label === "安排：购置自住住房").onPress();
  app.buttons.find((b) => b.label === "确认").onPress();
  assert.equal(stored.state.accounts.housingFund, 0);
  assert.equal(app.panel.id, "lifeResult");
  assert.ok(painted.join("").includes("本次支付：公积金 1.40 万"));
  assert.equal(stored.state.accounts.annuity, 0.7);
  assert.equal(stored.state.assets, 0);
  const restored = new GameApp({ getContext: () => ctx }); restored.continueGame();
  restored.panel = { id: "accounts", focus: "housingFund" }; painted.length = 0; restored.render();
  assert.ok(painted.join("").includes("自住房抵扣 −1.40 万"));
  assert.ok(restored.maxScroll() > 0);
  restored.panel = { id: "history", page: 0 }; restored.render();
  assert.ok(painted.join("").includes("其中公积金 1.40，现金 48.60 万"));
});

test("child arrangement confirms its ongoing budget, restores family and shows yearly growth", (t) => {
  let stored = null;
  const painted = [];
  global.wx = { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }), getStorageSync: () => stored, setStorageSync: (_key, value) => { stored = value; }, onTouchStart() {} };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const engine = require("../src/core/engine");
  const { EVENTS } = require("../src/data/events");
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  assert.ok(painted.join("").includes("子女 0"));
  app.state = finishAnnualWork(app.state, engine, EVENTS);
  app.state.life.relationship = "married"; app.state.assets = 10;
  app.panel = { id: "lifeActions" }; app.render();
  const before = JSON.stringify(app.state);
  app.buttons.find((b) => b.label === "安排：迎接一个孩子").onPress();
  assert.ok(painted.join("").includes("每年支出 2 万"));
  app.buttons.find((b) => b.label === "取消").onPress();
  assert.equal(JSON.stringify(app.state), before);
  app.panel = { id: "lifeActions" }; app.render();
  app.buttons.find((b) => b.label === "安排：迎接一个孩子").onPress();
  app.buttons.find((b) => b.label === "确认").onPress();
  assert.equal(stored.state.life.child.name, "小满");
  const restored = new GameApp({ getContext: () => ctx }); restored.continueGame();
  assert.equal(restored.state.phase, "review");
  restored.panel = { id: "desk" }; restored.render();
  assert.ok(painted.join("").includes("小满 0 岁"));
  restored.panel = null; painted.length = 0; restored.render();
  assert.ok(painted.join("").includes("年度支出已包含子女预算 2.00 万"));
  restored.state = engine.completeReview(restored.state, EVENTS); restored.saveAndRender();
  restored.panel = { id: "desk" }; restored.render();
  assert.ok(painted.join("").includes("小满 1 岁"));
});

test("promotion gossip offers one risky choice and the last result settles year-end automatically", (t) => {
  let stored = null;
  const painted = [];
  global.wx = { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }), getStorageSync: () => stored, setStorageSync: (_key, value) => { stored = value; }, onTouchStart() {} };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("study");
  painted.length = 0;
  app.buttons.find((b) => b.label.includes("晋升风声")).onPress();
  assert.equal(app.panel.id, "promotion");
  assert.ok(painted.join("").includes("当前晋升机会"));
  assert.ok(app.buttons.some((b) => b.label.includes("正常汇报")));
  assert.ok(app.buttons.some((b) => b.label.includes("赴饭局")));
  assert.ok(app.buttons.some((b) => b.label.includes("礼盒带红包")));
  app.buttons.find((b) => b.label.includes("正常汇报")).onPress();
  assert.equal(app.state.promotionPlan.choice, "report");
  assert.ok(painted.join("").includes("不保证晋升"));
  app.buttons.find((b) => b.label === "回到年度档案").onPress();
  assert.ok(!app.buttons.some((b) => b.label.includes("年终总结")));
  const engine = require("../src/core/engine");
  const { EVENTS } = require("../src/data/events");
  while (app.state.queue.length) {
    app.state = engine.selectChoice(app.state, EVENTS, 0);
    app.state = engine.advanceAfterResult(app.state, EVENTS);
  }
  app.state = engine.selectChoice(app.state, EVENTS, 0);
  app.panel = null; app.render();
  app.buttons.find((b) => b.label.includes("自动年终结算")).onPress();
  assert.equal(app.state.phase, "review");
  assert.equal(app.state.review.promotionMode, "automatic");
  assert.ok(painted.join("").includes("年度履职报告"));
});

test("turning the year continues into the next story without reopening the dashboard", (t) => {
  let stored = null;
  const painted = [];
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568, pixelRatio: 1 }),
    getStorageSync: () => stored,
    setStorageSync: (_key, value) => { stored = value; },
    onTouchStart() {}, setPreferredFramesPerSecond() {}
  };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const engine = require("../src/core/engine");
  const { EVENTS } = require("../src/data/events");
  const ctx = createContext();
  ctx.fillText = (value) => { painted.push(String(value)); };
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  app.state = reachReview(app.state, engine, EVENTS);
  app.panel = null;
  painted.length = 0;
  app.render();
  const nextYear = app.buttons.find((button) => button.label === "翻到下一年");
  assert.ok(nextYear);
  nextYear.onPress();
  assert.equal(app.state.careerYear, 2);
  assert.equal(app.state.phase, "event");
  assert.equal(app.panel, null);
  assert.equal(app.screen, "play");
  assert.ok(!painted.includes("年度工作 · 1/1"));
  assert.equal(stored.state.careerYear, 2);
});

test("appointment modal blocks other actions then continues directly into the new-year story", (t) => {
  global.wx = { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }), getStorageSync: () => null, setStorageSync() {}, onTouchStart() {} };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const app = new GameApp({ getContext: () => createContext() });
  app.startGame("community");
  app.state.roleIndex = 1;
  app.state.rankIndex = 2;
  app.state.appointment = { type: "leadership", roleIndex: 1, rankIndex: 2 };
  app.render();
  const balance = app.state.assets;
  assert.equal(app.buttons.length, 1);
  app.buttons[0].onPress();
  assert.equal(app.state.appointment, null);
  assert.equal(app.panel, null);
  assert.equal(app.screen, "play");
  assert.equal(app.state.assets, balance);
  assert.ok(app.buttons.some((button) => /^1\. /.test(button.label)));
});

test("life overview actions require confirmation and persist into the full history", (t) => {
  let stored = null;
  const painted = [];
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568, pixelRatio: 1 }),
    getStorageSync: () => stored,
    setStorageSync: (_key, value) => { stored = value; },
    onTouchStart() {}
  };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  const engine = require("../src/core/engine");
  const { EVENTS } = require("../src/data/events");
  app.state = finishAnnualWork(app.state, engine, EVENTS);
  app.panel = { id: "desk" }; app.render();
  app.buttons.find((button) => button.label === "人生").onPress();
  assert.equal(app.panel.id, "desk");
  app.buttons.find((button) => button.label.includes("生活详情")).onPress();
  assert.equal(app.panel.id, "profile");
  assert.ok(painted.join("").includes("普通租住"));
  app.buttons.find((button) => button.label === "年度安排").onPress();
  assert.ok(!app.buttons.some((button) => button.label === "安排：购置自住住房"));
  const before = JSON.stringify(app.state);
  app.buttons.find((button) => button.label === "安排：认真认识一个人").onPress();
  app.buttons.find((button) => button.label === "取消").onPress();
  assert.equal(JSON.stringify(app.state), before);
  app.panel = { id: "lifeActions" }; app.render();
  app.buttons.find((button) => button.label === "安排：认真认识一个人").onPress();
  app.buttons.find((button) => button.label === "确认").onPress();
  assert.equal(app.panel.id, "lifeResult");
  assert.equal(app.state.life.relationship, "dating");
  assert.equal(stored.state.life.actions.length, 1);
  const restored = new GameApp({ getContext: () => ctx });
  restored.continueGame();
  restored.panel = { id: "history", page: 0 }; painted.length = 0; restored.render();
  assert.ok(painted.join("").includes("林溪"));
  restored.panel = { id: "lifeActions" }; restored.render();
  assert.ok(!restored.buttons.some((button) => button.label.startsWith("安排：")));
});

test("career overview explains previous and new posts without fabricating lateral transfers", (t) => {
  global.wx = { getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568 }), getStorageSync: () => null, setStorageSync() {}, onTouchStart() {} };
  t.after(() => { delete global.wx; });
  const painted = [];
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const { GameApp } = require("../src/ui/app");
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  app.state.annualReports = [{ year: 2, roleIndex: 0, rankIndex: 1, promoted: true }];
  app.panel = { id: "career" }; app.render();
  assert.ok(painted.join("").includes("青禾镇党政办公室一级科员 → 青禾镇民政办公室负责人、四级主任科员"));
  assert.ok(painted.join("").includes("录用起点"));
});

test("life-story results show a concise narrative while history preserves the full version", (t) => {
  let stored = null;
  const painted = [];
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568, pixelRatio: 1, safeArea: { top: 24, bottom: 548 } }),
    getStorageSync: () => stored,
    setStorageSync: (_key, value) => { stored = value; },
    onTouchStart() {}
  };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const engine = require("../src/core/engine");
  const { EVENTS } = require("../src/data/events");
  const ctx = createContext();
  ctx.fillText = (value, x, y) => { painted.push({ value: String(value), x, y }); };
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  app.state.currentEventId = "life_family_group_promise";
  app.state.queue = [];
  app.state = engine.selectChoice(app.state, EVENTS, 0);
  painted.length = 0;
  app.saveAndRender();
  const outcome = app.state.lastResult.outcome;
  assert.ok(!painted.map((item) => item.value).join("").includes(outcome));
  assert.ok(painted.map((item) => item.value).join("").includes(outcome.slice(0, 20)));
  const button = app.buttons.find((item) => item.label.includes("自动年终结算"));
  assert.ok(button.y + button.height + app.topInset > 548);
  const changes = painted.filter((item) => /^(家庭|健康|政绩)[+-]/.test(item.value));
  assert.ok(changes.every((item) => item.y < button.y - 20));
  assert.ok(app.contentHeight >= button.y + button.height);

  const restored = new GameApp({ getContext: () => ctx });
  restored.continueGame();
  assert.equal(restored.state.lastResult.outcome, outcome);
  restored.buttons.find((button) => button.label === "继续剧情").onPress();
  restored.scrollY = restored.maxScroll();
  restored.render();
  const target = restored.buttons.find((item) => item.label.includes("自动年终结算"));
  const touch = { clientX: target.x + target.width / 2, clientY: target.y + target.height / 2 + restored.topInset - restored.scrollY };
  assert.ok(touch.clientY < 548 && touch.clientY > restored.topInset);
  restored.handleTouch({ touches: [touch] });
  painted.length = 0;
  restored.handleEnd({ changedTouches: [touch] });
  assert.equal(restored.state.phase, "review");
  assert.equal(restored.panel, null);
  assert.ok(painted.map((item) => item.value).join("").includes("年度履职报告"));
  assert.equal(restored.state.review.promotionMode, "automatic");

  painted.length = 0;
  restored.panel = { id: "history", page: 0 };
  restored.render();
  assert.ok(painted.map((item) => item.value).join("").includes(outcome));
});

test("appointment screens distinguish leadership and rank-only advancement and survive reload", (t) => {
  let stored = null;
  const painted = [];
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568, pixelRatio: 1 }),
    getStorageSync: () => stored,
    setStorageSync: (_key, value) => { stored = value; },
    onTouchStart() {}, setPreferredFramesPerSecond() {}
  };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const ctx = createContext();
  ctx.fillText = (value) => { painted.push(String(value)); };
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("study");
  app.state.roleIndex = 1;
  app.state.rankIndex = 2;
  app.state.appointment = { type: "leadership", roleIndex: 1, rankIndex: 2 };
  app.saveAndRender();
  assert.ok(painted.includes("内部轮岗结果"));
  assert.match(painted.join(""), /青禾镇民政办负责人/);
  assert.ok(app.buttons.some((button) => button.label === "赴任，开始新一年"));
  app.buttons.find((button) => button.label === "赴任，开始新一年").onPress();
  assert.equal(app.state.appointment, null);
  assert.equal(app.panel, null);
  assert.equal(app.screen, "play");
  assert.equal(stored.state.appointment, null);

  app.state.rankIndex = 3;
  app.state.appointment = { type: "rank", roleIndex: 1, rankIndex: 3 };
  app.saveAndRender();
  painted.length = 0;
  const restored = new GameApp({ getContext: () => ctx });
  restored.continueGame();
  assert.equal(restored.state.appointment.type, "rank");
  assert.ok(painted.includes("三级主任科员"));
  assert.match(painted.join(""), /当前职务不变/);
  assert.equal(restored.state.roleIndex, 1);
});

test("canvas UI can start a new game and make a choice", () => {
  let touchHandler = null;
  let saved = null;
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 375, windowHeight: 667, pixelRatio: 2 }),
    getStorageSync: () => saved,
    onTouchStart: (handler) => { touchHandler = handler; },
    setPreferredFramesPerSecond() {},
    setStorageSync: (_key, value) => { saved = value; }
  };
  const canvas = { width: 0, height: 0, getContext: () => createContext() };
  const { GameApp } = require("../src/ui/app");
  const app = new GameApp(canvas);

  assert.equal(app.screen, "home");
  assert.ok(touchHandler);
  app.buttons.find((button) => button.label === "重回录用那一年").onPress();
  assert.equal(app.screen, "background");
  const chooseButton = app.buttons.find((button) => button.label === "选择");
  chooseButton.onPress();
  assert.equal(app.screen, "play");
  assert.equal(app.state.phase, "event");
  assert.ok(saved);

  assert.equal(app.panel.id, "desk");
  app.buttons.find((button) => button.label === "开始我的仕途").onPress();
  app.buttons.find((button) => button.label.startsWith("1.")).onPress();
  assert.equal(app.state.phase, "result");
  assert.equal(app.state.history.length, 1);
  delete global.wx;
});

test("small-screen swipes reveal choices without selecting and taps use scrolled coordinates", (t) => {
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568, pixelRatio: 2, safeArea: { top: 24, bottom: 548 } }),
    getStorageSync: () => null,
    onTouchStart() {}, setStorageSync() {}, setPreferredFramesPerSecond() {}
  };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const app = new GameApp({ getContext: () => createContext() });
  app.startGame("community");
  app.buttons.find((button) => button.label === "开始我的仕途").onPress();
  const target = app.buttons.find((button) => button.label.startsWith("3.")) || app.buttons.find((button) => button.label.startsWith("2."));
  assert.ok(target.y + target.height + app.topInset > 548);
  app.handleTouch({ touches: [{ clientX: 100, clientY: 460 }] });
  app.handleMove({ touches: [{ clientX: 100, clientY: 240 }] });
  app.handleEnd({ changedTouches: [{ clientX: 100, clientY: 240 }] });
  assert.equal(app.state.history.length, 0);
  assert.ok(app.scrollY > 0);
  const touch = { clientX: target.x + target.width / 2, clientY: target.y + target.height / 2 + app.topInset - app.scrollY };
  app.handleTouch({ touches: [touch] });
  app.handleEnd({ changedTouches: [touch] });
  assert.equal(app.state.phase, "result");
  assert.equal(app.state.history.length, 1);
});

test("small-screen criminal ending shows its fictional sentence, causal story and reachable actions", (t) => {
  const painted = [];
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 320, windowHeight: 568, pixelRatio: 1 }),
    getStorageSync: () => null, onTouchStart() {}, setStorageSync() {}, setPreferredFramesPerSecond() {}
  };
  t.after(() => { delete global.wx; });
  const ctx = createContext(); ctx.fillText = (value) => painted.push(String(value));
  const { GameApp } = require("../src/ui/app");
  const engine = require("../src/core/engine");
  const app = new GameApp({ getContext: () => ctx });
  app.state = engine.createNewGame("community", 77);
  app.state.phase = "ending";
  app.state.endingId = "criminal_conviction";
  app.state.accountability.caseStatus = "convicted";
  app.state.accountability.sentenceExposure = 12;
  app.state.accountability.sentenceYears = 12;
  app.screen = "play"; app.panel = null; painted.length = 0; app.render();
  const text = painted.join("");
  assert.ok(text.includes("法槌落下"));
  assert.ok(text.includes("有期徒刑 12 年"));
  assert.ok(text.includes("三百万元转账"));
  assert.ok(text.includes("不构成现实量刑说明"));
  assert.ok(app.contentHeight > app.height);
  assert.ok(app.buttons.some((button) => button.label === "回看本局履历"));
  app.scrollY = app.maxScroll(); app.render();
  assert.ok(app.buttons.find((button) => button.label === "回到首页").y > 568);
});

test("failed storage does not crash play, and replacing a save requires confirmation", (t) => {
  global.wx = {
    getWindowInfo: () => ({ windowWidth: 375, windowHeight: 812, pixelRatio: 1 }),
    getStorageSync: () => null, onTouchStart() {},
    setStorageSync: () => { throw new Error("storage full"); }
  };
  t.after(() => { delete global.wx; });
  const { GameApp } = require("../src/ui/app");
  const app = new GameApp({ getContext: () => createContext() });
  app.startGame("community");
  assert.match(app.notice, /保存失败/);
  const oldState = app.state;
  app.startGame("study");
  assert.equal(app.panel.id, "confirm");
  assert.equal(app.state, oldState);
  app.buttons.find((button) => button.label === "取消").onPress();
  assert.equal(app.state, oldState);
  app.startGame("study");
  app.buttons.find((button) => button.label === "确认").onPress();
  assert.equal(app.state.backgroundId, "study");
});

test("foreground return repaints the open story and a window change re-fits the layout", (t) => {
  const handlers = {};
  let metrics = { windowWidth: 320, windowHeight: 568, pixelRatio: 2, safeArea: { top: 24, bottom: 548 } };
  let stored = null;
  global.wx = {
    getWindowInfo: () => metrics,
    getStorageSync: () => stored,
    setStorageSync: (_key, value) => { stored = value; },
    onTouchStart(handler) { handlers.start = handler; },
    onTouchEnd(handler) { handlers.end = handler; },
    onShow(handler) { handlers.show = handler; },
    onHide(handler) { handlers.hide = handler; },
    onWindowResize(handler) { handlers.resize = handler; }
  };
  t.after(() => { delete global.wx; });
  const ctx = createContext();
  const painted = [];
  ctx.fillText = (value, x, y) => painted.push({ value: String(value), x, y });
  const { GameApp } = require("../src/ui/app");
  const app = new GameApp({ getContext: () => ctx });
  app.startGame("community");
  app.panel = null;
  app.render();

  assert.equal(typeof handlers.show, "function", "onShow is registered");
  assert.equal(typeof handlers.resize, "function", "onWindowResize is registered");
  assert.equal(app.state.phase, "event");
  const eventId = app.state.currentEventId;

  painted.length = 0;
  handlers.show();
  assert.ok(painted.length > 0, "returning to the foreground repainted the frame");
  assert.equal(app.state.currentEventId, eventId, "the open story was kept");
  assert.equal(app.screen, "play");

  // A touch interrupted by backgrounding must not turn into a tap afterwards.
  handlers.start({ touches: [{ clientX: 12, clientY: 12 }] });
  handlers.hide();
  painted.length = 0;
  handlers.end({ changedTouches: [{ clientX: 12, clientY: 12 }] });
  assert.equal(painted.length, 0, "the interrupted gesture did nothing");

  // A window-metric change must re-fit the canvas and every button.
  metrics = { windowWidth: 430, windowHeight: 932, pixelRatio: 3, safeArea: { top: 59, bottom: 898 } };
  handlers.resize();
  assert.equal(app.width, 430);
  assert.equal(app.pixelRatio, 3);
  assert.ok(app.buttons.length > 0);
  for (const button of app.buttons) {
    assert.ok(button.x >= 0 && button.x + button.width <= 430, button.label);
  }
});
