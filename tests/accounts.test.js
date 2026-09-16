"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../src/core/engine");
const accounts = require("../src/core/accounts");
const life = require("../src/core/life");
const { EVENTS } = require("../src/data/events");
const { MAX_CAREER_YEARS } = require("../src/core/constants");
const start = () => engine.beginYear(engine.createNewGame("community", 18), EVENTS);
function planning(input) {
  let state = input;
  while (["event", "result"].includes(state.phase)) state = state.phase === "event" ? engine.selectChoice(state, EVENTS, 0) : engine.advanceAfterResult(state, EVENTS);
  return state;
}
function review(input) { return engine.finalizeAnnualPlanning(planning(input)); }

test("account forecasts do not mint money and annual settlement credits once separately from cash", () => {
  const state = start();
  const before = JSON.stringify(state);
  assert.deepEqual(engine.calculateReview(state).accountCredit, { housingFund: 1.4, annuity: 0.7 });
  assert.equal(JSON.stringify(state), before);
  const closing = review(state);
  const next = engine.completeReview(closing, EVENTS);
  assert.equal(next.assets - closing.assets, closing.review.annualIncome - closing.review.livingCost);
  assert.equal(next.accounts.housingFund, 1.4);
  assert.equal(next.accounts.annuity, 0.7);
  assert.deepEqual(next.annualReports[0].accountCredit, closing.review.accountCredit);
  assert.equal(next.accounts.entries.length, 1);
  assert.equal(engine.validateSavedGame(next), true);
  assert.deepEqual(engine.beginYear(next, EVENTS).accounts, next.accounts);
  assert.throws(() => engine.completeReview(next, EVENTS), /active review/);
  const duplicate = { ...closing, accounts: next.accounts };
  assert.throws(() => engine.completeReview(duplicate, EVENTS), /已经入账/);
  assert.equal(duplicate.assets, closing.assets);
});

test("promotion-year credits use the outgoing post and subsequent years use the new salary", () => {
  const state = start();
  state.yearsInRole = 1;
  Object.keys(state.stats).forEach((key) => { state.stats[key] = 90; });
  const next = engine.completeReview(review(state), EVENTS);
  assert.equal(next.roleIndex, 1);
  assert.equal(next.accounts.entries[0].roleIndex, 0);
  assert.equal(next.accounts.housingFund, 1.4);
  assert.deepEqual(engine.calculateReview(next).accountCredit, { housingFund: 1.8, annuity: 0.9 });
});

test("housing fund can close the purchase cash gap with exact split and a persistent debit", () => {
  const state = engine.completeReview(review(start()), EVENTS);
  state.appointment = null; state.startOfYearResults = [];
  state.assets = 48.6;
  const ready = planning(state);
  const before = JSON.stringify(ready);
  assert.equal(life.actionReason(ready, "home"), null);
  const bought = life.takeLifeAction(ready, "home");
  assert.equal(bought.assets, 0);
  assert.equal(bought.accounts.housingFund, 0);
  assert.equal(bought.accounts.annuity, 0.7);
  assert.equal(bought.life.housing, "owned");
  assert.equal(bought.life.actions[0].cashCost, 48.6);
  assert.equal(bought.life.actions[0].housingFundUsed, 1.4);
  assert.equal(bought.accounts.entries[1].type, "home");
  assert.equal(JSON.stringify(ready), before);
  assert.equal(engine.validateSavedGame(JSON.parse(JSON.stringify(bought))), true);
  assert.throws(() => life.takeLifeAction(bought, "home"), /本年度/);
  ready.assets = 48.59;
  assert.throws(() => life.takeLifeAction(ready, "home"), /结余不足/);
});

