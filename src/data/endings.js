"use strict";

// Endings summarize fictional playthroughs. The criminal ending is a narrative
// outcome, not a real-world sentencing calculator or legal conclusion.
const ENDINGS = [
  {
    id: "criminal_conviction",
    title: "法槌落下",
    description: "收下的财物、作出的关照和后来掩盖的痕迹，最终在证据中连成了一条线。",
    story: "宣判那天，你想起第一次到青禾镇报到的清晨。那时公文包里只有录用通知，你也曾认真相信，自己能够把每一件小事办得干净。"
  },
  {
    id: "disciplinary_exit",
    title: "边界失守",
    description: "问题尚未走到刑事判决，却已经足以让你失去岗位和组织信任。",
    story: "调离通知只有薄薄一页。收礼不登记、替熟人递话、把程序当作可以通融的小事——单看都像还能解释，合在一起却写出了另一份履历。"
  },
  {
    id: "health_exit",
    title: "先照顾好自己",
    description: "长久透支让职业旅程提前结束。停下来不是失败，而是重新开始生活。",
    story: "办公桌被收拾干净以后，家人把那张迟到多年的复查单重新放到你手里。窗外的会议仍在继续，这一次，你先跟他们回家。"
  },
  {
    id: "results_only",
    title: "只有成绩单",
    description: "数字足够亮眼，但一些关系和健康被留在了表格之外。",
    story: "告别会上念了很长一串项目名称。掌声停下后，你翻开手机，才发现家庭群里那张合照已经是很多年前的头像。"
  },
  {
    id: "family_first",
    title: "灯火可亲",
    description: "你没有把每一步都押给职位，守住了许多不能重来的夜晚。",
    story: "最后一个工作日没有隆重仪式。回家推开门，饭刚盛好，旧日历上还留着你亲手圈过的生日、复查和接孩子的日子。"
  },
  {
    id: "high_office",
    title: "责任所在",
    description: "你走到协调全局的位置，也更加明白每个数字背后都是具体的人。",
    story: "新的会议材料摊满长桌。你从最后一页翻回第一页，在那个看似普通的数字旁写下：请说明它会影响哪些人的生活。"
  },
  {
    id: "public_legacy",
    title: "一方留痕",
    description: "职位终会交接，留下来的，是经住时间的工程和被认真回应过的人。",
    story: "多年后的一场暴雨里，早年修过的管线没有再让老街积水。没人知道当年的会议开了多久，但有人记得问题终于被解决了。"
  },
  {
    id: "clean_retirement",
    title: "清白收卷",
    description: "没有传奇，也没有捷径。你靠专业和耐心，把一份工作清清楚楚地做到了最后。",
    story: "年轻同事来接档案，问你最重要的经验是什么。你想了很久，只把那本写满核验记录的旧笔记递给他：事情办完，还要经得住回头看。"
  },
  {
    id: "new_beginning",
    title: "履历未完",
    description: "你主动离开既定路径。下一页没有职位名称，只有新的可能。",
    story: "交回工作证时，你没有想象中轻松，也没有想象中后悔。走出大门，路口仍旧很忙，而这一次该往哪里走，由你自己决定。"
  }
];

const LEGACY_ENDING_MAP = {
  integrity_exit: "disciplinary_exit",
  trusted_specialist: "clean_retirement",
  quiet_retirement: "clean_retirement",
  learning_path: "clean_retirement",
  city_builder: "public_legacy",
  public_trust: "public_legacy",
  balanced_life: "family_first"
};

function migrateEndingId(id) {
  return LEGACY_ENDING_MAP[id] || id;
}

function getEnding(id) {
  const migrated = migrateEndingId(id);
  return ENDINGS.find((ending) => ending.id === migrated) || ENDINGS.find((ending) => ending.id === "clean_retirement");
}

function getEndingPresentation(state) {
  const ending = getEnding(state && state.endingId);
  if (ending.id !== "criminal_conviction") return { ...ending, detail: "" };
  const sentenceYears = [3, 7, 12].includes(state && state.accountability && state.accountability.sentenceYears)
    ? state.accountability.sentenceYears
    : 3;
  const stories = {
    3: "你在调查后期停止否认，如实说明并配合退缴。已经越过的边界没有因此消失。宣判后，家人带走了你进门前交出的那只旧手表。",
    7: "那笔写成“旧账”的转账、经办人保存的复印件和前后矛盾的说明相互印证。直到宣判，你才明白每一次侥幸都在替下一次侥幸留下证据。",
    12: "从递出的名片到异常分包，再到三百万元转账和带病通过的验收，项目损失与个人所得一起写进判决。你得到过短暂的方便，也失去了余下许多年的自由。"
  };
  return {
    ...ending,
    detail: `虚构剧情判决 · 有期徒刑 ${sentenceYears} 年`,
    story: stories[sentenceYears]
  };
}

module.exports = { ENDINGS, getEnding, getEndingPresentation, migrateEndingId };
