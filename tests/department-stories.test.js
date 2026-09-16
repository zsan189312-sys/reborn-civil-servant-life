"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const { DEPARTMENT_STORIES } = require("../src/data/department-stories");
const { ROLES } = require("../src/core/constants");

test("department route includes ten visibly different fields", () => {
  const departments = ROLES.map((role) => role.department).join(" ");
  for (const field of ["党政办公室", "民政", "农业农村", "市场监督", "政法", "公安", "发展和改革", "生态环境", "交通运输", "省政府"]) {
    assert.match(departments, new RegExp(field));
  }
  assert.ok(ROLES.every((role) => role.department && role.responsibility));
});

test("new conflict stories are single-use, themed and preserve every authored consequence", () => {
  assert.ok(DEPARTMENT_STORIES.length >= 18);
  const themes = new Set(DEPARTMENT_STORIES.map((event) => event.storyTheme));
  assert.ok(themes.size >= 12);
  for (const event of DEPARTMENT_STORIES) {
    assert.equal(event.once, true, event.id);
    assert.equal(event.contentTag, "部门履职 · 虚构剧情");
    assert.equal(event.choices.length, 3);
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, 3);
    event.choices.forEach((choice, choiceIndex) => {
      const state = engine.beginYear(engine.createNewGame("community", 8800 + choiceIndex), EVENTS);
      state.roleIndex = event.roleLevels[0];
      state.currentEventId = event.id;
      state.seen[event.id] = state.careerYear;
      const result = engine.selectChoice(state, EVENTS, choiceIndex);
      assert.equal(result.lastResult.outcome, choice.outcome);
      assert.equal(result.lastResult.storyTheme, event.storyTheme);
      assert.equal(engine.validateSavedGame(result), true);
    });
  }
});

test("different event IDs with the same dramatic theme are cooled across nearby years", () => {
  const state = engine.createNewGame("community", 42);
  state.roleIndex = 4;
  state.careerYear = 12;
  state.history = [{
    year: 11, roleIndex: 4, eventId: "dept_relative_case_call", eventTitle: "旧案情请托",
    storyTheme: "case-boundary", choiceIndex: 0, choiceText: "拒绝", changes: {}
  }];
  state.seen.dept_relative_case_call = 11;
  const pool = engine.eligibleEvents(state, EVENTS, "work");
  assert.ok(pool.some((event) => engine.eventTheme(event) === "case-boundary"));
  const drawn = engine.drawEvent(state, EVENTS, "work");
  assert.notEqual(engine.eventTheme(EVENTS.find((event) => event.id === drawn.currentEventId)), "case-boundary");
});

test("an already-open old tab with a repetitive theme is replaced on restore", () => {
  const state = engine.createNewGame("community", 84);
  state.roleIndex = 4;
  state.careerYear = 12;
  state.phase = "event";
  state.currentEventId = "dept_case_coordination_blank";
  state.seen.dept_case_coordination_blank = 12;
  state.history = [{
    year: 11, roleIndex: 4, eventId: "dept_relative_case_call", eventTitle: "亲属打探案情",
    storyTheme: "case-boundary", choiceIndex: 0, choiceText: "拒绝", changes: {}
  }];
  const repaired = engine.repairRepetitiveCurrentTheme(state, EVENTS);
  assert.notEqual(repaired.currentEventId, "dept_case_coordination_blank");
  assert.notEqual(engine.eventTheme(EVENTS.find((event) => event.id === repaired.currentEventId)), "case-boundary");
  assert.equal(repaired.history.length, 1);
  assert.equal(state.currentEventId, "dept_case_coordination_blank");
});
