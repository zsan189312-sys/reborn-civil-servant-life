"use strict";

const CASE_STATUSES = ["clear", "unreported", "review", "disciplinary", "investigation", "prosecution", "convicted"];
const NUMBER_FIELDS = ["acceptedValue", "retainedValue", "dutyAbuse", "concealment", "publicHarm", "cooperation"];

function createAccountability() {
  return {
    acceptedValue: 0,
    retainedValue: 0,
    dutyAbuse: 0,
    concealment: 0,
    publicHarm: 0,
    cooperation: 0,
    caseStatus: "clear",
    sentenceExposure: 0,
    sentenceYears: 0
  };
}

function getAccountability(state) {
  if (state && state.accountability) return { ...createAccountability(), ...state.accountability };
  const inferred = createAccountability();
  for (const entry of (state && state.history) || []) {
    if (entry.eventId === "county_friend_project" && entry.choiceIndex === 2) {
      inferred.acceptedValue += 5;
      inferred.retainedValue += 5;
      inferred.dutyAbuse += 1;
      inferred.caseStatus = "unreported";
    }
    if (entry.eventId === "followup_friend_project_taken" && entry.choiceIndex === 0) {
      inferred.retainedValue = Math.max(0, inferred.retainedValue - 5);
      inferred.cooperation += 2;
      inferred.caseStatus = "disciplinary";
    }
    if (entry.eventId === "followup_friend_project_taken" && entry.choiceIndex === 1) {
      inferred.concealment += 1;
      inferred.caseStatus = "investigation";
    }
  }
  return inferred;
}

function applyAccountability(state, effects = {}) {
  const current = getAccountability(state);
  const next = { ...current };
  NUMBER_FIELDS.forEach((field) => {
    if (Number.isFinite(effects[field])) next[field] = Math.max(0, current[field] + effects[field]);
  });
  next.retainedValue = Math.min(next.retainedValue, next.acceptedValue);
  // A later gift scene must never move an existing investigation back to the
  // softer "unreported" state. Accountability can only advance.
  if (CASE_STATUSES.includes(effects.caseStatus) &&
    CASE_STATUSES.indexOf(effects.caseStatus) > CASE_STATUSES.indexOf(next.caseStatus)) {
    next.caseStatus = effects.caseStatus;
  }
  if ([0, 3, 7, 12].includes(effects.sentenceExposure)) next.sentenceExposure = effects.sentenceExposure;
  if (effects.sentenceExposureFromRecord) {
    const severity = next.acceptedValue + next.dutyAbuse * 2 + next.concealment * 3 + next.publicHarm * 8;
    next.sentenceExposure = severity >= 70 ? 12 : severity >= 22 ? 7 : 3;
  }
  if (effects.convictFromExposure) {
    next.caseStatus = "convicted";
    next.sentenceYears = [3, 7, 12].includes(next.sentenceExposure) ? next.sentenceExposure : 3;
  }
  state.accountability = next;
  return next;
}

function validAccountability(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (!NUMBER_FIELDS.every((field) => Number.isFinite(value[field]) && value[field] >= 0)) return false;
  if (value.retainedValue > value.acceptedValue) return false;
  if (!CASE_STATUSES.includes(value.caseStatus)) return false;
  if (![0, 3, 7, 12].includes(value.sentenceExposure) || ![0, 3, 7, 12].includes(value.sentenceYears)) return false;
  return value.caseStatus === "convicted" ? value.sentenceYears > 0 : value.sentenceYears === 0;
}

module.exports = { CASE_STATUSES, applyAccountability, createAccountability, getAccountability, validAccountability };
