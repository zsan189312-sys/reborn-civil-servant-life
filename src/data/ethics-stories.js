"use strict";

// Original fictional dilemmas. They show consequences of conflicts of interest;
// they are not descriptions of real cases or instructions for evading oversight.
const ETHICS_STORIES = [
  {
    id: "county_friend_project", category: "work", title: "酒在后备箱里", roleLevels: [3, 4], once: true,
    body: "云岑县的老街更新项目进入评审。老同学宋齐约你吃面，说他的公司只是‘正常参与’。临走时，他按住你的车门：‘两箱老酒，给叔叔尝尝。还有五万咨询费，已经转了。项目给谁都要做，给熟人至少不会砸你的招牌。’手机恰好亮起到账提醒。",
    choices: [
      { text: "拒收并登记关系，主动退出项目评审", effects: { integrity: 7, trust: 2, performance: -2, family: -1 }, flags: { friendProjectRecused: true }, outcome: "你当面退回转账，酒也没有上车，并把同学关系写进登记。宋齐沉默了一路，最后只说：‘行，当我没认识过你。’项目临时换评审，进度慢了；回家后父亲听说那酒没拿，反倒问你是不是把老同学得罪狠了。" },
      { text: "退酒退钱并说明关系，申请独立复核后保留技术答疑", effects: { ability: 3, integrity: 4, performance: 1, health: -2 }, flags: { friendProjectDisclosed: true }, outcome: "你不参与评分，只按统一口径回答所有候选方的技术问题。宋齐收回酒时脸色不好看：‘我没让你改分，只想你心里有个数。’你说正因为心里容易有数，才需要让别人看得见边界。这个做法更费时间，也没人保证他会理解。" },
      {
        text: "收下酒和转账，私下提醒他评审最看重什么",
        effects: { integrity: -15, trust: -3, performance: 3, health: -2 }, assetChange: 5,
        flags: { friendProjectTaken: true },
        accountability: {
          acceptedValue: 5, retainedValue: 5, dutyAbuse: 1, caseStatus: "unreported",
          note: "责任记录：收受价值五万元的转账及酒品，并向项目相关方透露评审重点。"
        },
        outcome: "宋齐没有让你改表，只把你说的重点一条条记下。转账备注写着‘旧账’，两箱酒也像普通年礼一样进了储物间。项目推进得异常顺利。你反复告诉自己没有承诺中标，却开始害怕同事随口问一句：‘你们以前认识？’"
      }
    ]
  },
  {
    id: "followup_friend_project_recused", category: "life", title: "他把群聊退了", roleLevels: [3, 4, 5], once: true,
    requiresFlags: ["friendProjectRecused"], afterEvent: { id: "county_friend_project", years: 1 },
    body: "宋齐的公司没有中选。班级群聚会那天，他发了一句‘有些人当了领导，就怕同学沾边’，随后退群。几位老同学轮流来劝，说你哪怕不帮忙，也不该把关系登记得像一件丑事。你盯着那张空出来的头像，第一次怀疑守住边界是否一定要失去一个朋友。",
    choices: [
      { text: "单独约他，把回避和不信任解释清楚", effects: { family: 2, integrity: 2, health: -2 }, outcome: "宋齐没赴约，只回了很长一段语音。你听完才明白，他在意的不只是项目，还有你当场公事公办的语气。你没有为回避道歉，但承认自己把朋友说成了风险点。关系没有立刻修好，话至少重新能送到对方那里。" },
      { text: "不请同学说情，保留距离让时间回答", effects: { integrity: 3, family: -3, health: 1 }, outcome: "聚会照常，你的位置旁边一直空着。有人说宋齐只是气头上，你没借机讲原则。回家路上，群里发来合照，少了他，也少了从前你们总爱抢的那盘菜。边界守住了，失去的亲近同样是真的。" }
    ]
  },
  {
    id: "followup_friend_project_disclosed", category: "work", title: "同一张问题清单", roleLevels: [3, 4, 5], once: true,
    requiresFlags: ["friendProjectDisclosed"], afterEvent: { id: "county_friend_project", years: 1 },
    body: "独立复核完成，宋齐的方案在两项指标上领先，也有一处报价需要澄清。因为你披露过关系，任何处理都容易被解读：让他继续，是照顾；让他退出，是撇清。宋齐在电话里问：‘现在你总能说一句公道话吧？’",
    choices: [
      { text: "让复核组按同一清单书面澄清，不单独表态", effects: { integrity: 4, ability: 2, performance: -1 }, outcome: "同一份问题清单发给所有需要澄清的候选方。宋齐看到邮件后只回了一个‘收到’。最终结果不再由你控制，也不会因为你沉默就没有争议。你把每次答疑都留在公开记录里，项目多走了一段路。" },
      { text: "向复核组完整提供技术背景，继续回避结论", effects: { ability: 3, trust: 1, health: -2 }, outcome: "你把项目背景说清，连宋齐曾私下找过你的经过也一并交代。复核组据此补了核验环节。宋齐后来问你是不是连吃面的事都写了，你说是。他笑了一声：‘你这人，真是一点余地都不给自己留。’" }
    ]
  },
  {
    id: "followup_friend_project_taken", category: "work", title: "那五万不是旧账", roleLevels: [3, 4, 5], once: true,
    requiresFlags: ["friendProjectTaken"], afterEvent: { id: "county_friend_project", years: 1 },
    body: "一封投诉要求复核老街项目。材料没有写你收过什么，只附了一张你和宋齐吃面的照片，以及中选方案调整时间。谈话通知摆在桌上时，储物间那两箱酒还没拆。宋齐发来消息：‘别慌，转账写的是旧账，咱们口径一致就行。’",
    choices: [
      {
        text: "退回五万并上交酒，如实说明接触经过",
        effects: { integrity: -6, trust: -6, performance: -5, health: -3 }, assetChange: -5,
        flags: { friendProjectAdmitted: true, friendProjectTaken: false },
        accountability: {
          retainedValue: -5, cooperation: 2, caseStatus: "disciplinary",
          note: "责任记录：主动退缴并如实说明；原行为保留记录，进入处分与岗位调整程序。"
        },
        outcome: "钱退了，酒交了，记录也补了，但时间没有倒流。你承认自己透露过评审重点，项目进入重新核验。宋齐最后一条消息是：‘你这是把我们两个都交代了。’你没有回复。归还所得只是停止继续占有，不会把已经发生的事擦掉。"
      },
      {
        text: "继续否认请托，把异常解释成经办疏漏",
        effects: { integrity: -18, trust: -10, performance: -6, health: -4 },
        flags: { friendProjectDenied: true },
        accountability: {
          concealment: 1, caseStatus: "investigation",
          note: "责任记录：面对复核仍否认利益往来，案件线索进入进一步调查。"
        },
        outcome: "你没有伪造材料，也没有再给宋齐打电话，只在说明中把每件事拆开：饭是叙旧，钱是旧账，调整是经办流程。每一句单看都像能解释。签名时，经办同事看了你一眼，拿走了属于他的那份复印件。"
      }
    ]
  },
  {
    id: "followup_friend_project_admitted", category: "life", title: "退回以后", roleLevels: [3, 4, 5, 6], once: true,
    requiresFlags: ["friendProjectAdmitted"], afterEvent: { id: "followup_friend_project_taken", years: 1 },
    body: "项目复核告一段落，你被调离相关工作。父亲整理储物间时，问起那两块空出来的地方。你只说酒退了。他沉默半天：‘退了就算没拿过？’饭桌上没人再追问，宋齐也没有再联系。",
    choices: [
      { text: "把事情原委告诉家人，不替自己找理由", effects: { integrity: 3, family: -2, health: -2 }, outcome: "父亲听完，筷子搁了很久：‘你小时候拿同学一块橡皮，我都让你第二天还。现在东西还回去了，事怎么更大了？’你说因为这次拿走的不只是东西。家人没有立刻原谅，但终于知道你在怕什么。" },
      { text: "先承担工作调整，把解释留到自己想清楚以后", effects: { performance: -3, integrity: 1, health: 1, family: -1 }, outcome: "你接下了新的基础工作，没有把它说成主动沉淀。夜里偶尔想给宋齐发消息，写到一半又删掉。承担后果不等于已经想明白，你只能从下一件没人关注的小事重新开始。" }
    ]
  },
  {
    id: "followup_friend_project_denied", category: "work", title: "经办人的复印件", roleLevels: [3, 4, 5, 6], once: true,
    requiresFlags: ["friendProjectDenied"], afterEvent: { id: "followup_friend_project_taken", years: 1 },
    body: "复核人员拿出另一份材料：经办同事保留的时间记录，与签字说明对不上。对方没有质问，只把两页纸并排推到你面前。你忽然想起那天同事看你的眼神。宋齐的电话就在此时震动，一遍，又一遍。",
    choices: [
      {
        text: "停止否认，完整交代并配合退缴",
        effects: { integrity: -8, trust: -12, performance: -10, health: -5 },
        flags: { friendProjectDenied: false, friendCaseCharged: true },
        accountability: {
          retainedValue: -5, cooperation: 2, caseStatus: "prosecution", sentenceExposure: 3,
          note: "责任记录：调查后期完整交代并配合退缴，案件随后进入审查起诉。"
        },
        outcome: "你把手机调成静音，从第一次吃面开始说。很多细节原本以为忘了，说出口时却异常清楚。调查结束后，案件被移送审查起诉。职位、项目和友情会怎样处理，不再由你选择；你终于能选择的，只剩下不让下一句话继续扩大上一句谎话。"
      },
      {
        text: "仍坚持原说明，要求由证据作出判断",
        effects: { integrity: -9, trust: -15, performance: -12, health: -6 },
        flags: { friendCaseCharged: true },
        accountability: {
          concealment: 1, caseStatus: "prosecution", sentenceExposure: 7,
          note: "责任记录：调查依据转账、项目记录和证人材料形成证据链，案件进入审查起诉。"
        },
        outcome: "你依法要求调查人员只以证据判断，也没有承认原说明不实。谈话结束后，转账记录、项目修改时间和经办人的复印件被逐项核对。案件随后进入审查起诉；依法陈述和辩护是你的权利，却不会让已经形成的客观证据消失。"
      }
    ]
  },
  {
    id: "followup_friend_project_judgment", category: "work", title: "法庭上的旧账", roleLevels: [3, 4, 5, 6, 7, 8, 9, 10], once: true,
    requiresFlags: ["friendCaseCharged"], afterEvent: { id: "followup_friend_project_denied", years: 1 },
    body: "案件经审查起诉后，在云岑县人民法院（虚构）公开审理。转账备注写着‘旧账’，但资金往来、评审重点泄露和项目调整记录能够相互印证。审判长宣布法庭调查结束，请你作最后陈述。",
    choices: [
      {
        text: "承认自己越过边界，向家人和受影响的人道歉",
        effects: { family: -5, health: -4, trust: -8 },
        accountability: {
          convictFromExposure: true,
          note: "司法结局：本段为虚构剧情，判处有期徒刑 {{sentenceYears}} 年，并处罚金，违法所得依法追缴。"
        },
        outcome: "法庭依法作出判决：有期徒刑 {{sentenceYears}} 年，并处罚金，违法所得依法追缴。法槌落下时，你想起第一次到青禾镇报到的那天——那时你手里只有一份录用通知。"
      },
      {
        text: "委托辩护人依法陈述意见，平静听候判决",
        effects: { family: -4, health: -5, trust: -8 },
        accountability: {
          convictFromExposure: true,
          note: "司法结局：本段为虚构剧情，判处有期徒刑 {{sentenceYears}} 年，并处罚金，违法所得依法追缴。"
        },
        outcome: "辩护人依法陈述完毕，法庭根据已经查明的事实作出判决：有期徒刑 {{sentenceYears}} 年，并处罚金，违法所得依法追缴。是否辩护不改变游戏刑期；刑期来自此前已经发生的行为。"
      }
    ]
  },
  {
    id: "city_private_dinner", category: "work", title: "没人谈项目的饭局", roleLevels: [5, 6], once: true,
    body: "澄川市公共停车改造正在选合作方。企业负责人说只是感谢前期协调，请你和项目组吃顿便饭。进包间时，一瓶价格不低的酒已经开了。席间果然没人直接提中选，只反复说‘以后长期支持市里的工作’。买单时，对方把你的手轻轻挡开：‘今天谁谈项目了？’",
    choices: [
      { text: "当场离席并登记接触，请项目组照常复核", effects: { integrity: 6, trust: 2, performance: -2 }, flags: { dinnerLeft: true }, outcome: "你没有要求所有人跟着离开，只说明自己不适合参加。走到街上，项目组的消息一条接一条，有人觉得你让场面太难看。第二天的复核照常进行，但那张没坐完的餐桌成了所有人都绕不开的话题。" },
      { text: "留下沟通公开问题，坚持各付各的并补充登记", effects: { ability: 2, integrity: 3, health: -2, trust: -1 }, flags: { dinnerSplit: true }, outcome: "你让服务员拆单，只谈已经公开的共性问题。对方笑着说你太认真，项目组里也有人觉得一顿饭不至于。登记写到‘已开酒水’时，你还是停了一下：形式上的各付各的，能不能消除这顿饭本身带来的亲近感？" },
      { text: "让对方结账，听完那些没有明说的建议", effects: { performance: 3, integrity: -10, trust: -3, health: -2 }, flags: { dinnerHosted: true }, outcome: "没人向你递信封，也没人说交换条件。你只是听见了对方最担心的评审条款，以及他们愿意追加的资源。散席时负责人替你叫了车：‘今晚就是交个朋友。’回程很顺，你却想不起这顿饭该记在私人交往还是项目接触里。" }
    ]
  },
  {
    id: "followup_dinner_hosted", category: "work", title: "发票上的六个人", roleLevels: [5, 6, 7], once: true,
    requiresFlags: ["dinnerHosted"], afterEvent: { id: "city_private_dinner", years: 1 },
    body: "企业内部审计把那顿饭列为项目招待，发票备注里有六个人的姓。合作项目此后进展不错，更让问题变得难讲：一顿饭是否影响过判断，没有人能替你证明。项目组问，要不要把接触补进档案。",
    choices: [
      { text: "补充登记并接受对相关决策的独立复核", effects: { integrity: -3, trust: -3, performance: -2 }, outcome: "复核没有简单宣布所有决策无效，却指出你当时没有及时披露接触。项目成绩仍然存在，程序上的亏欠也没有被成绩抵消。你第一次发现，最难说明的不是收了多少，而是自己究竟从什么时候开始觉得这很正常。" },
      { text: "强调席间未谈中选，拒绝把普通聚餐定性为请托", effects: { integrity: -9, trust: -6, performance: 1 }, outcome: "你的陈述没有虚构内容：确实没人说‘请把项目给我’。但发票、项目节点和席间谈过的条款仍摆在一起。合作进度没有停，你在几次会议上也照常发言，只是每当有人提‘项目外沟通’，会场都会短暂安静。" }
    ]
  },
  {
    id: "province_relative_subcontract", category: "work", title: "表弟的名片", roleLevels: [7, 8, 9], once: true,
    body: "栖原省一项公共设施工程准备确定总承包方案。多年不联系的表弟忽然来家里，给父母带了土特产，又把名片压在水果箱下：‘我不碰总包，就做一点分包。你不用打招呼，把名片递给能做主的人就行。都是一家人，连这点门路都不能给吗？’母亲在厨房里假装没有听见。",
    choices: [
      { text: "退回名片和礼物，说明亲属关系并不介入", effects: { integrity: 6, family: -3, trust: 2 }, flags: { relativeProjectRefused: true }, outcome: "表弟提着水果箱走得很快，母亲追到门口也没叫住。她回来只说：‘你有你的难处。’这句话比责怪更沉。第二天你完成了关系说明，工作上没有人多问；家庭群里，表弟把你设置成了消息免打扰。" },
      { text: "只发送公开报名信息，不替他联系任何人", effects: { integrity: 3, family: 1, ability: 1 }, flags: { relativeProjectPublic: true }, outcome: "你把公开页面发给表弟，并写明不会询问结果。他回了个大拇指，过一会儿又问：‘材料递上去以后，你总能帮我看看缺什么吧？’你没有回复第二个问题。把同一扇公开的门指给亲人很容易，拒绝陪他走捷径才是后半段。" },
      { text: "把名片转给总包负责人，请对方在同等条件下考虑", effects: { family: 4, performance: 2, integrity: -9, trust: -2 }, flags: { relativeProjectIntroduced: true }, outcome: "你没有要求照顾，只说了一句‘有机会可以了解一下’。负责人答得很圆：‘符合条件当然欢迎。’表弟当晚就在家庭群里发了红包，说总算有人把他当自家人。你没领，却清楚那张名片已经因为你的身份获得了不同的重量。" }
    ]
  },
  {
    id: "followup_relative_introduced", category: "work", title: "同等条件", roleLevels: [7, 8, 9], once: true,
    requiresFlags: ["relativeProjectIntroduced"], afterEvent: { id: "province_relative_subcontract", years: 1 },
    body: "表弟的公司进入备选分包名单。纸面条件确实合格，却不是唯一合格的那家。总包负责人来汇报时特意补了一句：‘我们完全按同等条件考虑。’他把‘同等’两个字说得很重。母亲则转来表弟的语音：‘我没让你白帮，活干好了也是给你争气。’",
    choices: [
      { text: "补充披露此前转递名片，退出相关协调", effects: { integrity: -2, trust: -3, performance: -2, family: -2 }, outcome: "名单交给独立人员重新核验。表弟在电话里问你为什么非要把小事闹大，你说因为那句‘同等条件’已经没法只靠自己相信。结果尚未确定，你先失去了家里那份好不容易缓和的热络。" },
      { text: "要求用统一量化标准复核全部备选方", effects: { ability: 3, integrity: 1, health: -2, family: -1 }, outcome: "统一标准让差异更清楚，也暴露出原清单有几处模糊空间。表弟的公司没有被单独剔除，也没有因那张名片保留。母亲问你最后能不能选上，你只能回答：‘现在我也不该提前知道。’" },
      {
        text: "认可原名单，让负责人按既定方案推进",
        effects: { performance: 3, family: 3, integrity: -8, trust: -3 },
        flags: { relativeProjectFavored: true },
        accountability: {
          dutyAbuse: 1, caseStatus: "unreported",
          note: "责任记录：未披露亲属关系，继续推动亲属公司进入分包名单。"
        },
        outcome: "你没有再提表弟，也没有在文件上留下额外意见，只批了‘按程序推进’。负责人临走前说了一句‘明白’，表弟当晚则在家庭群里发来开工照片。所有手续表面齐全，只有那张被你递出去的名片没有出现在任何一页材料里。"
      }
    ]
  },
  {
    id: "followup_relative_payment", category: "work", title: "验收前的三百万", roleLevels: [7, 8, 9, 10], once: true,
    requiresFlags: ["relativeProjectFavored"], afterEvent: { id: "followup_relative_introduced", years: 1 },
    body: "表弟的公司拿到分包后，复检发现一批排水构件强度不合格，返工会错过年度验收。汇报会前，他给你转来三百万元，说是‘家里早年投资的分红’：‘让他们先验收，我保证明年全换。这和项目没有关系。’窗外，负责人已经抱着验收意见等候签字。",
    choices: [
      {
        text: "拒收并报告关系，暂停验收、独立复检",
        effects: { integrity: 5, performance: -6, family: -8, trust: 3 },
        flags: { relativePaymentRefused: true },
        accountability: {
          cooperation: 1, caseStatus: "review",
          note: "责任记录：拒收三百万元并报告亲属关系，项目进入独立复检。"
        },
        outcome: "转账原路退回，验收也停了。复检确认需要返工，年度目标因此落空。表弟在电话里第一次连名带姓地骂你，母亲坐在客厅没有劝任何一边。你知道现在报告仍然太晚，但至少没有让不合格构件跟着沉默一起埋进地下。"
      },
      {
        text: "收下转账，但要求返工合格后再验收",
        effects: { integrity: -20, trust: -10, performance: -4, family: 2, health: -5 }, assetChange: 300,
        flags: { relativeCaseCharged: true },
        accountability: {
          acceptedValue: 300, retainedValue: 300, dutyAbuse: 1, caseStatus: "prosecution", sentenceExposure: 7,
          note: "责任记录：收受三百万元；虽然要求返工，资金往来与此前职务关照形成案件线索。"
        },
        outcome: "你要求项目返工，却没有退回转账。表弟以为钱能买到验收，你则告诉自己至少守住了质量。后续审计从这笔所谓‘分红’查到那张名片和分包名单，案件经调查后被移送审查起诉。你终于发现，守住一条线不能抵消跨过另一条线。"
      },
      {
        text: "收下转账，让负责人先通过验收",
        effects: { integrity: -24, trust: -18, performance: 5, family: 3, health: -6 }, assetChange: 300,
        flags: { relativeCaseCharged: true },
        accountability: {
          acceptedValue: 300, retainedValue: 300, dutyAbuse: 2, concealment: 1, publicHarm: 2,
          caseStatus: "prosecution", sentenceExposure: 12,
          note: "责任记录：收受三百万元并推动不合格工程通过验收，造成公共项目损失。"
        },
        outcome: "验收意见改成了‘限期整改后复查’，项目按时计入年度成绩。第二年暴雨后，返修路段再次开挖，审计人员顺着异常支出查到分包关系和三百万元转账。调查、起诉接踵而至；那句‘明年全换’，最终和破损构件一起成为案卷的一部分。"
      }
    ]
  },
  {
    id: "followup_relative_judgment", category: "work", title: "审判席上的旧名片", roleLevels: [7, 8, 9, 10], once: true,
    requiresFlags: ["relativeCaseCharged"], afterEvent: { id: "followup_relative_payment", years: 1 },
    body: "案件进入审判。检方出示了名片转递、分包名单、验收记录、三百万元转账和项目复检材料。云岑、澄川、栖原都只是虚构地名，但今天摆在你面前的每一个选择，都是这局人生确实走过的记录。",
    choices: [
      {
        text: "如实作最后陈述，不再把责任推给经办人员",
        effects: { family: -8, health: -6, trust: -12 },
        accountability: {
          convictFromExposure: true,
          note: "司法结局：本段为虚构剧情，判处有期徒刑 {{sentenceYears}} 年，并处罚金，违法所得依法追缴。"
        },
        outcome: "法庭依法作出判决：有期徒刑 {{sentenceYears}} 年，并处罚金，违法所得依法追缴。离开审判席前，你最后看见的是证物袋里的那张名片——当初只需把它退回去，后面的许多页就不会写下。"
      },
      {
        text: "由辩护人依法完成陈述，接受法院裁判",
        effects: { family: -7, health: -7, trust: -12 },
        accountability: {
          convictFromExposure: true,
          note: "司法结局：本段为虚构剧情，判处有期徒刑 {{sentenceYears}} 年，并处罚金，违法所得依法追缴。"
        },
        outcome: "法庭根据查明的事实作出判决：有期徒刑 {{sentenceYears}} 年，并处罚金，违法所得依法追缴。依法辩护没有被设计成惩罚项；真正决定这页履历的，是此前收钱、关照项目和处理质量问题的选择。"
      }
    ]
  }
];

ETHICS_STORIES.forEach((event) => { event.contentTag = "利益抉择 · 虚构剧情"; });

module.exports = { ETHICS_STORIES };
