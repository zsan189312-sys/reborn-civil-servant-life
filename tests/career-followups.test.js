"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { CAREER_FOLLOWUPS } = require("../src/data/career-followups");

function chooseOrigin(sequel) {
  const origin = EVENTS.find((event) => event.id === sequel.afterEvent.id);
  let state;
  for (let seed = 1; seed <= 1000; seed += 1) {
    state = engine.beginYear(engine.createNewGame("community", seed), EVENTS);
    if (state.currentEventId === origin.id) break;
  }
  assert.equal(state.currentEventId, origin.id, "Origin must be drawn from a normal seeded opening");
  return engine.selectChoice(state, EVENTS, origin.choices.findIndex((choice) => choice.flags[sequel.requiresFlags[0]]));
}

function nextYear(state) {
  while (state.phase !== "review") {
    if (state.phase === "result") state = engine.advanceAfterResult(state, EVENTS);
    else if (state.phase === "event") state = engine.selectChoice(state, EVENTS, 0);
    else state = engine.finalizeAnnualPlanning(state);
  }
  state = engine.completeReview(state, EVENTS);
  state.appointment = null;
  return state;
}

test("all six township sequels are reachable by real choices in a normal opening and next year", () => {
  assert.equal(CAREER_FOLLOWUPS.length, 6);
  for (const sequel of CAREER_FOLLOWUPS) {
    const originResult = chooseOrigin(sequel);
    assert.ok(!engine.eligibleEvents(originResult, EVENTS, "work").some((event) => CAREER_FOLLOWUPS.includes(event)));
    const saved = JSON.parse(JSON.stringify(originResult));
    assert.equal(engine.validateSavedGame(saved), true);
    const yearTwo = nextYear(saved);
    assert.equal(yearTwo.careerYear, 2);
    assert.equal(yearTwo.currentEventId, sequel.id);
    assert.equal(engine.validateSavedGame(yearTwo), true);
    const siblings = CAREER_FOLLOWUPS.filter((event) => event.afterEvent.id === sequel.afterEvent.id && event.id !== sequel.id);
    assert.ok(siblings.every((event) => !engine.eligibleEvents(yearTwo, EVENTS, "work").includes(event)));
  }
});

test("all twelve sequel outcomes persist, apply their actual changes and never draw twice", () => {
  for (const sequel of CAREER_FOLLOWUPS) {
    const state = nextYear(chooseOrigin(sequel));
    assert.equal(new Set(sequel.choices.map((choice) => choice.outcome)).size, 2);
    sequel.choices.forEach((choice, index) => {
      const result = engine.selectChoice(state, EVENTS, index);
      assert.equal(result.lastResult.outcome, choice.outcome);
      assert.equal(result.history.at(-1).outcome, choice.outcome);
      for (const [key, value] of Object.entries(choice.effects)) assert.equal(result.stats[key], Math.max(0, Math.min(100, state.stats[key] + value)));
      const restored = JSON.parse(JSON.stringify(result));
      assert.equal(engine.validateSavedGame(restored), true);
      const later = nextYear(restored);
      assert.ok(!engine.eligibleEvents(later, EVENTS, "work").some((event) => event.id === sequel.id));
      assert.equal(later.history.filter((entry) => entry.eventId === sequel.id).length, 1);
    });
  }
});

test("township sequels require the original record, branch flag, delay and local post", () => {
  for (const sequel of CAREER_FOLLOWUPS) {
    const state = chooseOrigin(sequel); state.careerYear = 2;
    for (let roleIndex = 0; roleIndex < 11; roleIndex += 1) {
      state.roleIndex = roleIndex;
      assert.equal(engine.eligibleEvents(state, EVENTS, "work").includes(sequel), roleIndex < 3);
    }
    state.roleIndex = 0;
    delete state.seen[sequel.afterEvent.id];
    assert.ok(!engine.eligibleEvents(state, EVENTS, "work").includes(sequel));
  }
});

test("legacy history without new branch flags stays valid without fabricating a sequel", () => {
  const state = chooseOrigin(CAREER_FOLLOWUPS[0]);
  state.flags = {};
  const legacy = JSON.parse(JSON.stringify(state));
  assert.equal(engine.validateSavedGame(legacy), true);
  const later = nextYear(legacy);
  assert.ok(!CAREER_FOLLOWUPS.some((event) => event.id === later.currentEventId));
  assert.ok(!engine.eligibleEvents(later, EVENTS, "work").some((event) => CAREER_FOLLOWUPS.includes(event)));
  assert.deepEqual(later.history[0], legacy.history[0]);
});
