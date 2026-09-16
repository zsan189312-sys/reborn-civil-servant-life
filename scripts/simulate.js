"use strict";

// Offline diagnostics: all careers use the same public transitions as gameplay.
// Policies inspect authored effects to find witnesses; they are not player-retention predictions.
const engine = require("../src/core/engine");
const { ATTRIBUTES, BACKGROUNDS, ROLES, MAX_CAREER_YEARS } = require("../src/core/constants");
const { nextRandom } = require("../src/core/random");
const { EVENTS } = require("../src/data/events");
const { ENDINGS } = require("../src/data/endings");

function sourceFingerprint() {
  const fs = require("node:fs");
  const path = require("node:path");
  const hash = require("node:crypto").createHash("sha256");
  ["scripts/simulate.js", "src/core/constants.js", "src/core/random.js", "src/core/engine.js", "src/core/competition.js", "src/core/life.js", "src/core/accounts.js", "src/core/accountability.js", "src/data/events.js", "src/data/followups.js", "src/data/senior-events.js", "src/data/career-stories.js", "src/data/career-followups.js", "src/data/duty-stories.js", "src/data/department-stories.js", "src/data/sector-stories.js", "src/data/more-sector-stories.js", "src/data/ethics-stories.js", "src/data/integrity-assessments.js", "src/data/inspection-crisis-stories.js", "src/data/child-stories.js", "src/data/life-dilemmas.js", "src/data/engaging-work-stories.js", "src/data/endings.js"].forEach((filename) => {
    hash.update(filename + "\n");
    hash.update(fs.readFileSync(path.resolve(__dirname, "..", filename)));
  });
  return hash.digest("hex");
}

const POLICIES = {
  first: { first: true },
  random: { random: true },
  steady: { targets: { ability: 58, performance: 55, trust: 55, integrity: 65, family: 65, health: 65 } },
  family: { family: 5, health: 1, integrity: 0.4, ability: -0.2 },
  health: { health: 5, family: 1, integrity: 0.5 },
  learning: { ability: 5, health: 0.6, integrity: 0.7 },
  delivery: { performance: 5, ability: 0.5, health: -0.1, family: -0.1 },
  trust: { trust: 5, integrity: 1, health: 0.8 },
  integrity: { integrity: 5, ability: 1, health: 0.8 },
  balanced: { ability: 1, performance: 1, trust: 1, integrity: 1, family: 1, health: 1, balance: true },
  promotion: { ability: 1.2, performance: 2.5, trust: 1, integrity: 1.5, health: 0.8 },
  longTerm: { ability: 0.5, performance: 1.5, trust: 1, integrity: 1, health: 0.7, delayed: 3 },
  overwork: { performance: 4, health: -2, family: -1 },
  burnout: { health: -10, performance: 1 },
  healthExit: { health: -12, integrity: 8, family: -0.2, performance: 0.1 },
  boundaryLoss: { integrity: -5, health: 0.5 },
  departure: { leaveYear: 8, family: 2, health: 1 },
  specialist: { targets: { ability: 74, performance: 58, trust: 68, integrity: 72, family: 65, health: 65 } },
  quiet: { targets: { ability: 55, performance: 52, trust: 52, integrity: 60, family: 55, health: 65 } }
};

function choose(state, event, policy, random) {
  if (policy.first) return 0;
  if (policy.random) return Math.floor(random * event.choices.length);
  const scores = event.choices.map((choice) => {
    let score = 0;
    ATTRIBUTES.forEach((key) => {
      const effect = Math.max(0, Math.min(100, state.stats[key] + (choice.effects[key] || 0))) - state.stats[key];
      let weight = policy[key] || 0;
      if (policy.targets) {
        const target = policy.targets[key];
        score += (state.stats[key] - target) ** 2 - (state.stats[key] + effect - target) ** 2;
        return;
      }
      if (policy.balance) weight *= state.stats[key] < 55 ? 4 : state.stats[key] >= 78 ? 0.2 : 1;
      // Avoid accidental terminal outcomes unless a policy explicitly explores them.
      if (key === "health" && state.stats.health < 22 && weight >= 0) weight += 12;
      if (key === "integrity" && state.stats.integrity < 28 && weight >= 0) weight += 12;
      score += effect * weight;
    });
    for (const delayed of choice.delayed || []) {
      if (state.careerYear + delayed.afterYears > MAX_CAREER_YEARS) continue;
      for (const key of ATTRIBUTES) score += (delayed.effects[key] || 0) * (policy[key] || 0) * (policy.delayed || 0.4);
    }
    return score;
  });
  const best = Math.max(...scores);
  const ties = scores.flatMap((score, index) => Math.abs(score - best) < 0.00001 ? [index] : []);
  return ties[Math.floor(random * ties.length)];
}

