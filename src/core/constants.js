"use strict";

const ATTRIBUTES = ["ability", "performance", "trust", "integrity", "family", "health"];

const ATTRIBUTE_LABELS = {
  ability: "能力",
  performance: "政绩",
  trust: "民望",
  integrity: "廉洁",
  family: "家庭",
  health: "健康"
};

const ROLES = [
  { name: "青禾镇科员", department: "党政办公室", level: null, post: "青禾镇党政办公室一级科员", scope: "青禾镇", entryMode: "录用", responsibility: "走访核实、材料流转和群众诉求，不替领导或业务部门越权拍板", threshold: 50, minPerformance: 44, minIntegrity: 45, minYears: 1, annualIncome: 7 },
  { name: "青禾镇民政办负责人", department: "民政办公室", level: null, post: "青禾镇民政办公室负责人、四级主任科员", scope: "青禾镇", entryMode: "内部轮岗", responsibility: "负责救助、养老和基层民生事项的核验协调，重大资金事项按程序报审", threshold: 54, minPerformance: 46, minIntegrity: 48, minYears: 1, annualIncome: 8 },
  { name: "青禾镇党委委员、副镇长", department: "镇政府（农业农村、应急）", level: "乡科级副职", post: "青禾镇党委委员、副镇长", scope: "青禾镇", entryMode: "提拔", responsibility: "分管农业农村、项目建设和应急协调，重大事项提交集体研究，不替专业部门越权处置", threshold: 58, minPerformance: 50, minIntegrity: 50, minYears: 1, annualIncome: 10 },
  { name: "云岑县市场监管局副局长", department: "县市场监督管理局", level: "乡科级副职", post: "云岑县市场监督管理局党组成员、副局长", scope: "云岑县", entryMode: "跨部门调任", responsibility: "分管食品药品、价格与经营秩序监管，检查和处罚必须依事实与法定程序办理", threshold: 60, minPerformance: 50, minIntegrity: 50, minYears: 1, annualIncome: 12 },
  { name: "云岑县委政法委副书记", department: "县委政法委", level: "乡科级正职", post: "云岑县委政法委副书记", scope: "云岑县", entryMode: "提拔", responsibility: "协调政法单位和基层治理工作，维护依法履职边界，不对具体案件结果发指令", threshold: 62, minPerformance: 52, minIntegrity: 54, minYears: 1, annualIncome: 15 },
  { name: "澄川市公安局副局长", department: "市公安局", level: "县处级副职", post: "澄川市公安局党委委员、副局长", scope: "澄川市", entryMode: "跨部门调任并提拔", responsibility: "按分工组织公共安全和执法监督，具体案件由办案单位依法办理；游戏默认已履行必要任职资格程序", threshold: 68, minPerformance: 59, minIntegrity: 60, minYears: 1, annualIncome: 18 },
  { name: "澄川市发展改革委主任", department: "市发展和改革委员会", level: "县处级正职", post: "澄川市发展和改革委员会党组书记、主任", scope: "澄川市", entryMode: "跨部门转任", responsibility: "统筹发展规划、重大项目和公共资源安排，论证与审批各守边界，不拿规划给关系项目开绿灯", threshold: 68, minPerformance: 58, minIntegrity: 60, minYears: 1, annualIncome: 22 },
  { name: "栖原省生态环境厅副厅长", department: "省生态环境厅", level: "厅局级副职", post: "栖原省生态环境厅党组成员、副厅长", scope: "栖原省", entryMode: "调任并提拔", responsibility: "统筹跨市污染治理、环境监测与执法协同，让监测数据和整改责任经得起复核", threshold: 78, minPerformance: 68, minIntegrity: 70, minYears: 2, annualIncome: 26 },
  { name: "栖原省交通运输厅厅长", department: "省交通运输厅", level: "厅局级正职", post: "栖原省交通运输厅党组书记、厅长", scope: "栖原省", entryMode: "跨部门转任", responsibility: "统筹综合交通、重点工程和应急保通，对项目安全、资金使用和区域公平承担组织责任", threshold: 82, minPerformance: 72, minIntegrity: 74, minYears: 2, annualIncome: 30 },
  { name: "栖原省委常委、副省长", department: "省政府（综合分工）", level: "省部级副职", post: "栖原省委常委、副省长", scope: "栖原省", entryMode: "提拔", responsibility: "按分工统筹发展改革、应急、生态与民生等跨部门事项，坚持集体决策，不替法定机关作具体结论", threshold: 86, minPerformance: 76, minIntegrity: 78, minYears: 2, annualIncome: 34 },
  { name: "国家层面综合协调岗位副职", department: "跨区域综合协调（虚构）", level: "国家级副职", post: "国家层面综合协调岗位副职（虚构）", scope: "跨区域", entryMode: "交流任职并提拔", responsibility: "围绕跨区域重大议题提出统筹方案、协调执行边界并督促评估，不对应现实中的特定机关或个人", threshold: 101, minPerformance: 0, minIntegrity: 0, minYears: 99, annualIncome: 38 }
];

// Names follow the published general-management rank sequence. They confer no leadership duty.
const CIVIL_RANKS = ["二级科员", "一级科员", "四级主任科员", "三级主任科员", "二级主任科员", "一级主任科员", "四级调研员", "三级调研员", "二级调研员", "一级调研员", "二级巡视员", "一级巡视员"];
// Minimum rank corresponding to township through prefecture leadership levels.
const LEADERSHIP_MIN_RANK = [1, 2, 4, 6, 8, 10, 11];
const ALL_ROLE_LEVELS = ROLES.map((_role, index) => index);

const BACKGROUNDS = [
  {
    id: "community",
    name: "重生前：基层老科员",
    description: "熟悉群众工作，曾因业务短板错过提拔。",
    effects: { ability: -4, trust: 10, family: 5 }
  },
  {
    id: "study",
    name: "重生前：机关笔杆子",
    description: "材料写得好，却总把陪伴和健康留到以后。",
    effects: { ability: 12, health: -6, family: -4 }
  },
  {
    id: "career_change",
    name: "重生前：中途离职者",
    description: "离开过体制，这次更懂自己想守住什么。",
    effects: { ability: 6, health: 5, trust: -5 }
  }
];

const START_AGE = 22;
const MAX_CAREER_YEARS = 28;
const SAVE_VERSION = 2;

module.exports = {
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
  BACKGROUNDS,
  MAX_CAREER_YEARS,
  ROLES,
  SAVE_VERSION,
  CIVIL_RANKS, LEADERSHIP_MIN_RANK, ALL_ROLE_LEVELS, START_AGE
};
