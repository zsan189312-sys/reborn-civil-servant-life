"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { ENDINGS } = require("../src/data/endings");
const { replay, sourceFingerprint } = require("../scripts/simulate");
const audit = require("../artifacts/simulation-audit.json");

test("all nine endings have normal, repeatable paths through the current engine", () => {
  assert.equal(audit.sourceFingerprint, sourceFingerprint(), "Regenerate the simulation audit after changing gameplay or events");
  assert.equal(Object.keys(audit.witnesses).length, ENDINGS.length);
  ENDINGS.forEach((ending) => {
    const witness = audit.witnesses[ending.id];
    assert.ok(witness, ending.id);
    const final = replay(witness);
    assert.equal(final.endingId, ending.id);
    assert.deepEqual(final.stats, witness.stats);
    assert.equal(engine.validateSavedGame(final), true);
  });
});

test("fixed-seed calibration keeps conviction near 50% and high office near 8%", () => {
  assert.equal(audit.calibration.model, "uniform-random-player-choices");
  assert.equal(audit.calibration.runs, 3000);
  assert.ok(audit.calibration.criminalConvictionRate >= 0.47 && audit.calibration.criminalConvictionRate <= 0.53,
    `conviction=${audit.calibration.criminalConvictionRate}`);
  assert.ok(audit.calibration.highOfficeRate >= 0.06 && audit.calibration.highOfficeRate <= 0.1,
    `highOffice=${audit.calibration.highOfficeRate}`);
});

test("high ability cannot replace minimum delivery or integrity for promotion", () => {
  const state = engine.createNewGame("community", 42);
  state.yearsInRole = 2;
  state.stats = { ability: 100, performance: 43, trust: 100, integrity: 100, health: 90, family: 70 };
  let report = engine.calculateReview(state);
  assert.ok(report.finalScore > report.threshold);
  assert.equal(report.promoted, false);
  assert.ok(report.reasons.some((reason) => /政绩/.test(reason)));
  state.stats.performance = 90;
  state.stats.integrity = 44;
  report = engine.calculateReview(state);
  assert.equal(report.promoted, false);
  assert.ok(report.reasons.some((reason) => /廉洁/.test(reason)));
});

test("a high title does not override the ending about neglected family", () => {
  const state = engine.createNewGame("community", 42);
  state.roleIndex = 7;
  state.stats = { ability: 95, performance: 95, trust: 95, integrity: 95, family: 20, health: 70 };
  assert.equal(engine.resolveEndingId(state), "results_only");
});

test("follow-ups require the originating choice and elapsed time and happen only once", () => {
  let state = engine.beginYear(engine.createNewGame("community", 42), EVENTS);
  assert.equal(engine.eligibleEvents(state, EVENTS, "work").some((item) => item.id === "followup_room_trial"), false);
  state.currentEventId = "work_shared_room";
  state.seen.work_shared_room = 1;
  state = engine.selectChoice(state, EVENTS, 0);
  assert.equal(engine.eligibleEvents(state, EVENTS, "work").some((item) => item.id === "followup_room_trial"), false);
  state.careerYear = 2;
  state = engine.beginYear(state, EVENTS);
  assert.equal(state.currentEventId, "followup_room_trial");
  state = engine.selectChoice(state, EVENTS, 1);
  state.careerYear = 3;
  state = engine.beginYear(state, EVENTS);
  assert.equal(state.currentEventId, "followup_room_joint");
  assert.equal(engine.eligibleEvents(state, EVENTS, "work").some((item) => item.id === "followup_room_shared"), false);
  assert.equal(engine.eligibleEvents(state, EVENTS, "work").some((item) => item.id === "followup_room_trial"), false);
});
