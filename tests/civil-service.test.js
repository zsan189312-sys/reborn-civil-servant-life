"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { ROLES, CIVIL_RANKS, LEADERSHIP_MIN_RANK, MAX_CAREER_YEARS } = require("../src/core/constants");
const { EVENTS } = require("../src/data/events");
const { createNewGame, calculateReview, completeReview, eligibleEvents, validateSavedGame } = require("../src/core/engine");

function reviewState(roleIndex, yearsInRole, rankIndex, yearsInRank) {
  const state = createNewGame("study", 1234);
  Object.assign(state, { roleIndex, yearsInRole, rankIndex, yearsInRank, phase: "review", careerYear: 10 });
  state.stats = { ability: 100, performance: 100, trust: 100, integrity: 100, family: 100, health: 100 };
  for (let seed = 1; seed <= 1000; seed += 1) {
    state.seed = seed;
    state.review = calculateReview(state);
    if (state.review.promoted) break;
  }
  return state;
}

test("concrete government and Party posts retain valid leadership levels beside the twelve civil ranks", () => {
  assert.equal(ROLES[0].level, null);
  assert.deepEqual(ROLES.slice(1).map((role) => role.level), [
    null, "乡科级副职", "乡科级副职", "乡科级正职", "县处级副职", "县处级正职",
    "厅局级副职", "厅局级正职", "省部级副职", "国家级副职"
  ]);
  assert.deepEqual(ROLES.map((role) => role.name), [
    "青禾镇科员", "青禾镇民政办负责人", "青禾镇党委委员、副镇长", "云岑县市场监管局副局长", "云岑县委政法委副书记",
    "澄川市公安局副局长", "澄川市发展改革委主任", "栖原省生态环境厅副厅长", "栖原省交通运输厅厅长",
    "栖原省委常委、副省长", "国家层面综合协调岗位副职"
  ]);
  assert.deepEqual(CIVIL_RANKS, ["二级科员", "一级科员", "四级主任科员", "三级主任科员", "二级主任科员", "一级主任科员", "四级调研员", "三级调研员", "二级调研员", "一级调研员", "二级巡视员", "一级巡视员"]);
  assert.deepEqual(LEADERSHIP_MIN_RANK, [1, 2, 4, 6, 8, 10, 11]);
  assert.equal(createNewGame("study", 1).rankIndex, 1);
});

test("rank-only advancement leaves the leadership post and its tenure intact", () => {
  const state = reviewState(2, 0, 4, 1);
  state.stats.performance = 0;
  state.review = calculateReview(state);
  assert.equal(state.review.promoted, false);
  assert.equal(state.review.rankPromoted, true);
  const next = completeReview(state, EVENTS);
  assert.equal(next.roleIndex, 2);
  assert.equal(next.yearsInRole, 1);
  assert.equal(next.rankIndex, 5);
  assert.equal(next.yearsInRank, 0);
  assert.deepEqual(next.appointment, { type: "rank", roleIndex: 2, rankIndex: 5 });
  assert.equal(next.annualReports[0].rankPromoted, true);
  assert.equal(validateSavedGame(next), true);
  assert.equal(state.rankIndex, 4);
});

test("leadership promotion advances one level and creates an appointment", () => {
  for (let roleIndex = 0; roleIndex < ROLES.length - 1; roleIndex += 1) {
    const state = reviewState(roleIndex, ROLES[roleIndex].minYears - 1, LEADERSHIP_MIN_RANK[roleIndex] || 11, 3);
    assert.equal(state.review.promoted, true);
    assert.equal(state.review.rankPromoted, false);
    const next = completeReview(state, EVENTS);
    assert.equal(next.roleIndex, roleIndex + 1);
    assert.equal(next.appointment.type, "leadership");
    assert.equal(next.yearsInRole, 0);
    if (next.roleIndex < 7) assert.ok(next.rankIndex >= LEADERSHIP_MIN_RANK[next.roleIndex]);
    assert.equal(validateSavedGame(next), true);
  }
});

test("province and national responsibilities draw only matching broad-scope or post-specific work", () => {
  for (const roleIndex of [7, 8, 9, 10]) {
    const state = reviewState(roleIndex, 0, 11, 2);
    for (const category of ["work", "city"]) {
      const pool = eligibleEvents(state, EVENTS, category);
      assert.ok(pool.length > 0);
      assert.ok(pool.every((event) => roleIndex < 10
        ? event.id.startsWith("province_") || event.id.startsWith("duty_") || event.id.startsWith("dept_")
        : event.id.startsWith("national_") || event.id.startsWith("duty_") || event.id.startsWith("dept_")));
    }
    assert.equal(state.review.rankPromoted, false);
    assert.equal(state.review.rankAllowance, 0);
  }
});

test("career finishes at its fictional story limit and highest rank cannot overflow", () => {
  const state = reviewState(10, 1, 11, 1);
  state.careerYear = MAX_CAREER_YEARS;
  state.promotionPlan = null;
  state.review = calculateReview(state);
  assert.equal(state.review.promoted, false);
  assert.equal(state.review.rankPromoted, false);
  const next = completeReview(state, EVENTS);
  assert.equal(next.phase, "ending");
  assert.equal(next.roleIndex, 10);
  assert.equal(next.rankIndex, 11);
  assert.equal(validateSavedGame(next), true);
});

test("new-route saves never read, overwrite or clear the superseded fictional-career save", (t) => {
  const legacyKey = "yizhi-lvli-save-v1";
  const legacy = { version: 1, roleIndex: 7 };
  const records = new Map([[legacyKey, legacy]]);
  const reads = [];
  global.wx = {
    getStorageSync(key) { reads.push(key); return records.get(key); },
    setStorageSync(key, value) { records.set(key, value); },
    removeStorageSync(key) { records.delete(key); }
  };
  t.after(() => { delete global.wx; });
  const { loadGame, saveGame, clearGame } = require("../src/platform/wechat");
  assert.equal(loadGame(), null);
  const state = createNewGame("study", 1);
  assert.equal(saveGame(state), true);
  assert.deepEqual(loadGame(), state);
  assert.equal(clearGame(), true);
  assert.equal(loadGame(), null);
  assert.equal(records.get(legacyKey), legacy);
  assert.ok(!reads.includes(legacyKey));
});
