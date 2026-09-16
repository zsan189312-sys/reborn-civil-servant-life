"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const life = require("../src/core/life");
const { EVENTS } = require("../src/data/events");
const start = () => {
  const state = engine.createNewGame("community", 18);
  state.phase = "planning";
  return state;
};

function finishPlanning(input) {
  let state = input;
  while (["event", "result"].includes(state.phase)) {
    state = state.phase === "event" ? engine.selectChoice(state, EVENTS, 0) : engine.advanceAfterResult(state, EVENTS);
  }
  return state.phase === "planning" ? engine.finalizeAnnualPlanning(state) : state;
}

test("one annual arrangement commits once, round-trips, and does not alter its input", () => {
  const initial = start();
  const next = life.takeLifeAction(initial, "meet");
  assert.equal(initial.assets, 2);
  assert.equal(initial.life.relationship, "single");
  assert.equal(next.assets, 1);
  assert.equal(next.life.relationship, "dating");
  assert.equal(next.life.actions.length, 1);
  assert.equal(engine.validateSavedGame(next), true);
  assert.throws(() => life.takeLifeAction(JSON.parse(JSON.stringify(next)), "rest"), /本年度/);
  assert.equal(next.phase, "planning");
});

test("annual actions reject insufficient funds, closed timing and owned assets", () => {
  const state = start();
  assert.throws(() => life.takeLifeAction(state, "home"), /结余不足/);
  assert.throws(() => life.takeLifeAction(state, "marry"), /稳定交往/);
  assert.throws(() => life.takeLifeAction(state, "reunite"), /两地/);
  state.phase = "planning";
  state.assets = 100;
  state.life.vehicle = true;
  assert.throws(() => life.takeLifeAction(state, "car"), /已经有/);
  state.life.housing = "owned";
  assert.throws(() => life.takeLifeAction(state, "home"), /已经有/);
  for (const phase of ["result", "review", "ending"]) {
    state.phase = phase;
    assert.throws(() => life.takeLifeAction(state, "rest"), /工作进行期间/);
  }
});

test("the next year unlocks a new arrangement through normal engine transitions", () => {
  let state = life.takeLifeAction(start(), "meet");
  state = engine.finalizeAnnualPlanning(state);
  state = engine.completeReview(state, EVENTS);
  state.appointment = null;
  state.startOfYearResults = [];
  assert.equal(state.careerYear, 2);
  while (state.phase !== "planning") state = state.phase === "event" ? engine.selectChoice(state, EVENTS, 0) : engine.advanceAfterResult(state, EVENTS);
  assert.equal(life.actionReason(state, "rest"), null);
  state = life.takeLifeAction(state, "rest");
  assert.deepEqual(state.life.actions.map((item) => item.year), [1, 2]);
  assert.equal(engine.validateSavedGame(state), true);
});

test("purchased assets persist and have explicit recurring costs in the annual review", () => {
  const state = start(); state.assets = 100;
  const base = engine.calculateReview(state);
  const car = life.takeLifeAction(state, "car");
  assert.equal(car.assets, 88);
  assert.equal(car.life.vehicle, true);
  assert.equal(engine.calculateReview(car).livingCost, base.livingCost + 2);
  const home = life.takeLifeAction(state, "home");
  assert.equal(home.assets, 50);
  assert.equal(home.life.housing, "owned");
  assert.equal(engine.calculateReview(home).livingCost, base.livingCost - 1);
  assert.ok(!engine.eligibleEvents(home, EVENTS, "life").some((event) => event.id === "life_move_house"));
});

test("stories change housing and two-city life, and singles do not get a pre-existing partner", () => {
  let state = start(); state.careerYear = 6;
  assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === "life_family_choice"));
  state = life.takeLifeAction(state, "meet");
  assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === "life_family_choice"));
  state.careerYear += 2;
  assert.ok(engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === "life_family_choice"));
  state.phase = "event";
  state.currentEventId = "life_family_choice";
  state = engine.selectChoice(state, EVENTS, 0);
  assert.equal(state.life.longDistance, true);
  assert.equal(engine.validateSavedGame(state), true);
  state.phase = "event";
  state.currentEventId = "life_move_house";
  state = engine.selectChoice(state, EVENTS, 0);
  assert.equal(state.life.housing, "near");
  assert.equal(state.life.longDistance, true);
  assert.equal(life.getLifeState(JSON.parse(JSON.stringify(state))).housing, "near");
});

test("legacy migration infers only recorded life events without inventing savings or marriage", () => {
  const state = start(); delete state.life;
  assert.equal(life.getLifeState(state).relationship, "single");
  state.phase = "event";
  state.currentEventId = "life_family_choice";
  const old = engine.selectChoice(state, EVENTS, 0);
  delete old.life;
  const before = JSON.stringify(old);
  const derived = life.getLifeState(old);
  assert.equal(derived.relationship, "dating");
  assert.equal(derived.longDistance, true);
  assert.equal(derived.vehicle, false);
  assert.equal(derived.housing, "rental");
  assert.equal(JSON.stringify(old), before);
  assert.equal(engine.validateSavedGame(old), true);
});

test("malformed persistent life state is rejected on load", () => {
  for (const mutate of [
    (s) => { s.life = null; },
    (s) => { s.life.housing = "castle"; },
    (s) => { s.life.vehicle = "yes"; },
    (s) => { s.life.actions = [{}]; },
    (s) => { s.life.lastActionYear = 999; },
    (s) => { s.life.longDistance = true; }
  ]) {
    const state = start(); mutate(state);
    assert.equal(engine.validateSavedGame(state), false);
  }
});

test("a full career can date, marry, buy assets and retire through normal choices", () => {
  let state = start();
  state.assets = 100;
  let steps = 0;
  while (state.phase !== "ending") {
    assert.ok(++steps < 300);
    assert.equal(engine.validateSavedGame(state), true);
    if (state.phase === "event") {
      state.appointment = null;
      state.startOfYearResults = [];
      state = engine.selectChoice(state, EVENTS, 0);
    } else if (state.phase === "result") state = engine.advanceAfterResult(state, EVENTS);
    else if (state.phase === "planning") {
      const actionId = ["meet", "marry", "car", "home", "rest"].find((id) => !life.actionReason(state, id));
      if (actionId) state = life.takeLifeAction(state, actionId);
      state = engine.finalizeAnnualPlanning(state);
    }
    else state = engine.completeReview(state, EVENTS);
  }
  assert.equal(engine.validateSavedGame(state), true);
  const chosen = new Set(state.life.actions.map((item) => item.id));
  for (const id of ["meet", "marry", "car", "home"]) assert.ok(chosen.has(id), id);
  assert.equal(state.life.relationship, "married");
  assert.equal(state.life.vehicle, true);
  assert.equal(state.life.housing, "owned");
});

test("annual settlement charges vehicle upkeep once and reset does not charge it again", () => {
  const state = start(); state.assets = 100;
  let next = life.takeLifeAction(state, "car");
  next = finishPlanning(next);
  const balance = next.assets;
  const net = next.review.annualIncome - next.review.livingCost;
  assert.equal(next.review.lifeCost, 2);
  const settled = engine.completeReview(next, EVENTS);
  assert.equal(settled.assets, balance + net);
  assert.equal(settled.annualReports.at(-1).netIncome, net);
  assert.equal(engine.beginYear(settled, EVENTS).assets, settled.assets);
  assert.throws(() => engine.completeReview(settled, EVENTS), /active review/);
});
