"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { CAREER_STORIES } = require("../src/data/career-stories");
const { EVENTS } = require("../src/data/events");
const engine = require("../src/core/engine");

test("new career episodes have distinct consequences, remain in their role scope and do not recur", () => {
  assert.equal(CAREER_STORIES.length, 8);
  for (const event of CAREER_STORIES) {
    assert.equal(event.once, true);
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, 3);
    for (let roleIndex = 0; roleIndex <= 10; roleIndex += 1) {
      const state = engine.createNewGame("study", 2026);
      state.roleIndex = roleIndex;
      assert.equal(engine.eligibleEvents(state, EVENTS, "work").some((item) => item.id === event.id), event.roleLevels.includes(roleIndex), `${event.id}/${roleIndex}`);
      state.seen[event.id] = 1; state.careerYear = 10;
      assert.ok(!engine.eligibleEvents(state, EVENTS, "work").some((item) => item.id === event.id));
    }
  }
});

test("every authored career consequence survives the choice, save and history", () => {
  for (const event of CAREER_STORIES) {
    event.choices.forEach((choice, choiceIndex) => {
      const state = engine.beginYear(engine.createNewGame("study", 2026), EVENTS);
      state.roleIndex = event.roleLevels[0];
      state.currentEventId = event.id;
      state.seen[event.id] = state.careerYear;
      const next = engine.selectChoice(state, EVENTS, choiceIndex);
      assert.equal(next.lastResult.outcome, choice.outcome);
      assert.equal(next.history[0].outcome, choice.outcome);
      assert.equal(engine.validateSavedGame(JSON.parse(JSON.stringify(next))), true);
    });
  }
});

test("the last-stamp story clearly identifies Chen as an applicant rather than the player's mentor or supervisor", () => {
  const event = CAREER_STORIES.find((item) => item.id === "town_last_stamp");
  assert.match(event.body, /青禾镇便民服务大厅/);
  assert.match(event.body, /邻村修农机的陈国平/);
  assert.match(event.body, /办手续的群众，不是你的师父或领导/);
  assert.match(event.body, /综合窗口/);
  assert.match(event.body, /业务窗口/);
  assert.ok(event.choices.every((choice) => choice.outcome.includes("陈国平") || choice.outcome.includes("综合窗口")));
});
