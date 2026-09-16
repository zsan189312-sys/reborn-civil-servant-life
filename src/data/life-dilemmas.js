"use strict";

const { ALL_ROLE_LEVELS } = require("../core/constants");

// Original life dilemmas. Conflict comes from face, affection, money, time and
// misunderstood intentions; no option is written as a consequence-free answer.
const LIFE_DILEMMAS = [
  {
    id: "life_family_group_promise", category: "life", title: "母亲替你答应了", roleLevels: ALL_ROLE_LEVELS,
    once: true, minYear: 2,
    body: "家族群忽然刷出十几条“谢谢领导”。母亲刚发过语音，说表妹毕业找工作的事“交给我们家孩子，认识的人多”。表妹紧跟着私聊，把简历和一句“姐，我就靠你了”发来。你知道母亲只是想在亲戚面前抬一次头，也知道自己根本不该替任何单位安排人。今晚就是表妹投递截止日。",
    choices: [
      { text: "在群里把话说清，再陪表妹把简历改到能投", effects: { integrity: 4, family: -3, ability: 2, health: -2 }, outcome: "群里安静了整整七分钟。母亲单独发来一句：‘非得当着所有人说？’你没辩解，和表妹改简历改到凌晨。她最后说了声谢谢，却把原来的“姐，我就靠你了”撤回了。原则守住了，母亲丢掉的面子也是真的。" },
      { text: "先替母亲圆场：我只负责把公开岗位找齐", effects: { family: 2, integrity: 2, health: -3 }, outcome: "你在群里发了六个公开招聘链接，顺手做了一张截止日期表。舅舅回了个大拇指：‘还是自家人靠谱。’母亲的面子暂时保住了，表妹却私聊问：‘所以，你其实一个电话也不会打，对吗？’" },
      { text: "私下托熟人“帮忙留意”，让群里先高兴一晚", effects: { family: 5, integrity: -7, performance: 1 }, flags: { familyJobFavor: true }, outcome: "熟人没有承诺录用，只说有合适机会可以看看。母亲已经在群里发了三个红包，表妹把备注改成“等好消息”。你明明什么都没办成，却第一次体会到一句含糊的“我问问”，怎样在别人心里长成一张录取通知。" }
    ]
  },
  {
    id: "life_midnight_deleted_message", category: "life", title: "他撤回了三次", roleLevels: ALL_ROLE_LEVELS,
    once: true, minYear: 2,
    body: "凌晨一点十七分，大学室友周野连着撤回三条消息。第四条只有一句：‘手头方便的话，能借我一万吗？不方便就当没看见。’毕业后他很少找你，朋友圈却总是旅行和新鞋。明早你要作一场重要汇报，家里这个月也刚交完一笔大开支。",
    choices: [
      { text: "先打电话，不问朋友圈，只问今晚出了什么事", effects: { family: 2, health: -4, ability: 1 }, outcome: "电话接通后很久没人说话。周野不是去旅行，而是在给客户开车；照片是以前存的。他母亲临时住院，缺的是押金。你们算清他还能从哪些正规渠道周转，天亮前没有解决全部问题，至少那三条撤回不再只有他一个人知道。" },
      { text: "借一万元，备注写清还款时间，也说明这是底线", effects: { family: 1, health: -2 }, assetChange: -1, outcome: "转账过去以后，他回了句“收到”，没有发表情。三个月后第一笔还款准时到账，金额只有两千。他说剩下的再等等。你忽然明白，借出去的不只是钱，还有一段友情接下来每次开口时的重量。" },
      { text: "把手机扣过去：凌晨的决定，留到天亮再做", effects: { performance: 3, health: 2, family: -3 }, outcome: "你睡了四个小时，汇报很顺。散会后再点开对话框，那条借钱消息也撤回了。你问“昨晚找我有事？”周野回得很快：‘没事，按错了。’你盯着这五个字，知道有些体面一旦帮对方保住，就很难再问第二次。" }
    ]
  },
  {
    id: "life_father_short_video", category: "life", title: "父亲开播了", roleLevels: ALL_ROLE_LEVELS,
    once: true, minYear: 3,
    body: "父亲学会了直播。你点进去时，他正对几十个观众说：‘我家孩子在机关工作，谁办事遇到困难，留言，我让他帮着问。’屏幕上已经有人留下姓名和具体诉求，还有人追问你的职务。父亲看见你进入直播间，立刻笑着喊：‘正主来了！给大家说两句。’",
    choices: [
      { text: "当场入镜：爸，先关播，我回家教你怎么保护别人信息", effects: { integrity: 5, family: -2, trust: 1, health: -2 }, outcome: "父亲脸上的笑僵了一下，还是关了直播。回家后他把手机往桌上一放：‘我就是想让人知道你没白干。’你们一起删除带有个人信息的回放，又把公开渠道写在纸上。他学会了设置，你也第一次听懂那句炫耀背后的委屈。" },
      { text: "发条弹幕救场：老同志别替我开第二个办事大厅", effects: { family: 3, trust: 2, integrity: 1 }, outcome: "观众刷了一排笑脸，父亲顺势说自己只是热心。下播后他骂你没大没小，又把那条弹幕截图发进家族群。你随后逐一提醒留言者改走公开渠道。场面保住了，但那几十条已经出现过的个人信息仍让你后怕。" },
      { text: "让母亲先关掉直播，自己假装没看见", effects: { performance: 2, family: -5, health: 1 }, outcome: "直播突然中断。父亲给你打了两个电话，你都没接。晚上母亲发来语音：‘他把支架收起来了，说以后不碰这些。’麻烦最快地消失了，父亲想被你看见的那一小会儿，也一起被关掉了。" }
    ]
  },
  {
    id: "life_public_clip", category: "life", title: "十五秒里，你像个坏人", roleLevels: ALL_ROLE_LEVELS,
    once: true, minYear: 4,
    body: "一段十五秒的视频突然传开：一位老人红着眼问你能不能通融，你只回了句“按程序办”。标题写着《领导的程序，比老百姓的事大》。被剪掉的后半段里，你安排了复核和上门办理。家人把视频发来，只问：‘这是你吗？’评论还在飞快增加。",
    choices: [
      { text: "公开完整经过和办理结果，让事实自己挨骂一次", effects: { trust: 5, integrity: 4, performance: -3, health: -3 }, outcome: "完整记录发出后，新的争论没有停止：有人道歉，也有人说你只会事后公关。老人当天完成了上门核验，临走前问会不会害你被骂得更凶。你说事情办对，比评论区站哪一边更重要。" },
      { text: "先去见老人，再决定是否回应镜头外的人", effects: { trust: 3, ability: 2, health: -4 }, outcome: "老人以为你来追究拍摄，急得一直解释。你把后续流程讲完，也问他那天为什么哭。原来他怕的不是材料，而是自己再跑一次就记不住路。回去后你只发布办理进度，没有要求他替你澄清。" },
      { text: "今晚关掉评论，把这顿饭完整吃完", effects: { family: 4, health: 3, trust: -4 }, outcome: "你把手机交给家人保管，饭桌上还是没人敢先说话。父亲夹了一筷子菜：‘十五秒看不明白一个人，十五年也未必。’第二天热度已经转向别处，误解没有完全澄清，你也没有让它吞掉整个晚上。" }
    ]
  },
  {
    id: "life_partner_award_seat", category: "life", title: "领奖台下那把空椅子", roleLevels: ALL_ROLE_LEVELS,
    requiresPartner: true, minRelationshipYears: 2, once: true, minYear: 6,
    body: "伴侣第一次获得行业奖项，邀请函上特意写了你的名字。颁奖同一晚，一场不强制参加的工作交流饭局临时通知，几位可能影响下一阶段项目安排的人都会到。伴侣只发来会场座位图，用红圈圈出第一排的一把椅子：‘我不催，你自己选。’",
    choices: [
      { text: "去坐那把椅子，工作饭局缺我一次也会转", effects: { family: 7, health: 2, performance: -3 }, outcome: "灯光亮起时，伴侣先往那把椅子看了一眼，才走上台。主持人问家属有没有话说，你举起手机，上面打着六个字：‘今晚你是主角。’第二天有人问你怎么没去饭局，你第一次没有编一个更像工作的理由。" },
      { text: "饭局露面后赶去，接受自己可能错过最重要的十分钟", effects: { family: 2, performance: 2, health: -5 }, outcome: "你中途离席，跑进会场时掌声刚结束。第一排的椅子一直空着，伴侣却在后台把奖杯递给你：‘挺沉的，你感受一下。’你赶上了合影，也错过了对方在人群里寻找你的那一眼。" },
      { text: "留在饭局，把祝福录成一段不重拍的视频", effects: { performance: 4, family: -7, health: -1 }, outcome: "视频第一遍说错奖项名称，第二遍背景太吵，第三遍你看着镜头忽然不知道还能说什么。伴侣凌晨回复：‘收到了。’照片里，那把写着你名字的椅子被工作人员收到了墙边。" }
    ]
  },
  {
    id: "life_old_house_key", category: "life", title: "门框上的身高还在", roleLevels: ALL_ROLE_LEVELS,
    once: true, minYear: 8,
    body: "父母说想卖掉老房子，把钱给你改善现在的住处：‘反正你一年也回来不了几次。’看房的人明天就来。你回去拿钥匙，发现门框上还留着从七岁到十八岁的身高刻痕，最上面一条是父亲踮脚替你画高的。中介估计，卖掉能给你二十万元。",
    choices: [
      { text: "接受他们的心意，但把养老和居住方案先算清", effects: { family: 2, ability: 2, health: -2 }, assetChange: 20, outcome: "你们把数字摊开算了两个小时，先留下父母今后居住和医疗的预算，再谈剩下的钱。签约前，父亲拿砂纸在门框上比划，最后又放下：‘留给下家吧，房子也得记得住人。’钱到账了，钥匙却在你口袋里沉了很久。" },
      { text: "不卖，我想回来的时候还有地方能认出我", effects: { family: 5, health: 2, performance: -1 }, outcome: "父亲嘴上说你净讲没用的，转身就给中介打电话。晚上他拿卷尺站到门框边，让你再量一次。你早已过了长个子的年纪，他还是认真添了一笔，日期写的是今天。" },
      { text: "先修好出租，让老房子自己承担维护费", effects: { ability: 3, family: 1, health: -3 }, assetChange: -3, outcome: "修缮比想象中麻烦，你们为窗框颜色争了三次。第一位租客带孩子来看房，孩子一进门就研究那些身高线。父亲蹲下来讲了半天，临走悄悄对你说：‘有人接着量，也挺好。’" }
    ]
  }
];

module.exports = { LIFE_DILEMMAS };
