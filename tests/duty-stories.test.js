"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { ROLES } = require("../src/core/constants");
const { EVENTS } = require("../src/data/events");
const { DUTY_STORIES } = require("../src/data/duty-stories");

test("every career stage has one exclusive duty story with authored consequences", () => {
  assert.equal(DUTY_STORIES.length, ROLES.length);
  DUTY_STORIES.forEach((event, roleIndex) => {
    assert.deepEqual(event.roleLevels, [roleIndex]);
    assert.equal(event.once, true);
    assert.equal(event.contentTag, "岗位专属剧情 · 虚构");
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, event.choices.length);
    assert.ok(event.choices.every((choice) => choice.outcome.length > 20));
    const eligibleState = engine.createNewGame("community", 8000 + roleIndex);
    eligibleState.roleIndex = roleIndex;
    const eligibleDuty = engine.eligibleEvents(eligibleState, EVENTS, "work").filter((item) => item.id.startsWith("duty_"));
    assert.deepEqual(eligibleDuty.map((item) => item.id), [event.id]);

    event.choices.forEach((choice, choiceIndex) => {
      const state = engine.beginYear(engine.createNewGame("community", 9000 + roleIndex), EVENTS);
      state.roleIndex = roleIndex;
      state.currentEventId = event.id;
      state.seen[event.id] = state.careerYear;
      const result = engine.selectChoice(state, EVENTS, choiceIndex);
      assert.equal(result.lastResult.outcome, choice.outcome);
      assert.equal(result.history.at(-1).roleIndex, roleIndex);
      assert.equal(engine.validateSavedGame(JSON.parse(JSON.stringify(result))), true);
    });
  });
});

test("the route exposes fictional jurisdictions, responsibilities and real move types", () => {
  assert.deepEqual(ROLES.map((role) => role.entryMode), [
    "录用", "内部轮岗", "提拔", "跨部门调任", "提拔", "跨部门调任并提拔", "跨部门转任", "调任并提拔", "跨部门转任", "提拔", "交流任职并提拔"
  ]);
  assert.ok(ROLES.every((role) => role.responsibility.length >= 25));
  assert.deepEqual([...new Set(ROLES.slice(0, 10).map((role) => role.scope))], ["青禾镇", "云岑县", "澄川市", "栖原省"]);
  assert.match(ROLES[0].responsibility, /不替领导或业务部门越权拍板/);
  assert.match(ROLES[9].responsibility, /不替法定机关作具体结论/);
  assert.match(ROLES[10].post, /虚构/);
});
