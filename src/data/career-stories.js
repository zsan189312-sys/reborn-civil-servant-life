"use strict";

// Original fictional episodes. Their choices and effects are game abstractions.
const CAREER_STORIES = [
  {
    id: "town_last_stamp", category: "work", title: "差一枚章", roleLevels: [0, 1, 2], once: true,
    body: "你在青禾镇便民服务大厅轮岗。快下班时，邻村修农机的陈国平第三次来到窗口。镇上人按他的手艺叫他‘陈师傅’；他是来为自家修理铺办手续的群众，不是你的师父或领导。综合窗口让他补租赁证明，业务窗口又让他补场地说明，两张清单对不上。上一世遇到同样的事，你只说了句‘按流程来’，后来再没追问他是否办成。现在，他把两张清单摊到你面前：‘今天能不能告诉我，到底还差什么？’",
    choices: [
      { text: "留下核对两张清单，约齐两个窗口一次说清", effects: { ability: 3, trust: 4, health: -2 }, outcome: "你请综合窗口和业务窗口的经办人逐项核对，没有越过审核直接承诺办成。关灯时，陈国平把确认后的清单折好：‘至少这趟，我知道下回该拿什么了。’你的晚饭已经凉了。" },
      { text: "登记两份清单的分歧，约明早共同核实", effects: { integrity: 3, performance: 2, trust: -1 }, outcome: "你写下两份清单冲突的条目、两个窗口的经办人和次日联系时间，给陈国平留了登记回执。他说还得再请半天假，你没把‘很快’说出口。第二天第一项安排，不再是那封无关紧要的邮件。" },
      { text: "先按综合窗口的旧清单收件，分歧以后再查", effects: { performance: 3, ability: 1, trust: -3 }, outcome: "当天的收件数又多了一笔，综合窗口和业务窗口的口径却仍没统一。陈国平提起材料袋时问：‘业务窗口要是还不认，我是不是还得回来？’你看着桌上那张漂亮的进度表，迟了一拍才回答。" }
    ]
  },
  {
    id: "town_empty_chair", category: "work", title: "会场最后一把椅子", roleLevels: [0, 1, 2], once: true,
    body: "公共活动安排征求意见，几位熟悉的代表早早坐好。准备收材料时，门口卖早点的许姐问：‘我们每天收摊晚，白天从来赶不上。是不是每次都算我们没意见？’会场里有人提醒你，纪要模板已经填好了。",
    choices: [
      { text: "提议补开晚间小会，再汇总意见", effects: { trust: 4, ability: 2, performance: -1, health: -2 }, outcome: "晚上来了几个从没在名单上出现的人。许姐没讲大道理，只说照明差的那段路，她推车走了六年。你把模板里‘意见一致’四个字删掉，重新写了两页。" },
      { text: "增设电话和纸质反馈，按期汇总", effects: { performance: 3, integrity: 2, ability: 1 }, outcome: "你把期限和反馈方式贴在大家真会路过的地方，也请同事接听记录。材料按时交了，零散诉求被装进同一份附件。代价是有些话，你没能当面追问。" },
      { text: "先完成本次会议，下轮再扩大邀请", effects: { performance: 4, trust: -3, health: 1 }, outcome: "会议准点结束，表格整整齐齐。许姐没再争，只把门口那把椅子推回墙边。你给下轮会议留了条备注；这一次，名单之外的人仍没有进入结论。" }
    ]
  },
  {
    id: "county_after_photo", category: "work", title: "合影结束以后", roleLevels: [3, 4], once: true,
    body: "县里新服务中心准备验收，现场的花已经摆好。提前到场时，一名工作人员悄悄指着侧门：雨天会漏水，系统也还没联通。有人说，流程先走完，问题以后补。你记起前世那张挂了很久的竣工合影。",
    choices: [
      { text: "把缺项列出来，调整验收安排", effects: { integrity: 4, trust: 2, performance: -2 }, outcome: "你让问题清单和整改时限一起进入记录。有人忙了一周的会务得重排，抱怨一点不少。花被搬走时，工作人员小声问：‘那这回，我们能把系统试通了再开门吗？’" },
      { text: "仅验收已具备条件的部分，公开剩余缺项", effects: { performance: 3, ability: 3, health: -2 }, outcome: "大厅按实际可用范围开放，侧门和未完成系统单列处理，没有被盖进‘全部完成’里。你多开了几次协调会。第一位来办事的人没注意剪彩，只问取号机是不是能用了。" },
      { text: "暂不启用，先组织完整使用演练", effects: { ability: 4, integrity: 2, performance: -3, trust: 1 }, outcome: "演练里又发现两个窗口的线路接反。原定宣传日期过去了，催问电话接连不断。但在真正开放前，你终于看见了从进门到办结的完整过程，而不是一张效果图。" }
    ]
  },
  {
    id: "county_third_call", category: "work", title: "今晚的第三通电话", roleLevels: [3, 4], once: true,
    body: "你刚在家坐下，第三通电话又来了：一处县乡接合部道路施工影响出行，两个部门都说剩下的事不归自己。家人没催你，只默默把汤重新端回厨房。前世你总觉得，等忙过这阵就好了。",
    choices: [
      { text: "连夜召集协调，明确临时通行与责任", effects: { performance: 4, trust: 3, health: -3, family: -2 }, outcome: "你把争执压回同一张图纸，要求先明确安全的临时通行安排，再补齐责任清单。回家时汤已经放进冰箱。事情推进了，但你没再把‘明天一定早回来’当成一句随手的保证。" },
      { text: "交由牵头负责人处置，设定回报时点", effects: { ability: 4, integrity: 2, family: 1, performance: 1 }, outcome: "你把需要协调的权限和反馈节点讲清，没把电话一转就算交办。饭吃到一半，简报到了。你发现不亲自包办每一步，也需要承担判断与监督的责任。" },
      { text: "先请值班人员核实风险，次日专题协调", effects: { health: 2, family: 2, performance: -2, trust: -1 }, outcome: "在确认有临时保障安排后，你把正式协调放到次日。今晚终于陪家人吃完了饭；早会上，居民对又等了一夜的不满也照样摆在你面前。留下来的时间和耽搁的时间，都是真的。" }
    ]
  },
  {
    id: "city_last_bus", category: "work", title: "末班车里的十二个人", roleLevels: [5, 6], once: true,
    body: "市里讨论调整低客流公交线，报表显示某条夜班线路每趟只有十来个人。随车调研记录却写着：医院护工、餐馆后厨、夜班保安。‘这条线不划算’，和‘没有它就回不了家’，同时摆在你的桌上。",
    choices: [
      { text: "保留关键末班，压缩空驶路段试运行", effects: { ability: 4, trust: 3, performance: 1, health: -2 }, outcome: "线路没有原样保留，也没有整条消失。几处站点需要调整，解释工作比画路线难。第一周回访里，护工留下了一句：‘晚十分钟也行，别让我们出门时才知道没有车。’" },
      { text: "研究与邻线衔接，把换乘等待算进去", effects: { performance: 4, ability: 3, trust: -1 }, outcome: "运营里程降了，部分乘客需要多换一趟。你要求评估报告把等待和步行算进去，而不只报节省了多少。数字更完整了，但那位推着小车下夜班的人，确实多走了一段路。" },
      { text: "暂保原线，先核实夜间出行需求", effects: { trust: 3, integrity: 2, performance: -2 }, outcome: "你没有拿一次调研替代完整判断。线路暂时照常，补充调查也占用了本就紧张的预算。会上有人追问何时定案，你把明确的复评日期写进了纪要。" }
    ]
  },
  {
    id: "province_two_reports", category: "work", title: "两份都写着完成的报告", roleLevels: [7, 8, 9], once: true,
    body: "省里收到两市的协作进度报告：甲市说接口已经开放，乙市说系统已经改好，两份结论都是‘完成’。联合试办时，申请却卡在两套系统之间。会议上安静了一会儿，大家开始翻找各自的责任附件。",
    choices: [
      { text: "以真实办结为目标，组织跨市联调", effects: { ability: 4, performance: 3, trust: 2, health: -3 }, outcome: "你把各自的完成率放到一边，让两边围着同一笔测试申请排查。最后的故障不属于任何一份漂亮总结，却影响每一个办事人。复盘表新增了一栏：跨过边界之后，到底能不能办成。" },
      { text: "先设人工协作通道，系统问题限期修复", effects: { performance: 5, trust: 2, ability: -1 }, outcome: "临时通道先让积压事项动了起来，两地窗口承担了额外核验工作。你要求列明关闭临时通道的条件；方便群众的补救，也可能成为一线同事新的长期负担。" },
      { text: "暂停新增接入，先统一验证标准", effects: { integrity: 4, ability: 3, performance: -3 }, outcome: "推广进度慢了下来，已接入的服务保留保障安排。讨论终于从‘你完成没有’转向‘什么才算完成’。下一份报表不再那么好看，但至少同一列里的数字说的是同一件事。" }
    ]
  },
  {
    id: "province_short_meeting", category: "work", title: "少开一场会", roleLevels: [7, 8, 9], once: true,
    body: "省级专题协调会排到了晚上，几座城市的分管负责人还在路上。附件里已经有了书面答复。一位基层工作人员在调研意见中写道：‘我们想把事情做好，但有时候，一整天都在汇报事情怎么做。’",
    choices: [
      { text: "合并重复议题，只对分歧开短会", effects: { ability: 4, trust: 3, performance: 1 }, outcome: "原来的长议程缩成几项真正需要决策的分歧。不是所有人都习惯，有人仍带来了几十页讲稿。散会时，一位参会者看了看车次：‘今天竟然赶得上回去处理后面的事。’" },
      { text: "转为书面会商，明确责任与反馈期限", effects: { performance: 3, integrity: 2, health: 2, trust: -1 }, outcome: "会场空了，问题没有凭空消失。你让回复必须指向具体争议和负责人，不再接受‘原则同意’四个字包办一切。少掉的会能否真正减负，要看后面是否又添出一串表格。" },
      { text: "保留本次会议，集中解决跨部门分歧", effects: { performance: 4, ability: 2, health: -2, trust: -1 }, outcome: "会仍开到很晚，但你把已经写清的情况汇报拿掉，把时间留给无法通过附件协调的事项。有人终于拿到了需要的答复，也有人错过了回程的车。你记下了这次会议真正解决的三件事。" }
    ]
  },
  {
    id: "national_margin_note", category: "work", title: "材料边上的一行字", roleLevels: [10], once: true,
    body: "跨区域公共服务评估材料很厚，进度和投入列得一清二楚。你翻到调研附件，一行手写批注让你停住：‘从前跑三个地方，现在开三个软件。’各地实施基础不同，统一方案也不能靠一句话落地。",
    choices: [
      { text: "以完整办事路径复评，允许分区改进", effects: { ability: 4, trust: 4, performance: 1, health: -2 }, outcome: "你要求把每一步重复填写、核验和往返都列出来，再比较不同地区的解法。评估不再只有投入和上线数量。那行潦草的批注被收入问题清单，成了需要回应的正式事项。" },
      { text: "先统一关键环节标准，再逐步推广", effects: { performance: 4, integrity: 3, ability: 2, trust: -1 }, outcome: "共同标准更清楚了，基础薄弱地区的进度却不能凭空加快。你要求同步列出配套支持与阶段目标。方案没有许诺所有地方同一天变好，但也不能让‘分步实施’变成没有日期的等待。" },
      { text: "保留现有服务，先支持薄弱地区补课", effects: { trust: 4, integrity: 2, performance: -2, ability: 1 }, outcome: "资源安排向短板地区倾斜，原本准备扩大试点的地方需要再等一等。统筹意见里写下了取舍，而不是把所有诉求都写成‘全力支持’。到了这个位置，没被优先选择的那部分人也需要一个解释。" }
    ]
  }
];

// Each one-off choice opens only its own sequel. Older saves without these
// flags retain their existing history; do not invent a past decision for them.
const BRANCH_FLAGS = {
  town_last_stamp: ["stampTogether", "stampTomorrow", "stampOldList"],
  town_empty_chair: ["chairEvening", "chairFeedback", "chairNextTime"]
};
CAREER_STORIES.forEach((event) => {
  if (BRANCH_FLAGS[event.id]) event.choices.forEach((choice, index) => {
    choice.flags = { [BRANCH_FLAGS[event.id][index]]: true };
  });
});

module.exports = { CAREER_STORIES };
