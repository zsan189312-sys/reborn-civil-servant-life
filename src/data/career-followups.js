"use strict";

// Original fiction. Local follow-ups only occur while still in a township post.
const CAREER_FOLLOWUPS = [
  {
    id: "followup_stamp_together", category: "work", title: "陈师傅带了个徒弟",
    roleLevels: [0, 1, 2], once: true, requiresFlags: ["stampTogether"], afterEvent: { id: "town_last_stamp", years: 1 },
    body: "一年后，修农机的陈国平又来到大厅。这次他不是替自己办事，而是陪修理铺新收的学徒小周来咨询开修理摊需要哪些手续。他把小周推到窗口前：‘问清楚，别怕，人家肯听。’你还没来得及高兴，新同事就从业务系统里调出另一版办事指南。原来上次说清的口径，只存在你和几位经办人的聊天记录里。",
    choices: [
      { text: "和经办人核对新版，做成有日期的公开清单", effects: { ability: 3, integrity: 2, health: -2 }, outcome: "你把新旧条目逐项核对，给清单标上适用范围和更新日期。陈师傅拿出手机，拍了三次才拍清楚：‘这张我发群里。’你提醒他以后看更新日期，别把今天的答案传成永远的规矩。" },
      { text: "先陪年轻人核实这笔申请，另记口径分歧", effects: { trust: 3, performance: 1, health: -2 }, outcome: "年轻人终于知道下一步去哪儿，陈师傅说要请你吃饭，你笑着指了指食堂方向。送走两人后，待协调清单又多一行。这次你帮到了眼前的人，下一位还会不会绕路，仍要继续解决。" }
    ]
  },
  {
    id: "followup_stamp_tomorrow", category: "work", title: "回执背面的公交时刻",
    roleLevels: [0, 1, 2], once: true, requiresFlags: ["stampTomorrow"], afterEvent: { id: "town_last_stamp", years: 1 },
    body: "整理回访材料时，你又看到邻村修农机的陈国平那张登记回执。上次约他次日核实，修理铺的手续后来办完了，回执背面却密密写着几班车的时间。电话接通，他先认出了你：‘记得，你没让我白等电话。就是那阵子，车费快赶上材料费了。’最近，类似的往返又出现在回访表里。",
    choices: [
      { text: "梳理可远程预核的事项，再约必须到场的环节", effects: { ability: 3, trust: 3, performance: -1 }, outcome: "你没有承诺所有手续都能隔空完成，而是和窗口把必须到场的部分单列出来。陈师傅听完问：‘那是不是先打个电话，就知道该坐哪班车？’你把这句话写在说明第一页，删掉了原来那段绕口的开场。" },
      { text: "保留现场核验，协调集中办理时段", effects: { performance: 3, integrity: 2, trust: -1 }, outcome: "集中办理让几项核验能在同一天完成，窗口也得重新排班。陈师傅说星期二来得了，另一位回访对象却说星期二不能请假。表格比原来整齐了，你给暂时赶不上这个时段的人另留了待协调记录。" }
    ]
  },
  {
    id: "followup_stamp_old_list", category: "work", title: "漂亮数字下面的退件",
    roleLevels: [0, 1, 2], once: true, requiresFlags: ["stampOldList"], afterEvent: { id: "town_last_stamp", years: 1 },
    body: "一份办件回访把旧问题翻了出来：收件数增长，补正往返也增长。陈国平为修理铺办手续的申请夹在其中，备注写着‘综合窗口与业务窗口清单不一致’。同事说这不是你一个人的问题。你知道他说得没错，也记得当时自己为了不耽误收件，没有把分歧解决。",
    choices: [
      { text: "把往返原因写进复盘，推动统一清单", effects: { integrity: 3, ability: 2, performance: -2 }, outcome: "你没有把原因全写成‘申请人材料不齐’，也没替别人认下不属于自己的责任。复盘会上有人皱眉，问题清单还是留下了。电话那头，陈师傅只问以后能不能少跑一次；你没有拿一份整改记录当作已经做到。" },
      { text: "逐件通知补正，先把积压申请接回来", effects: { performance: 3, trust: 1, health: -3 }, outcome: "你和同事把电话一通通打完，有人愿意回来，也有人先抱怨了十分钟。陈师傅说袋子一直没扔。积压开始减少，但清单冲突还在；这轮加班，是在偿还过去省下来的时间。" }
    ]
  },
  {
    id: "followup_chair_evening", category: "work", title: "许姐不肯再当代表",
    roleLevels: [0, 1, 2], once: true, requiresFlags: ["chairEvening"], afterEvent: { id: "town_empty_chair", years: 1 },
    body: "晚间小会开过以后，许姐成了同事最熟悉的联系对象。新一轮征求意见，你拨通电话，她却说：‘别总让我代表。我卖早点，修车的小赵晚上最忙，我哪知道他怎么想？’你看了眼新名单：那些从没出现过的人，如今又变成了一批固定名字。",
    choices: [
      { text: "换几个时间走访，把没来过的人也记进去", effects: { trust: 4, ability: 2, health: -3 }, outcome: "你听见了和许姐不同的意见。小赵不反对活动，担心的是临时围挡把修车铺挡住。许姐路过时笑了：‘对嘛，他话比我多。’这回的纪要更难归纳，却少了一句轻易写下的‘大家都认为’。" },
      { text: "公布轮换邀请办法，同时保留自由反馈", effects: { integrity: 3, performance: 2, trust: -1 }, outcome: "邀请不再只靠熟悉的电话号码，新面孔也能知道怎样参与。有人嫌要看说明，有人问能不能直接来。你把自由反馈的入口又写大了一行。许姐答应转告，但特意补了一句：‘我只转，不包他们同意。’" }
    ]
  },
  {
    id: "followup_chair_feedback", category: "work", title: "附件里那十七条意见",
    roleLevels: [0, 1, 2], once: true, requiresFlags: ["chairFeedback"], afterEvent: { id: "town_empty_chair", years: 1 },
    body: "当初收集的电话和纸质意见成了十七条附件。许姐今天来问的不是添一条建议，而是：‘上回那些，后来算数没有？’你翻出办结说明，里面写着‘已研究吸收’，却看不出哪一条改了、哪一条没改。附件没有丢，人却找不到回音。",
    choices: [
      { text: "逐条核实采纳情况，说明未采纳的原因", effects: { trust: 4, integrity: 2, health: -2 }, outcome: "十七条没有全部实现，你把能确认的调整、仍待协调的事项和无法采纳的原因分开写。许姐指着其中一条说她不赞成，你点头记下。解释没有换来全票满意，至少不再让一句‘已吸收’替所有人点头。" },
      { text: "先集中回访争议最多的几项，约定其余答复时间", effects: { performance: 3, ability: 2, trust: -1 }, outcome: "你先把几件反复被问起的事说清，其余排进回复安排。许姐掏出笔，把你说的日期写在袋子上：‘这回我记着了。’你看着那行字，知道一张时间表既能减少等待，也会成为下一次追问的凭据。" }
    ]
  },
  {
    id: "followup_chair_next_time", category: "work", title: "备注里的下次到了",
    roleLevels: [0, 1, 2], once: true, requiresFlags: ["chairNextTime"], afterEvent: { id: "town_empty_chair", years: 1 },
    body: "新一轮会议安排送来，你看到了自己上回留下的备注：‘下轮扩大邀请。’同事说沿用老名单最省事，许姐则托人带来一句：‘这回别又赶在我们收摊前开完。’那把被推到墙边的椅子，你以为只有自己还记得。",
    choices: [
      { text: "兑现备注，先问清缺席者方便的参与方式", effects: { trust: 3, integrity: 2, performance: -2 }, outcome: "有人想晚间来，有人更愿意留语音，你和同事重新安排汇总。许姐最后还是迟到了几分钟，门口已经留了位置。她没夸你，只说：‘这回赶上了。’一个曾经随手写下的下次，终于变成了今天。" },
      { text: "会议按期召开，另设补充征集再形成最终意见", effects: { performance: 2, ability: 2, health: -2 }, outcome: "这次没有在散会时就把结论封好，补充意见和会议记录一起进入汇总。多出来的工作落到了你和同事身上。许姐的语音长达两分钟，你听完才发现，开头那句‘我就说一句’不能按字面理解。" }
    ]
  }
];

module.exports = { CAREER_FOLLOWUPS };
