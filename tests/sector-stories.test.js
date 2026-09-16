"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { ROLES } = require("../src/core/constants");
const { SECTOR_STORIES } = require("../src/data/sector-stories");
const { MORE_SECTOR_STORIES } = require("../src/data/more-sector-stories");

test("cross-department scenes add playful, authored variety without losing consequences", () => {
  assert.equal(SECTOR_STORIES.length, 16);
  assert.equal(new Set(SECTOR_STORIES.map((event) => event.title)).size, 16);
  assert.ok(new Set(SECTOR_STORIES.map((event) => event.storyTheme)).size >= 14);
  const text = SECTOR_STORIES.map((event) => `${event.title} ${event.body}`).join(" ");
  for (const field of ["农业", "市场", "警务", "投资", "环境", "交通", "教育", "急救"]) {
    assert.match(text, new RegExp(field));
  }
  for (const event of SECTOR_STORIES) {
    assert.equal(event.once, true, event.id);
    assert.equal(event.contentTag, "跨部门小剧场 · 虚构");
    assert.match(event.body, /[‘“]/, event.id);
    assert.equal(event.choices.length, 3, event.id);
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, 3, event.id);
    assert.ok(event.roleLevels.every((index) => ROLES[index]), event.id);
    for (const choice of event.choices) {
      assert.ok(choice.text.length >= 10, `${event.id} choice`);
      assert.ok(choice.outcome.length >= 45, `${event.id} outcome`);
    }
  }
});

test("the second department pack reaches the 160-story target with more public-service fields", () => {
  assert.equal(MORE_SECTOR_STORIES.length, 16);
  assert.equal(new Set(MORE_SECTOR_STORIES.map((event) => event.storyTheme)).size, 16);
  const text = MORE_SECTOR_STORIES.map((event) => `${event.title} ${event.body}`).join(" ");
  for (const field of ["规划", "水利", "猴", "消费券", "科技", "审计", "招聘", "博物馆", "马拉松", "医院", "学校", "补贴", "产值"]) {
    assert.match(text, new RegExp(field));
  }
  for (const event of MORE_SECTOR_STORIES) {
    assert.equal(event.once, true, event.id);
    assert.equal(event.contentTag, "跨部门小剧场 · 虚构");
    assert.equal(event.choices.length, 3, event.id);
    assert.ok(event.roleLevels.every((index) => ROLES[index]), event.id);
    assert.equal(new Set(event.choices.map((choice) => choice.outcome)).size, 3, event.id);
  }
});
