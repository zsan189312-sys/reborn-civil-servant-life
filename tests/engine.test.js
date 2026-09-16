"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { EVENTS } = require("../src/data/events");
const { ATTRIBUTES, ROLES, MAX_CAREER_YEARS } = require("../src/core/constants");
const {
  advanceAfterResult,
  applyEffects,
  beginYear,
  calculateReview,
  completeReview,
  createNewGame,
  eligibleEvents,
  finalizeAnnualPlanning,
  selectChoice,
  validateSavedGame
} = require("../src/core/engine");

test("new game applies a background and can start the first year", () => {
  const initial = createNewGame("community", 1234);
  assert.equal(initial.stats.trust, 58);
  assert.equal(initial.stats.ability, 44);
  const started = beginYear(initial, EVENTS);
  assert.equal(started.phase, "event");
  assert.ok(started.currentEventId);
  assert.deepEqual(started.queue, []);
  assert.equal(validateSavedGame(started), true);
});

test("effects are clamped and do not mutate source stats", () => {
  const source = { ability: 98, performance: 2, trust: 50, integrity: 50, family: 50, health: 50 };
  const result = applyEffects(source, { ability: 10, performance: -10 });
  assert.equal(source.ability, 98);
  assert.equal(result.stats.ability, 100);
  assert.equal(result.stats.performance, 0);
  assert.equal(result.changes.ability, 2);
});

test("one annual story creates history before automatic year-end review", () => {
  let state = beginYear(createNewGame("study", 4567), EVENTS);
  state = selectChoice(state, EVENTS, 0);
  assert.equal(state.phase, "result");
  assert.equal(state.history.length, 1);
  state = advanceAfterResult(state, EVENTS);
  assert.equal(state.phase, "planning");
  state = finalizeAnnualPlanning(state);
  assert.equal(state.phase, "review");
  assert.ok(Number.isInteger(state.review.finalScore));
  assert.ok(state.review.randomShift >= -6 && state.review.randomShift <= 6);
});

test("promotion requires tenure, score and integrity", () => {
  let state = beginYear(createNewGame("community", 99), EVENTS);
  state.roleIndex = 7;
  state.yearsInRole = 0;
  state.stats = { ability: 100, performance: 100, trust: 100, integrity: 100, family: 100, health: 100 };
  while (state.phase !== "planning") {
    state = state.phase === "event" ? selectChoice(state, EVENTS, 0) : advanceAfterResult(state, EVENTS);
  }
  state = finalizeAnnualPlanning(state);
  assert.equal(state.phase, "review");
  assert.equal(state.review.promoted, false);
  assert.match(state.review.reasons.join(" "), /至少 2 年/);

  state.yearsInRole = 1;
  state.review = calculateReview(state);
  assert.equal(state.review.promoted, true);
  const next = completeReview(state, EVENTS);
  assert.equal(next.roleIndex, 8);
  assert.equal(next.careerYear, 2);
});

test("a deterministic seed produces the same event sequence", () => {
  const a = beginYear(createNewGame("career_change", 20260908), EVENTS);
  const b = beginYear(createNewGame("career_change", 20260908), EVENTS);
  assert.equal(a.currentEventId, b.currentEventId);
  assert.equal(a.seed, b.seed);
});

test("every role has work, life and city content available", () => {
  ROLES.forEach((_role, roleIndex) => {
    const state = createNewGame("community", 42);
    state.roleIndex = roleIndex;
    state.careerYear = 12;
    ["work", "life", "city"].forEach((category) => {
      assert.ok(eligibleEvents(state, EVENTS, category).length > 0, `${roleIndex} ${category}`);
    });
  });
});

test("multiple choice strategies can all finish a career", () => {
  for (let run = 0; run < 18; run += 1) {
    let state = beginYear(createNewGame(BACKGROUND_FOR_RUN(run), 9000 + run), EVENTS);
    let safety = 0;
    while (state.phase !== "ending" && safety < 220) {
      safety += 1;
      if (state.phase === "event") {
        const event = EVENTS.find((item) => item.id === state.currentEventId);
        state = selectChoice(state, EVENTS, run % event.choices.length);
      } else if (state.phase === "result") state = advanceAfterResult(state, EVENTS);
      else if (state.phase === "planning") state = finalizeAnnualPlanning(state);
      else if (state.phase === "review") state = completeReview(state, EVENTS);
    }
    assert.equal(state.phase, "ending", `run ${run} should finish`);
    assert.ok(safety < 220);
  }
});

function BACKGROUND_FOR_RUN(run) {
  return ["community", "study", "career_change"][run % 3];
}

test("a full simulated career reaches an ending without invalid stats", () => {
  let state = beginYear(createNewGame("community", 777), EVENTS);
  let safety = 0;
  while (state.phase !== "ending" && safety < MAX_CAREER_YEARS * 7) {
    safety += 1;
    if (state.phase === "event") state = selectChoice(state, EVENTS, 0);
    else if (state.phase === "result") state = advanceAfterResult(state, EVENTS);
    else if (state.phase === "planning") state = finalizeAnnualPlanning(state);
    else if (state.phase === "review") state = completeReview(state, EVENTS);
  }
  assert.equal(state.phase, "ending");
  assert.ok(state.endingId);
  assert.ok(state.careerYear <= MAX_CAREER_YEARS);
  ATTRIBUTES.forEach((key) => {
    assert.ok(state.stats[key] >= 0 && state.stats[key] <= 100);
  });
  assert.ok(ROLES[state.roleIndex]);
});
