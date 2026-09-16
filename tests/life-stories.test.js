"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { LIFE_DILEMMAS } = require("../src/data/life-dilemmas");
const { takeLifeAction } = require("../src/core/life");

function chooseLife(eventId, choiceIndex) {
  let state = engine.beginYear(engine.createNewGame("community", 1234), EVENTS);
  const event = EVENTS.find((item) => item.id === eventId);
  if (event.requiresChild) {
    state.life.relationship = "married"; state.assets = 3;
    state.phase = "planning"; state.currentEventId = null; state.queue = [];
    state = takeLifeAction(state, "child");
    state.careerYear += event.minChildAge;
  }
  state.phase = "event";
  state.currentEventId = eventId;
  state.seen[eventId] = state.careerYear;
  state.queue = [];
  return engine.selectChoice(state, EVENTS, choiceIndex);
}

test("every life choice has its own authored consequence, preserved in the save and history", () => {
  const life = EVENTS.filter((event) => event.category === "life");
  assert.equal(life.length, 26);
  life.forEach((event) => {
    assert.equal(event.once, true, `${event.id} must not replay the same authored scene`);
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, event.choices.length);
    event.choices.forEach((choice, index) => {
      assert.ok(typeof choice.outcome === "string" && choice.outcome.length > 20, `${event.id}:${index}`);
      const state = chooseLife(event.id, index);
      assert.equal(state.lastResult.outcome, choice.outcome);
      assert.equal(state.history.at(-1).outcome, choice.outcome);
      assert.equal(engine.validateSavedGame(JSON.parse(JSON.stringify(state))), true);
      const after = engine.advanceAfterResult(state, EVENTS);
      assert.equal(after.history.at(-1).outcome, choice.outcome);
    });
  });
});

test("specific life scenes disappear after the first reading and exhausted life queues are skipped", () => {
  for (const eventId of ["life_evening_course", "life_health_check", "life_weekend_walk", "life_move_house"]) {
    const state = engine.createNewGame("community", 77);
    state.careerYear = 9;
    state.seen[eventId] = 3;
    assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === eventId), eventId);
  }

  let state = engine.beginYear(engine.createNewGame("community", 88), EVENTS);
  state = engine.selectChoice(state, EVENTS, 0);
  state.queue = ["life"];
  for (const event of EVENTS.filter((item) => item.category === "life")) state.seen[event.id] = 1;
  const next = engine.advanceAfterResult(state, EVENTS);
  assert.equal(next.phase, "planning");
  assert.equal(next.currentEventId, null);
});

test("history blocks a one-off story even when an old save has lost its seen index", () => {
  const state = engine.createNewGame("community", 89);
  state.careerYear = 25;
  state.history.push({
    year: 24,
    eventId: "life_evening_course",
    eventTitle: "全班就你没交作业",
    choiceIndex: 0,
    choiceText: "旧选择",
    changes: {}
  });
  delete state.seen.life_evening_course;

  const eligible = engine.eligibleEvents(state, EVENTS, "life");
  assert.ok(!eligible.some((event) => event.id === "life_evening_course"));

  state.history.push({
    year: 20,
    eventId: "life_weekend_walk",
    eventTitle: "同学群突然热闹了",
    choiceIndex: 1,
    choiceText: "旧选择",
    changes: {}
  });
  assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === "life_weekend_walk"));
});

test("a repeated one-off event already active in an old tab is replaced on restore", () => {
  const state = engine.createNewGame("community", 91);
  state.careerYear = 9;
  state.phase = "event";
  state.currentEventId = "life_weekend_walk";
  state.queue = [];
  state.seen.life_weekend_walk = 9;
  state.history.push({ year: 3, eventId: "life_weekend_walk", eventTitle: "同学群突然热闹了", choiceIndex: 0, choiceText: "旧选择", changes: {} });

  const repaired = engine.repairRepeatedCurrentEvent(state, EVENTS);
  assert.notEqual(repaired.currentEventId, "life_weekend_walk");
  assert.equal(repaired.seen.life_weekend_walk, 3);
  assert.equal(repaired.phase, "event");
  assert.equal(state.currentEventId, "life_weekend_walk");
});

