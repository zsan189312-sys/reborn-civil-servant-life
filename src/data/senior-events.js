"use strict";

// Fictional cases for broader administrative responsibilities, not real policy events.
const PROVINCIAL = [7, 8, 9];
const NATIONAL = [10];
const SENIOR_EVENTS = [
  {
    id: "province_budget", category: "work", once: true, title: "省级预算的取舍", roleLevels: PROVINCIAL,
    body: "省内几个地级市同时申请新增建设资金。经济较强的城市承诺见效快，欠发达地区则急需补齐公共服务短板。你需要提出统筹意见。",
    choices: [
      { text: "向薄弱地区倾斜，分阶段验收", effects: { trust: 4, integrity: 3, performance: 1, health: -2 } },
      { text: "先支持成熟项目，追踪带动效果", effects: { performance: 5, ability: 2, trust: -2 } },
      { text: "组织联合论证后分批下达", effects: { ability: 4, integrity: 2, performance: -1, health: -2 } }
    ]
  },
  {
    id: "province_personnel", category: "work", once: true, title: "一份干部考察材料", roleLevels: PROVINCIAL,
    body: "干部考察材料摆到案头：一名候选人项目推进快，但基层反映其工作方式急躁。你需要提出是否进一步考察的意见。",
    choices: [
      { text: "补充基层访谈再提出意见", effects: { integrity: 4, trust: 3, performance: -1 } },
      { text: "建议交流锻炼，持续观察", effects: { ability: 3, performance: 2, trust: 1 } },
      { text: "要求量化核验项目实际成效", effects: { ability: 4, performance: 3, health: -2 } }
    ]
  },
  {
    id: "province_basin", category: "city", once: true, title: "跨市流域协调", roleLevels: PROVINCIAL,
    body: "上游城市发展产业，下游城市承担了更多水环境治理成本。两地谈了数轮仍未达成一致，问题提交省级协调。",
    choices: [
      { text: "协商共同监测与成本分担", effects: { ability: 4, trust: 3, performance: 2, health: -3 } },
      { text: "先给紧急治理资金再完善机制", effects: { performance: 5, trust: 1, integrity: -1 } },
      { text: "组织第三方评估后明确责任", effects: { integrity: 4, ability: 2, performance: -2 } }
    ]
  },
  {
    id: "national_coordination", category: "work", once: true, title: "一项跨区域协调议题", roleLevels: NATIONAL,
    body: "多个地区对同一项公共服务协作方案提出不同诉求。你面对的是整体制度安排，需要让执行责任、资源分配与监督方式相互匹配。",
    choices: [
      { text: "形成共同底线，允许分区试点", effects: { ability: 4, trust: 3, performance: 3, health: -3 } },
      { text: "先统一服务标准，再分步落实", effects: { performance: 5, integrity: 2, trust: -1 } },
      { text: "安排公开评估并持续征求意见", effects: { integrity: 4, trust: 4, performance: -2 } }
    ]
  },
  {
    id: "national_review", category: "work", once: true, title: "成绩之外的回访", roleLevels: NATIONAL,
    body: "一份汇总报告显示工作进展顺利，但抽样回访发现部分地区的群众办事体验仍未改善。你需要提出下一阶段的督促重点。",
    choices: [
      { text: "以实际办事体验重新核验成效", effects: { integrity: 4, trust: 4, performance: -2, health: -2 } },
      { text: "保留进度安排，增加现场回访", effects: { performance: 4, ability: 3, health: -3 } },
      { text: "先解决集中反映的共性问题", effects: { performance: 5, trust: 2, ability: 1 } }
    ]
  },
  {
    id: "national_emergency", category: "city", once: true, title: "跨区域应急协作", roleLevels: NATIONAL,
    body: "多个地区同时面临极端天气，救援物资与专业队伍需要统筹调配。你需要兼顾当前救助和后续恢复的衔接。",
    choices: [
      { text: "优先保障受影响最严重的地区", effects: { trust: 5, integrity: 3, performance: 2, health: -3 } },
      { text: "协调区域互助并设立动态调度", effects: { ability: 5, performance: 4, health: -4 } },
      { text: "同步安排救助与恢复阶段计划", effects: { performance: 3, ability: 3, trust: 2, health: -2 } }
    ]
  }
];

module.exports = { SENIOR_EVENTS };
