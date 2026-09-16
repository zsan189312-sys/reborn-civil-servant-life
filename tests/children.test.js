"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const life = require("../src/core/life");
const { EVENTS } = require("../src/data/events");
const { CHILD_STORIES } = require("../src/data/child-stories");
const start = () => engine.beginYear(engine.createNewGame("community", 18), EVENTS);
function finishYear(state) {
  while (state.phase !== "review") {
    if (state.phase === "event") state = engine.selectChoice(state, EVENTS, 0);
    else if (state.phase === "result") state = engine.advanceAfterResult(state, EVENTS);
    else state = engine.finalizeAnnualPlanning(state);
  }
  return engine.completeReview(state, EVENTS);
}
function planning(input) {
  let state = input;
  while (["event", "result"].includes(state.phase)) state = state.phase === "event" ? engine.selectChoice(state, EVENTS, 0) : engine.advanceAfterResult(state, EVENTS);
  return state;
}
function ready() {
  let state = planning(start());
  state.life.relationship = "married";
  state.assets = 10;
  return state;
}

test("welcoming a child is optional, confirmed once through the annual action and costs are explicit", () => {
  const state = ready();
  const before = JSON.stringify(state);
  const born = life.takeLifeAction(state, "child");
  assert.equal(JSON.stringify(state), before);
  assert.equal(born.assets, 7);
  assert.equal(life.childAge(born), 0);
  assert.deepEqual(born.life.child, { name: "小满", bornYear: 1 });
  assert.equal(engine.calculateReview(born).livingCost - engine.calculateReview(state).livingCost, 2);
  assert.equal(engine.validateSavedGame(JSON.parse(JSON.stringify(born))), true);
  assert.throws(() => life.takeLifeAction(born, "child"), /本年度/);
  let next = finishYear(born); next.appointment = null; next.startOfYearResults = [];
  assert.equal(life.childAge(next), 1);
  next = planning(next);
  assert.throws(() => life.takeLifeAction(next, "child"), /已有一个孩子/);
  assert.equal(next.annualReports[0].childCost, 2);
});

test("child actions require family, sufficient cash and the regular annual timing", () => {
  assert.throws(() => life.takeLifeAction(planning(start()), "child"), /先组建家庭/);
  const state = ready(); state.assets = 2.99;
  assert.throws(() => life.takeLifeAction(state, "child"), /结余不足/);
  state.assets = 10;
  state.phase = "result";
  assert.throws(() => life.takeLifeAction(state, "child"), /工作进行期间/);
  const married = ready(); married.life.actions = [{ id: "marry", year: 1 }];
  assert.throws(() => life.takeLifeAction(married, "child"), /下一年度/);
});

test("children's events are age-gated, prioritised in life slots, and cannot recur", () => {
  const childless = start();
  for (const story of CHILD_STORIES) {
    childless.careerYear = 25;
    assert.ok(!engine.eligibleEvents(childless, EVENTS, "life").some((event) => event.id === story.id));
    const state = life.takeLifeAction(ready(), "child");
    state.careerYear = state.life.child.bornYear + story.minChildAge;
    const selected = engine.drawEvent(structuredClone(state), EVENTS, "life");
    assert.equal(selected.currentEventId, story.id);
    for (let choice = 0; choice < story.choices.length; choice += 1) {
      const next = engine.selectChoice(selected, EVENTS, choice);
      assert.equal(next.lastResult.outcome, story.choices[choice].outcome);
      assert.equal(engine.validateSavedGame(next), true);
    }
    state.careerYear -= 1;
    assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === story.id));
    state.careerYear = state.life.child.bornYear + story.maxChildAge + 1;
    assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === story.id));
    selected.careerYear += 1;
    assert.ok(!engine.eligibleEvents(selected, EVENTS, "life").some((event) => event.id === story.id));
  }
});

test("fixed child budget stops at game age 18 and is never settled again on beginYear", () => {
  const state = life.takeLifeAction(ready(), "child");
  state.careerYear = 18;
  assert.equal(life.childAge(state), 17);
  assert.equal(life.annualChildCost(state), 2);
  const next = finishYear(state);
  assert.equal(life.childAge(next), 18);
  assert.equal(life.annualChildCost(next), 0);
  assert.equal(next.annualReports[0].childCost, 2);
  assert.equal(engine.beginYear(next, EVENTS).assets, next.assets);
  assert.equal(engine.calculateReview(next).childCost, 0);
});

test("old saves acquire no children and inconsistent child records are rejected", () => {
  const legacy = start(); delete legacy.life.child;
  assert.equal(engine.validateSavedGame(legacy), true);
  assert.equal(life.getLifeState(legacy).child, null);
  assert.equal(life.annualChildCost(legacy), 0);
  const born = life.takeLifeAction(ready(), "child");
  for (const mutate of [
    (s) => { s.life.child.bornYear = 2; },
    (s) => { s.life.child.name = 5; },
    (s) => { s.life.child = []; },
    (s) => { s.life.child = null; },
    (s) => { s.life.actions = []; },
    (s) => { s.life.relationship = "single"; }
  ]) {
    const state = structuredClone(born); mutate(state);
    assert.equal(engine.validateSavedGame(state), false);
  }
});

test("a normal career can form a family and see all three child milestones without injected age or money", () => {
  let state = start();
  let steps = 0;
  while (state.phase !== "ending") {
    assert.ok(++steps < 300);
    assert.equal(engine.validateSavedGame(state), true);
    if (state.phase === "event") {
      state.appointment = null; state.startOfYearResults = [];
      state = engine.selectChoice(state, EVENTS, 0);
    } else if (state.phase === "result") state = engine.advanceAfterResult(state, EVENTS);
    else if (state.phase === "planning") {
      const action = ["meet", "marry", "child", "rest"].find((id) => !life.actionReason(state, id));
      if (action) state = life.takeLifeAction(state, action);
      state = engine.finalizeAnnualPlanning(state);
    }
    else state = engine.completeReview(state, EVENTS);
  }
  assert.equal(engine.validateSavedGame(state), true);
  assert.ok(state.life.child);
  assert.ok(life.childAge(state) >= 18);
  for (const story of CHILD_STORIES) assert.equal(state.history.filter((entry) => entry.eventId === story.id).length, 1, story.id);
});
