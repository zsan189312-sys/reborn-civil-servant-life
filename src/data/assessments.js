"use strict";

// Reusable fictional assessment scenes, not descriptions of real appointment procedures.
const ASSESSMENTS = [
  {
    id: "assessment_frontline", category: "assessment", title: "履历之外的问题", roleLevels: [0, 1, 2],
    body: "考察谈话里，对方合上履历：‘材料上的经历我们看了。如果承担更大的责任，你最想保留现在的什么，又最需要改掉什么？’你准备好的那段开场白，忽然显得有点长。",
    choices: [
      { text: "用实际经办过的事说明能力和不足", effects: { ability: 3, integrity: 2, health: -1 }, outcome: "你没有把整个项目都说成自己的成绩，而是分清自己做了什么、同事做了什么。被追问到没有解决的部分，你停了一下，说这正是下一步要补的课。记录员又翻开了一页纸。" },
      { text: "重点介绍可以验证的工作成果", effects: { performance: 3, ability: 1, health: -1 }, outcome: "你把能核验的变化逐项讲清，也说明其中有哪些条件无法简单复制。对方没当场给结论，只问：‘换一个地方，还能不能做出来？’你把这个问题记在了本子上。" },
      { text: "谈群众反馈，以及自己准备怎样改进", effects: { trust: 3, integrity: 2, performance: -1 }, outcome: "你没有只挑表扬来讲。有些抱怨确实尖锐，也指出了你原先没看见的地方。离开时，你没有听到‘稳了’之类的暗示，只知道这次把该说的说清了。" }
    ]
  },
  {
    id: "assessment_coordination", category: "assessment", title: "如果不亲自盯着呢", roleLevels: [3, 4, 5, 6],
    body: "谈话谈到一半，对方问：‘你过去推动的事情，如果调离岗位，还能继续运转吗？’你想起那些写着自己名字的协调记录。职位往上走，需要证明的似乎不只是能多扛几件事。",
    choices: [
      { text: "说明职责分工、监督和交接安排", effects: { ability: 4, integrity: 2, health: -1 }, outcome: "你谈了谁负责决策、谁跟进、出现分歧如何处理，也承认有几项还过于依赖个人协调。对方顺着这个缺口继续问，你没有用‘加强统筹’四个字盖过去。" },
      { text: "复盘推进中的关键取舍和实际成效", effects: { performance: 4, ability: 1, health: -2 }, outcome: "你把几次困难的取舍摊开，包括没能同时满足的诉求。谈话结束时，材料旁多了一张待核验清单。你知道成果被看见了，但是否适合下一岗，还要经得住核对。" },
      { text: "从合作方和一线人员的评价谈起", effects: { trust: 4, integrity: 2, performance: -1 }, outcome: "你介绍了不同立场的反馈，也没有替那些持保留意见的人编造好话。对方问愿不愿意补充访谈对象，你把参与过协作的人列了出来。评价不会只来自你自己。" }
    ]
  },
  {
    id: "assessment_broad_scope", category: "assessment", title: "没有两全的答案", roleLevels: [7, 8, 9],
    body: "这次谈话围绕更大范围的责任展开。面对地区差异、有限资源和长短期目标，对方没有让你许诺一张完美蓝图，而是问：‘如果几件正确的事暂时不能同时做，你怎样作出取舍？’",
    choices: [
      { text: "讲清判断依据、评估边界和纠偏安排", effects: { ability: 4, integrity: 3, health: -2 }, outcome: "你没有声称每一步都能算准，而是解释怎样发现偏差、何时调整，以及哪些底线不能被进度挤掉。谈话没有标准答案，但你说出的每个判断，都需要承担后果。" },
      { text: "用过去的统筹成效说明执行能力", effects: { performance: 4, ability: 2, health: -2 }, outcome: "你把目标拆成实际推进的阶段，说明哪些结果已经出现、哪些仍需时间。对方追问资源从哪里来，你没有把‘协调解决’当成凭空增加资源的办法。" },
      { text: "说明如何听取受影响群体的意见", effects: { trust: 4, integrity: 3, performance: -1 }, outcome: "你谈的不只是怎样解释决定，也包括让原先没进入材料的意见真正影响决定。离开谈话室时，没有祝贺声。你要等的仍是本年的综合判断，而不是一句好听的承诺。" }
    ]
  }
];

module.exports = { ASSESSMENTS };
