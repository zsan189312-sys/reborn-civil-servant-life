"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { MAX_CAREER_YEARS } = require("../src/core/constants");

const start = () => engine.beginYear(engine.createNewGame("community", 42), EVENTS);

test("corrupt saves are rejected before the UI attempts to render", () => {
  const corruptions = [
    (s) => { s.phase = "unknown"; },
    (s) => { s.currentEventId = "deleted"; },
    (s) => { s.stats.health = -1; },
    (s) => { s.delayed = null; },
    (s) => { s.history = [{}]; },
    (s) => { s.queue = ["unknown"]; },
    (s) => { s.phase = "review"; s.review = { promoted: true }; },
    (s) => { s.phase = "result"; s.lastResult = null; },
    (s) => { s.phase = "ending"; s.endingId = "missing"; },
    (s) => { s.careerYear = MAX_CAREER_YEARS + 1; },
    (s) => { s.seed = "42"; },
    (s) => { s.startOfYearResults = [{ message: 42 }]; }
  ];
  corruptions.forEach((mutate) => {
    const state = start(); mutate(state);
    assert.equal(engine.validateSavedGame(state), false);
  });
});

test("every saved phase round-trips without changing the following transition", () => {
  let state = start();
  while (state.phase !== "ending") {
    const saved = JSON.parse(JSON.stringify(state));
    assert.equal(engine.validateSavedGame(saved), true, state.phase);
    const transition = (value) => {
      if (value.phase === "event") return engine.selectChoice(value, EVENTS, 0);
      if (value.phase === "result") return engine.advanceAfterResult(value, EVENTS);
      if (value.phase === "planning") return engine.finalizeAnnualPlanning(value);
      return engine.completeReview(value, EVENTS);
    };
    state = transition(state);
    assert.deepEqual(transition(saved), state);
  }
  assert.equal(engine.validateSavedGame(state), true);
});

test("critical health and integrity outcomes end immediately after their result", () => {
  for (const [key, ending] of [["health", "health_exit"], ["integrity", "disciplinary_exit"]]) {
    const state = engine.selectChoice(start(), EVENTS, 0);
    state.stats[key] = 0;
    const next = engine.advanceAfterResult(state, EVENTS);
    assert.equal(next.phase, "ending");
    assert.equal(next.endingId, ending);
  }
});

test("delayed consequences apply exactly once and include a visible explanation", () => {
  const state = start();
  state.currentEventId = "work_long_project";
  const chosen = engine.selectChoice(state, EVENTS, 0);
  chosen.careerYear = 3;
  const before = chosen.stats.performance;
  const next = engine.beginYear(chosen, EVENTS);
  assert.equal(next.stats.performance, before + 8);
  assert.equal(next.longTermWins, 1);
  assert.match(next.startOfYearResults[0].message, /管线/);
  const again = engine.beginYear(next, EVENTS);
  assert.equal(again.stats.performance, next.stats.performance);
  assert.equal(again.startOfYearResults.length, 0);
});

test("review contributions explain the exact weighted total", () => {
  const review = engine.calculateReview(start());
  const total = review.contributions.reduce((sum, item) => sum + item.score, 0);
  assert.equal(review.baseScore, Math.round(total));
  assert.equal(review.finalScore, Math.round(total + review.randomShift));
  assert.equal(review.contributions.reduce((sum, item) => sum + item.weight, 0), 100);
});

test("completed years retain their review, income and promotion explanation", () => {
  let state = start();
  while (state.phase !== "review") {
    if (state.phase === "event") state = engine.selectChoice(state, EVENTS, 0);
    else if (state.phase === "result") state = engine.advanceAfterResult(state, EVENTS);
    else state = engine.finalizeAnnualPlanning(state);
  }
  const next = engine.completeReview(state, EVENTS);
  assert.equal(next.annualReports.length, 1);
  assert.equal(next.annualReports[0].score, state.review.finalScore);
  assert.deepEqual(next.annualReports[0].reasons, state.review.reasons);
  assert.equal(next.assets - state.assets, next.annualReports[0].netIncome);
  assert.equal(engine.validateSavedGame(next), true);
});

test("voluntary departure has an actionable ending without mutating the save", () => {
  const state = start();
  const next = engine.leaveCareer(state);
  assert.equal(state.phase, "event");
  assert.equal(next.endingId, "new_beginning");
  assert.equal(engine.validateSavedGame(next), true);
});
