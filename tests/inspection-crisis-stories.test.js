"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { ROLES } = require("../src/core/constants");
const { INSPECTION_CRISIS_STORIES } = require("../src/data/inspection-crisis-stories");

test("inspection and crisis stories are dramatic, distinct and single-use", () => {
  assert.equal(INSPECTION_CRISIS_STORIES.length, 9);
  assert.equal(new Set(INSPECTION_CRISIS_STORIES.map((event) => event.id)).size, 9);
  assert.equal(new Set(INSPECTION_CRISIS_STORIES.map((event) => event.title)).size, 9);
  assert.equal(new Set(INSPECTION_CRISIS_STORIES.map((event) => event.storyTheme)).size, 9);
  const corpus = INSPECTION_CRISIS_STORIES.map((event) => `${event.title} ${event.body}`).join(" ");
  for (const subject of ["饭局", "门卡", "检查", "巡视", "审计", "匿名举报", "直播", "家人"]) {
    assert.match(corpus, new RegExp(subject));
  }
  INSPECTION_CRISIS_STORIES.forEach((event) => {
    assert.equal(event.once, true, event.id);
    assert.equal(event.choices.length, 3, event.id);
    assert.ok(event.roleLevels.every((roleIndex) => ROLES[roleIndex]), event.id);
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, 3, event.id);
    assert.ok(event.choices.every((choice) => choice.outcome.length >= 55), event.id);
  });
});

