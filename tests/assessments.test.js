"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");

test("one annual story proceeds through planning to automatic review without an extra assessment", () => {
  let state = engine.beginYear(engine.createNewGame("study", 99), EVENTS);
  state.stats = { ability: 80, performance: 80, trust: 80, integrity: 80, family: 80, health: 80 };
  while (["event", "result"].includes(state.phase)) state = state.phase === "event" ? engine.selectChoice(state, EVENTS, 0) : engine.advanceAfterResult(state, EVENTS);
  assert.equal(state.phase, "planning");
  state = engine.finalizeAnnualPlanning(state);
  assert.equal(state.phase, "review");
  assert.equal(state.review.promotionMode, "automatic");
  assert.equal(state.history.some((entry) => entry.eventId.startsWith("assessment_")), false);
  assert.equal(engine.needsAssessment(state), false);
});

test("assessment content cannot enter ordinary story pools", () => {
  const state = engine.beginYear(engine.createNewGame("study", 9), EVENTS);
  for (const category of ["work", "life", "city"]) {
    assert.ok(!engine.eligibleEvents(state, EVENTS, category).some((event) => event.category === "assessment"));
  }
});