test("restricted balances cannot buy cars or cover cash arrangements, and purchase never overdrafts a fund", () => {
  const state = planning(start());
  state.accounts = accounts.creditAccounts(state, { housingFund: 100, annuity: 100 });
  state.assets = 0;
  assert.throws(() => life.takeLifeAction(state, "car"), /结余不足/);
  assert.throws(() => life.takeLifeAction(state, "rest"), /结余不足/);
  const bought = life.takeLifeAction(state, "home");
  assert.equal(bought.assets, 0);
  assert.equal(bought.accounts.housingFund, 50);
  assert.equal(bought.accounts.annuity, 100);
  assert.equal(engine.validateSavedGame(bought), true);
  assert.throws(() => accounts.spendHousingFund(state, 100.01), /不足/);
  assert.throws(() => accounts.spendHousingFund(state, -1), /无效/);
});

test("legacy event and already-calculated review saves migrate without retroactive benefits", () => {
  const legacy = start(); legacy.careerYear = 8; delete legacy.accounts;
  assert.equal(engine.validateSavedGame(legacy), true);
  assert.deepEqual(accounts.getAccounts(legacy), accounts.createAccounts(8));
  assert.equal(legacy.accounts, undefined);
  const current = engine.completeReview(review(legacy), EVENTS);
  assert.equal(current.accounts.startedYear, 8);
  assert.equal(current.accounts.entries.length, 1);
  const oldReview = review(legacy); delete oldReview.review.accountCredit;
  const next = engine.completeReview(oldReview, EVENTS);
  assert.equal(next.accounts, undefined);
  assert.equal(next.annualReports[0].accountCredit, undefined);
  assert.equal(engine.validateSavedGame(next), true);
  const after = engine.completeReview(review(next), EVENTS);
  assert.equal(after.accounts.startedYear, 9);
  assert.equal(after.accounts.entries.length, 1);
});

test("ending preserves balances without inventing an extra year or paying locked annuity into cash", () => {
  let state = engine.completeReview(review(start()), EVENTS);
  const balances = JSON.stringify(state.accounts);
  const cash = state.assets;
  const left = engine.leaveCareer(state);
  assert.equal(JSON.stringify(left.accounts), balances);
  assert.equal(left.assets, cash);
  state.careerYear = MAX_CAREER_YEARS;
  const closing = review(state);
  const ended = engine.completeReview(closing, EVENTS);
  assert.equal(ended.phase, "ending");
  assert.equal(ended.accounts.entries.length, 2);
  assert.equal(ended.assets, cash + (closing.assets - cash) + closing.review.annualIncome - closing.review.livingCost);
  assert.equal(engine.validateSavedGame(ended), true);
});

test("account balances must match their ledger; malformed and duplicate entries are rejected", () => {
  const valid = engine.completeReview(review(start()), EVENTS);
  for (const mutate of [
    (s) => { s.accounts = null; },
    (s) => { s.accounts.housingFund = -1; },
    (s) => { s.accounts.annuity = Infinity; },
    (s) => { s.accounts.housingFund = 1.401; },
    (s) => { s.accounts.startedYear = 3; },
    (s) => { s.accounts.entries.push({ ...s.accounts.entries[0] }); },
    (s) => { s.accounts.entries[0].type = "cashout"; },
    (s) => { s.accounts.entries[0].year = 3; },
    (s) => { s.accounts.entries[0].housingFund = 99; },
    (s) => { s.annualReports[0].accountCredit = {}; }
  ]) {
    const state = structuredClone(valid); mutate(state);
    assert.equal(engine.validateSavedGame(state), false);
  }
});

test("fractional entries stay at two decimal places across a full career ledger", () => {
  const state = start();
  for (let year = 1; year <= MAX_CAREER_YEARS; year += 1) {
    state.careerYear = year;
    state.accounts = accounts.creditAccounts(state, accounts.annualAccountCredit(7.07));
  }
  assert.equal(state.accounts.housingFund, 39.48);
  assert.equal(state.accounts.annuity, 19.88);
  assert.equal(accounts.validAccounts(state.accounts, MAX_CAREER_YEARS), true);
});
