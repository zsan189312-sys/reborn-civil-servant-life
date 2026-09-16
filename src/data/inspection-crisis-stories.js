"use strict";

// 利益围猎、监督检查与突发危机。每个事件拥有独立的人物关系、
// 场景道具和戏剧主题，避免把“有人送钱”机械换皮。
const INSPECTION_CRISIS_STORIES = [
  {
    id: "crisis_three_dinner_tables", category: "work", once: true, roleLevels: [1, 2, 3, 4, 5, 6], storyTheme: "banquet-three-networks",
    title: "三个包间，都给你留了主位",
    body: "同一晚三条消息同时弹出：企业家局说有产业内幕，媒体人局说有匿名爆料，老同学局说‘真没事，就想看你还会不会抢最后一块肉’。司机问往哪开，你发现成年人的选择题连夜宵都带后果。",
    choices: [
      { text: "去媒体人那桌，只听可公开核实的线索", effects: { ability: 3, trust: 2, health: -2 }, outcome: "爆料里真有一条异常招标线索，也混着两条私人恩怨。你没接材料原件，只记下公开查询路径。散席时对方说你谨慎，你说胃可以冒险，程序不行。" },
      { text: "去老同学那桌，把职位留在包间门外", effects: { family: 4, health: 2, performance: -1 }, outcome: "主位最后坐了班里最胖的老班长。没人问项目，只翻出你当年欠过的饭票。回家路上你没多一条情报，却想起自己还不只是履历上的那行职务。" },
      { text: "去企业家那桌，先把饭钱和话题边界说清", effects: { ability: 2, integrity: 2, trust: 1 }, outcome: "你坚持AA，也没接对方递来的项目清单。席间听到的行业困难被带回去走公开调研，所谓‘内幕’则留在了饭桌。老板叹气：‘您这饭，吃得像会议。’" }
    ]
  },
  {
    id: "crisis_banquet_bid_price", category: "work", once: true, roleLevels: [2, 3, 4, 5, 6, 7], storyTheme: "banquet-bid-intelligence",
    title: "醒酒汤旁边，躺着竞争对手的底价",
    body: "招标前夜，承包商彭总把你请进一场‘纯朋友饭局’。第三杯刚满，他推来一张纸：竞争对手的测算底价。服务员又端来醒酒汤，彭总笑道：‘汤是真的，朋友也是真的，明天帮我少走一个弯路。’",
    choices: [
      { text: "纸不碰、酒不喝，登记接触并回避评审", effects: { integrity: 7, performance: -2, trust: 2 }, outcome: "彭总一路把你送到门口，嘴上还说只是行业交流。你把接触经过完整登记，评审换了人。第二天，那张纸成了调查泄密来源的线索，不再是你的捷径。" },
      { text: "带同事在场听诉求，只谈公开规则", effects: { ability: 3, integrity: 3, health: -1 }, outcome: "你把包间临时开成政策答疑会，彭总准备好的敬酒词全没用上。他确实反映了一处不合理条款，按公开程序得到修正，但底价纸始终没有展开。" },
      { text: "收下三万元‘咨询费’，暗示他调整报价", effects: { integrity: -13, performance: 4, trust: -3 }, accountability: { acceptedValue: 3, retainedValue: 3, dutyAbuse: 1, concealment: 1, caseStatus: "unreported", note: "在招标前收受三万元，并向特定投标人泄露可能影响公平竞争的信息。" }, outcome: "彭总第二天的报价像长了眼睛，刚好压在关键位置。项目表面省了钱，你也多了三万元；只有泄密调查开始时，那碗没人喝的醒酒汤还在监控里冒热气。" }
    ]
  },
  {
    id: "crisis_hotel_keycard", category: "work", once: true, roleLevels: [3, 4, 5, 6, 7, 8, 9], storyTheme: "ambiguous-hotel-lure",
    title: "门卡压在名片下面",
    body: "考察活动结束，项目中间人许曼递来名片，下面还压着酒店门卡。她不避讳暧昧，也不急着谈钱：‘上楼聊十分钟，我知道你们最想听的那组数据。’她代理的企业，正在等一项关键批复。",
    choices: [
      { text: "把门卡退回，在大厅请同事共同记录接触", effects: { integrity: 7, ability: 2, trust: 1 }, outcome: "许曼把名片收得很慢：‘您真不怕得罪人。’你说怕，所以才要把边界摆在有监控、有同事的地方。她最终只提交了公开材料，暧昧没能替项目走快一步。" },
      { text: "不赴约，要求企业次日走正式数据核验", effects: { integrity: 5, performance: -1, health: 2 }, outcome: "第二天，所谓神秘数据少了滤镜，只是一份口径未经核验的预测。企业抱怨你不懂效率，你却省下了一场可能说不清是谈项目还是谈感情的夜谈。" },
      { text: "上楼赴约，收下名表并透露批复节点", effects: { integrity: -16, performance: 3, family: -5 }, accountability: { acceptedValue: 2, retainedValue: 2, dutyAbuse: 2, concealment: 1, caseStatus: "unreported", note: "接受利益关系人的私密邀约和名表，并泄露项目批复节点。" }, outcome: "十分钟变成两个小时。离开时，名表在手腕上，批复节点在对方手机里。你告诉自己没有承诺结果，可监控拍下的门卡、通话和腕表，已经替这晚写了注脚。" }
    ]
  },
  {
    id: "crisis_inspection_route", category: "work", once: true, roleLevels: [0, 1, 2, 3, 4, 5, 6], storyTheme: "superior-inspection-staging",
    title: "检查路线干净得像刚拆封",
    body: "上级检查明早到。办公室连夜设计了一条‘零问题路线’：把欠薪工人引到后门、把空台账换成样板册、再安排一位最会背答案的大爷。年轻同事问你：‘我们是迎检，还是拍戏？’",
    choices: [
      { text: "取消表演路线，把三个真问题和整改表放桌上", effects: { integrity: 6, trust: 4, performance: -3 }, outcome: "检查组看到欠薪、空台账和没背台词的大爷，脸色不算好看，却逐项留下整改要求。你的汇报不漂亮，但一个月后再回头，问题比横幅少得更快。" },
      { text: "保留路线，但随机抽点、随机访谈", effects: { ability: 4, integrity: 3, performance: -1 }, outcome: "原定路线走了一半就转向，提前背答案的人派不上用场。现场暴露两个问题，也证实一项工作确实有效。检查不再像演出，大家反而没那么忙着藏道具。" },
      { text: "照剧本演完，问题材料先锁进空会议室", effects: { performance: 5, integrity: -12, trust: -5 }, accountability: { dutyAbuse: 1, concealment: 2, publicHarm: 1, caseStatus: "review", note: "为应对检查隐瞒真实问题并提供失实台账，相关责任进入核查。" }, outcome: "检查组一路点头，大爷把答案背得比你还熟。可欠薪工人在后门开了直播，镜头一转，空会议室里堆着的问题材料比样板册厚三倍。戏演完了，舆情刚开场。" }
    ]
  },
  {
    id: "crisis_inspection_notebook", category: "work", once: true, roleLevels: [2, 3, 4, 5, 6, 7, 8, 9], storyTheme: "discipline-inspection-notebook",
    title: "巡视组问的，正是你最想跳过的三页",
    body: "巡视谈话前，你翻出一本旧通讯录。三页上记着‘饭局认识’‘请托待回’和几笔只写姓氏的数字。办公室门外已经有人等你，同事小声问：‘要不要先把这本处理掉？’碎纸机像突然醒了，嗡了一声。",
    choices: [
      { text: "原样提交，逐条说明哪些已拒绝、哪些未处置", effects: { integrity: 7, health: -3, trust: 2 }, outcome: "三页讲了整整一下午。有些记录只是正常工作，有些边界确实含糊。巡视人员要求补充说明，你保住的不是面子，而是材料前后还能对得上。" },
      { text: "先自查核对，再连同往来凭证主动报告", effects: { integrity: 5, ability: 3, performance: -2 }, outcome: "通讯录和支付记录一笔笔核对，两个没处理干净的礼品被补登记退回。谈话不轻松，但你不用猜碎纸屑能不能被拼回来，复核也终于有纸有据。" },
      { text: "撕掉三页，只带一本‘干净得过分’的本子", effects: { integrity: -14, health: -5 }, accountability: { concealment: 3, caseStatus: "investigation", note: "在监督检查前毁损可能涉及利益往来的记录，相关事实被进一步核查。" }, outcome: "本子干净了，装订线却留下三道新鲜毛边。巡视人员翻到那里，什么也没问，只让人调取门口监控和碎纸清运记录。你突然听见，碎纸机其实一直很响。" }
    ]
  },
  {
    id: "crisis_audit_old_invoice", category: "work", once: true, roleLevels: [2, 3, 4, 5, 6, 7, 8, 9], storyTheme: "audit-invoice-chain",
    title: "审计翻出一张会走路的发票",
    body: "审计风暴扫到六年前的工程：同一张设备发票先在甲项目报销，又换了抬头出现在乙项目。供应商老板拎着新合同赶来：‘旧票作废，新票补上，大家都省事。’他把合同翻到签字页，里面夹着六万元购物卡。",
    choices: [
      { text: "暂停付款，封存原始凭证并追查资金去向", effects: { integrity: 7, ability: 4, performance: -3 }, outcome: "一张票牵出三家关联公司和两次重复报销。项目进度停了，资金却追回来。供应商抱怨你把小问题做大，审计人员说，是小票自己走了太远。" },
      { text: "请第三方复核全部同类合同，自己回避处理", effects: { integrity: 5, trust: 2, performance: -2 }, outcome: "复核范围扩大后，既查到问题，也洗清了几笔被误解的正常支出。你退出具体处置，没有靠一句‘年代久远’把责任推给档案室。" },
      { text: "收下购物卡，让新合同把旧票‘覆盖’掉", effects: { integrity: -17, performance: 5, trust: -4 }, accountability: { acceptedValue: 6, retainedValue: 6, dutyAbuse: 2, concealment: 2, publicHarm: 1, caseStatus: "unreported", note: "收受六万元购物卡，并通过补签合同掩盖重复报销问题。" }, outcome: "新合同盖住旧票，购物卡藏进抽屉。你以为账面已经闭环，审计数据却把两次付款连成一条直线。纸会旧，转账时间不会，补签也没让旧账失忆。" }
    ]
  },
  {
    id: "crisis_anonymous_report", category: "work", once: true, roleLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9], storyTheme: "anonymous-report-screenshot",
    title: "匿名举报信，连你的口头禅都写对了",
    body: "一封匿名举报信附着饭局截图、车辆进出时间和你常说的那句‘先把事办了’。内容有夸大，也有两处细节只有身边人知道。秘书气得拍桌：‘肯定是内部人，我先把他揪出来。’",
    choices: [
      { text: "先核事实，不查举报人；把相关事项交叉复核", effects: { integrity: 6, ability: 3, trust: 2, health: -2 }, outcome: "复核证明大半是误读，却发现一场饭局确实没有按要求登记。你补正记录并回避后续事项。匿名人没被揪出来，问题也没被情绪盖住。" },
      { text: "主动说明截图背景，请监督人员独立核查", effects: { integrity: 7, performance: -2, family: -2 }, outcome: "你把行程、付款记录和接触对象一次性交出。核查期间难免议论，结论出来后，失实部分被澄清，真实疏漏也被处理。最难受的几天，没有被省略。" },
      { text: "先查谁泄密，再让知情下属统一口径", effects: { integrity: -13, trust: -7, performance: 2 }, accountability: { dutyAbuse: 1, concealment: 2, caseStatus: "investigation", note: "利用职务影响追查举报来源，并要求相关人员统一不实口径。" }, outcome: "匿名人暂时没找到，统一口径的聊天记录却先被截了图。第二封举报信标题只有七个字：‘他们开始找我了。’事情从饭局疑点，变成了对监督的干扰。" }
    ]
  },
  {
    id: "crisis_livestream_microphone", category: "city", once: true, roleLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9], storyTheme: "public-opinion-live-microphone",
    title: "直播没关，内部话先出圈了",
    body: "突发停水处置会上，工作人员以为直播已结束，随口说了句：‘先挑个好解释。’三分钟后，这句话冲上热榜。评论区认定你们只想甩锅，供水抢修队却还在地下两米找爆点。",
    choices: [
      { text: "立刻续播：承认措辞错误，公开抢修时间线", effects: { trust: 5, integrity: 4, performance: -1, health: -3 }, outcome: "镜头重新打开时，评论区并不客气。你承认表达失当，展示停水范围、送水点和每小时进度。爆点修好后热度慢慢退去，留下的时间线比辩解更有用。" },
      { text: "让抢修负责人讲现场，你负责回答追问", effects: { ability: 4, trust: 4, health: -4 }, outcome: "负责人满身泥进了直播间，第一句话是‘解释不能出水，管子能’。技术问题被讲明白，你也回答了补偿和追责。舆情没瞬间反转，却从骂战变回了问题清单。" },
      { text: "先删视频、联系平台降热度，等修好再回应", effects: { performance: 2, trust: -10, integrity: -6 }, outcome: "原视频删了，录屏却多出几十个版本。抢修按时完成，公众仍在追问为什么先处理声音、不先处理问题。你赢了几个小时，输了整条时间线。" }
    ]
  },
  {
    id: "crisis_family_watch", category: "life", once: true, minYear: 10, roleLevels: [2, 3, 4, 5, 6, 7, 8, 9], storyTheme: "family-hidden-watch",
    title: "家人从米缸里翻出一块表",
    body: "家里找量杯时，从米缸深处翻出一块价格不菲的手表。伴侣把表放到饭桌正中：‘你说这是朋友送的，那为什么要藏在米里？’孩子正好推门进来，空气突然比谈话室还安静。",
    choices: [
      { text: "当着家人说明来源，立即登记上交并申请核查", effects: { integrity: 7, family: -4, health: -3 }, accountability: { retainedValue: -999, cooperation: 2, caseStatus: "review", note: "主动说明手表来源、上交财物并接受核查。" }, outcome: "饭没吃完，你先把来源和相关事项写清。家人没有立刻原谅，只说：‘先把该做的做了。’表被上交，家里的信任却只能一顿饭一顿饭慢慢补。" },
      { text: "承认判断失当，联系对方在见证下退回", effects: { integrity: 4, family: -3, trust: 1 }, accountability: { retainedValue: -999, cooperation: 1, caseStatus: "review", note: "在家人发现后退回不当礼品并补充报告。" }, outcome: "对方在电话里反复说你太见外，见证人在旁边逐项记录。伴侣听完只问一句：‘如果今天没找量杯呢？’你答不上来，但至少不再让米缸替你保密。" },
      { text: "让伴侣说是自己买的，先把这一关糊过去", effects: { integrity: -14, family: -10, health: -4 }, accountability: { concealment: 2, caseStatus: "investigation", note: "要求家属对高价礼品来源作不实说明，进一步加重隐瞒情节。" }, outcome: "伴侣看了你很久：‘你要我帮你，还是要我替你撒谎？’孩子在门外没进来。表还在桌上，这一晚先碎掉的不是证据，是家里原本以为不会互相推卸的那点信任。" }
    ]
  }
];

module.exports = { INSPECTION_CRISIS_STORIES };