function simulate({ seed, backgroundId, policyName, policy = POLICIES[policyName] }) {
  if (!policy) throw new Error(`Unknown policy: ${policyName}`);
  let state = engine.beginYear(engine.createNewGame(backgroundId, seed), EVENTS);
  let policySeed = (seed ^ 0x9e3779b9) >>> 0;
  let transitions = 0;
  let quietYears = 0;
  const actions = [];
  while (state.phase !== "ending") {
    if (++transitions > MAX_CAREER_YEARS * 9) throw new Error("Career failed to terminate");
    if (state.phase === "event") {
      if (policy.leaveYear && state.careerYear >= policy.leaveYear) {
        actions.push({ type: "leave", year: state.careerYear });
        state = engine.leaveCareer(state);
        continue;
      }
      // Acknowledge the same appointment overlay as a player before making annual choices.
      state.appointment = null;
      const event = engine.findCurrentEvent(state, EVENTS);
      const rng = nextRandom(policySeed);
      policySeed = rng.seed;
      const choiceIndex = choose(state, event, policy, rng.value);
      actions.push({ type: "choice", year: state.careerYear, eventId: event.id, choiceIndex });
      state = engine.selectChoice(state, EVENTS, choiceIndex);
    } else if (state.phase === "result") state = engine.advanceAfterResult(state, EVENTS);
    else if (state.phase === "planning") state = engine.finalizeAnnualPlanning(state);
    else if (state.phase === "review") {
      if (state.review.noNewStory) quietYears += 1;
      state = engine.completeReview(state, EVENTS);
    }
    else throw new Error(`Unknown phase: ${state.phase}`);
  }
  const narrativeHistory = state.history.filter((item) => EVENTS.find((event) => event.id === item.eventId)?.category !== "assessment");
  const distinct = new Set(narrativeHistory.map((item) => item.eventId)).size;
  const automaticTransfers = (state.annualReports || []).filter((report) => report.promoted).length;
  return {
    seed, backgroundId, policyName, endingId: state.endingId, roleIndex: state.roleIndex,
    years: state.careerYear, stats: state.stats, distinct,
    events: narrativeHistory.length, assessments: state.history.length - narrativeHistory.length,
    repeats: narrativeHistory.length - distinct, quietYears,
    automaticTransfers,
    actions
  };
}

function replay(witness) {
  let state = engine.beginYear(engine.createNewGame(witness.backgroundId, witness.seed), EVENTS);
  let index = 0;
  let transitions = 0;
  while (state.phase !== "ending") {
    if (++transitions > MAX_CAREER_YEARS * 9) throw new Error("Replay did not finish");
    if (state.phase === "event") {
      const action = witness.actions[index++];
      if (!action || action.year !== state.careerYear) throw new Error("Replay year mismatch");
      state.appointment = null;
      if (action.type === "leave") state = engine.leaveCareer(state);
      else {
        if (action.type !== "choice") throw new Error("Unsupported replay action");
        if (action.eventId !== state.currentEventId) throw new Error("Replay event mismatch");
        state = engine.selectChoice(state, EVENTS, action.choiceIndex);
      }
    } else if (state.phase === "result") state = engine.advanceAfterResult(state, EVENTS);
    else if (state.phase === "planning") state = engine.finalizeAnnualPlanning(state);
    else if (state.phase === "review") state = engine.completeReview(state, EVENTS);
    else throw new Error("Unsupported replay phase");
  }
  if (index !== witness.actions.length || state.endingId !== witness.endingId) throw new Error("Replay ending mismatch");
  return state;
}

