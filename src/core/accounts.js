"use strict";

const { MAX_CAREER_YEARS, ROLES } = require("./constants");

// Fictional extra game benefits. No real-world payroll, tax or withdrawal rules.
const ACCOUNT_RATES = { housingFund: 0.2, annuity: 0.1 };
const money = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const isMoney = (value) => Number.isFinite(value) && value >= 0 && value <= 1000000 && Math.abs(value * 100 - Math.round(value * 100)) < 0.000001;
const record = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));

function createAccounts(year = 1) {
  return { startedYear: year, housingFund: 0, annuity: 0, entries: [] };
}

function getAccounts(state) {
  // Old saves start at zero now, with no invented retroactive contributions.
  return state.accounts ? JSON.parse(JSON.stringify(state.accounts)) : createAccounts(state.careerYear);
}

function annualAccountCredit(annualIncome) {
  return { housingFund: money(annualIncome * ACCOUNT_RATES.housingFund), annuity: money(annualIncome * ACCOUNT_RATES.annuity) };
}

function validCredit(credit) {
  return record(credit) && isMoney(credit.housingFund) && isMoney(credit.annuity);
}

function creditAccounts(state, credit) {
  if (!validCredit(credit)) throw new Error("Invalid account credit");
  const accounts = getAccounts(state);
  if (accounts.entries.some((entry) => entry.type === "annual" && entry.year === state.careerYear)) throw new Error("本年度账户已经入账");
  accounts.housingFund = money(accounts.housingFund + credit.housingFund);
  accounts.annuity = money(accounts.annuity + credit.annuity);
  accounts.entries.push({ type: "annual", year: state.careerYear, roleIndex: state.roleIndex, ...credit });
  return accounts;
}

function homeFunding(state, price = 50) {
  const housingFundUsed = money(Math.min(price, getAccounts(state).housingFund));
  return { housingFundUsed, cashCost: money(price - housingFundUsed) };
}

function spendHousingFund(state, amount) {
  const accounts = getAccounts(state);
  if (!isMoney(amount) || amount > 50 || amount > accounts.housingFund) throw new Error("公积金余额不足或金额无效");
  if (amount === 0) return accounts;
  if (accounts.entries.some((entry) => entry.type === "home")) throw new Error("已使用公积金购置住房");
  accounts.housingFund = money(accounts.housingFund - amount);
  accounts.entries.push({ type: "home", year: state.careerYear, roleIndex: state.roleIndex, amount });
  return accounts;
}

function validAccounts(accounts, year) {
  if (!record(accounts) || !Number.isInteger(accounts.startedYear) || accounts.startedYear < 1 || accounts.startedYear > year ||
    !isMoney(accounts.housingFund) || !isMoney(accounts.annuity) || !Array.isArray(accounts.entries) || accounts.entries.length > MAX_CAREER_YEARS + 1) return false;
  let housingFund = 0;
  let annuity = 0;
  let lastYear = accounts.startedYear;
  let usedHome = false;
  const creditedYears = new Set();
  for (const entry of accounts.entries) {
    if (!record(entry) || !Number.isInteger(entry.year) || entry.year < lastYear || entry.year > year ||
      !Number.isInteger(entry.roleIndex) || !ROLES[entry.roleIndex]) return false;
    lastYear = entry.year;
    if (entry.type === "annual") {
      if (!validCredit(entry) || creditedYears.has(entry.year)) return false;
      creditedYears.add(entry.year);
      housingFund = money(housingFund + entry.housingFund);
      annuity = money(annuity + entry.annuity);
    } else if (entry.type === "home") {
      if (usedHome || !isMoney(entry.amount) || entry.amount <= 0 || entry.amount > 50 || entry.amount > housingFund) return false;
      usedHome = true;
      housingFund = money(housingFund - entry.amount);
    } else return false;
  }
  return accounts.housingFund === housingFund && accounts.annuity === annuity;
}

module.exports = { ACCOUNT_RATES, money, createAccounts, getAccounts, annualAccountCredit, validCredit, creditAccounts, homeFunding, spendHousingFund, validAccounts };
