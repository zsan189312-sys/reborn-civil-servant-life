"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { ETHICS_STORIES } = require("../src/data/ethics-stories");

const ORIGINS = ETHICS_STORIES.filter((event) => !event.afterEvent);
const FOLLOWUPS = ETHICS_STORIES.filter((event) => event.afterEvent);

function choose(eventId, choiceIndex, roleIndex) {
  const state = engine.beginYear(engine.createNewGame("community", 4567), EVENTS);
  state.roleIndex = roleIndex;
  state.currentEventId = eventId;
  state.seen[eventId] = state.careerYear;
  return engine.selectChoice(state, EVENTS, choiceIndex);
}

test("ethical tension is a limited, role-scoped part of the wider story pool", () => {
  assert.equal(ETHICS_STORIES.length, 13);
  assert.equal(ORIGINS.length, 3);
  assert.ok(ETHICS_STORIES.length / EVENTS.length < 0.15);
  for (const event of ETHICS_STORIES) {
    assert.equal(event.once, true);
    assert.ok(["work", "life"].includes(event.category));
    assert.ok(event.choices.every((choice) => choice.outcome && choice.outcome.length > 30));
  }
  for (const origin of ORIGINS) {
    assert.equal(origin.choices.length, 3);
    assert.ok(origin.choices.some((choice) => (choice.effects.integrity || 0) > 0));
    assert.ok(origin.choices.some((choice) => (choice.effects.integrity || 0) < 0));
  }
});

test("each sequel requires the exact originating choice, elapsed year and matching post", () => {
  for (const sequel of FOLLOWUPS) {
    const source = EVENTS.find((event) => event.id === sequel.afterEvent.id);
    const branch = source.choices.findIndex((choice) => sequel.requiresFlags.every((flag) => choice.flags && choice.flags[flag]));
    assert.ok(branch >= 0, sequel.id);
    const result = choose(source.id, branch, source.roleLevels[0]);
    assert.ok(!engine.eligibleEvents(result, EVENTS, sequel.category).includes(sequel));
    result.careerYear += sequel.afterEvent.years;
    result.roleIndex = sequel.roleLevels[0];
    assert.ok(engine.eligibleEvents(result, EVENTS, sequel.category).includes(sequel), sequel.id);
    result.roleIndex = sequel.roleLevels.at(-1) + 1;
    if (result.roleIndex <= 10) assert.ok(!engine.eligibleEvents(result, EVENTS, sequel.category).includes(sequel));
  }
});

test("all authored outcomes, gains, losses and flags persist in history", () => {
  for (const event of ETHICS_STORIES) {
    event.choices.forEach((choice, index) => {
      const result = choose(event.id, index, event.roleLevels[0]);
      if (choice.outcome.includes("{{sentenceYears}}")) {
        assert.doesNotMatch(result.lastResult.outcome, /\{\{sentenceYears\}\}/);
      } else {
        assert.equal(result.lastResult.outcome, choice.outcome);
        assert.equal(result.history.at(-1).outcome, choice.outcome);
      }
      assert.equal(result.history.at(-1).assetChange, choice.assetChange || 0);
      for (const [flag, value] of Object.entries(choice.flags || {})) assert.equal(result.flags[flag], value);
      assert.equal(engine.validateSavedGame(JSON.parse(JSON.stringify(result))), true);
    });
  }
});

function reachFriendJudgment(finalInvestigationChoice) {
  let state = choose("county_friend_project", 2, 3);
  assert.equal(state.assets, 7);
  assert.equal(state.stats.integrity, 43);
  state.careerYear = 2;
  state = engine.drawEvent(state, EVENTS, "work");
  assert.equal(state.currentEventId, "followup_friend_project_taken");
  state = engine.selectChoice(state, EVENTS, 1);
  assert.equal(state.stats.integrity, 25);
  state.careerYear = 3;
  state = engine.drawEvent(state, EVENTS, "work");
  assert.equal(state.currentEventId, "followup_friend_project_denied");
  state = engine.selectChoice(state, EVENTS, finalInvestigationChoice);
  assert.equal(state.accountability.caseStatus, "prosecution");
  assert.equal(state.accountability.sentenceExposure, finalInvestigationChoice === 0 ? 3 : 7);
  state = engine.advanceAfterResult(state, EVENTS);
  assert.notEqual(state.phase, "ending", "起诉不等于未经审判直接判刑");
  state.careerYear = 4;
  state = engine.drawEvent(state, EVENTS, "work");
  assert.equal(state.currentEventId, "followup_friend_project_judgment");
  state = engine.selectChoice(state, EVENTS, 0);
  assert.equal(state.accountability.caseStatus, "convicted");
  assert.equal(state.accountability.sentenceYears, finalInvestigationChoice === 0 ? 3 : 7);
  assert.match(state.lastResult.outcome, new RegExp(`有期徒刑 ${state.accountability.sentenceYears} 年`));
  state = engine.advanceAfterResult(state, EVENTS);
  assert.equal(state.phase, "ending");
  assert.equal(state.endingId, "criminal_conviction");
  return state;
}

