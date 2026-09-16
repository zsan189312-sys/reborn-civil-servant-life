"use strict";

// Each fictional episode belongs to one concrete post. The player can exercise
// only the authority described by that post; collective decisions stay collective.
const DUTY_STORIES = [
  {
    id: "duty_clerk_missing_name", category: "work", title: "名单上少了一个人", roleLevels: [0], once: true, storyTheme: "emergency-safety",
    body: "青禾镇连夜转移低洼地带群众。你负责核对安置名单，只能查证、记录和上报，不能擅自改变转移命令。翻到最后一页，你发现独居的周奶奶既不在已转移名单，也不在留守名单。村干部电话占线，雨已经敲响办公室的铁窗。",
    choices: [
      { text: "联系网格员上门核实，同时向值班负责人报告", effects: { ability: 3, trust: 3, health: -2 }, outcome: "你没有在表格上替她编一个去向。网格员冒雨赶到时，周奶奶还在收拾药盒；值班负责人随即安排车辆。凌晨更新名单时，你的名字不在处置决定后面，却在第一条异常记录旁边。" },
      { text: "先标记待核对象，催村里限时回报", effects: { integrity: 3, performance: 2, trust: -1 }, outcome: "你保留了空白，没有把未知写成安全。半小时后村里回报周奶奶已由亲属接走，并补上联系人。风险最终没有发生，但那半小时里，你第一次知道一格空白也会让人坐立不安。" },
      { text: "按邻户已经转移推定她也安全", effects: { performance: 2, integrity: -4, trust: -4 }, outcome: "名单准时汇总，周奶奶那一格也变成了绿色。凌晨，亲属打来电话问人在哪里。最后是巡查人员在她家门口找到她；你盯着自己填上的“已转移”，第一次觉得一个对勾也能重得抬不起笔。" }
    ]
  },
  {
    id: "duty_deputy_town_dike", category: "work", title: "救助窗口外的两张病历", roleLevels: [1], once: true, storyTheme: "welfare-care",
    body: "作为青禾镇民政办负责人，你核验临时救助时发现两户都急需用钱：一户材料齐全，另一户孩子今晚就要住院，却缺异地收入证明。你能组织核验和提出意见，不能自己改标准。窗口外，两位家属都攥着病历等你的答复。",
    choices: [
      { text: "启动紧急核验，先按程序救助住院家庭", effects: { ability: 4, performance: 3, trust: 2, health: -2 }, outcome: "工作人员同步联系医院、社区和收入信息来源。紧急救助先接住了今晚的费用，缺失证明随后补核；另一户按正常顺序当天办结。你没有修改标准，而是用标准本来就有的应急程序解决急迫。" },
      { text: "请两户共同见证材料登记和办理时限", effects: { integrity: 4, trust: 3, performance: -1 }, outcome: "窗口没有给出谁更值得同情的口头判断，只把证据、缺项和完成时限逐项写明。两家仍着急，却知道自己的材料走到了哪一步。" },
      { text: "材料齐全的先办，另一户等证明到齐再说", effects: { performance: 3, ability: -2, trust: -4 }, outcome: "第一户顺利办结，住院家庭却在医院和单位之间反复打电话。你守住了最省事的流程，却忘了紧急救助制度正是为等不起的人准备的。" }
    ]
  },
  {
    id: "duty_town_mayor_one_budget", category: "work", title: "草莓刚上链接，冰雹也上了", roleLevels: [2], once: true, storyTheme: "agriculture-emergency",
    body: "你这个分管农业和应急的副镇长刚进直播间，主播就喊：‘家人们，副镇长来给草莓站台了！’下一秒，气象员发来冰雹预警。果农催你别扫兴，村干部问要不要立刻停播抢收。镜头还对着你，弹幕已经刷起‘领导来一口’。",
    choices: [
      { text: "先关麦布置抢收，再回来认真卖草莓", effects: { ability: 4, trust: 3, performance: 2, health: -2 }, outcome: "你消失了二十分钟，弹幕从‘摆架子’骂到‘是不是掉线’。等村里的棚膜、车辆和老人都安排好，你重新上线，第一句话是：‘刚才不是耍大牌，是老天爷插播广告。’当晚草莓卖完大半。" },
      { text: "直播不断，让干部在镜头外同步通知各村", effects: { performance: 4, trust: 2, ability: -1, health: -3 }, outcome: "你一边试吃一边看手机，脸上的笑比草莓还僵。通知发出去了，销量也没掉，可有个村漏看了群消息。复盘时大家都承认场面保住了，调度却差点被一颗草莓带跑。" },
      { text: "继续直播冲销量，预警等下播再说", effects: { performance: 3, trust: -5, integrity: -4 }, outcome: "订单数字一路跳，冰雹也准时落下。第二天果农把破掉的棚膜拍成视频，配文只有一句：‘昨晚领导还在直播间说形势喜人。’这条视频的播放量，比卖出去的草莓多两个零。" }
    ]
  },
  {
    id: "duty_deputy_county_ward", category: "work", title: "奶茶店把‘零糖’写成了心情", roleLevels: [3], once: true, storyTheme: "market-food-safety",
    body: "网红奶茶店被测出‘零糖款’含糖不低。老板急得把配方表拍在桌上：‘零糖是生活态度，又不是化学公式。’楼下排队的人还在拍短视频，你分管食品与经营秩序，既不能跟着热搜判案，也不能让文案替检测结果打太极。",
    choices: [
      { text: "复核抽检、公开依据，该改标签改标签", effects: { ability: 4, trust: 3, integrity: 3, health: -2 }, outcome: "第二次检测确认含糖，店里连夜换掉菜单。老板不服，发视频说你‘不懂年轻人的梗’，评论区却有人回：‘梗可以甜，血糖可不认梗。’处罚和整改都有证据，热搜没替你执法。" },
      { text: "先责令暂停争议款，给商家一次陈述机会", effects: { performance: 3, integrity: 3, trust: 1 }, outcome: "争议款先下架，其他产品照常卖。老板带着厚厚一叠行业惯例来陈述，最后发现同行写的是‘不另外加糖’，只有他敢写‘零糖’。他沉默半天：‘行，是我胆子比配方大。’" },
      { text: "让老板悄悄改菜单，别把网红店搞凉了", effects: { performance: 2, trust: -5, integrity: -6 }, outcome: "菜单当天改了，检查记录却没留下问题。一个月后消费者晒出旧截图和新检测，老板直播时脱口而出：‘监管那边早就知道。’你想低调处理，最后成了直播间最响亮的那句话。" }
    ]
  },
  {
    id: "duty_county_mayor_wage_sheet", category: "work", title: "一场不能变成定案会的协调会", roleLevels: [4], once: true, storyTheme: "case-boundary",
    body: "云岑县一宗企业纠纷引发工人聚集。作为县委政法委副书记，你需要协调风险处置、法律服务和群众沟通，但案件事实与财产措施必须由有权机关依法处理。企业、工人和承办单位都等着你开口，任何一句模糊的‘照顾大局’都可能被理解成指令。",
    choices: [
      { text: "只协调风险和服务，个案意见退回法定程序", effects: { integrity: 5, ability: 4, performance: -2, trust: 2 }, outcome: "会议明确工人沟通、法律援助和现场秩序安排，却不对案件结果作倾向性要求。争议没有被你一句话解决，但每个人知道下一步由谁依法处理。" },
      { text: "让各方分别陈述，形成不越权的事项清单", effects: { performance: 3, ability: 3, integrity: 2, health: -2 }, outcome: "清单把可协调事项与案件实体问题分开，三个部门终于不再用同一句‘大局’互相推责任。" },
      { text: "暗示承办单位先放一放，等企业稳住再说", effects: { performance: 4, trust: -2, integrity: -8 }, accountability: { dutyAbuse: 2, note: "以维稳协调名义不当影响具体案件程序。" }, outcome: "企业把你的暗示当成承诺，另一方则拿着会议记录提出质疑。原本要化解的矛盾，又多了一层程序是否公正的争议。" }
    ]
  },
  {
    id: "duty_deputy_mayor_shutdown", category: "work", title: "凌晨一点，两份警情同时升级", roleLevels: [5], once: true, storyTheme: "emergency-safety",
    body: "澄川市大型活动散场时发生拥挤，另一片区同时报告危化品车辆泄漏风险。作为市公安局副局长，你按分工组织公共安全和跨部门应急，现场处置必须服从专业判断和法定指挥。凌晨一点，两张力量部署图同时发到手机上。",
    choices: [
      { text: "按生命风险先处置泄漏，活动现场立即分区疏散", effects: { integrity: 4, trust: 3, performance: 2, health: -3 }, outcome: "专业力量先控制泄漏，活动现场用广播、隔离带和分流路线缓慢降密度。两处都没有被放弃，只是不同力量按不同风险投入。" },
      { text: "启动市级联动，让相邻片区补位活动安保", effects: { ability: 4, performance: 3, trust: 1, health: -2 }, outcome: "调度图不断变化，最近力量不再被行政边界锁住。天亮前局面稳定，复盘也保留了每次调动的理由。" },
      { text: "先保大型活动画面稳定，泄漏交属地自行处理", effects: { performance: 4, integrity: -5, trust: -5 }, outcome: "散场镜头很平静，泄漏区域却因支援不足扩大警戒。公众最终看到的不是一场漂亮散场，而是两套处置标准。" }
    ]
  },
  {
    id: "duty_city_mayor_no_applause", category: "work", title: "开工率怎么变成了105%", roleLevels: [6], once: true, storyTheme: "project-data",
    body: "重大项目看板上写着‘开工率105%’。你问怎么算的，处长认真解释：‘五个储备项目提前开了，所以超额完成。’另一页却有三个老项目只围了挡板。你是市发改委主任，明天要拿这张表上会，数字正冲你露出一个很职业的微笑。",
    choices: [
      { text: "把围挡开工踢出去，按实际进度重算", effects: { ability: 5, integrity: 4, performance: -3, health: -2 }, outcome: "105%当场瘦成72%。会上有人皱眉，有人装作第一次见这张表。你把项目逐个摊开，真正卡在用地、资金和审批的地方终于露出来。成绩没那么圆，问题总算不再穿着围挡冒充开工。" },
      { text: "保留新项目贡献，但把新建、续建分栏展示", effects: { performance: 3, ability: 3, integrity: 2 }, outcome: "数字不再挤在一只筐里。储备项目提前开工值得表扬，三个围挡项目也被单独点名。处长看着新表叹气：‘这下没法一句话报喜了。’你说：‘挺好，一句话本来也装不下一个城市。’" },
      { text: "先用105%上会，脚注里写清统计口径", effects: { performance: 5, integrity: -6, trust: -3 }, outcome: "大屏上的105%收获掌声，脚注小得像蚂蚁。会后记者拿着无人机画面追问那三个‘已开工’项目，处长指着脚注说我们写了。可大家只记得大数字，也只会问大数字是谁同意的。" }
    ]
  },
  {
    id: "duty_deputy_governor_one_team", category: "work", title: "河水一夜学会了变色", roleLevels: [7], once: true, storyTheme: "environment-monitoring",
    body: "跨市河段凌晨变成暗红色，上游企业说是‘雨水带泥’，下游网友说像火锅底料。监测站第一组数据偏偏缺了二十分钟。你是省生态环境厅副厅长，两市都催你先发一句‘总体可控’，鱼可没参加新闻发布会。",
    choices: [
      { text: "上下游同步采样，缺失数据原样公开", effects: { ability: 5, integrity: 4, trust: 2, health: -3 }, outcome: "第二轮样本指向一条支沟，两小时后锁定异常排放源。通报里那二十分钟仍留着空白，评论区有人嘲讽监测站睡着了。难看归难看，空白至少没被一条平滑曲线偷偷填上。" },
      { text: "先断源控污，等复核完成再定污染性质", effects: { performance: 4, ability: 3, trust: -1, health: -2 }, outcome: "闸门和应急池先动起来，企业停下相关工序。网友嫌通报说得太少，实验室却需要时间。凌晨四点，河水颜色开始变淡；你没有抢结论，也没有让等待变成什么都不做。" },
      { text: "先发总体可控，别让‘火锅河’上热搜", effects: { performance: 3, trust: -7, integrity: -5 }, outcome: "‘总体可控’四个字刚发出去，死鱼照片就冲上热榜。污染最终被控制，大家追问的却变成：你们连来源都不知道，控制的到底是什么？一句想降温的话，给热搜又添了一勺油。" }
    ]
  },
  {
    id: "duty_governor_twelve_hours", category: "work", title: "两座桥都说自己不能等", roleLevels: [8], once: true, storyTheme: "transport-safety",
    body: "一座跨江桥伸缩缝报警，另一条山区国道被落石堵住。专家说桥要限流，货运协会说一限流全省配送都得绕；山区县长直接发来语音：‘厅长，再不通，明早菜都进不来。’你的交通调度图上，红线像在比赛谁更红。",
    choices: [
      { text: "桥梁立即限流，抢通力量连夜进山", effects: { ability: 5, trust: 4, performance: 1, health: -4 }, outcome: "导航一片深红，骂声也很准时。工程人员在桥下排查，抢通队在山里清障，生活物资改走临时接驳。第二天路逐步恢复，货运老板还是抱怨，但没人拿一车货去赌一座桥。" },
      { text: "客货分时过桥，山区先打通单向生命通道", effects: { ability: 4, performance: 4, trust: -1, health: -3 }, outcome: "方案像给两根针同时穿线：救护和生鲜优先，普通车辆错峰。有人嫌规则复杂，收费站把解释喊到嗓子哑。至少红线都在一点点变短，没有哪条路被一句‘属地负责’丢回地图。" },
      { text: "桥先保持通行，等白天专家到齐再决定", effects: { performance: 3, ability: -5, integrity: -4 }, outcome: "夜里货车照常过桥，报警次数却继续增加。最终没有发生事故，但专家到场后的第一句是：‘谁同意继续放行的？’侥幸让路面看起来很平静，也让你的签字格格外醒目。" }
    ]
  },
  {
    id: "duty_party_secretary_deleted_column", category: "work", title: "六个部门，七种‘已经办了’", roleLevels: [9], once: true, storyTheme: "cross-department-accountability",
    body: "全省老旧小区加装电梯推进缓慢。住建说图审办了，市场监管说设备备案办了，消防说意见提了，财政说钱拨了，街道说群众还在吵。你这个分管副省长听完一圈，桌上已经有七种版本的‘已经办了’，就是没有一部电梯真的动起来。",
    choices: [
      { text: "拿一个卡住的小区现场跑完全流程", effects: { integrity: 4, ability: 5, performance: 1, health: -3 }, outcome: "六个部门第一次站在同一块施工牌前，才发现图纸、管线和居民表决各卡了一截。一个上午没人能再说‘我们这边已经办完’，因为旁边就是那块没挖的地。试点慢慢动了，也把共性堵点照了出来。" },
      { text: "建立一张联办清单，只认最终落地节点", effects: { ability: 4, performance: 4, trust: 1, health: -2 }, outcome: "以后谁再填‘已完成’，系统会追问：电梯在哪？第一次填表时，六个部门集体沉默了三分钟。数据没以前好看，居民却终于能在同一页看到事情卡在谁手里。" },
      { text: "让各部门再报一次完成率，先把季度材料交了", effects: { performance: 4, integrity: -5, trust: -5 }, outcome: "新表格第二天就齐了，平均完成率91%。一个坐轮椅的老人把表格截图和楼梯照片拼在一起发上网：‘剩下9%，大概就是我家这六层。’七种‘已经办了’终于变成一种尴尬。" }
    ]
  },
  {
    id: "duty_national_three_regions", category: "work", title: "三个地区都说自己吃亏", roleLevels: [10], once: true, storyTheme: "budget-resource",
    body: "一项跨区域公共服务协同方案进入最后协调：人口流入地承担更多服务成本，人口流出地担心资源继续减少，枢纽地区则要求先补基础设施。你在国家层面的虚构综合协调岗位任副职，职责是提出共同规则和评估办法，不对应任何现实机关，也不能以个人意见替代法定决策程序。",
    choices: [
      { text: "按实际服务量分担成本，设置薄弱地区保障底线", effects: { ability: 5, integrity: 4, trust: 2, health: -3 }, outcome: "新规则没有让三个地区都觉得占了便宜，却让每笔成本有了可核验的去向。流出地得到基础保障，流入地按服务量获得补助，枢纽项目分阶段评估。真正困难的是下一年数据变化后，你是否仍愿意重新调整。" },
      { text: "先选三地共同认可的小范围事项试行", effects: { performance: 4, ability: 3, trust: 1 }, outcome: "争议最大的部分被留到后面，几个能落地的服务先实现互认。进展因此出现，也有人批评你只挑容易的做。你给试行设了退出和扩围条件，避免“小范围”成为永远不碰核心矛盾的借口。" },
      { text: "统一下达目标，具体成本由各地区自行消化", effects: { performance: 4, integrity: -4, trust: -5 }, outcome: "方案最短、时间表最好看，各地也都按期报送了完成情况。半年后的调查却发现，有的地方通过减少服务项目完成目标。统一要求省掉了协调的麻烦，也把差异产生的代价留给了看不见的办事人。" }
    ]
  }
];

DUTY_STORIES.forEach((event) => { event.contentTag = "岗位专属剧情 · 虚构"; });

module.exports = { DUTY_STORIES };
