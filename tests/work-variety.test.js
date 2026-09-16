"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { ENGAGING_WORK_STORIES } = require("../src/data/engaging-work-stories");

test("every authored work, life and city story is single-use in one career", () => {
  const stories = EVENTS.filter((event) => ["work", "life", "city"].includes(event.category));
  assert.ok(stories.length > 90);
  for (const event of stories) assert.equal(event.once, true, event.id);
});

test("history prevents an old work story from returning in a later year", () => {
  const state = engine.createNewGame("community", 9132026);
  state.careerYear = 11;
  state.history.push({
    year: 3,
    eventId: "work_old_records",
    eventTitle: "散乱的旧档案",
    choiceIndex: 0,
    choiceText: "旧版选择",
    changes: {}
  });
  delete state.seen.work_old_records;

  assert.ok(!engine.eligibleEvents(state, EVENTS, "work").some((event) => event.id === "work_old_records"));
});

test("a repeated work story already waiting in an old save is replaced before choice", () => {
  const state = engine.createNewGame("community", 9132027);
  state.careerYear = 12;
  state.phase = "event";
  state.currentEventId = "work_old_records";
  state.seen.work_old_records = 12;
  state.history.push({
    year: 2,
    eventId: "work_old_records",
    eventTitle: "散乱的旧档案",
    choiceIndex: 1,
    choiceText: "旧版选择",
    changes: {}
  });

  const repaired = engine.repairRepeatedCurrentEvent(state, EVENTS);
  assert.notEqual(repaired.currentEventId, "work_old_records");
  assert.equal(repaired.seen.work_old_records, 2);
  assert.equal(repaired.history.length, 1);
  assert.equal(repaired.phase, "event");
  assert.equal(state.currentEventId, "work_old_records");
});

test("an exhausted post advances to planning and review instead of replaying a finished story", () => {
  const state = engine.createNewGame("community", 9132028);
  state.careerYear = 28;
  state.roleIndex = 0;
  for (const event of EVENTS.filter((item) => ["work", "life", "city", "integrity"].includes(item.category) && item.roleLevels.includes(0))) {
    state.seen[event.id] = Math.max(1, state.careerYear - 1);
    state.history.push({ year: 1, roleIndex: 0, eventId: event.id, eventTitle: event.title, choiceIndex: 0, choiceText: "已读", changes: {} });
  }

  const next = engine.beginYear(state, EVENTS);
  assert.equal(next.phase, "planning");
  assert.equal(next.currentEventId, null);
  assert.equal(next.noNewStory, true);
  assert.equal(engine.validateSavedGame(next, EVENTS), true);
  const reviewed = engine.finalizeAnnualPlanning(next);
  assert.equal(reviewed.review.noNewStory, true);
});

test("new work dilemmas span the career and give every choice an authored aftermath", () => {
  assert.equal(ENGAGING_WORK_STORIES.length, 14);
  assert.equal(new Set(ENGAGING_WORK_STORIES.map((event) => event.title)).size, 14);
  const coveredRoles = new Set(ENGAGING_WORK_STORIES.flatMap((event) => event.roleLevels));
  for (let roleIndex = 0; roleIndex <= 10; roleIndex += 1) assert.ok(coveredRoles.has(roleIndex), `role ${roleIndex}`);

  for (const event of ENGAGING_WORK_STORIES) {
    assert.equal(event.once, true, event.id);
    assert.equal(event.choices.length, 3, event.id);
    assert.match(event.body, /[‘“]/, event.id);
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, 3, event.id);
    for (const [index, choice] of event.choices.entries()) {
      assert.ok(choice.text.length >= 12, `${event.id}:${index} choice`);
      assert.ok(choice.outcome.length > 55, `${event.id}:${index} outcome`);
      assert.ok(Object.values(choice.effects).some((value) => value < 0), `${event.id}:${index} needs a cost`);
    }
  }
});
