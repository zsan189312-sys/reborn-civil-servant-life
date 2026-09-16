"use strict";

const {
  ATTRIBUTES,
  BACKGROUNDS,
  MAX_CAREER_YEARS,
  ROLES,
  SAVE_VERSION,
  CIVIL_RANKS, LEADERSHIP_MIN_RANK
} = require("./constants");
const { nextRandom, normalizeSeed, pick } = require("./random");
const { ENDINGS } = require("../data/endings");
const { createLifeState, getLifeState, applyStoryLife, childAge, annualChildCost, annualLifeCost, validLife } = require("./life");
const { createAccounts, annualAccountCredit, creditAccounts, validAccounts, validCredit, money } = require("./accounts");
const { getPromotionOpportunity, validOpportunity } = require("./competition");
const { applyAccountability, createAccountability, getAccountability, validAccountability } = require("./accountability");

const INTEGRITY_CHECK_INTERVAL = 4;
// Once a sufficiently serious evidence chain exists, the career receives one
// deterministic screening roll. At 60%, the fixed uniform-random audit settles
// near the product target: roughly half of all careers reach a conviction.
const INTEGRITY_CASE_DETECTION_RATE = 0.755;
const CRITICAL_HEALTH = 10;

const PROMOTION_MOVES = {
  report: {
    id: "report",
    name: "拿成绩说话，正常汇报",
    short: "正常汇报",
    cost: 0,
    bonus: 1,
    risk: 0,
    effects: { ability: 1, integrity: 1 },
    outcome: "你把成绩、短板和下一步都摆在桌面上。没有暗示，也没有礼盒。上级只说了一句：‘年底看结果。’不刺激，但晚上睡得踏实。"
  },
  dinner: {
    id: "dinner",
    name: "赴饭局，混个脸熟",
    short: "人情饭局",
    cost: 0.3,
    bonus: 4,
    risk: 0.2,
    effects: { performance: 2, integrity: -5, health: -2 },
    outcome: "酒过三巡，对方笑着说‘以后多走动’。你似乎被记住了，也说不清被记住的是成绩，还是这顿不该由你张罗的饭。"
  },
  gift: {
    id: "gift",
    name: "拎礼盒带红包，去敲门",
    short: "送礼请托",
    cost: 0.8,
    bonus: 8,
    risk: 0.48,
    effects: { performance: 4, integrity: -12, family: -2 },
    outcome: "门开了一条缝，礼盒进去了，你的名字也进了另一份记忆。它可能让你靠近位置，也可能让你离调查谈话更近。"
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function applyEffects(stats, effects = {}) {
  const next = { ...stats };
  const changes = {};
  ATTRIBUTES.forEach((key) => {
    if (typeof effects[key] !== "number") return;
    const previous = next[key];
    next[key] = clamp(previous + effects[key]);
    changes[key] = next[key] - previous;
  });
  return { stats: next, changes };
}

function createNewGame(backgroundId, seed = Date.now()) {
  const background = BACKGROUNDS.find((item) => item.id === backgroundId);
  if (!background) throw new Error(`Unknown background: ${backgroundId}`);

  const baseStats = {
    ability: 48,
    performance: 45,
    trust: 48,
    integrity: 58,
    family: 55,
    health: 60
  };
  const adjusted = applyEffects(baseStats, background.effects).stats;

  return {
    version: SAVE_VERSION,
    seed: normalizeSeed(seed),
    backgroundId,
    careerYear: 1,
    yearsInRole: 0,
    roleIndex: 0,
    rankIndex: 1,
    yearsInRank: 0,
    appointment: null,
    stats: adjusted,
    assets: 2,
    life: createLifeState(),
    accounts: createAccounts(),
    accountability: createAccountability(),
    flags: {},
    seen: {},
    delayed: [],
    history: [],
    annualReports: [],
    queue: [],
    currentEventId: null,
    phase: "idle",
    lastResult: null,
    review: null,
    endingId: null,
    longTermWins: 0
  };
}

function eligibleEvents(state, events, category) {
  // `seen` is a fast lookup cache, but old saves and tabs can contain a
  // complete history with a missing/stale cache entry.  For one-off stories,
  // the persisted history is the source of truth so they cannot be drawn
  // again merely because that cache drifted.
  const historicalEventIds = new Set((state.history || []).map((entry) => entry.eventId));
  return events.filter((event) => {
    if (event.category !== category) return false;
    if (event.requiresChild) {
      const age = childAge(state);
      if (age === null || age < event.minChildAge || age > event.maxChildAge) return false;
    }
    if (event.requiresPartner) {
      const life = getLifeState(state);
      if (life.relationship === "single" || state.careerYear - life.relationshipSince < (event.minRelationshipYears || 0)) return false;
    }
    if (event.id === "life_move_house" && getLifeState(state).housing !== "rental") return false;
    if (!event.roleLevels.includes(state.roleIndex)) return false;
    if (state.roleIndex >= 7 && ["work", "city"].includes(event.category) && !event.requiresFlags &&
      !event.id.startsWith("province_") && !event.id.startsWith("national_") && !event.id.startsWith("duty_") && !event.id.startsWith("dept_")) return false;
    if (event.minYear && state.careerYear < event.minYear) return false;
    if (event.maxYear && state.careerYear > event.maxYear) return false;
    if (event.once && (state.seen[event.id] !== undefined || historicalEventIds.has(event.id))) return false;
    if (event.afterEvent) {
      const sourceYear = state.seen[event.afterEvent.id];
      if (sourceYear === undefined || state.careerYear - sourceYear < event.afterEvent.years) return false;
    }
    if (event.requiresFlags) {
      return event.requiresFlags.every((flag) => Boolean(state.flags[flag]));
    }
    return true;
  });
}

const STORY_THEME_RULES = [
  ["case-boundary", /案情|案件|办案|笔录|侦查|审判|法院|检察|报警/],
  ["gift-benefit", /礼盒|礼品|红包|购物卡|转账|现金|酒|宴请|饭局|请吃|土特产/],
  ["project-procurement", /招标|投标|评审|供应方|分包|承包|验收|工程|项目/],
  ["records-data", /档案|材料|报表|报告|清单|台账|数字|名单|签字|纪要/],
  ["emergency-safety", /暴雨|台风|险情|应急|救援|安置|消防|事故|桥|河堤/],
  ["welfare-care", /民政|低保|救助|养老|儿童|老人|殡葬|慈善/],
  ["family-relationship", /家人|父亲|母亲|伴侣|孩子|生日|同学|朋友|亲戚|表弟/],
  ["health-rest", /健康|体检|复查|医院|医生|病|休息|睡/],
  ["public-opinion", /直播|记者|热搜|舆情|评论区|媒体|视频/],
  ["budget-resource", /预算|资金|财政|资源|成本|工资|补贴/],
  ["team-management", /下属|同事|队伍|干部|值班|加班|会议/]
];

function eventTheme(event) {
  if (!event) return "unknown";
  if (event.storyTheme) return event.storyTheme;
  const text = `${event.title || ""} ${event.body || ""}`;
  const matched = STORY_THEME_RULES.find(([, pattern]) => pattern.test(text));
  return matched ? matched[0] : `scene:${event.id}`;
}

function drawEvent(state, events, category) {
  const eligible = eligibleEvents(state, events, category);
  if (!eligible.length) throw new Error(`No eligible ${category} events for role ${state.roleIndex}`);

  const followups = eligible.filter((event) => event.requiresFlags && event.requiresFlags.length && state.seen[event.id] == null);
  const milestones = eligible.filter((event) => event.requiresChild && state.seen[event.id] == null);
  const unseen = eligible.filter((event) => state.seen[event.id] == null);
  const cooled = eligible.filter((event) => {
    const lastSeen = state.seen[event.id];
    const cooldown = event.cooldownYears || 3;
    return lastSeen == null || state.careerYear - lastSeen >= cooldown;
  });
  const basePool = milestones.length ? milestones : followups.length ? followups : unseen.length ? unseen : cooled.length ? cooled : eligible;
  // Exact IDs are already single-use. This second guard prevents consecutive
  // years from feeling repetitive when two different scenes share the same
  // dramatic subject (for example two archive errors or two gift attempts).
  // A causal follow-up keeps priority because it advances an earlier choice;
  // standalone scenes rotate away from themes used in the last three years.
  // Exact event IDs remain single-use for the entire career; a causal sequel
  // may revisit a subject because it advances the player's earlier choice.
  const recentThemes = new Set((state.history || [])
    .filter((entry) => entry.year >= state.careerYear - 3)
    .map((entry) => events.find((event) => event.id === entry.eventId))
    .filter(Boolean)
    .map(eventTheme));
  const varied = basePool.filter((event) => event.afterEvent || !recentThemes.has(eventTheme(event)));
  const pool = varied.length ? varied : basePool;
  const selection = pick(state.seed, pool);
  state.seed = selection.seed;
  state.currentEventId = selection.item.id;
  state.seen[selection.item.id] = state.careerYear;
  state.phase = "event";
  return state;
}

function applyDueEffects(state) {
  const due = state.delayed.filter((item) => item.dueYear <= state.careerYear);
  state.delayed = state.delayed.filter((item) => item.dueYear > state.careerYear);
  const messages = [];
  due.forEach((item) => {
    const result = applyEffects(state.stats, item.effects);
    state.stats = result.stats;
    if ((item.effects.performance || 0) >= 6) state.longTermWins += 1;
    messages.push({ message: item.message, changes: result.changes });
  });
  return messages;
}

function beginYear(inputState, events) {
  const state = clone(inputState);
  state.lastResult = null;
  state.review = null;
  state.currentEventId = null;
  const delayedResults = applyDueEffects(state);
  state.queue = [];
  const availableWork = eligibleEvents(state, events, "work");
  const availableLife = eligibleEvents(state, events, "life");
  const hasPriorityWork = availableWork.some((event) =>
    state.seen[event.id] === undefined && event.requiresFlags && event.requiresFlags.length);
  const hasPriorityLife = availableLife.some((event) =>
    state.seen[event.id] === undefined && (event.requiresFlags || event.requiresChild));
  const availableCity = eligibleEvents(state, events, "city");
  const availableIntegrity = eligibleEvents(state, events, "integrity");
  // Fast narrative mode: one main story per service year. Consequences and
  // child milestones take priority; otherwise city and life chapters rotate
  // into the work stream instead of being stacked behind it in the same year.
  let category = "work";
  if (hasPriorityLife) category = "life";
  else if (hasPriorityWork) category = "work";
  else if (availableIntegrity.length && state.careerYear % INTEGRITY_CHECK_INTERVAL === 0) category = "integrity";
  else if (availableCity.length && state.careerYear % 5 === 0) category = "city";
  else if (availableLife.length && state.careerYear % 3 === 0) category = "life";
  state.startOfYearResults = delayedResults;
  if (getAccountability(state).caseStatus === "convicted" || state.stats.health <= CRITICAL_HEALTH || state.stats.integrity < 15) {
    state.phase = "ending";
    state.endingId = resolveEndingId(state);
    state.queue = [];
    return state;
  }
  if (!eligibleEvents(state, events, category).length) {
    category = ["work", "integrity", "life", "city"].find((candidate) => eligibleEvents(state, events, candidate).length);
  }
  // A deliberately non-promoting career can outlive every authored scene for
  // its current post. Never resurrect a read story merely to fill the year.
  // Such rare years settle normally and disclose why no choice was shown.
  if (!category) {
    state.review = null;
    state.phase = "planning";
    state.currentEventId = null;
    state.noNewStory = true;
    return state;
  }
  // Fast mode is intentionally one decision per year. Life, city, integrity
  // and consequence chapters rotate into this single slot instead of being
  // stacked behind a compulsory second work card.
  return drawEvent(state, events, category);
}

function selectChoice(inputState, events, choiceIndex) {
  const state = clone(inputState);
  if (state.phase !== "event") throw new Error("A choice can only be made during an event");
  const event = events.find((item) => item.id === state.currentEventId);
  if (!event) throw new Error(`Missing event: ${state.currentEventId}`);
  if (!Number.isInteger(choiceIndex)) throw new Error("Choice index must be an integer");
  const choice = event.choices[choiceIndex];
  if (!choice) throw new Error(`Invalid choice index ${choiceIndex}`);

  const effectResult = applyEffects(state.stats, choice.effects);
  state.stats = effectResult.stats;
  state.assets += choice.assetChange || 0;
  state.flags = { ...state.flags, ...(choice.flags || {}) };
  if (choice.accountability) applyAccountability(state, choice.accountability);
  const accountability = getAccountability(state);
  const evidenceThresholdReached = accountability.retainedValue > 0 &&
    accountability.dutyAbuse >= 3 && accountability.concealment >= 1;
  if (evidenceThresholdReached && !state.flags.integrityCaseScreened &&
    !["prosecution", "convicted"].includes(accountability.caseStatus)) {
    const detection = nextRandom(state.seed);
    state.seed = detection.seed;
    state.flags.integrityCaseScreened = true;
    if (detection.value < INTEGRITY_CASE_DETECTION_RATE) {
      state.flags.integrityCaseOpened = true;
      applyAccountability(state, { caseStatus: "investigation" });
    } else {
      state.flags.integrityEvidenceMissed = true;
    }
  }
  state.life = applyStoryLife(state, event.id, choiceIndex);
  (choice.delayed || []).forEach((delayed) => {
    state.delayed.push({
      dueYear: state.careerYear + delayed.afterYears,
      effects: delayed.effects,
      message: delayed.message
    });
  });

  const sentenceYears = getAccountability(state).sentenceYears;
  const fillStoryValues = (text) => typeof text === "string"
    ? text.replace(/\{\{sentenceYears\}\}/g, String(sentenceYears || "待依法判定"))
    : text;
  const historyEntry = {
    year: state.careerYear,
    roleIndex: state.roleIndex,
    eventId: event.id,
    eventTitle: event.title,
    storyTheme: eventTheme(event),
    choiceIndex,
    choiceText: choice.text,
    ...(choice.outcome ? { outcome: fillStoryValues(choice.outcome) } : {}),
    ...(choice.accountability && choice.accountability.note
      ? { accountabilityNote: fillStoryValues(choice.accountability.note) }
      : {}),
    changes: effectResult.changes,
    assetChange: choice.assetChange || 0,
    delayedMessages: (choice.delayed || []).map((item) => `约 ${item.afterYears} 年后回看此事`)
  };
  state.history.push(historyEntry);
  state.lastResult = historyEntry;
  state.phase = "result";
  return state;
}

function currentPromotionPlan(state) {
  return state && state.promotionPlan && state.promotionPlan.year === state.careerYear ? state.promotionPlan : null;
}

function promotionChoice(state) {
  const plan = currentPromotionPlan(state);
  return plan ? plan.choice : "automatic";
}

function promotionActionReason(state, choiceId) {
  if (!state || state.phase !== "event" || state.appointment || (state.startOfYearResults || []).length) return "只能在本年度故事处理前选择";
  if (state.roleIndex >= ROLES.length - 1) return "已经到达本局最高岗位";
  if (currentPromotionPlan(state)) return "本年度已经作出选择";
  const move = PROMOTION_MOVES[choiceId];
  if (!move) return "这个选择不存在";
  if (state.assets < move.cost) return `可支配现金不足 ${move.cost.toFixed(1)} 万`;
  return null;
}

function setPromotionChoice(inputState, choiceId) {
  const state = clone(inputState);
  const move = PROMOTION_MOVES[choiceId];
  const reason = promotionActionReason(state, choiceId);
  if (reason) throw new Error(reason);
  const applied = applyEffects(state.stats, move.effects);
  state.stats = applied.stats;
  state.assets = money(state.assets - move.cost);
  const priorRiskMoves = (state.annualReports || []).filter((report) => ["dinner", "gift"].includes(report.promotionChoice)).length;
  const detectionRate = Math.min(0.9, move.risk + priorRiskMoves * (choiceId === "gift" ? 0.1 : 0.06));
  const mixedSeed = (state.seed ^ Math.imul(state.careerYear, 0x9e3779b1) ^ (choiceId === "gift" ? 0x85ebca6b : 0xc2b2ae35)) >>> 0;
  const detected = detectionRate > 0 && nextRandom(mixedSeed).value < detectionRate;
  if (detected) {
    const fallout = applyEffects(state.stats, { trust: -5, integrity: -3, health: -3 });
    state.stats = fallout.stats;
    Object.entries(fallout.changes).forEach(([key, value]) => { applied.changes[key] = (applied.changes[key] || 0) + value; });
  }
  state.promotionPlan = {
    year: state.careerYear,
    choice: choiceId,
    bonus: move.bonus,
    cost: move.cost,
    detected,
    changes: applied.changes,
    outcome: move.outcome
  };
  return state;
}

function calculateReview(state) {
  const role = ROLES[state.roleIndex];
  const roleFit = (state.stats.ability + state.stats.trust) / 2;
  const contributions = [
    { label: "政绩", value: state.stats.performance, weight: 35 },
    { label: "能力", value: state.stats.ability, weight: 20 },
    { label: "民望", value: state.stats.trust, weight: 15 },
    { label: "廉洁", value: state.stats.integrity, weight: 20 },
    { label: "岗位匹配", value: roleFit, weight: 10 }
  ].map((item) => ({ ...item, score: item.value * item.weight / 100 }));
  const baseScore = contributions.reduce((total, item) => total + item.score, 0);
  const randomResult = nextRandom(state.seed);
  const randomShift = Math.round(randomResult.value * 12 - 6);
  const plan = currentPromotionPlan(state);
  const relationshipBonus = plan && PROMOTION_MOVES[plan.choice] && !plan.detected ? plan.bonus : 0;
  const finalScore = Math.round(baseScore + randomShift + relationshipBonus);
  const nextRoleExists = state.roleIndex < ROLES.length - 1;
  const competition = nextRoleExists ? getPromotionOpportunity(state) : null;
  const reasons = [];

  if (state.yearsInRole + 1 < role.minYears) {
    reasons.push(`当前岗位需至少 ${role.minYears} 年经历`);
  }
  if (nextRoleExists && state.stats.performance < role.minPerformance) reasons.push(`政绩需至少 ${role.minPerformance}`);
  if (nextRoleExists && state.stats.integrity < role.minIntegrity) reasons.push(`廉洁需至少 ${role.minIntegrity}`);
  if (state.stats.health <= CRITICAL_HEALTH) reasons.push("健康状态无法继续履职");
  if (finalScore < role.threshold) reasons.push(`总分未达到 ${role.threshold}`);
  if (nextRoleExists && competition && !competition.available) reasons.push("目标岗位本年度没有空缺");
  if (nextRoleExists && competition && competition.available && finalScore <= competition.candidate.score) {
    reasons.push(`同场人选组织评价 ${competition.candidate.score} 分，本次未形成优势`);
  }
  if (plan && plan.detected) reasons.push("请客送礼引发核查，本年不予提拔");
  if (!nextRoleExists) reasons.push("已处于最高岗位");
  const demoted = state.roleIndex > 0 && (finalScore < 42 || state.stats.integrity < 25);
  if (demoted) reasons.push(state.stats.integrity < 25 ? "廉洁评价过低，触发降任" : "综合评价过低，触发降任");
  return {
    contributions,
    seed: randomResult.seed,
    baseScore: Math.round(baseScore),
    randomShift,
    relationshipBonus,
    finalScore,
    threshold: role.threshold,
    promotionMode: "automatic",
    promotionChoice: plan ? plan.choice : "automatic",
    promoted: nextRoleExists && reasons.length === 0 && !demoted,
    demoted,
    rankPromoted: state.roleIndex < 7 && state.rankIndex < CIVIL_RANKS.length - 1 &&
      state.yearsInRank + 1 >= 2 && state.stats.integrity >= 60 && finalScore >= 60 &&
      !(plan && plan.detected) && !(nextRoleExists && reasons.length === 0) && !demoted,
    competition,
    reasons,
    rankAllowance: state.roleIndex < 7 ? Math.floor(state.rankIndex / 2) : 0,
    annualIncome: role.annualIncome + (state.roleIndex < 7 ? Math.floor(state.rankIndex / 2) : 0),
    accountCredit: annualAccountCredit(role.annualIncome + (state.roleIndex < 7 ? Math.floor(state.rankIndex / 2) : 0)),
    lifeCost: annualLifeCost(state),
    childCost: annualChildCost(state),
    livingCost: 5 + Math.min(4, Math.floor(state.careerYear / 6)) + annualLifeCost(state)
  };
}

function needsAssessment(state) {
  return false;
}

function proceedAfterRegularEvents(state, events) {
  while (state.queue.length) {
    const nextCategory = state.queue.shift();
    // A save created by an earlier version may still contain a queued category
    // whose one-off stories have since all been read. Skip it instead of
    // replaying an authored scene or failing the year transition.
    if (eligibleEvents(state, events, nextCategory).length) return drawEvent(state, events, nextCategory);
  }
  state.review = null;
  state.phase = "planning";
  state.currentEventId = null;
  return state;
}

function finalizeAnnualPlanning(inputState) {
  const state = clone(inputState);
  if (state.phase !== "planning") throw new Error("Finish annual work before year-end planning");
  const review = calculateReview(state);
  state.seed = review.seed;
  state.review = { ...review, ...(state.noNewStory ? { noNewStory: true } : {}) };
  delete state.noNewStory;
  state.phase = "review";
  return state;
}

function repairRepeatedCurrentEvent(inputState, events) {
  if (!inputState || inputState.phase !== "event" || !inputState.currentEventId) return inputState;
  const event = events.find((item) => item.id === inputState.currentEventId);
  const previous = (inputState.history || []).filter((item) => item.eventId === inputState.currentEventId);
  if (!event || !event.once || !previous.length) return inputState;

  const state = clone(inputState);
  state.seen[event.id] = Math.max(...previous.map((item) => item.year));
  state.currentEventId = null;
  state.lastResult = null;
  if (eligibleEvents(state, events, event.category).length) return drawEvent(state, events, event.category);
  return proceedAfterRegularEvents(state, events);
}

function repairRepetitiveCurrentTheme(inputState, events) {
  if (!inputState || inputState.phase !== "event" || !inputState.currentEventId) return inputState;
  const current = events.find((item) => item.id === inputState.currentEventId);
  if (!current || current.afterEvent) return inputState;
  const recentThemes = new Set((inputState.history || [])
    .filter((entry) => entry.year >= inputState.careerYear - 3)
    .map((entry) => entry.storyTheme || eventTheme(events.find((event) => event.id === entry.eventId)))
    .filter(Boolean));
  if (!recentThemes.has(eventTheme(current))) return inputState;

  const state = clone(inputState);
  const alreadyCompleted = (state.history || []).some((entry) => entry.eventId === current.id);
  if (!alreadyCompleted && state.seen[current.id] === state.careerYear) delete state.seen[current.id];
  const alternatives = eligibleEvents(state, events, current.category)
    .filter((event) => event.afterEvent || !recentThemes.has(eventTheme(event)));
  if (!alternatives.length) return inputState;
  state.currentEventId = null;
  state.lastResult = null;
  return drawEvent(state, events, current.category);
}

function repairLegacyPacing(inputState) {
  if (!inputState || !["event", "result"].includes(inputState.phase) || !inputState.queue || !inputState.queue.length) return inputState;
  const state = clone(inputState);
  state.queue = [];
  return state;
}

function advanceAfterResult(inputState, events) {
  const state = clone(inputState);
  if (state.phase !== "result") throw new Error("Can only advance from a result");
  state.lastResult = null;
  if (getAccountability(state).caseStatus === "convicted" || state.stats.health <= CRITICAL_HEALTH || state.stats.integrity < 15) {
    state.phase = "ending";
    state.endingId = resolveEndingId(state);
    state.currentEventId = null;
    state.queue = [];
    return state;
  }
  return proceedAfterRegularEvents(state, events);
}

function resolveEndingId(state) {
  const accountability = getAccountability(state);
  if (accountability.caseStatus === "convicted") return "criminal_conviction";
  if (state.stats.health <= CRITICAL_HEALTH) return "health_exit";
  if (state.stats.integrity < 15) return "disciplinary_exit";
  // A high title or skill score must not hide the cost of neglecting life.
  if (state.stats.performance >= 82 && (state.stats.family < 35 || state.stats.health < 35)) {
    return "results_only";
  }
  const values = ATTRIBUTES.map((key) => state.stats[key]);
  if ((state.stats.family >= 78 && state.roleIndex <= 3) ||
    (Math.min(...values) >= 60 && Math.max(...values) - Math.min(...values) <= 25)) return "family_first";
  // 市级部门正职及以上属于本作定义的“较高领导岗位”。最后一档是
  // 世界观边界位，不能再作为唯一可达条件。
  if (state.roleIndex >= 6) return "high_office";
  if ((state.longTermWins >= 2 && state.stats.performance >= 70) || state.stats.trust >= 82) return "public_legacy";
  if (accountability.caseStatus === "disciplinary" || state.stats.integrity < 45) return "disciplinary_exit";
  return "clean_retirement";
}

function completeReview(inputState, events) {
  const state = clone(inputState);
  if (state.phase !== "review" || !state.review) {
    throw new Error("Can only complete an active review");
  }

  if (state.review.accountCredit) state.accounts = creditAccounts(state, state.review.accountCredit);
  state.assets = money(state.assets + state.review.annualIncome - state.review.livingCost);
  state.appointment = null;
  state.annualReports = [...(state.annualReports || []), {
    year: state.careerYear,
    roleIndex: state.roleIndex,
    promoted: state.review.promoted,
    demoted: Boolean(state.review.demoted),
    rankPromoted: Boolean(state.review.rankPromoted),
    rankIndex: state.rankIndex,
    score: state.review.finalScore,
    netIncome: state.review.annualIncome - state.review.livingCost,
    ...(state.review.childCost !== undefined ? { childCost: state.review.childCost } : {}),
    ...(state.review.accountCredit ? { accountCredit: { ...state.review.accountCredit } } : {}),
    promotionMode: state.review.promotionMode || "legacy",
    ...(state.review.promotionChoice && state.review.promotionChoice !== "automatic" ? { promotionChoice: state.review.promotionChoice } : {}),
    ...(currentPromotionPlan(state) ? { promotionDetected: Boolean(currentPromotionPlan(state).detected) } : {}),
    ...(state.review.competition ? { competition: clone(state.review.competition) } : {}),
    reasons: [...state.review.reasons]
  }];
  if (state.review.demoted) {
    state.roleIndex -= 1;
    state.yearsInRole = 0;
    state.yearsInRank += 1;
    state.appointment = { type: "demotion", roleIndex: state.roleIndex, rankIndex: state.rankIndex };
  } else if (state.review.promoted) {
    state.roleIndex += 1;
    state.yearsInRole = 0;
    state.rankIndex = Math.max(state.rankIndex, LEADERSHIP_MIN_RANK[state.roleIndex] || state.rankIndex);
    state.yearsInRank = 0;
    state.appointment = { type: "leadership", roleIndex: state.roleIndex, rankIndex: state.rankIndex };
  } else {
    state.yearsInRole += 1;
    state.yearsInRank += 1;
    if (state.review.rankPromoted) {
      state.rankIndex += 1;
      state.yearsInRank = 0;
      state.appointment = { type: "rank", roleIndex: state.roleIndex, rankIndex: state.rankIndex };
    }
  }

  const mustEnd =
    getAccountability(state).caseStatus === "convicted" ||
    state.stats.health <= CRITICAL_HEALTH ||
    state.stats.integrity < 15 ||
    state.careerYear >= MAX_CAREER_YEARS;
  if (mustEnd) {
    state.endingId = resolveEndingId(state);
    state.phase = "ending";
    state.review = null;
    return state;
  }

  state.careerYear += 1;
  // Discard obsolete application data when an older save advances a year.
  state.promotionPlan = null;
  return beginYear(state, events);
}

function findCurrentEvent(state, events) {
  return events.find((event) => event.id === state.currentEventId) || null;
}

function leaveCareer(inputState) {
  const state = clone(inputState);
  if (state.phase !== "event") throw new Error("Leave before choosing an event");
  state.phase = "ending";
  state.endingId = "new_beginning";
  state.currentEventId = null;
  state.queue = [];
  return state;
}

function validateSavedGame(state, events = require("../data/events").EVENTS) {
  const record = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
  const effects = (value) => record(value) && Object.entries(value).every(([key, amount]) =>
    ATTRIBUTES.includes(key) && Number.isFinite(amount));
  const historyEntry = (item) => record(item) && Number.isInteger(item.year) &&
    item.year >= 1 && item.year <= MAX_CAREER_YEARS && Number.isInteger(item.roleIndex) &&
    Boolean(ROLES[item.roleIndex]) && typeof item.eventId === "string" &&
    typeof item.eventTitle === "string" && typeof item.choiceText === "string" &&
    Number.isInteger(item.choiceIndex) && effects(item.changes) &&
    (item.storyTheme === undefined || typeof item.storyTheme === "string") &&
    (item.outcome === undefined || (typeof item.outcome === "string" && item.outcome.length <= 2000)) &&
    (item.accountabilityNote === undefined || (typeof item.accountabilityNote === "string" && item.accountabilityNote.length <= 1000));
  if (!state || state.version !== SAVE_VERSION) return false;
  if (!Number.isInteger(state.careerYear) || state.careerYear < 1 || state.careerYear > MAX_CAREER_YEARS) return false;
  if (!Number.isInteger(state.roleIndex) || !ROLES[state.roleIndex]) return false;
  if (!Number.isInteger(state.rankIndex) || !CIVIL_RANKS[state.rankIndex] || !Number.isInteger(state.yearsInRank) || state.yearsInRank < 0) return false;
  if (state.appointment && (!["leadership", "rank", "demotion"].includes(state.appointment.type) || !ROLES[state.appointment.roleIndex] || !CIVIL_RANKS[state.appointment.rankIndex])) return false;
  if (!Number.isInteger(state.seed) || state.seed < 0 || state.seed > 0xffffffff) return false;
  if (!BACKGROUNDS.some((item) => item.id === state.backgroundId)) return false;
  if (!Number.isInteger(state.yearsInRole) || state.yearsInRole < 0 || state.yearsInRole > MAX_CAREER_YEARS) return false;
  if (state.assessmentYear !== undefined && (!Number.isInteger(state.assessmentYear) || state.assessmentYear < 0 || state.assessmentYear > state.careerYear)) return false;
  if (!Number.isFinite(state.assets) || !Number.isInteger(state.longTermWins) || state.longTermWins < 0) return false;
  if (state.life !== undefined && !validLife(state.life, state.careerYear)) return false;
  if (state.accounts !== undefined && !validAccounts(state.accounts, state.careerYear)) return false;
  if (state.accountability !== undefined && !validAccountability(state.accountability)) return false;
  if (state.promotionPlan !== undefined && state.promotionPlan !== null) {
    const plan = state.promotionPlan;
    const legacyPlan = record(plan) && plan.year === state.careerYear && ["apply", "defer"].includes(plan.choice) &&
      (plan.opportunity === undefined || (plan.choice === "apply" && validOpportunity(plan.opportunity)));
    const currentPlan = record(plan) && plan.year === state.careerYear && Boolean(PROMOTION_MOVES[plan.choice]) &&
      Number.isFinite(plan.bonus) && plan.bonus === PROMOTION_MOVES[plan.choice].bonus &&
      Number.isFinite(plan.cost) && plan.cost === PROMOTION_MOVES[plan.choice].cost &&
      typeof plan.detected === "boolean" && effects(plan.changes) && typeof plan.outcome === "string";
    if (!legacyPlan && !currentPlan) return false;
  }
  if (!record(state.flags) || !record(state.seen) || !record(state.stats)) return false;
  if (!ATTRIBUTES.every((key) => Number.isFinite(state.stats[key]) && state.stats[key] >= 0 && state.stats[key] <= 100)) return false;
  if (!Array.isArray(state.history) || state.history.length > MAX_CAREER_YEARS * 4 || !state.history.every(historyEntry)) return false;
  if (state.annualReports !== undefined && (!Array.isArray(state.annualReports) || state.annualReports.length > MAX_CAREER_YEARS || !state.annualReports.every((item) =>
    record(item) && Number.isInteger(item.year) && item.year >= 1 && item.year <= MAX_CAREER_YEARS &&
    Number.isInteger(item.roleIndex) && Boolean(ROLES[item.roleIndex]) && typeof item.promoted === "boolean" &&
    (item.demoted === undefined || typeof item.demoted === "boolean") &&
    Number.isFinite(item.score) && Number.isFinite(item.netIncome) &&
    (item.childCost === undefined || [0, 2].includes(item.childCost)) &&
    (item.accountCredit === undefined || validCredit(item.accountCredit)) &&
    (item.promotionMode === undefined || ["automatic", "legacy"].includes(item.promotionMode)) &&
    (item.promotionChoice === undefined || ["apply", "defer", "pending", "legacy", "report", "dinner", "gift"].includes(item.promotionChoice)) &&
    (item.promotionDetected === undefined || typeof item.promotionDetected === "boolean") &&
    (item.competition === undefined || validOpportunity(item.competition)) &&
    Array.isArray(item.reasons) && item.reasons.every((reason) => typeof reason === "string")))) return false;
  if (!Array.isArray(state.queue) || state.queue.length > 2 || !state.queue.every((item) => ["work", "life", "city"].includes(item))) return false;
  if (!Array.isArray(state.delayed) || state.delayed.length > 100 || !state.delayed.every((item) =>
    record(item) && Number.isInteger(item.dueYear) && item.dueYear >= 1 && effects(item.effects) && typeof item.message === "string")) return false;
  if (state.startOfYearResults !== undefined && (!Array.isArray(state.startOfYearResults) ||
    !state.startOfYearResults.every((item) => record(item) && typeof item.message === "string" && effects(item.changes)))) return false;
  const activeAssessment = events.find((event) => event.id === state.currentEventId && event.category === "assessment");
  if (["event", "result"].includes(state.phase) && activeAssessment &&
    (state.assessmentYear !== state.careerYear || promotionChoice(state) !== "apply" ||
      (state.promotionPlan && state.promotionPlan.opportunity && !state.promotionPlan.opportunity.available) ||
      state.queue.length !== 0 || !activeAssessment.roleLevels.includes(state.roleIndex))) return false;
  if (state.phase === "event") return events.some((event) => event.id === state.currentEventId);
  if (state.phase === "result") return historyEntry(state.lastResult) && events.some((event) => event.id === state.currentEventId);
  if (state.phase === "review") {
    const review = state.review;
    return record(review) && ["baseScore", "randomShift", "finalScore", "threshold", "annualIncome", "livingCost"].every((key) => Number.isFinite(review[key])) &&
      (review.competition === undefined || validOpportunity(review.competition)) &&
      (state.promotionPlan && state.promotionPlan.opportunity
        ? JSON.stringify(review.competition) === JSON.stringify(state.promotionPlan.opportunity)
        : true) &&
      (review.accountCredit === undefined || validCredit(review.accountCredit)) &&
      (review.childCost === undefined || [0, 2].includes(review.childCost)) &&
      (review.noNewStory === undefined || review.noNewStory === true) &&
      (review.promotionMode === undefined || ["automatic", "legacy"].includes(review.promotionMode)) &&
      (review.promotionChoice === undefined || review.promotionChoice === promotionChoice(state)) &&
      (review.relationshipBonus === undefined || Number.isFinite(review.relationshipBonus)) &&
      Math.abs(review.randomShift) <= 6 && typeof review.promoted === "boolean" &&
      (review.demoted === undefined || typeof review.demoted === "boolean") &&
      (!review.promoted || state.roleIndex < ROLES.length - 1) && Array.isArray(review.reasons) && review.reasons.every((item) => typeof item === "string") &&
      (review.contributions === undefined || (Array.isArray(review.contributions) && review.contributions.every((item) =>
        record(item) && typeof item.label === "string" && Number.isFinite(item.value) && Number.isFinite(item.weight) && Number.isFinite(item.score))));
  }
  if (state.phase === "planning") return state.currentEventId === null && state.review === null && state.queue.length === 0;
  if (state.phase === "ending") return ENDINGS.some((ending) => ending.id === state.endingId);
  return false;
}

module.exports = {
  advanceAfterResult,
  applyEffects,
  beginYear,
  calculateReview,
  completeReview,
  createNewGame,
  drawEvent,
  eligibleEvents,
  eventTheme,
  findCurrentEvent,
  finalizeAnnualPlanning,
  leaveCareer,
  resolveEndingId,
  selectChoice,
  promotionChoice,
  promotionActionReason,
  PROMOTION_MOVES,
  needsAssessment,
  setPromotionChoice,
  repairLegacyPacing,
  repairRepetitiveCurrentTheme,
  repairRepeatedCurrentEvent,
  validateSavedGame
};
