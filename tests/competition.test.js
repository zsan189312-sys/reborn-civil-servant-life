"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");

test("new careers expose vacancies and competitors before an optional promotion choice", () => {
  const state = engine.beginYear(engine.createNewGame("study", 1234), EVENTS);
  assert.equal(state.promotionPlan, undefined);
  const review = engine.calculateReview(state);
  assert.ok(review.competition);
  assert.ok([0, 1].includes(review.competition.vacancies));
  if (review.competition.available) assert.ok(review.competition.candidate.score > 0);
  assert.equal(review.promotionChoice, "automatic");
  assert.equal(review.promotionMode, "automatic");
  assert.equal(engine.needsAssessment(state), false);
});

test("old vacancy records remain readable but current deterministic competition controls reviews", () => {
  const state = engine.beginYear(engine.createNewGame("study", 8), EVENTS);
  state.promotionPlan = { year: 1, choice: "apply", opportunity: { available: false, vacancies: 0, candidate: null } };
  assert.equal(engine.validateSavedGame(state), true);
  const review = engine.calculateReview(state);
  assert.ok(review.competition);
  assert.notDeepEqual(review.competition, state.promotionPlan.opportunity);
  assert.equal(review.promotionMode, "automatic");
});
