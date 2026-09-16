"use strict";

const { ROLES } = require("./constants");
const { nextRandom } = require("./random");

const CANDIDATES = [
  { name: "顾禾", profile: "群众工作扎实，民望表现突出" },
  { name: "唐野", profile: "一线经历完整，年度政绩稳定" },
  { name: "周砚", profile: "材料与协调能力均衡" },
  { name: "林照", profile: "跨部门项目经历较多" },
  { name: "许行舟", profile: "长期任务推进表现突出" },
  { name: "沈知微", profile: "风险判断与原则性较强" },
  { name: "程望", profile: "统筹经验与执行记录稳定" },
  { name: "孟川", profile: "跨区域协作履历较完整" }
];

function validOpportunity(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (typeof value.available !== "boolean" || ![0, 1].includes(value.vacancies)) return false;
  if (value.available !== (value.vacancies === 1)) return false;
  if (!value.available) return value.candidate === null;
  const candidate = value.candidate;
  return Boolean(candidate && typeof candidate === "object" && !Array.isArray(candidate) &&
    typeof candidate.name === "string" && candidate.name.length >= 2 && candidate.name.length <= 12 &&
    typeof candidate.profile === "string" && candidate.profile.length >= 4 && candidate.profile.length <= 80 &&
    Number.isInteger(candidate.score) && candidate.score >= 0 && candidate.score <= 110);
}

// A deterministic annual snapshot: opening the panel never consumes game RNG.
// Vacancy rate and competitor score are fictional game parameters.
function getPromotionOpportunity(state) {
  if (!state || state.roleIndex >= ROLES.length - 1) return null;
  const mixedSeed = (state.seed ^ Math.imul(state.careerYear, 0x9e3779b1) ^ Math.imul(state.roleIndex + 1, 0x85ebca6b)) >>> 0;
  const vacancyRoll = nextRandom(mixedSeed);
  if (vacancyRoll.value < 0.15) return { available: false, vacancies: 0, candidate: null };
  const scoreRoll = nextRandom(vacancyRoll.seed);
  const candidateRoll = nextRandom(scoreRoll.seed);
  const currentRole = ROLES[state.roleIndex];
  const candidate = CANDIDATES[Math.floor(candidateRoll.value * CANDIDATES.length)];
  return {
    available: true,
    vacancies: 1,
    candidate: {
      name: candidate.name,
      profile: candidate.profile,
      score: Math.max(0, Math.min(110, currentRole.threshold - 2 + Math.floor(scoreRoll.value * 7)))
    }
  };
}

module.exports = { CANDIDATES, getPromotionOpportunity, validOpportunity };
