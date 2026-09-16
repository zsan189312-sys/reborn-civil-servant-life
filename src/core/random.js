"use strict";

function normalizeSeed(seed) {
  const value = Number(seed) >>> 0;
  return value === 0 ? 0x6d2b79f5 : value;
}

function nextRandom(seed) {
  let value = normalizeSeed(seed);
  value += 0x6d2b79f5;
  let mixed = value;
  mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  const random = ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  return { seed: value >>> 0, value: random };
}

function pick(seed, items) {
  if (!items.length) throw new Error("Cannot pick from an empty list");
  const result = nextRandom(seed);
  return {
    seed: result.seed,
    item: items[Math.floor(result.value * items.length)]
  };
}

module.exports = { nextRandom, normalizeSeed, pick };

