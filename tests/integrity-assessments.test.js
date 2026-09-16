"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { INTEGRITY_ASSESSMENTS } = require("../src/data/integrity-assessments");

const CHECKS = INTEGRITY_ASSESSMENTS.filter((event) => event.category === "integrity");

function chooseEvent(inputState, eventId, choiceIndex) {
  const state = JSON.parse(JSON.stringify(inputState));
  const event = EVENTS.find((item) => item.id === eventId);
  state.phase = "event";
  state.currentEventId = eventId;
  state.seen[eventId] = state.careerYear;
  return engine.selectChoice(state, EVENTS, choiceIndex);
}

test("five integrity checks are one-off, distinct scenes with authored outcomes", () => {
  assert.equal(CHECKS.length, 5);
  assert.equal(new Set(CHECKS.map((event) => event.id)).size, 5);
  assert.equal(new Set(CHECKS.map((event) => event.storyTheme)).size, 5);
  assert.equal(new Set(CHECKS.map((event) => event.title)).size, 5);
  CHECKS.forEach((event) => {
    assert.equal(event.once, true);
    assert.equal(event.choices.length, 3);
    assert.ok(event.choices.every((choice) => choice.outcome && choice.outcome.length > 20));
    assert.equal(event.choices.filter((choice) => choice.accountability).length, 1);
  });
});

test("integrity checks enter the annual stream at their career milestones", () => {
  for (const year of [4, 8, 12, 16, 20]) {
    const state = engine.createNewGame("community", 9100 + year);
    state.careerYear = year;
    CHECKS.filter((event) => event.minYear < year).forEach((event) => {
      state.seen[event.id] = event.minYear;
      state.history.push({
        year: event.minYear, roleIndex: 0, eventId: event.id, eventTitle: event.title,
        storyTheme: event.storyTheme, choiceIndex: 0, choiceText: event.choices[0].text,
        outcome: event.choices[0].outcome, changes: {}, assetChange: 0, delayedMessages: []
      });
    });
    const started = engine.beginYear(state, EVENTS);
    assert.equal(started.currentEventId, CHECKS.find((event) => event.minYear === year).id);
  }
});

test("two evidenced corrupt choices can open a causal inquiry and judgment", () => {
  let state = engine.createNewGame("community", 1);
  state.careerYear = 4;
  state = chooseEvent(state, "integrity_trunk_wine", 2);
  assert.equal(state.accountability.caseStatus, "unreported");
  assert.equal(state.flags.integrityCaseOpened, undefined);

  state.careerYear = 8;
  state.seed = 6; // deterministic screening draw below the calibrated 60% threshold
  state = chooseEvent(state, "integrity_wedding_ledger", 2);
  assert.equal(state.accountability.caseStatus, "investigation");
  assert.equal(state.flags.integrityCaseOpened, true);

  state.careerYear = 9;
  state = chooseEvent(state, "integrity_joint_inquiry", 0);
  assert.equal(state.accountability.caseStatus, "prosecution");
  assert.equal(state.accountability.sentenceExposure, 7);
  assert.equal(state.accountability.retainedValue, 0);

  state.careerYear = 10;
  state = chooseEvent(state, "integrity_public_judgment", 0);
  assert.equal(state.accountability.caseStatus, "convicted");
  assert.equal(state.accountability.sentenceYears, 7);
  assert.match(state.lastResult.outcome, /有期徒刑 7 年/);
  assert.equal(engine.advanceAfterResult(state, EVENTS).endingId, "criminal_conviction");
});

test("lawful choices neither invent a case nor permit the same check to repeat", () => {
  let state = engine.createNewGame("study", 77);
  state.careerYear = 4;
  state = chooseEvent(state, "integrity_trunk_wine", 0);
  assert.equal(state.accountability.caseStatus, "clear");
  assert.equal(engine.eligibleEvents(state, EVENTS, "integrity").some((event) => event.id === "integrity_trunk_wine"), false);
});
