"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { ROLES } = require("../src/core/constants");

function startAtYear(year) {
  const state = engine.createNewGame("community", 20260913 + year);
  state.careerYear = year;
  return engine.beginYear(state, EVENTS);
}

test("each year has exactly one rotating lead story", () => {
  const firstYear = startAtYear(1);
  assert.equal(EVENTS.find((event) => event.id === firstYear.currentEventId).category, "work");
  assert.deepEqual(firstYear.queue, []);

  const lifeYear = startAtYear(3);
  assert.equal(EVENTS.find((event) => event.id === lifeYear.currentEventId).category, "life");
  assert.deepEqual(lifeYear.queue, []);

  const cityYear = startAtYear(5);
  assert.equal(EVENTS.find((event) => event.id === cityYear.currentEventId).category, "city");
  assert.deepEqual(cityYear.queue, []);

  const consequenceYear = engine.createNewGame("community", 9);
  consequenceYear.careerYear = 2;
  consequenceYear.flags.birthdayHome = true;
  consequenceYear.seen.life_family_dinner = 1;
  const started = engine.beginYear(consequenceYear, EVENTS);
  assert.equal(started.currentEventId, "followup_birthday_photo");
  assert.deepEqual(started.queue, []);
});

test("game tenure gates visibly accelerate through the township, county, city and province route", () => {
  const playable = ROLES.slice(0, 10).map((role) => role.minYears);
  assert.deepEqual(playable, [1, 1, 1, 1, 1, 1, 1, 2, 2, 2]);
  assert.equal(playable.reduce((sum, years) => sum + years, 0), 13);
});

test("old saves drop queued stories to enter the new one-story rhythm", () => {
  const state = startAtYear(16);
  state.queue = ["life", "city"];
  const repaired = engine.repairLegacyPacing(state);
  assert.deepEqual(repaired.queue, []);
  assert.deepEqual(state.queue, ["life", "city"]);
  const result = engine.selectChoice(repaired, EVENTS, 0);
  assert.equal(engine.advanceAfterResult(result, EVENTS).phase, "planning");
});