test("the friend-project evidence chain supports three- and seven-year fictional sentences", () => {
  reachFriendJudgment(0);
  reachFriendJudgment(1);
});

test("the senior relative-project chain supports a twelve-year fictional sentence", () => {
  let state = choose("province_relative_subcontract", 2, 7);
  state.careerYear = 2;
  state = engine.drawEvent(state, EVENTS, "work");
  assert.equal(state.currentEventId, "followup_relative_introduced");
  state = engine.selectChoice(state, EVENTS, 2);
  state.careerYear = 3;
  state = engine.drawEvent(state, EVENTS, "work");
  assert.equal(state.currentEventId, "followup_relative_payment");
  state = engine.selectChoice(state, EVENTS, 2);
  assert.equal(state.accountability.sentenceExposure, 12);
  assert.equal(state.accountability.publicHarm, 2);
  state.careerYear = 4;
  state = engine.drawEvent(state, EVENTS, "work");
  assert.equal(state.currentEventId, "followup_relative_judgment");
  state = engine.selectChoice(state, EVENTS, 1);
  assert.equal(state.accountability.sentenceYears, 12);
  state = engine.advanceAfterResult(state, EVENTS);
  assert.equal(state.endingId, "criminal_conviction");
});

test("low integrity alone produces discipline rather than inventing a criminal conviction", () => {
  const state = choose("work_supplier_gift", 2, 3);
  state.stats.integrity = 0;
  const ended = engine.advanceAfterResult(state, EVENTS);
  assert.equal(ended.endingId, "disciplinary_exit");
  assert.equal(ended.accountability.caseStatus, "clear");
  assert.equal(ended.accountability.sentenceYears, 0);
});

test("returning the money removes its game-cash gain but does not erase the recorded choice", () => {
  let state = choose("county_friend_project", 2, 3);
  state.careerYear = 2;
  state = engine.drawEvent(state, EVENTS, "work");
  state = engine.selectChoice(state, EVENTS, 0);
  assert.equal(state.assets, 2);
  assert.equal(state.flags.friendProjectTaken, false);
  assert.equal(state.flags.friendProjectAdmitted, true);
  assert.equal(state.accountability.acceptedValue, 5);
  assert.equal(state.accountability.retainedValue, 0);
  assert.equal(state.accountability.caseStatus, "disciplinary");
  assert.equal(state.history[0].assetChange, 5);
  assert.equal(state.history[1].assetChange, -5);
  assert.equal(engine.validateSavedGame(state), true);
});

test("older saves without new flags stay valid and never invent a project relationship", () => {
  const state = engine.beginYear(engine.createNewGame("community", 8), EVENTS);
  state.careerYear = 12;
  assert.equal(engine.validateSavedGame(state), true);
  assert.ok(!engine.eligibleEvents(state, EVENTS, "work").some((event) => FOLLOWUPS.includes(event)));
  assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => FOLLOWUPS.includes(event)));
});

test("an older save derives responsibility only from choices already present in its history", () => {
  let state = choose("county_friend_project", 2, 3);
  delete state.accountability;
  assert.equal(engine.validateSavedGame(state), true);
  state.careerYear = 2;
  state = engine.drawEvent(state, EVENTS, "work");
  state = engine.selectChoice(state, EVENTS, 0);
  assert.equal(state.accountability.acceptedValue, 5);
  assert.equal(state.accountability.retainedValue, 0);
  assert.equal(state.accountability.caseStatus, "disciplinary");

  const unrelated = engine.beginYear(engine.createNewGame("community", 5), EVENTS);
  delete unrelated.accountability;
  const next = engine.selectChoice(unrelated, EVENTS, 0);
  assert.equal(next.accountability, undefined, "ordinary history must not invent a responsibility record");
});