test("new life dilemmas use concrete relationships, three costly choices and distinct consequences", () => {
  assert.equal(LIFE_DILEMMAS.length, 6);
  assert.equal(new Set(LIFE_DILEMMAS.map((event) => event.title)).size, LIFE_DILEMMAS.length);
  LIFE_DILEMMAS.forEach((event) => {
    assert.equal(event.once, true, event.id);
    assert.equal(event.choices.length, 3, event.id);
    assert.match(event.body, /[‘“]/, event.id);
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, 3, event.id);
    event.choices.forEach((choice, index) => {
      assert.ok(choice.text.length >= 10, `${event.id}:${index} choice`);
      assert.ok(choice.outcome.length > 45, `${event.id}:${index} outcome`);
    });
    assert.ok(event.choices.some((choice) =>
      Object.values(choice.effects || {}).some((value) => value < 0) || (choice.assetChange || 0) < 0
    ), `${event.id} needs a real cost`);
  });
});

test("the old classmate debt is 5000 yuan and repayment deducts 0.5 in ten-thousand-yuan units", () => {
  const event = EVENTS.find((item) => item.id === "life_weekend_walk");
  const narrative = [event.body, ...event.choices.map((choice) => choice.outcome)].join("\n");
  assert.match(narrative, /5000 元/);
  assert.doesNotMatch(narrative, /五块钱/);

  const paid = chooseLife(event.id, 0);
  assert.equal(paid.assets, 1.5);
  assert.equal(paid.lastResult.assetChange, -0.5);
  assert.equal(paid.history.at(-1).assetChange, -0.5);

  for (const choiceIndex of [1, 2]) {
    const unpaid = chooseLife(event.id, choiceIndex);
    assert.equal(unpaid.assets, 2);
    assert.equal(unpaid.lastResult.assetChange, 0);
  }
});

test("existing result saves without narrative remain readable, malformed new narrative does not", () => {
  const state = chooseLife("life_family_dinner", 0);
  delete state.lastResult.outcome;
  delete state.history.at(-1).outcome;
  assert.equal(engine.validateSavedGame(state), true);
  for (const invalid of [42, {}, ["story"], "a".repeat(2001)]) {
    const broken = JSON.parse(JSON.stringify(state));
    broken.lastResult.outcome = invalid;
    assert.equal(engine.validateSavedGame(broken), false);
  }
});

test("birthday follow-ups remember the chosen branch, require elapsed time and occur only once", () => {
  for (const [choiceIndex, expected, excluded] of [
    [0, "followup_birthday_photo", "followup_birthday_candle"],
    [1, "followup_birthday_candle", "followup_birthday_photo"]
  ]) {
    const state = chooseLife("life_family_dinner", choiceIndex);
    assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === expected));
    state.careerYear += 1;
    const next = engine.drawEvent(state, EVENTS, "life");
    assert.equal(next.currentEventId, expected);
    assert.ok(!engine.eligibleEvents(next, EVENTS, "life").some((event) => [expected, excluded, "life_family_dinner"].includes(event.id)));
  }
});

test("friendship and hobby follow-ups depend on the player's actual commitment", () => {
  const scenarios = [
    ["life_old_friend", 0, "followup_friend_tickets", "followup_favor_review"],
    ["life_old_friend", 1, "followup_friend_tickets", "followup_favor_review"],
    ["life_old_friend", 2, "followup_favor_review", "followup_friend_tickets"],
    ["life_hobby_group", 0, "followup_band_stage", null]
  ];
  scenarios.forEach(([eventId, choiceIndex, expected, excluded]) => {
    const state = chooseLife(eventId, choiceIndex);
    state.careerYear += 1;
    const next = engine.drawEvent(state, EVENTS, "life");
    assert.equal(next.currentEventId, expected);
    assert.ok(!engine.eligibleEvents(next, EVENTS, "life").some((event) => event.id === excluded));
  });
  for (const choiceIndex of [1, 2]) {
    const state = chooseLife("life_hobby_group", choiceIndex);
    state.careerYear += 1;
    assert.ok(!engine.eligibleEvents(state, EVENTS, "life").some((event) => event.id === "followup_band_stage"));
  }
});
