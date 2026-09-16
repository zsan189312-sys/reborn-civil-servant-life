"use strict";

const MORE_SECTOR_STORIES = [
  {
    id: "dept_natural_map_line", category: "work", once: true, roleLevels: [2, 6, 9], storyTheme: "natural-resources",
    title: "地图上那根线，正好穿过人家厨房",
    body: "产业园规划图画得很漂亮，老许却抱着锅来了：‘这条红线从我家厨房穿过去，是征房还是征锅？’设计单位说底图比例小，投资方催你别为一户人改节点。老许把锅往桌上一放，会议突然有了音效。",
    choices: [
      { text: "暂停点位确认，带测绘人员到现场复核", effects: { ability: 4, integrity: 4, performance: -2 }, outcome: "红线真偏了十几米，还压到另外两户附属房。图改完，投资方多等一周，老许也把锅带回去做饭。项目没被一口锅拖黄，反而少埋了三颗以后会爆的雷。" },
      { text: "公示备选线位，让受影响住户逐一确认", effects: { trust: 4, ability: 3, health: -2 }, outcome: "村民把地图围得水泄不通，设计人员第一次听懂哪条是灌溉渠、哪间不是杂房。方案慢下来，却从电脑里的红线变成了地面上大家能认出的边界。" },
      { text: "按原图推进，误差等征迁时再校正", effects: { performance: 4, trust: -6, integrity: -5 }, outcome: "节点按时过了，征迁队到现场第一天就停工。老许把锅挂在红线上直播：‘规划说这是产业用地，我说这是午饭。’你省下的一周，后来用三个月来补。" }
    ]
  },
  {
    id: "dept_water_gate_fish", category: "work", once: true, roleLevels: [2, 9], storyTheme: "water-allocation",
    title: "上游要放水，下游的鱼先开会了",
    body: "持续干旱，上游果园要灌溉，下游养殖户怕水位一降鱼塘缺氧。养殖户指着翻白肚的鱼说：‘它们意见很统一。’果农回他：‘我的树连翻肚子的机会都没有。’水利人员看着你，三套方案一套比一套得罪人。",
    choices: [
      { text: "按实时水量分时供水，鱼塘同步增氧", effects: { ability: 5, trust: 3, performance: 1, health: -3 }, outcome: "水闸半夜也在调整，果园先保关键生长期，鱼塘借来增氧设备。两边都嫌水少，却能看到每小时流量。鱼没再翻肚，果树也没等到一份只写原则的通知。" },
      { text: "先保生活与生态底线，剩余水量轮灌", effects: { integrity: 4, trust: 2, performance: -1 }, outcome: "底线先锁住，剩余水按地块轮转。有人骂方案保守，也有人偷偷多开闸，被巡查及时制止。水不够分出皆大欢喜，只能把每次取舍摆在阳光下。" },
      { text: "先满足种植面积更大的上游果园", effects: { performance: 3, trust: -6, ability: -3 }, outcome: "果园缓过来，下游鱼塘却在第二天出现损失。面积让表格很好算，活物的承受时间却没写进那一列。养殖户把死鱼排在水闸边，谁也没心情继续开会。" }
    ]
  },
  {
    id: "dept_forestry_monkey", category: "work", once: true, roleLevels: [2, 7], storyTheme: "wildlife-tourism",
    title: "猴子学会了抢游客的自拍杆",
    body: "景区猴群被游客喂得越来越大胆，今天抢走三根自拍杆和一袋药。商户说猴子是流量密码，护林员说再不管就要出事。正说着，一只猴子坐在栏杆上熟练拆开薯片，像会议里的第四方代表。",
    choices: [
      { text: "划禁喂区、撤近距离摊位，专业引导猴群", effects: { trust: 3, integrity: 3, performance: -1 }, outcome: "商户少了几天生意，护林员多了几趟巡护。猴子不再天天守着游客开饭，景区也把‘别喂’从小牌子改成真管理。流量少一点，抓伤风险也少一点。" },
      { text: "限量预约入园，现场反复讲清投喂后果", effects: { ability: 3, trust: 2, performance: 2 }, outcome: "游客少了，秩序好了，仍有人偷偷塞花生。护林员抓现行时，猴子在旁边比谁都着急。景区把管理和科普一起做，没再拿野生动物当演员。" },
      { text: "保留互动项目，只让商户换安全包装", effects: { performance: 4, trust: -5, integrity: -3 }, outcome: "包装更结实，猴子也更有挑战精神。没多久，一名游客为抢回包被抓伤。商户说以前都没事，你发现自己优化的是抢夺难度，不是风险。" }
    ]
  },
  {
    id: "dept_commerce_coupon", category: "work", once: true, roleLevels: [6, 9], storyTheme: "commerce-subsidy",
    title: "消费券刚上线，火锅店先涨了二十",
    body: "消费券上线当天，火锅店把套餐从198改成218，再贴上‘满200减20，政府请客’。老板说是原料涨价，网友算完账说只收到一张电子心理安慰券。商务部门问你要不要先下架活动。",
    choices: [
      { text: "核对历史价格，违规商户退出并退回补贴", effects: { integrity: 5, ability: 3, performance: -1 }, outcome: "几家门店暂停参与，真实涨价和借券抬价分开核查。老板发长文喊冤，网友只回了一张旧菜单。消费券重开时，页面多了历史价格提示。" },
      { text: "公开价格监测，给商户申诉和退款入口", effects: { trust: 4, ability: 3, health: -2 }, outcome: "消费者上传小票，商户提交成本变化证据。数据一多，谁真涨价、谁蹭补贴很快分开。活动没被一锅端，锅底里的账也不再靠口水算。" },
      { text: "先保活动热度，价格问题结束后再总结", effects: { performance: 4, integrity: -6, trust: -5 }, outcome: "核销数字一路涨，吐槽榜也一路涨。总结写着拉动消费显著，网友在下面补了一句：主要拉动了套餐原价。活动最后成了全民算术竞赛。" }
    ]
  },
  {
    id: "dept_science_robot_report", category: "work", once: true, roleLevels: [6, 9], storyTheme: "science-project",
    title: "机器人会敬礼，不会干活",
    body: "科技项目验收现场，机器人一见你就敬礼。你让它搬箱子，它原地转两圈，播报‘今天也要元气满满’。企业说核心能力还在训练，验收组悄悄建议：先拍宣传片，性能以后补。",
    choices: [
      { text: "按合同逐项实测，敬礼不算核心指标", effects: { ability: 4, integrity: 5, performance: -2 }, outcome: "宣传片没拍成，验收表却第一次写清哪些能做、哪些只是演示。企业延期整改，机器人临走又给你敬了个礼。你回礼了，但没给它通过。" },
      { text: "分阶段验收，未完功能对应款项暂缓", effects: { performance: 2, integrity: 3, ability: 3 }, outcome: "能用的模块先试点，搬箱子和稳定性继续测试，钱也跟着真实进度走。企业少了一张完美成绩单，却保住了继续改的机会。" },
      { text: "先通过验收，创新不能用传统眼光看", effects: { performance: 5, integrity: -7, trust: -3 }, outcome: "机器人上了新闻，半年后仍只会敬礼和喊口号。审计问核心功能在哪，企业把宣传片发了过来。镜头很创新，验收证据一点也不创新。" }
    ]
  },
  {
    id: "dept_data_grandma_face", category: "work", once: true, roleLevels: [3, 6, 9], storyTheme: "digital-accessibility",
    title: "系统认不出奶奶，奶奶认出了系统毛病",
    body: "人脸识别连续失败，唐奶奶对着摄像头眨了十次眼，机器还说‘请保持自然’。她问你：‘我都自然老了，它怎么还不自然？’窗口说只能线上认证，技术公司说准确率99%。",
    choices: [
      { text: "开人工核验通道，把失败样本纳入整改", effects: { trust: 5, ability: 3, performance: -1 }, outcome: "唐奶奶当天办成，技术公司也拿到一批被忽略的失败样本。它的99%没被一脚踢翻，却必须回答剩下1%是不是只能一直眨眼。" },
      { text: "安排工作人员协助，保留线下兜底窗口", effects: { integrity: 3, trust: 3, health: -1 }, outcome: "换光线、换设备后终于认证成功，线下窗口也没有被撤。唐奶奶临走对机器说：‘你慢慢学，下次争取认得我。’" },
      { text: "请家属代办，系统总体准确率没有问题", effects: { performance: 2, trust: -6, ability: -3 }, outcome: "家属请假赶来办完，系统报表仍保持99%。唐奶奶总结得比报告清楚：机器没认出我，最后扣的是我女儿的工资。" }
    ]
  },
  {
    id: "dept_audit_two_invoices", category: "work", once: true, roleLevels: [4, 6, 9], storyTheme: "audit-expense",
    title: "同一顿饭，长出了两张发票",
    body: "审计发现同一晚餐既报招商接待，又报项目调研。经办人解释：‘财务太认真，报了两次。’饭局名单里还有你熟悉的老同学。财务科长低声说：‘退一张就平了，别把小错搞大。’",
    choices: [
      { text: "钱先退，责任和真实用餐人员继续查清", effects: { integrity: 5, ability: 3, performance: -1 }, outcome: "重复款当天退回，核查没有结束。最终发现有人拆分接待用途规避审核，老同学只是临时凑桌。小错没被夸成大案，也没用退款洗成从未发生。" },
      { text: "封存凭证，让经办、审批和财务分别说明", effects: { ability: 4, integrity: 4, health: -2 }, outcome: "三份说明互相对不上，真实目的很快浮出来。财务并非太认真，而是没人愿意退回领导签过的单。流程问题和人的问题没有挤进同一个‘疏忽’。" },
      { text: "退回一笔就结项，年底别再增加问题数", effects: { performance: 3, integrity: -8, trust: -3 }, outcome: "账面平了，底稿却留着两张发票。复核问为何没追查重复审批，你只能说问题已经解决。可他们最想知道的，正是你为什么急着宣布解决。" }
    ]
  },
  {
    id: "dept_hr_classmate_resume", category: "work", once: true, roleLevels: [4, 6, 9], storyTheme: "personnel-boundary",
    title: "简历没署名，微信头像署了",
    body: "公开招聘前，老同学发来一份没写名字的简历：‘帮我看看竞争力。’下一条却是他女儿的自拍照，还补一句‘孩子从小懂事’。你不参与命题，但会参加最后的集体研究。",
    choices: [
      { text: "不评价个人，申报关系并退出相关环节", effects: { integrity: 6, family: -2, trust: 1 }, outcome: "老同学说你想多了，还是撤回了那句‘懂事’。招聘按统一标准进行，你也没接触她的成绩。最后是否入围，都不需要靠大家相信你只看过一眼。" },
      { text: "只发公开岗位条件，不接收私人简历", effects: { integrity: 4, ability: 1, family: -1 }, outcome: "你把官网链接发过去，老同学回了个叹气表情。后来又问报名入口，你仍只回公开信息。友情降了点温，规则没替任何人开小灶。" },
      { text: "私下告诉他哪些经历更容易拿高分", effects: { family: 3, integrity: -8 }, accountability: { dutyAbuse: 2, concealment: 1, note: "公开招聘前向关系人定向透露评价侧重点。" }, outcome: "简历很快按提示改好，像提前见过评分表。另一名考生投诉后，老同学还在群里炫耀‘有人指导过’。你没改分数，却帮一个人先看了路标。" }
    ]
  },
  {
    id: "dept_urban_signboard", category: "work", once: true, roleLevels: [2, 6], storyTheme: "urban-management",
    title: "招牌统一以后，整条街像复制粘贴",
    body: "老街改造要求商铺换统一招牌。装完一看，包子铺、修鞋店和书店全是同一种灰字，老板都差点走错门。设计公司说这叫高级感，修鞋师傅问：‘高级到客人找不到我，算谁的？’",
    choices: [
      { text: "保留安全尺度，让商户重新设计自己的脸", effects: { trust: 5, ability: 3, performance: -2 }, outcome: "返工花了时间，街道却慢慢活回来。包子铺画蒸汽，修鞋店挂回旧楦头，书店留下一盏小灯。统一的是安全和尺寸，不是把每家店都做成同一个人。" },
      { text: "挑一段试点调整，边营业边收集意见", effects: { performance: 3, trust: 2, ability: 2 }, outcome: "试点那段先改，其他商户每天围观。设计公司不得不坐进店里听老板讲生意，最后拿出有边界但不撞脸的方案。高级感没消失，只是不再高到认不出门。" },
      { text: "维持统一方案，审美需要时间适应", effects: { performance: 4, trust: -6, integrity: -2 }, outcome: "验收照片整齐得像效果图，营业额却不认效果图。游客把‘找出真正包子铺’拍成挑战视频，设计公司获得流量，商户只获得更多问路的人。" }
    ]
  },
  {
    id: "dept_museum_cat", category: "work", once: true, roleLevels: [6, 9], storyTheme: "culture-preservation",
    title: "博物馆镇馆之宝，是门口那只猫",
    body: "博物馆花钱做新展，参观者寥寥，门口一只胖猫却天天上热搜。馆长想让猫当代言，文保专家怕大家只撸猫不看展，消防人员又说猫窝堵了半个通道。猫本人正在意见表上睡觉。",
    choices: [
      { text: "猫窝先挪开，把猫流量导进真实展览", effects: { ability: 3, trust: 4, performance: 1 }, outcome: "博物馆做了‘跟着馆猫巡展’路线，猫只在安全区偶尔营业。游客先来看猫，后来真有人停在古碑前看了十分钟。镇馆之宝没换，讲故事的方法换了。" },
      { text: "小规模试点，文保、消防和运营共同盯", effects: { integrity: 3, performance: 3, trust: 2 }, outcome: "猫有了工牌和固定休息区，通道也重新划线。它并不每天配合，但馆方终于学会不把流量当命令。最受欢迎的照片，是猫背对镜头、游客认真看展。" },
      { text: "趁热度大办馆猫节，安全问题以后优化", effects: { performance: 5, trust: -4, integrity: -4 }, outcome: "首日人潮远超预期，猫躲了，通道堵了，展厅也临时限流。活动没有出大事故，网友总结得很准：官方把一只想睡觉的猫办成了大型会议。" }
    ]
  },
  {
    id: "dept_sports_marathon", category: "work", once: true, roleLevels: [6, 9], storyTheme: "sports-safety",
    title: "马拉松还没鸣枪，雨已经抢跑",
    body: "马拉松前夜突降暴雨，气温也骤降。赞助商说延期损失巨大，跑友群有人喊‘真正的跑者不怕雨’，医疗组只回了一张低温风险表。号码布已经发了，明早那一枪响不响由你决定。",
    choices: [
      { text: "按气象和医疗阈值延期，费用逐项善后", effects: { integrity: 4, trust: 2, performance: -3 }, outcome: "退改信息发出后，评论区骂了一夜。第二天赛道多处积水，很多人转而庆幸没开跑。赞助损失仍要谈，至少不用拿参赛者的体温证明谁更热爱。" },
      { text: "缩短赛程提高门槛，持续监测并设置硬停", effects: { ability: 4, performance: 2, health: -3 }, outcome: "赛事改成短距离，部分选手被劝退，沿途增加保温和医疗点。比赛勉强完成，复盘里也没把一次侥幸写成以后照搬的经验。" },
      { text: "照常开跑，个人可以自行决定参不参加", effects: { performance: 4, integrity: -5, trust: -5 }, outcome: "枪响了，低温不适人数也很快上升。所谓自愿选择没有替组织者卸下安全责任。热搜上的奖牌照片旁边，是一排裹着保温毯的人。" }
    ]
  },
  {
    id: "dept_veterans_photo", category: "work", once: true, roleLevels: [1, 9], storyTheme: "public-service-dignity",
    title: "慰问合影里，老人只露了半张脸",
    body: "节前慰问结束，宣传照片里工作人员站满第一排，受访老人只露半张脸。老人笑着问：‘你们来看我，还是来看你们自己？’摄影师已经开始修图，准备把老人再往边上裁一点。",
    choices: [
      { text: "照片重拍，让慰问对象坐在画面中心", effects: { trust: 5, integrity: 3, performance: -1 }, outcome: "第二张照片没那么整齐，老人却笑得更自然。新闻稿删掉几句套话，补上他真正需要解决的事。慰问不是不许合影，只是别把被慰问的人拍成背景。" },
      { text: "不再摆拍，只记录需求和后续办理结果", effects: { trust: 4, ability: 2, performance: -2 }, outcome: "摄影师放下相机，工作人员逐条核实取暖和就医问题。报道晚两天，发出来的是问题怎么解决。老人转给战友时说：这回我不只剩半张脸。" },
      { text: "沿用原图，宣传版面位置有限", effects: { performance: 3, trust: -6, integrity: -2 }, outcome: "照片准时发布，老人那句话也被现场视频完整收录。网友把两张图放在一起，版面忽然一点也不有限了。你们想展示关心，最后展示的是谁更靠近镜头。" }
    ]
  },
  {
    id: "dept_health_scalper", category: "work", once: true, roleLevels: [3, 9], storyTheme: "healthcare-access",
    title: "专家号没了，黄牛却说还有",
    body: "热门门诊号源每天秒空，医院外的黄牛却拍胸口说‘加五百，明天就有’。院方说系统没漏洞，患者把付款截图递给你：‘他连医生哪天停诊都知道。’黄牛远远看见检查人员，转身走得很专业。",
    choices: [
      { text: "固定线索，查号源流转和内部权限记录", effects: { ability: 4, integrity: 4, performance: -1 }, outcome: "后台日志显示部分退号被固定账号反复抢走，还牵出内部信息泄露。号源规则随即调整。黄牛没被一句严厉谴责吓跑，却被一串真实日志堵住了路。" },
      { text: "增加实名候补和退号随机释放机制", effects: { performance: 3, trust: 3, ability: 2 }, outcome: "患者不用整夜刷新，退号也不再按固定秒点释放。调查继续，黄牛生意先冷下来。制度没替执法完成全部工作，但先拔掉了他最顺手的梯子。" },
      { text: "先清理大厅秩序，系统让医院内部自查", effects: { performance: 3, trust: -5, integrity: -3 }, outcome: "大厅安静了，黄牛转到群里继续接单。医院自查写着未发现明显漏洞，患者第二天又发来成功预约截图。人被赶出视线，生意却没被赶出系统。" }
    ]
  },
  {
    id: "dept_education_parent_group", category: "work", once: true, roleLevels: [2, 9], storyTheme: "education-equity",
    title: "家长群开始竞选‘最懂事家长’",
    body: "学校让家长自愿参与教室改造，群里很快晒出空调、打印机和整套课桌认捐。没跟上的家长被悄悄@，孩子回家问：‘我们家是不是不够支持班级？’校长说没有强迫，只是大家太热情。",
    choices: [
      { text: "叫停班级认捐排名，需求纳入统一保障", effects: { integrity: 5, trust: 4, performance: -2 }, outcome: "接龙撤下，学校列出真正缺口和统一采购计划。热心家长仍可走公开渠道捐助，但不再和孩子座位、班级面子绑在一起。最安静的家长终于不用解释为何没接龙。" },
      { text: "允许匿名自愿捐助，班主任不得经手暗示", effects: { trust: 3, integrity: 3, ability: 2 }, outcome: "捐助转到统一平台，名字和班级评价分开。数额少了，真正需要的设备却更清楚。校长说热情降温了，你回答：不让热情烫到孩子就行。" },
      { text: "提醒不要攀比，但保留现有自愿接龙", effects: { performance: 2, trust: -5, integrity: -4 }, outcome: "老师发了‘严禁攀比’，下一条家长就晒出两台空调订单，还谦虚说只是尽点心意。规则留在群公告里，压力继续顺着@名单往下传。" }
    ]
  },
  {
    id: "dept_finance_subsidy", category: "work", once: true, roleLevels: [6, 9], storyTheme: "fiscal-subsidy",
    title: "补贴名单里，最熟的企业排第一",
    body: "产业补贴初审名单里，老朋友的公司高出第二名0.2分。他发消息：‘这次真靠实力，改天我做东。’偏偏有一项主观分，打分人是他以前的合伙人。所有材料都齐，就是关系没写。",
    choices: [
      { text: "披露关系，主观项由无关联人员重新复核", effects: { integrity: 6, performance: -1, family: -1 }, outcome: "复核后老朋友公司掉到第二，另一家按规则入选。他发来一句‘懂了’，再没提庆祝。你没有认定谁作弊，只是让那0.2分不必靠大家相信熟人会公正。" },
      { text: "复查全部临界项目，不只盯熟人一家", effects: { ability: 4, integrity: 4, health: -2 }, outcome: "复查发现三家都有主观分偏差，标准随即细化。老朋友仍能下轮再报，也没被单独贴标签。麻烦扩大了，公平也不再只是一场针对熟人的表演。" },
      { text: "按现有排名通过，材料和流程毕竟都齐", effects: { performance: 4, integrity: -9 }, accountability: { dutyAbuse: 2, concealment: 1, note: "明知评审存在关联关系仍放任熟人企业获得财政补贴。" }, outcome: "名单顺利公布，落选企业很快查到打分人的历史关系。投诉材料里那0.2分被放大成整页红字。材料齐全没有回答，关系为什么没披露。" }
    ]
  },
  {
    id: "dept_statistics_growth", category: "work", once: true, roleLevels: [6, 9], storyTheme: "statistics-integrity",
    title: "企业还没投产，产值已经先上班了",
    body: "季度数据差一点达标，表里却突然多出一家‘已投产’企业。现场只有保安和两盆绿萝。园区负责人很坦然：‘设备下周到，产值先预填，月底肯定补上。’绿萝长势不错，机器一台没有。",
    choices: [
      { text: "把预填产值退回，按真实状态重新报送", effects: { integrity: 6, performance: -4, trust: 2 }, outcome: "季度增速掉一截，会上空气也跟着降温。企业下月真正投产后再依法入统，数据晚来一步，却没让两盆绿萝提前创造工业产值。" },
      { text: "核查所有临界企业，建立投产证据清单", effects: { ability: 4, integrity: 4, performance: -2 }, outcome: "一查不只这一家，有的有设备没订单，有的有订单没生产。新清单要求能源、票据和现场互相印证。数字不再靠一句‘马上就有’提前上班。" },
      { text: "先保留本季数据，下月再用实际产值冲回", effects: { performance: 5, integrity: -10, trust: -4 }, outcome: "本季顺利达标，下月设备却延期。园区开始找下一家填缺口，临时办法长出了续集。复核人员到现场时，最稳定的生产资料还是那两盆绿萝。" }
    ]
  }
];

MORE_SECTOR_STORIES.forEach((event) => { event.contentTag = "跨部门小剧场 · 虚构"; });

module.exports = { MORE_SECTOR_STORIES };
