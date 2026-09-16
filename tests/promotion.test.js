"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");

function ready(roleIndex = 0) {
  const state = engine.beginYear(engine.createNewGame("study", 1234), EVENTS);
  state.roleIndex = roleIndex;
  state.yearsInRole = 2;
  state.yearsInRank = 1;
  Object.keys(state.stats).forEach((key) => { state.stats[key] = 90; });
  return state;
}
function finish(input) {
  let state = input;
  while (["event", "result"].includes(state.phase)) state = state.phase === "event" ? engine.selectChoice(state, EVENTS, 0) : engine.advanceAfterResult(state, EVENTS);
  if (state.phase === "planning") state = engine.finalizeAnnualPlanning(state);
  return state;
}

test("year-end transfer is automatic and a normal report is free and non-mutating", () => {
  const state = ready();
  const before = JSON.stringify(state);
  const review = engine.calculateReview(state);
  assert.equal(review.promotionMode, "automatic");
  assert.equal(review.promoted, true);
  assert.equal(JSON.stringify(state), before);
  assert.equal(state.assets, 2);
  const reported = engine.setPromotionChoice(state, "report");
  assert.equal(JSON.stringify(state), before);
  assert.equal(reported.assets, 2);
  assert.equal(reported.promotionPlan.choice, "report");
  assert.equal(reported.promotionPlan.bonus, 1);
  assert.equal(reported.stats.integrity, 91);
  assert.equal(engine.validateSavedGame(reported), true);
});

test("dinners and gifts trade cash and integrity for uncertain promotion influence", () => {
  const dinner = engine.setPromotionChoice(ready(), "dinner");
  assert.equal(dinner.assets, 1.7);
  assert.equal(dinner.promotionPlan.bonus, 4);
  assert.equal(dinner.stats.integrity <= 85, true);
  assert.throws(() => engine.setPromotionChoice(dinner, "gift"), /已经作出选择/);

  const giftBase = ready(); giftBase.assets = 2;
  const gift = engine.setPromotionChoice(giftBase, "gift");
  assert.equal(gift.assets, 1.2);
  assert.equal(gift.promotionPlan.bonus, 8);
  assert.equal(gift.stats.integrity <= 78, true);
  const review = engine.calculateReview(gift);
  assert.equal(review.relationshipBonus, gift.promotionPlan.detected ? 0 : 8);
  assert.equal(review.reasons.includes("请客送礼引发核查，本年不予提拔"), gift.promotionPlan.detected);
  assert.equal(engine.validateSavedGame(gift), true);
});

test("automatic transfer never bypasses tenure, performance, integrity, score or health", () => {
  const cases = [
    [(s) => { s.roleIndex = 7; s.yearsInRole = 0; }, /至少 2 年/],
    [(s) => { s.stats.performance = 0; }, /政绩需/],
    [(s) => { s.stats.integrity = 20; }, /廉洁需/],
    [(s) => { s.stats.ability = 0; s.stats.trust = 0; s.stats.performance = 44; s.stats.integrity = 45; }, /总分未达到/],
    [(s) => { s.stats.health = 0; }, /健康状态/]
  ];
  for (const [mutate, reason] of cases) {
    const state = ready(); mutate(state);
    const review = engine.calculateReview(state);
    assert.equal(review.promoted, false);
    assert.match(review.reasons.join("；"), reason);
  }
});

test("automatic decision is persisted in the annual report and advances one post", () => {
  const reviewed = finish(ready());
  assert.equal(reviewed.review.promotionMode, "automatic");
  const next = engine.completeReview(reviewed, EVENTS);
  assert.equal(next.roleIndex, 1);
  assert.equal(next.annualReports[0].promotionMode, "automatic");
  assert.equal(next.promotionPlan, null);
  assert.equal(engine.validateSavedGame(next), true);
});

test("legacy application data remains readable but is discarded after settlement", () => {
  const state = ready();
  state.promotionPlan = { year: state.careerYear, choice: "defer" };
  assert.equal(engine.validateSavedGame(state), true);
  const next = engine.completeReview(finish(state), EVENTS);
  assert.equal(next.promotionPlan, null);
  assert.equal(next.annualReports[0].promotionMode, "automatic");
});
