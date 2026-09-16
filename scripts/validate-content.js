"use strict";

const { EVENTS } = require("../src/data/events");
const { ENDINGS } = require("../src/data/endings");
const { ATTRIBUTES, ROLES } = require("../src/core/constants");
const { CASE_STATUSES } = require("../src/core/accountability");

// These names are not blanket bans. Flag context for human review; generic
// institutions and accurate leadership levels are part of the product theme.
const reviewPatterns = [
  /中国共产党/,
  /国务院/,
  /中央纪委/,
  /国家主席/,
  /省委|市委|县委/,
  /公安局|检察院|法院/
];
const forbiddenPatterns = [/请(?:填写|输入|提供|上传).{0,12}(?:真实姓名|身份证号|手机号)/];
const ethicsReviewPatterns = [/收下.{0,16}(?:转账|酒)/, /继续否认/, /分包/, /请托/];
const engineGeneratedFlags = new Set(["integrityCaseOpened"]);

function fail(message) {
  throw new Error(`[content] ${message}`);
}

const ids = new Set();
EVENTS.forEach((event) => {
  if (!event.id || ids.has(event.id)) fail(`重复或缺失事件 ID: ${event.id}`);
  ids.add(event.id);
  if (!["work", "life", "city", "integrity", "assessment"].includes(event.category)) fail(`${event.id} 类别无效`);
  if (event.category !== "assessment" && event.once !== true) fail(`${event.id} 正式故事必须单局只出现一次`);
  if (!event.title || !event.body) fail(`${event.id} 缺少标题或正文`);
  if (event.storyTheme !== undefined && (typeof event.storyTheme !== "string" || !event.storyTheme.trim())) fail(`${event.id} 剧情主题无效`);
  if (event.requiresPartner !== undefined && typeof event.requiresPartner !== "boolean") fail(`${event.id} 伴侣条件无效`);
  if (event.requiresChild !== undefined && typeof event.requiresChild !== "boolean") fail(`${event.id} 子女条件无效`);
  if (event.requiresChild && (!event.once || event.category !== "life" || !Number.isInteger(event.minChildAge) || !Number.isInteger(event.maxChildAge) || event.minChildAge < 0 || event.maxChildAge < event.minChildAge)) fail(`${event.id} 子女年龄范围无效`);
  if (!event.requiresChild && (event.minChildAge !== undefined || event.maxChildAge !== undefined)) fail(`${event.id} 缺少子女门槛`);
  if (event.minRelationshipYears !== undefined && (!event.requiresPartner || !Number.isInteger(event.minRelationshipYears) || event.minRelationshipYears < 0)) fail(`${event.id} 交往年限无效`);
  if (!Array.isArray(event.roleLevels) || !event.roleLevels.length) fail(`${event.id} 缺少岗位范围`);
  if (event.roleLevels.some((level) => !ROLES[level])) fail(`${event.id} 含无效岗位`);
  if (event.afterEvent && (!EVENTS.some((source) => source.id === event.afterEvent.id) || !Number.isInteger(event.afterEvent.years) || event.afterEvent.years < 1)) fail(`${event.id} 的前置事件或间隔无效`);
  if (event.requiresFlags && (!Array.isArray(event.requiresFlags) || !event.requiresFlags.every((flag) =>
    engineGeneratedFlags.has(flag) || EVENTS.some((source) => source.choices.some((choice) => choice.flags && choice.flags[flag] === true))))) fail(`${event.id} 的剧情标记没有可到达的来源`);
  if (!Array.isArray(event.choices) || event.choices.length < 2 || event.choices.length > 3) {
    fail(`${event.id} 必须有 2—3 个选项`);
  }

  const fullText = [event.title, event.body, ...event.choices.flatMap((choice) => [
    choice.text, choice.outcome || "", ...(choice.delayed || []).map((item) => item.message)
  ])].join(" ");
  reviewPatterns.forEach((pattern) => {
    if (pattern.test(fullText)) process.stderr.write(`[review] ${event.id} 涉及机构/职务称谓，需结合上下文人工复核，不代表违规: ${pattern}\n`);
  });
  if (ethicsReviewPatterns.some((pattern) => pattern.test(fullText))) {
    process.stderr.write(`[review] ${event.id} 涉及利益冲突或请托剧情，正式发布前需人工复核语境与分级。\n`);
  }
  forbiddenPatterns.forEach((pattern) => {
    if (pattern.test(fullText)) fail(`${event.id} 命中待人工复核词: ${pattern}`);
  });

  event.choices.forEach((choice, index) => {
    if (!choice.text) fail(`${event.id} 的选项 ${index} 无文本`);
    if (choice.outcome !== undefined && (typeof choice.outcome !== "string" || !choice.outcome.trim() || choice.outcome.length > 2000)) fail(`${event.id} 的选项 ${index} 结果叙述无效`);
    if (event.category === "life" && !choice.outcome) fail(`${event.id} 的生活选项 ${index} 缺少结果叙述`);
    Object.keys(choice.effects || {}).forEach((key) => {
      if (!ATTRIBUTES.includes(key)) fail(`${event.id} 使用未知属性 ${key}`);
      if (!Number.isFinite(choice.effects[key])) fail(`${event.id} 的 ${key} 不是数值`);
    });
    if (choice.accountability !== undefined) {
      if (!choice.accountability || typeof choice.accountability !== "object" || Array.isArray(choice.accountability)) fail(`${event.id} 的责任记录无效`);
      const allowed = ["acceptedValue", "retainedValue", "dutyAbuse", "concealment", "publicHarm", "cooperation", "caseStatus", "sentenceExposure", "sentenceExposureFromRecord", "convictFromExposure", "note"];
      Object.keys(choice.accountability).forEach((key) => { if (!allowed.includes(key)) fail(`${event.id} 使用未知责任字段 ${key}`); });
      ["acceptedValue", "retainedValue", "dutyAbuse", "concealment", "publicHarm", "cooperation"].forEach((key) => {
        if (choice.accountability[key] !== undefined && !Number.isFinite(choice.accountability[key])) fail(`${event.id} 的责任字段 ${key} 无效`);
      });
      if (choice.accountability.caseStatus !== undefined && !CASE_STATUSES.includes(choice.accountability.caseStatus)) fail(`${event.id} 的案件状态无效`);
      if (choice.accountability.sentenceExposure !== undefined && ![0, 3, 7, 12].includes(choice.accountability.sentenceExposure)) fail(`${event.id} 的刑期档位无效`);
      if (choice.accountability.sentenceExposureFromRecord !== undefined && choice.accountability.sentenceExposureFromRecord !== true) fail(`${event.id} 的动态刑期标记无效`);
      if (choice.accountability.convictFromExposure !== undefined && choice.accountability.convictFromExposure !== true) fail(`${event.id} 的判决标记无效`);
      if (choice.accountability.note !== undefined && (typeof choice.accountability.note !== "string" || !choice.accountability.note.trim())) fail(`${event.id} 的责任说明无效`);
    }
    (choice.delayed || []).forEach((delayed) => {
      if (!Number.isInteger(delayed.afterYears) || delayed.afterYears < 1) {
        fail(`${event.id} 的延迟年限无效`);
      }
      if (!delayed.message) fail(`${event.id} 的延迟结果缺少说明`);
      Object.entries(delayed.effects || {}).forEach(([key, value]) => {
        if (!ATTRIBUTES.includes(key) || !Number.isFinite(value)) fail(`${event.id} 的延迟属性无效`);
      });
    });
  });
});

if (ENDINGS.length !== 9) fail("当前设计要求恰好 9 个主结局");
if (new Set(ENDINGS.map((ending) => ending.id)).size !== ENDINGS.length) fail("结局 ID 重复");
if (!ENDINGS.every((ending) => ending.title && ending.description && ending.story)) fail("结局缺少标题、说明或故事收尾");

const counts = EVENTS.reduce((result, event) => {
  result[event.category] = (result[event.category] || 0) + 1;
  return result;
}, {});

process.stdout.write(`内容校验通过：${EVENTS.length} 个事件（工作 ${counts.work || 0}、生活 ${counts.life || 0}、城市 ${counts.city || 0}、廉洁考察 ${counts.integrity || 0}、晋升考察 ${counts.assessment || 0}），${ENDINGS.length} 个结局。\n`);
