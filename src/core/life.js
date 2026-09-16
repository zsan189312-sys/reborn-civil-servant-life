"use strict";

const { MAX_CAREER_YEARS, ROLES } = require("./constants");
const { homeFunding, spendHousingFund, money } = require("./accounts");

// All prices and effects below are fictional game values, not market or policy data.
const HOUSING = { rental: "普通租住", near: "近单位租住", owned: "自有住房" };
const RELATIONSHIPS = { single: "暂无伴侣", dating: "稳定交往", married: "已组建家庭" };
const ACTIONS = [
  { id: "meet", name: "认真认识一个人", cost: 1, description: "全年社交与约会预算；开始稳定交往，家庭 +2。", effects: { family: 2 }, outcome: "朋友介绍你认识林溪。聊了半天，对方问的不是你在哪个单位，而是你休息时喜欢做什么。你竟卡了一下。后来约了几次，你们认真聊过，决定试着一起往前走。" },
  { id: "marry", name: "一起组建家庭", cost: 8, description: "稳定交往满一个年度后可安排。家庭 +5。", effects: { family: 5 }, outcome: "你们把预算摊在桌上，删掉了几项‘别人家都有’的安排。最后留下的东西不算多，却都是两个人真想要的。钥匙旁边，从此多了一串钥匙。" },
  { id: "child", name: "迎接一个孩子", cost: 3, description: "成家后的下一年度起可选，本版最多一个孩子。一次性准备费 3 万，另从本年起到孩子 17 岁每年支出 2 万；家庭 +4、健康 -2。均为游戏预算。", effects: { family: 4, health: -2 }, outcome: "你们给孩子起了个小名，叫小满。家里添了许多很小的东西：小碗、小袜子，还有一盏夜里不再关掉的灯。你曾把日程表排得密不透风，现在却发现，最重要的事有时根本不按日程来。" },
  { id: "reunite", name: "安排一次团聚", cost: 2, description: "用于两地生活；家庭 +4、健康 -1，不自动结束异地。", effects: { family: 4, health: -1 }, outcome: "你们提前订好了相聚的日子。见面后并没有安排什么大事，只逛了趟菜市场。回程还是要各走各的，但下一次见面的日期，已经写进了日历。" },
  { id: "car", name: "购置代步车", cost: 12, description: "一次性付清；以后每年养车支出 +2，通勤更灵活。", effects: { health: 2 }, outcome: "你把车停进车位，来回确认了两遍。家人问第一站去哪，你想了想，说先去买菜。车钥匙很轻，每年的养车预算倒不会跟着变轻。" },
  { id: "home", name: "购置自住住房", cost: 50, description: "一次性付清；不设贷款，每年基础居住支出 -1。", effects: { family: 4 }, outcome: "交接结束，你在空屋里站了一会儿。没有豪华装修，也没有想象中的背景音乐。你先量了窗边的位置，打算在那里放一张真正能坐下来吃饭的桌子。" },
  { id: "rest", name: "给身体放一段假", cost: 1, description: "健康 +6、政绩 -1；每年只能选择一项人生安排。", effects: { health: 6, performance: -1 }, outcome: "你提前交接好工作，把闹钟关了。第一天还是按上班时间醒来，盯着天花板愣了几秒，才想起来今天不用赶路。" }
];

function createLifeState() {
  return { housing: "rental", vehicle: false, relationship: "single", relationshipSince: 0, child: null, longDistance: false, relocationPending: false, lastActionYear: 0, actions: [] };
}

function getLifeState(state) {
  if (state.life) return { child: null, ...JSON.parse(JSON.stringify(state.life)) };
  const life = createLifeState();
  // Infer only facts actually recorded in old saves, never fabricate purchases or marriage.
  for (const item of state.history || []) {
    if (item.eventId === "life_move_house" && item.choiceIndex === 0) life.housing = "near";
    if (item.eventId === "life_family_choice") {
      life.relationship = "dating";
      life.relationshipSince = item.year;
      if (item.choiceIndex === 0) life.longDistance = true;
      if (item.choiceIndex === 2) life.relocationPending = true;
    }
  }
  return life;
}

function applyStoryLife(state, eventId, choiceIndex) {
  const life = getLifeState(state);
  if (eventId === "life_move_house" && choiceIndex === 0) life.housing = "near";
  if (eventId === "life_family_choice") {
    if (life.relationship === "single") { life.relationship = "dating"; life.relationshipSince = state.careerYear; }
    if (choiceIndex === 0) life.longDistance = true;
    if (choiceIndex === 2) life.relocationPending = true;
  }
  return life;
}

function childAge(state) {
  const child = getLifeState(state).child;
  return child ? state.careerYear - child.bornYear : null;
}

function annualChildCost(state) {
  const age = childAge(state);
  return age !== null && age < 18 ? 2 : 0;
}

function annualLifeCost(state) {
  const life = getLifeState(state);
  return (life.vehicle ? 2 : 0) - (life.housing === "owned" ? 1 : 0) + annualChildCost(state);
}

