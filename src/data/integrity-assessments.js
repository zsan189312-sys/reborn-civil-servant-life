"use strict";

const { ALL_ROLE_LEVELS } = require("../core/constants");

// 五次廉洁考察分散在职业生涯中。每个场景只出现一次，且诱惑的
// 人物关系、载体和利益事项各不相同，避免把“收礼”换几个名词重复讲。
const INTEGRITY_ASSESSMENTS = [
  {
    id: "integrity_trunk_wine",
    once: true,
    category: "integrity",
    minYear: 4,
    title: "后备箱里的酒很认路",
    body: "廉洁谈话刚结束，项目商老周就在停车场追上你：‘两箱土特产，不值钱。’箱角露出的酒标却很值钱。他还笑着补了一句：‘下周评审，您只要让大家公平地多看我两眼。’",
    storyTheme: "integrity-trunk-wine",
    roleLevels: ALL_ROLE_LEVELS,
    choices: [
      { text: "叫监督人员来，让酒和老周一起留影", effects: { integrity: 6, trust: 2, performance: -1 }, outcome: "老周的笑停在脸上。你当场登记、退回并申请回避评审。第二天单位群里多了一条提醒：停车场不是礼品中转站。" },
      { text: "退酒不退人情：照常评审，但全程留痕", effects: { integrity: 2, ability: 2, health: -1 }, outcome: "酒原路返回，评审记录逐项公开。老周没占到便宜，散会后发来四个字：‘您真较真。’你回：‘项目也较真。’" },
      { text: "先搬回家，评审时‘公平地多看两眼’", effects: { integrity: -10, performance: 3, family: -1 }, accountability: { acceptedValue: 2, retainedValue: 2, dutyAbuse: 2, concealment: 1, caseStatus: "unreported", note: "两箱高档酒未登记，并在项目评审中给予关照。" }, outcome: "酒进了储物间，老周进了候选名单。你告诉自己只是多看了两眼，可评分表上那两分，偏偏也很认路。" }
    ]
  },
  {
    id: "integrity_wedding_ledger",
    once: true,
    category: "integrity",
    minYear: 8,
    title: "婚宴来了几个没露面的人",
    body: "家里办喜事，礼簿最后一页突然豪华起来：三个承包商人没到场，红包却一个比一个厚。表哥压低声音：‘人情社会，退了多难看。’其中一人的验收款，正等你协调。",
    storyTheme: "integrity-wedding-ledger",
    roleLevels: ALL_ROLE_LEVELS,
    choices: [
      { text: "把三只红包单独封存，当天登记退回", effects: { integrity: 7, family: -2, trust: 2 }, outcome: "表哥嫌你把喜宴办成了审计现场。你逐笔退回，备注只写‘不符合正常礼尚往来’。席散时家里有点冷，礼簿却很干净。" },
      { text: "按普通亲友标准留一份，其余退回并说明", effects: { integrity: 3, family: 1, ability: 1 }, outcome: "你按当地正常往来标准处理并主动报告。承包商打来电话试探，你把标准念了一遍。他沉默两秒：‘明白，验收还是看材料。’" },
      { text: "礼簿先合上，验收款也‘顺手’催一催", effects: { integrity: -12, performance: 3, family: 3 }, accountability: { acceptedValue: 8, retainedValue: 8, dutyAbuse: 2, concealment: 1, caseStatus: "unreported", note: "借家庭喜事收受管理服务对象明显超出正常往来的礼金，并为其验收款提供关照。" }, outcome: "表哥夸你终于懂人情。款项很快拨出，礼簿也被收进柜底。只是那三个没来吃饭的人，名字比到场宾客写得还工整。" }
    ]
  },
  {
    id: "integrity_phone_card",
    once: true,
    category: "integrity",
    minYear: 12,
    title: "手机壳突然胖了",
    body: "下属小梁汇报完采购方案，手机落在你桌上。你追出去，他摆手跑得飞快。透明壳里夹着一张五万元购物卡，背面写着密码，还画了个很欠揍的笑脸：‘领导辛苦。’",
    storyTheme: "integrity-phone-card",
    roleLevels: ALL_ROLE_LEVELS,
    choices: [
      { text: "让小梁回来，连人带卡去说明情况", effects: { integrity: 7, trust: 1, performance: -2 }, outcome: "小梁一路解释‘只是心意’，到了监督人员面前声音越来越小。采购评审临时换人，你多挨了半天忙，却少欠了一笔说不清的人情。" },
      { text: "封卡、调监控、采购方案重新交叉复核", effects: { integrity: 5, ability: 3, health: -2 }, outcome: "卡没有被使用，接触过程也完整留痕。复核果然找出一个偏向特定品牌的参数。小梁低着头问：‘还有机会改吗？’你说先把方案改明白。" },
      { text: "卡留下，参数就按他熟悉的品牌写", effects: { integrity: -14, performance: 4, trust: -2 }, accountability: { acceptedValue: 5, retainedValue: 5, dutyAbuse: 2, concealment: 1, caseStatus: "unreported", note: "收受下属转交的购物卡，并默许采购参数偏向特定供应商。" }, outcome: "采购推进得异常顺利，小梁也突然很会读空气。月底对账时，购物卡只剩一串余额；方案里的品牌参数，却一字没少。" }
    ]
  },
  {
    id: "integrity_fishing_cooler",
    once: true,
    category: "integrity",
    minYear: 16,
    title: "钓鱼箱里一条鱼都没有",
    body: "老同学约你去水库‘叙旧’，临走塞来一只沉甸甸的保温箱：‘自己钓的。’你回家一开，冰袋下面整整齐齐码着二十万元现金。他的企业，正在争取一块稀缺指标。",
    storyTheme: "integrity-fishing-cooler",
    roleLevels: ALL_ROLE_LEVELS,
    choices: [
      { text: "原箱不动，带着‘零条鱼’主动说明", effects: { integrity: 8, trust: 3, family: -1 }, outcome: "工作人员清点完问你鱼呢。你说这正是问题。老同学发来十几条语音，你一条没删，全按要求提交。那顿叙旧，从此有了正式编号。" },
      { text: "通知他取回，同时退出指标研究", effects: { integrity: 4, performance: -3, health: 1 }, outcome: "你在见证下退回现金并报告接触情况，随后回避相关事项。老同学冷着脸拎走箱子：‘这么多年，白认识了。’你看着空桌子想，至少没白做自己。" },
      { text: "钱先藏好，会上替他的指标‘讲讲道理’", effects: { integrity: -18, performance: 5, trust: -3 }, accountability: { acceptedValue: 20, retainedValue: 20, dutyAbuse: 2, concealment: 1, caseStatus: "unreported", note: "收受二十万元现金，并在稀缺指标分配中为请托企业提供帮助。" }, outcome: "你在会上说得句句像业务分析，只有自己知道结论早装在保温箱里。指标落定那晚，老同学只发来一条消息：‘鱼好吃吗？’" }
    ]
  },
  {
    id: "integrity_tea_consultant",
    once: true,
    category: "integrity",
    minYear: 20,
    title: "这杯茶泡着退休后的年薪",
    body: "一家长期与你分管领域打交道的企业请你喝茶。老板不谈眼前项目，只递来一份‘退休后顾问协议’，年薪八十万元。他眨眨眼：‘现在不用签，最近那次并购审查，您心里有数就行。’",
    storyTheme: "integrity-future-consultancy",
    roleLevels: ALL_ROLE_LEVELS,
    choices: [
      { text: "茶钱自己付，协议交监督部门备案", effects: { integrity: 9, trust: 3, performance: -1 }, outcome: "老板追到门口说你误会了。你把付款记录和协议一并提交，主动回避审查。后来同事开玩笑：这可能是你喝过最贵、也最便宜的一杯茶。" },
      { text: "明确拒绝，再把并购审查随机分派", effects: { integrity: 5, ability: 3 }, outcome: "你没有收协议，也不再接触该事项。随机分派结果出来后，老板只回了一个句号。茶有点苦，但不用猜那个句号值多少钱。" },
      { text: "协议不签，暗号记住：先把并购放过去", effects: { integrity: -20, performance: 5, trust: -4 }, accountability: { acceptedValue: 80, retainedValue: 80, dutyAbuse: 2, concealment: 1, publicHarm: 1, caseStatus: "unreported", note: "接受高额离职后利益安排，并在并购审查中为相关企业谋取利益。" }, outcome: "纸没签，你以为就没有痕迹。审查很快通过，老板把那份协议收回公文包：‘等您退下来，我们再补日期。’原来空白处也能写满承诺。" }
    ]
  },
  {
    id: "integrity_joint_inquiry",
    once: true,
    category: "work",
    minYear: 5,
    title: "五个袋子，被摊在同一张桌上",
    body: "联合核查组没有问你‘廉不廉洁’，只依次摆出酒箱照片、礼簿复印件、购物卡流水、保温箱取款记录和顾问协议。实际摆了几样，取决于你曾经伸过几次手。负责谈话的人推来一张白纸：‘从第一笔开始说。’",
    storyTheme: "integrity-evidence-inquiry",
    roleLevels: ALL_ROLE_LEVELS,
    requiresFlags: ["integrityCaseOpened"],
    choices: [
      { text: "不等他翻第二页：逐笔说明、主动退缴", effects: { integrity: -4, health: -4, family: -3 }, flags: { integrityCaseCharged: true }, accountability: { cooperation: 3, retainedValue: -999, caseStatus: "prosecution", sentenceExposureFromRecord: true, note: "在证据核查阶段如实说明并主动退缴，案件依法进入审查起诉。" }, outcome: "你说到第三笔时，窗外已经黑了。退缴和配合会被记录，但不会把曾经作出的关照从材料里擦掉。工作人员收起笔：‘下一步，由司法程序判断。’" },
      { text: "只承认已摆上桌的，没问到的一字不提", effects: { integrity: -7, health: -6, family: -4 }, flags: { integrityCaseCharged: true }, accountability: { cooperation: 1, concealment: 1, caseStatus: "prosecution", sentenceExposureFromRecord: true, note: "对已经出示的证据作有限说明，案件依法进入审查起诉。" }, outcome: "你每句话都留了后门，对方也每页都留了编号。谈话结束时，没人拍桌子，只把一份更厚的材料放进档案袋。安静比训斥更让人心慌。" },
      { text: "把所有袋子都说成‘正常人情往来’", effects: { integrity: -10, health: -8, trust: -5 }, flags: { integrityCaseCharged: true }, accountability: { concealment: 3, publicHarm: 1, caseStatus: "prosecution", sentenceExposureFromRecord: true, note: "在多项客观证据面前仍作不实说明，案件依法进入审查起诉。" }, outcome: "你把同一句解释讲了五遍。核查人员没争辩，只播放了经办人的录音。录音里，你当时说的可不是‘正常往来’。白纸仍然空着，证据却已经写满。" }
    ]
  },
  {
    id: "integrity_public_judgment",
    once: true,
    category: "work",
    minYear: 6,
    title: "法槌落下前，屏幕亮了一次",
    body: "庭审最后陈述前，辩护人把量刑建议轻轻推到你面前。旁听席上没有熟面孔，只有家人发来的四个字：‘照实说吧。’酒、钱、关照和掩盖已经由证据固定，此刻能改变的是面对后果的方式，不是让事实消失。",
    storyTheme: "integrity-court-judgment",
    roleLevels: ALL_ROLE_LEVELS,
    requiresFlags: ["integrityCaseCharged"],
    afterEvent: { id: "integrity_joint_inquiry", years: 1 },
    choices: [
      { text: "承认责任，把最后一句话留给家人", effects: { family: -8, health: -6 }, accountability: { cooperation: 1, convictFromExposure: true, note: "法院依据虚构案情作出判决：有期徒刑 {{sentenceYears}} 年。" }, outcome: "你没有再解释动机，只说愿意承担后果。法槌落下：有期徒刑 {{sentenceYears}} 年。屏幕暗下去之前，你看见家人又发来一句：‘我们等你把以后过明白。’" },
      { text: "继续辩解‘大家都这样’，等待宣判", effects: { integrity: -8, family: -10, health: -8 }, accountability: { concealment: 1, convictFromExposure: true, note: "法院依据虚构案情作出判决：有期徒刑 {{sentenceYears}} 年。" }, outcome: "‘大家’没有坐在被告席上。审判人员逐项说明证据与责任，法槌落下：有期徒刑 {{sentenceYears}} 年。你第一次发现，这句话从来不能替任何一个选择买单。" }
    ]
  }
];

module.exports = { INTEGRITY_ASSESSMENTS };
