"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const { EVENTS } = require("../src/data/events");
const platform = require("../src/platform/wechat");

test("unwrapped current-route saves wrap atomically and discoveries survive restarting", (t) => {
  const state = engine.beginYear(engine.createNewGame("community", 42), EVENTS);
  let disk = JSON.parse(JSON.stringify(state));
  let fail = false;
  global.wx = {
    getStorageSync: () => JSON.parse(JSON.stringify(disk)),
    setStorageSync: (_key, value) => {
      if (fail) throw new Error("quota exhausted");
      disk = JSON.parse(JSON.stringify(value));
    },
    removeStorageSync: () => { disk = null; }
  };
  t.after(() => { delete global.wx; });
  assert.deepEqual(platform.loadGame(), state);
  assert.deepEqual(platform.loadArchive(), []);
  const ended = engine.leaveCareer(state);
  assert.equal(platform.saveGame(ended), true);
  assert.equal(platform.loadArchive()[0].endingId, "new_beginning");
  const previousDisk = JSON.stringify(disk);
  fail = true;
  assert.equal(platform.saveGame(state), false);
  assert.equal(JSON.stringify(disk), previousDisk);
  fail = false;
  assert.equal(platform.saveGame(state), true);
  assert.equal(platform.loadArchive().length, 1);
  for (let seed = 1; seed <= 30; seed += 1) {
    const repeated = engine.leaveCareer(engine.beginYear(engine.createNewGame("study", seed), EVENTS));
    platform.saveGame(repeated);
  }
  assert.equal(platform.loadArchive().length, 1, "same ending is not duplicated or evicted");
  assert.equal(platform.clearGame(), true);
  assert.equal(platform.loadGame(), null);
  assert.deepEqual(platform.loadArchive(), []);
});

test("legacy ending names merge into the nine-ending collection without deleting the save", (t) => {
  const legacyState = engine.beginYear(engine.createNewGame("community", 91), EVENTS);
  legacyState.phase = "ending";
  legacyState.currentEventId = null;
  legacyState.queue = [];
  legacyState.endingId = "learning_path";
  const disk = {
    format: "local-profile-v2",
    state: legacyState,
    archive: [
      { id: "old-learning", endingId: "learning_path", year: 12, roleIndex: 2, assets: 20 },
      { id: "old-specialist", endingId: "trusted_specialist", year: 18, roleIndex: 3, assets: 30 },
      { id: "old-city", endingId: "city_builder", year: 20, roleIndex: 4, assets: 40 }
    ]
  };
  global.wx = { getStorageSync: () => JSON.parse(JSON.stringify(disk)) };
  t.after(() => { delete global.wx; });
  assert.equal(platform.loadGame().endingId, "clean_retirement");
  assert.deepEqual(platform.loadArchive().map((item) => item.endingId), ["clean_retirement", "public_legacy"]);
});