function actionReason(state, id) {
  const action = ACTIONS.find((item) => item.id === id);
  if (!action) return "未知安排";
  const life = getLifeState(state);
  if (!["event", "planning"].includes(state.phase) || state.appointment || (state.startOfYearResults || []).length) return "请在本年度工作进行期间完成人生安排";
  if (life.lastActionYear === state.careerYear) return "本年度已安排一次，下一年再来";
  if (id === "meet" && life.relationship !== "single") return "已经有稳定伴侣";
  if (id === "marry" && (life.relationship !== "dating" || state.careerYear <= life.relationshipSince)) return "需要稳定交往满一个年度";
  if (id === "child") {
    if (life.child) return "本版已有一个孩子，不支持重复安排";
    const marriage = life.actions.find((item) => item.id === "marry");
    if (life.relationship !== "married" || (marriage && state.careerYear <= marriage.year)) return "需要先组建家庭，下一年度起再安排";
  }
  if (id === "reunite" && !life.longDistance) return "目前没有两地生活安排";
  if (id === "car" && life.vehicle) return "已经有代步车";
  if (id === "home" && life.housing === "owned") return "已经有自住住房";
  const cashCost = id === "home" ? homeFunding(state, action.cost).cashCost : action.cost;
  if (state.assets < cashCost) return `结余不足，需要 ${cashCost.toFixed(2)} 万可用游戏资金${id === "home" ? "（已计入公积金抵扣）" : ""}`;
  return null;
}

function takeLifeAction(inputState, id) {
  const reason = actionReason(inputState, id);
  if (reason) throw new Error(reason);
  const state = JSON.parse(JSON.stringify(inputState));
  const life = getLifeState(state);
  const action = ACTIONS.find((item) => item.id === id);
  const funding = id === "home" ? homeFunding(state, action.cost) : { cashCost: action.cost, housingFundUsed: 0 };
  state.assets = money(state.assets - funding.cashCost);
  if (funding.housingFundUsed > 0) state.accounts = spendHousingFund(state, funding.housingFundUsed);
  for (const [key, value] of Object.entries(action.effects)) state.stats[key] = Math.max(0, Math.min(100, state.stats[key] + value));
  if (id === "meet") { life.relationship = "dating"; life.relationshipSince = state.careerYear; }
  if (id === "marry") life.relationship = "married";
  if (id === "child") life.child = { name: "小满", bornYear: state.careerYear };
  if (id === "car") life.vehicle = true;
  if (id === "home") life.housing = "owned";
  life.lastActionYear = state.careerYear;
  life.actions.push({ id, year: state.careerYear, roleIndex: state.roleIndex, title: action.name, cost: action.cost, ...funding, effects: { ...action.effects }, outcome: action.outcome });
  state.life = life;
  return state;
}

function validLife(life, year) {
  if (!life || typeof life !== "object" || Array.isArray(life)) return false;
  if (!Object.prototype.hasOwnProperty.call(HOUSING, life.housing) || !Object.prototype.hasOwnProperty.call(RELATIONSHIPS, life.relationship)) return false;
  if (!["vehicle", "longDistance", "relocationPending"].every((key) => typeof life[key] === "boolean")) return false;
  if (!["relationshipSince", "lastActionYear"].every((key) => Number.isInteger(life[key]) && life[key] >= 0 && life[key] <= year)) return false;
  if (life.relationship === "single" && (life.longDistance || life.relocationPending)) return false;
  if (!Array.isArray(life.actions) || life.actions.length > MAX_CAREER_YEARS) return false;
  const births = life.actions.filter((item) => item && item.id === "child");
  if (life.child !== undefined && life.child !== null) {
    if (typeof life.child !== "object" || Array.isArray(life.child) || life.child.name !== "小满" ||
      !Number.isInteger(life.child.bornYear) || life.child.bornYear < 1 || life.child.bornYear > year ||
      births.length !== 1 || births[0].year !== life.child.bornYear || life.relationship !== "married") return false;
  } else if (births.length) return false;
  const years = new Set();
  return life.actions.every((item) => {
    if (!item || !ACTIONS.some((action) => action.id === item.id) || !Number.isInteger(item.roleIndex) || !ROLES[item.roleIndex] || !Number.isInteger(item.year) || item.year < 1 || item.year > year || years.has(item.year)) return false;
    years.add(item.year);
    const hasFunding = item.cashCost !== undefined || item.housingFundUsed !== undefined;
    if (hasFunding && (!Number.isFinite(item.cashCost) || item.cashCost < 0 || !Number.isFinite(item.housingFundUsed) || item.housingFundUsed < 0 ||
      money(item.cashCost + item.housingFundUsed) !== item.cost || (item.id !== "home" && item.housingFundUsed !== 0))) return false;
    return typeof item.title === "string" && typeof item.outcome === "string" && item.outcome.length <= 2000 && Number.isFinite(item.cost) && item.cost >= 0 && item.year <= life.lastActionYear;
  });
}

module.exports = { HOUSING, RELATIONSHIPS, ACTIONS, createLifeState, getLifeState, applyStoryLife, childAge, annualChildCost, annualLifeCost, actionReason, takeLifeAction, validLife };