function calibrate(runs = 3000) {
  const endings = {};
  for (let index = 0; index < runs; index += 1) {
    const result = simulate({
      seed: 220000 + index,
      backgroundId: BACKGROUNDS[index % BACKGROUNDS.length].id,
      policyName: "random"
    });
    endings[result.endingId] = (endings[result.endingId] || 0) + 1;
  }
  return {
    model: "uniform-random-player-choices",
    runs,
    endings,
    criminalConvictionRate: +((endings.criminal_conviction || 0) / runs).toFixed(4),
    highOfficeRate: +((endings.high_office || 0) / runs).toFixed(4)
  };
}

function audit(runsPerPolicy = 100) {
  if (!Number.isInteger(runsPerPolicy) || runsPerPolicy < 1 || runsPerPolicy > 10000) throw new Error("SIMULATION_RUNS must be an integer between 1 and 10000");
  const results = [];
  const witnesses = {};
  Object.keys(POLICIES).forEach((policyName) => {
    for (let index = 0; index < runsPerPolicy; index += 1) {
      const result = simulate({ seed: 10000 + index, backgroundId: BACKGROUNDS[index % BACKGROUNDS.length].id, policyName });
      results.push(result);
      if (!witnesses[result.endingId]) witnesses[result.endingId] = result;
    }
  });
  Object.values(witnesses).forEach(replay);
  const policies = Object.keys(POLICIES).map((name) => {
    const runs = results.filter((item) => item.policyName === name);
    return {
      name, runs: runs.length,
      meanYear: +(runs.reduce((sum, item) => sum + item.years, 0) / runs.length).toFixed(1),
      meanRole: +(runs.reduce((sum, item) => sum + item.roleIndex, 0) / runs.length).toFixed(2),
      meanQuietYears: +(runs.reduce((sum, item) => sum + item.quietYears, 0) / runs.length).toFixed(2),
      repeatRate: +(runs.reduce((sum, item) => sum + item.repeats, 0) / Math.max(1, runs.reduce((sum, item) => sum + item.events, 0))).toFixed(3),
      endings: runs.reduce((counts, item) => ({ ...counts, [item.endingId]: (counts[item.endingId] || 0) + 1 }), {}),
      meanStats: Object.fromEntries(ATTRIBUTES.map((key) => [key, +(runs.reduce((sum, item) => sum + item.stats[key], 0) / runs.length).toFixed(1)]))
    };
  });
  return {
    schemaVersion: 1,
    sourceFingerprint: sourceFingerprint(),
    eventCount: EVENTS.length,
    careers: results.length,
    coverage: Object.keys(witnesses).length,
    calibration: calibrate(3000),
    missing: ENDINGS.filter((ending) => !witnesses[ending.id]).map((ending) => ending.id),
    automaticTransfers: results.reduce((total, item) => total + item.automaticTransfers, 0),
    policies,
    witnesses,
    threeCareerRepeat: ["first", "random", "balanced"].map((policyName) => {
      const paths = results.filter((item) => item.policyName === policyName).slice(0, 3);
      const ids = paths.flatMap((item) => item.actions.filter((action) => action.type === "choice" &&
        !EVENTS.find((event) => event.id === action.eventId).requiresFlags &&
        EVENTS.find((event) => event.id === action.eventId).category !== "assessment").map((action) => action.eventId));
      return { policyName, careers: paths.length, ordinaryDraws: ids.length, unique: new Set(ids).size,
        repeatRate: +((ids.length - new Set(ids).size) / Math.max(1, ids.length)).toFixed(3) };
    }),
    rolePools: ROLES.map((role, roleIndex) => ({
      name: role.name,
      ordinaryWork: EVENTS.filter((event) => event.category === "work" && !event.requiresFlags && event.roleLevels.includes(roleIndex)).length,
      conditionalWork: EVENTS.filter((event) => event.category === "work" && event.requiresFlags && event.roleLevels.includes(roleIndex)).length
    }))
  };
}

if (require.main === module) {
  const result = audit(Number(process.env.SIMULATION_RUNS || 100));
  const { witnesses, ...summary } = result;
  process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
  if (process.argv.includes("--write")) {
    const fs = require("node:fs");
    const path = require("node:path");
    const output = path.resolve(__dirname, "../artifacts");
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, "simulation-audit.json"), JSON.stringify(result, null, 2) + "\n");
  }
}

module.exports = { POLICIES, audit, calibrate, replay, simulate, sourceFingerprint };
