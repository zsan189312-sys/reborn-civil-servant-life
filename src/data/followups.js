"use strict";

// Original narrative drafts. Automated validation does not constitute human content approval.
const { ALL_ROLE_LEVELS: ALL } = require("../core/constants");
const FOLLOWUPS = [
  {
    id: "followup_room_trial", category: "work", title: "轮换表之外",
    body: "去年排出的活动室轮换表运行了一阵。志愿者发现，两组人最需要的其实是同一个周末时段，执行者夹在中间。",
    roleLevels: ALL, once: true, requiresFlags: ["sharedRoomTrial"], afterEvent: { id: "work_shared_room", years: 1 },
    choices: [
      { text: "每月轮换热门时段，公开排期", effects: { trust: 3, performance: 2, health: -2 }, flags: { roomSharedPlan: true } },
      { text: "尝试联合活动，重新组织人员", effects: { ability: 4, performance: -2, health: -3 }, flags: { roomJointPlan: true } },
      { text: "保留原表，另给一组寻找场地", effects: { performance: 3, trust: -2, health: -1 } }
    ]
  },
  {
    id: "followup_room_shared", category: "work", title: "谁来维护排期",
    body: "轮换制度减少了争执，但志愿者常临时请假。大家希望这张表不再只靠一个人盯着。",
    roleLevels: ALL, once: true, requiresFlags: ["roomSharedPlan"], afterEvent: { id: "followup_room_trial", years: 1 },
    choices: [
      { text: "培训两名替补，交接记录公开", effects: { ability: 2, performance: 4, trust: 2, health: -2 } },
      { text: "暂时亲自维护排期", effects: { performance: 3, health: -5, family: -2 } }
    ]
  },
  {
    id: "followup_room_joint", category: "work", title: "一堂共同的课",
    body: "联合活动第一次成功了：老人讲旧城故事，孩子们画下听到的街道。团队希望扩大活动，但场地和志愿者都有限。",
    roleLevels: ALL, once: true, requiresFlags: ["roomJointPlan"], afterEvent: { id: "followup_room_trial", years: 1 },
    choices: [
      { text: "保留小规模，先整理执行手册", effects: { ability: 3, trust: 3, performance: 2, health: -1 } },
      { text: "增加场次，自己补上人员缺口", effects: { performance: 6, trust: 2, family: -3, health: -5 } }
    ]
  },
  {
    id: "followup_gift_review", category: "work", title: "迟来的登记",
    body: "上年的未登记礼盒在例行盘点中被发现。评审程序必须复核，你也需要说明为何没有及时处理。",
    roleLevels: ALL, once: true, requiresFlags: ["unresolvedGift"], afterEvent: { id: "work_supplier_gift", years: 1 },
    choices: [
      { text: "补充如实说明，承担复核责任", effects: { integrity: -2, trust: -3, performance: -3, health: -2 }, flags: { unresolvedGift: false, giftRemediation: true } },
      { text: "申请退出该项目并完整交接", effects: { integrity: -4, trust: -2, performance: -5 }, flags: { unresolvedGift: false, giftRemediation: true } }
    ]
  },
  {
    id: "followup_gift_remedy", category: "work", title: "把漏洞变成流程",
    body: "礼盒事件复核完成。团队请你把此次暴露的问题写入接收与回避流程，避免同样的遗漏再次发生。",
    roleLevels: ALL, once: true, requiresFlags: ["giftRemediation"], afterEvent: { id: "followup_gift_review", years: 1 },
    choices: [
      { text: "和同事演练登记与交接", effects: { integrity: 3, ability: 2, performance: -2, health: -2 } },
      { text: "整理书面提醒，请专人复核", effects: { integrity: 2, performance: 1, trust: 1 } }
    ]
  },
  {
    id: "followup_gift_declared", category: "work", title: "回避之后的进度",
    body: "你主动回避的评审已经交给其他同事。新经办人需要背景材料，项目期限却没有延长。",
    roleLevels: ALL, once: true, requiresFlags: ["declaredGift"], afterEvent: { id: "work_supplier_gift", years: 1 },
    choices: [
      { text: "整理交接清单，不参与评价", effects: { ability: 2, performance: 3, health: -2 } },
      { text: "申请合理延期，完成独立复核", effects: { integrity: 2, trust: 2, performance: -2 } }
    ]
  },
  {
    id: "followup_favor_review", category: "life", title: "那通电话有了回音",
    body: "你替马川打过的那通电话，终于绕了回来。另一位申请人对办理次序提出异议，相关记录需要核查。马川又约你去那家面馆，面端上来半天，他才问：‘是不是给你惹麻烦了？’这次，谁都没去拿桌上的卤蛋。",
    roleLevels: ALL, once: true, requiresFlags: ["improperFavor"], afterEvent: { id: "life_old_friend", years: 1 },
    choices: [
      { text: "说明是自己越了界，如实配合纠正", effects: { integrity: -2, trust: -4, family: -3 }, flags: { improperFavor: false, repairedBoundary: true }, outcome: "你把经过写清楚，也告诉马川不能再替他托话。他低着头说‘那我不该找你’，你回：‘你开口是你的事，我答应是我的错。’纠正开始了，失去的信任不会跟着一键恢复。" },
      { text: "交出相关记录，退出经办并配合核查", effects: { integrity: -4, trust: -2, health: -3 }, flags: { improperFavor: false, repairedBoundary: true }, outcome: "你把记录完整交出，不再接触这项申请。马川的消息来了又撤回，最后只剩一句‘知道了’。退出办理不是退出责任，接下来每一次说明，你都得自己面对。" }
    ]
  },
  {
    id: "followup_friend_boundary", category: "life", title: "半个馒头的交情",
    body: "申请风波后，马川很少主动联系你。一次聚会，你们偏偏被安排坐在一起。他盯着面前的点心，忽然说：‘小时候抢你半个馒头，也没见你这么难受。’说完他自己先笑了，又很快收住。你知道，他在试着找回以前说话的方式。",
    roleLevels: ALL, once: true, requiresFlags: ["repairedBoundary"], afterEvent: { id: "followup_favor_review", years: 1 },
    choices: [
      { text: "把话说开：饭可以蹭，队不能插", effects: { family: 3, integrity: 2, health: -1 }, outcome: "马川憋了半天，问：‘那卤蛋还能拿不？’你把点心碟推过去。事情没有从履历里消失，你们也回不到什么都没发生的时候，但这顿饭总算能接着吃。" },
      { text: "陪他聊旧事，先不急着恢复从前", effects: { health: 2, family: -1 }, outcome: "你接着讲起当年谁被老师罚站，他纠正了你两次。散场时，你们互相说了再见，没有约下一顿。那段交情没有当场修好，也不必在今晚硬说已经没事。" }
    ]
  },
  {
    id: "followup_birthday_photo", category: "life", title: "相框里没写你的职务",
    body: "父亲把上回生日的照片洗了出来，摆在客厅最显眼的位置。帽子是歪的，三个人却都笑着。亲戚来看，问你现在干什么，父亲没报头衔，只指照片：‘这张，他拍了三遍。’今年聚餐又要定日子，你的工作安排却还没落定。",
    roleLevels: ALL, once: true, requiresFlags: ["birthdayHome"], afterEvent: { id: "life_family_dinner", years: 1 },
    choices: [
      { text: "先留一天，其他安排尽早协调", effects: { family: 4, performance: -2 }, outcome: "你把日子圈出来，提前协调工作。父亲在电话里说不用专门腾时间，转头却问母亲：‘那天鱼要提前订吧？’你听见了，假装没听见。" },
      { text: "不许空头承诺，改约能确定的早饭", effects: { family: 2, health: -2 }, outcome: "聚餐改成了周末早茶。天刚亮你就赶到，父亲嫌包子贵，还是多点了一笼。没有生日帽，照片里只有三碗粥。这一次，谁都没等到菜凉。" }
    ]
  },
  {
    id: "followup_birthday_candle", category: "life", title: "今年不等你了",
    body: "又到父亲生日，母亲提前发来一句：‘今年我们先吃，不等你。’消息后跟着一张蛋糕照片，旁边是上回留给你的那根蜡烛。你打了句‘最近确实忙’，又删掉。上一世，这段对话你太熟悉了。今晚没有急事，明早却有一场你想准备好的汇报。",
    roleLevels: ALL, once: true, requiresFlags: ["birthdayMissed"], afterEvent: { id: "life_family_dinner", years: 1 },
    choices: [
      { text: "不说马上，报个确切的到家时间", effects: { family: 4, performance: -2 }, outcome: "你照着说好的时间敲门。父亲开门第一句是‘不是说不等了吗’，脚却往旁边让得飞快。你把旧蜡烛点上。他没提上回，你也没有把今天算成补偿完成。" },
      { text: "留在岗位准备，约明早陪他吃面", effects: { performance: 2, family: -1, health: -2 }, outcome: "电话里，父亲说面馆六点就开。第二天你赶到时，他已经占好了靠窗的位置：‘这回不怕耽误你事了吧？’生日的缺席还在，你们从这碗面开始，重新找见面的时间。" }
    ]
  },
  {
    id: "followup_band_stage", category: "life", title: "压轴节目，倒数第二",
    body: "老唐把一张社区演出单塞给你：乐队排倒数第二，最后是抽奖。他认真解释：‘这叫压轴，观众一个也跑不了。’你们练过的那首歌终于没那么散，家人说要坐第一排。偏偏演出前一晚，季度材料还有一轮可提前完成的校对。",
    roleLevels: ALL, once: true, requiresFlags: ["bandCommitted"], afterEvent: { id: "life_hobby_group", years: 1 },
    choices: [
      { text: "挤出排练时间，完整弹完这首歌", effects: { family: 3, health: 2, performance: -2 }, outcome: "你还是错了一个和弦，鼓手立刻敲重一拍替你盖过去。第一排的家人比抽到奖的人拍得还响。谢幕时老唐小声说：‘看吧，也有人专门来看咱们。’" },
      { text: "材料先校完，上台给大家打节拍", effects: { performance: 2, family: 1, health: -3 }, outcome: "你没赶上最后一次合练，主动把主吉他让给替补。台上只弹最熟的段落，手心仍全是汗。老唐谢幕时把你往前推：‘别躲，错的地方大家一起认。’" },
      { text: "提前请替补，这次坐台下帮忙录像", effects: { family: 1, health: 1 }, outcome: "你提前交代好曲目，把位置让出来。台下举手机举得手酸，才发现看别人上台比自己排练更紧张。散场时老唐把琴盒递给你：‘下次别光给我们留影。’" }
    ]
  },
  {
    id: "followup_friend_tickets", category: "life", title: "这回真没事求你",
    body: "马川又发来消息，你下意识以为还是申请。他先补了一句：‘已经按正常流程办好了，这回真没事求你。’跟着是两张露天老电影的票。当年你们翻墙看过一半，结尾谁也不知道。今晚去，就得把原定的学习计划往后挪。",
    roleLevels: ALL, once: true, requiresFlags: ["friendPublicRoute"], afterEvent: { id: "life_old_friend", years: 1 },
    choices: [
      { text: "去把那半部电影看完，各付各的", effects: { family: 4, health: 2, ability: -1 }, outcome: "结尾没有你们吹了多年的那么神。马川笑得直拍腿：‘早知道当年就不翻墙了。’你把自己的票钱转过去，他没客套，顺手让你拿一下汽水。你们终于没聊申请。" },
      { text: "今晚照常学习，换个双方都空的日子", effects: { ability: 2, family: 1, health: -1 }, outcome: "你没发‘有空再说’，而是给了两个具体日子。马川选完，回了个龇牙表情：‘行，我忍住不告诉你结局。’那天的日历多了一行，和工作安排写得一样认真。" }
    ]
  },
  {
    id: "followup_library_use", category: "work", title: "新空间的第一年",
    body: "旧图书馆的分区改造完成，来访人数增加了。安静阅读区和活动区之间却缺少足够的隔音。",
    roleLevels: ALL, once: true, requiresFlags: ["libraryRenovation"], afterEvent: { id: "city_library_future", years: 2 },
    choices: [
      { text: "缩短活动时段，试行分时使用", effects: { trust: 2, performance: 2, ability: 1 }, flags: { librarySchedule: true } },
      { text: "暂停部分活动，改造隔音设施", effects: { performance: -3, integrity: 2, health: -2 }, flags: { librarySoundproof: true } },
      { text: "把活动移到室外，保留阅读区", effects: { trust: -1, performance: 3, ability: 2 } }
    ]
  },
  {
    id: "followup_library_schedule", category: "work", title: "晚间的阅读灯",
    body: "分时使用减少了噪声，但晚下班的人希望延长阅读时间。现有值班人员已经排满。",
    roleLevels: ALL, once: true, requiresFlags: ["librarySchedule"], afterEvent: { id: "followup_library_use", years: 1 },
    choices: [
      { text: "每周选两天延时，重新调班", effects: { ability: 3, trust: 3, performance: 2, health: -2 } },
      { text: "维持开放时段，提供预约借阅", effects: { performance: 3, trust: -1, ability: 1 } }
    ]
  },
  {
    id: "followup_library_sound", category: "work", title: "听见安静",
    body: "隔音改造通过验收。居民建议再次扩大活动规模，而管理人员希望先验证现有设施的维护成本。",
    roleLevels: ALL, once: true, requiresFlags: ["librarySoundproof"], afterEvent: { id: "followup_library_use", years: 1 },
    choices: [
      { text: "先运行一季，公开维护账目", effects: { trust: 3, integrity: 2, performance: 3, health: -1 } },
      { text: "小幅增加活动，逐次记录成本", effects: { performance: 5, ability: 2, health: -3 } }
    ]
  }
];

module.exports = { FOLLOWUPS };
