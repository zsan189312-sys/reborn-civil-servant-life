"use strict";

// Standalone fictional dilemmas add variety between longer consequence chains.
// Every scene is authored once per career and uses no real place or person.
const ENGAGING_WORK_STORIES = [
  {
    id: "work_live_bridge_comment", category: "work", once: true,
    title: "直播镜头对准了那座桥", roleLevels: [0, 1, 2, 3, 4],
    body: "午休时，本地博主把镜头架在一座出现裂纹的旧桥边，评论区已经刷到几千条。检测人员还在路上，村民周姨却推着三轮车要过桥：‘我绕路，菜就卖不掉了。’你手里只有一份尚未签字的初步记录。",
    choices: [
      { text: "先封半幅桥面，陪周姨走一次绕行路线", effects: { trust: 4, performance: -2, health: -2, integrity: 2 }, outcome: "警戒带刚拉起，直播间就有人骂你小题大做。你跟着周姨绕了二十分钟，把坑洼和照明问题记下来。傍晚检测意见到了：桥还没到停用标准，但限行是必要的。周姨第二天照旧抱怨，只是没再推开警戒带。" },
      { text: "请检测人员到镜头前，只解释已经确认的部分", effects: { ability: 3, trust: 3, performance: 1, health: -2 }, outcome: "工程师起初不愿出镜，你答应不让他猜结论。直播里最诚实的一句话是‘现在还不知道’。评论没有立刻安静，倒有人开始上传桥底照片。新线索让检测提前找到了渗水位置，也让你多出一整晚去核实。" },
      { text: "等正式报告再回应，先要求现场停止拍摄", effects: { performance: 2, trust: -5, integrity: -2 }, outcome: "镜头关了十分钟，偷拍视频却已经被转发。正式报告第二天才来，内容并不严重，可‘不让拍’成了新的标题。你完成了处置台账，也第一次发现：沉默并不会替你保留解释的位置。" }
    ]
  },
  {
    id: "work_school_gate_sixth_cart", category: "work", once: true,
    title: "校门口第六辆餐车", roleLevels: [1, 2, 3, 4],
    body: "学校门口划了五个临时经营位，今天却来了第六辆餐车。摊主老韩拿出一张皱巴巴的缴费截图：‘有人答应给我留位，这钱难道白交了？’家长群正催着整治，另外五名摊主则围着你数地上的白线。放学铃还有四十分钟。",
    choices: [
      { text: "先核验截图和食品手续，今天划出等候区", effects: { ability: 4, performance: -1, trust: 2, health: -2 }, outcome: "截图最终对应的是市场活动费，不是经营位。你没让老韩混进白线，也没当场把车拖走，而是安排他在等候区补材料。放学时秩序有点乱，但第二周轮候名单贴出来，六个人第一次对着同一张规则说话。" },
      { text: "让六辆车轮换五个位置，月底公开抽签", effects: { trust: 4, integrity: 3, performance: -2 }, outcome: "五名摊主都觉得自己吃了亏，老韩反倒最先签字。轮换表第一天就被油渍糊住，你只好加做公示牌和投诉记录。麻烦没有消失，却从围着你吵，变成了可以被核对的次序。" },
      { text: "只清走第六辆车，先保证今天不出乱子", effects: { performance: 4, trust: -3, integrity: -3 }, outcome: "放学高峰很顺，家长群发来一排点赞。老韩推车离开前把截图塞进你手里：‘那收钱的人呢？’你当天的数据很好看，但那张截图压在抽屉里，提醒你处理的是第六辆车，不是第六辆车出现的原因。" }
    ]
  },
  {
    id: "work_muted_three_minutes", category: "work", once: true,
    title: "被静音的三分钟", roleLevels: [2, 3, 4, 5, 6],
    body: "汇报已经超时，年轻干部宋遥第三次举手，说项目完成率的分母可能算错了。主持人提醒你后面还有八项议程：‘有问题会后再说。’投影上的数字又漂亮得让人舍不得关，宋遥的麦克风正好处于静音状态。",
    choices: [
      { text: "把麦克风打开，给她三分钟说完异议", effects: { integrity: 5, trust: 3, performance: -2 }, outcome: "宋遥只用了两分十七秒。会场先是安静，随后三个部门同时翻材料。数字确实高估了进度，会议因此延长四十分钟。散会时她小声说‘我以为您会让我会后再谈’，你看着被改红的那一页，没有接这句恭维。" },
      { text: "宣布休会十分钟，让数据组当场复算", effects: { ability: 4, integrity: 3, health: -2, performance: -1 }, outcome: "十分钟变成二十五分钟，走廊里的茶凉了两轮。复算确认口径有误，也发现宋遥漏看了一份补充表。她不是全对，原报告也不是全错。重开会议时，争论终于从‘听谁的’变成了‘哪一行怎么算’。" },
      { text: "先按原议程通过，要求她会后提交书面说明", effects: { performance: 4, trust: -3, integrity: -4 }, outcome: "会议准点结束，简报半小时后发出。宋遥的书面说明在深夜到达，附件列了七处口径问题。第二天你必须决定是否更正已经发布的成绩；省下来的三分钟，变成了一场更难解释的返工。" }
    ]
  },
  {
    id: "work_concert_last_train", category: "work", once: true,
    title: "散场后，导航全红了", roleLevels: [5, 6],
    body: "大型演出散场撞上暴雨，导航上的道路一片红。主办方说‘合同服务已经结束’，公交公司只能临时多派四十辆车，附近居民投诉喇叭声不断。现场还有两万多人，第一条抱怨视频已经冲上热榜。",
    choices: [
      { text: "延长接驳并开放三个公共建筑避雨", effects: { trust: 5, performance: 3, health: -4 }, outcome: "体育馆、文化馆和一处大厅临时亮灯，保洁和安保被重新叫回。凌晨两点最后一批人离开，有人把热水杯拍进视频，也有人追问为什么预案没有算到暴雨。你解决了今晚，却给明天留下了一张必须重写的方案。" },
      { text: "把四十辆车拆成短驳环线，优先疏散外围", effects: { ability: 5, performance: 2, trust: 1, health: -3 }, outcome: "第一圈车差点全堵在同一个路口，调度员临时把线路画在纸箱背面。外围人群先散开，中心压力随之下降。方案不漂亮，甚至没来得及盖章，但每一轮位置和人数都被补进记录，供事后复盘。" },
      { text: "要求主办方按合同处置，城市交通维持常态", effects: { performance: 1, trust: -7, integrity: -2, health: 2 }, outcome: "职责边界写得很清楚，现场却不会按合同分成人群。主办方的车不够，常规公交也被堵住。第二天各方都能找到一句证明自己尽责的话，只有视频里的乘客在问：‘那昨晚到底谁负责？’" }
    ]
  },
  {
    id: "province_double_red_alert", category: "work", once: true,
    title: "两座城同时亮起红色预警", roleLevels: [7, 8, 9],
    body: "云岑方向出现山洪风险，澄川方向的医院备用电源又告急。两地都请求同一支省级应急队伍先到，视频会上，两位负责人几乎同时说：‘人命不能排第二。’气象图还在刷新，队伍已经发动。",
    choices: [
      { text: "按实时风险拆分力量，并公开每小时调整条件", effects: { ability: 5, integrity: 3, performance: 1, health: -4 }, outcome: "队伍被拆成两组，任何一边都觉得不够。你把雨量、转移人数和医院续航写成每小时更新的调整线。凌晨，医院电力稳住，山洪方向又追加力量。没有谁获得完整支援，但所有人都知道下一次调动因为什么发生。" },
      { text: "主力先保医院，协调邻近力量支援山洪区域", effects: { performance: 4, trust: 1, ability: 2, health: -3 }, outcome: "医院的备用电源在队伍抵达后不久恢复，山洪区域则靠邻近力量连夜转移。第二天复盘发现，两地都曾有二十分钟觉得自己被放弃。结果守住了，跨区域增援的空档也被原样写进报告，没有被胜利抹平。" },
      { text: "让两地再报一轮数据，等信息更完整再决定", effects: { ability: 1, integrity: 1, performance: -6, trust: -4 }, outcome: "新数据确实更完整，队伍却在高速入口多等了十八分钟。最后没有造成严重后果，但会议记录把等待时间精确到分钟。你得到了一次更稳妥的判断，也看见应急现场里‘再确认一下’同样有价格。" }
    ]
  },
  {
    id: "national_blank_cell", category: "work", once: true,
    title: "汇总表里空着一格", roleLevels: [10],
    body: "跨区域民生项目即将汇总上会，十一个地区都交了完成率，只有最偏远地区留下一格空白。对方在电话里承认基层系统断线，纸质数据还在路上。秘书组问你：‘填估算值、保留空白，还是整份材料延期？’",
    choices: [
      { text: "保留空白并附原因，安排纸质数据并行复核", effects: { integrity: 5, ability: 3, performance: -2 }, outcome: "空白格在会上比任何数字都显眼。有人质疑准备不足，也有人第一次追问偏远地区为何长期依赖不稳定系统。纸质数据两天后送到，与估算值差了六个百分点。那一格没有让材料更漂亮，却让后续投入有了具体去处。" },
      { text: "延后整份汇总，等所有地区采用同一口径", effects: { integrity: 4, trust: 2, performance: -4, health: -2 }, outcome: "会议材料被撤回重排，十一个按时上报的地区都来问原因。统一口径后，三地又发现旧数据不能直接比较。延期不受欢迎，却避免一张看似整齐的表把不同情况硬塞成同一种成绩。" },
      { text: "先填模型估算值，在脚注里标明待核", effects: { performance: 4, ability: 2, integrity: -3 }, outcome: "材料准时上会，脚注也确实存在，只是几乎没人读到。纸质数据到达后，估算偏差超出预期。你可以在下一版更正，但第一版的数字已经进入几份引用材料，速度带来的便利开始收取利息。" }
    ]
  },
  {
    id: "town_goose_at_door", category: "work", once: true,
    title: "会议室门口拴着一只鹅", roleLevels: [0, 1, 2],
    body: "村民田叔来反映施工震裂了院墙，材料还没核完，他却把一只大白鹅拴在会议室门口：‘不是送你的，它比我会催。’鹅见人就叫，施工方代表还有十分钟到。",
    choices: [
      { text: "先把鹅安置到院里，再让双方对着照片核损", effects: { trust: 4, ability: 2, performance: -1, health: -2 }, outcome: "鹅追着保安绕了半圈，气氛倒先松下来。照片显示裂缝有新有旧，你们约定请第三方复核。田叔没拿到当场赔偿，施工方也没能一句‘旧墙’了事；临走时鹅又叫了一声，像替会议盖章。" },
      { text: "按程序收件，明确今天不能现场认定责任", effects: { integrity: 3, performance: 2, trust: -3 }, outcome: "材料收得很完整，门口的鹅却叫满了一下午。田叔把受理回执折好，说自己听懂了流程，但没听见谁去看墙。你守住了不能仓促认定的边界，也给第二天的入户核查留下了更高的期待。" },
      { text: "请施工方先垫付维修，后续再核责任", effects: { performance: 4, trust: 2, integrity: -4 }, outcome: "施工方不情愿地答应先修，田叔当天就牵鹅回家。几周后复核认为只有部分裂缝与施工有关，垫付款怎么分成了新的争议。你很快解决了院墙，却把责任顺序倒了过来。" }
    ]
  },
  {
    id: "town_notice_wrong_group", category: "work", once: true,
    title: "通知发进了家长群", roleLevels: [0, 1, 2],
    body: "同事把一份尚未定稿的停课演练通知发进家长群，三分钟后撤回，截图却已经传开。校长来电说‘正式方案还没批’，家长们则开始抢购食品。发错消息的同事脸色发白地站在你桌边。",
    choices: [
      { text: "立即说明是演练草案，同时公布正式确认时间", effects: { trust: 3, integrity: 3, performance: -2, health: -1 }, outcome: "群里先炸出更多问号，随后有人追问确认渠道。你每隔一小时更新一次，正式方案当天傍晚发布。恐慌没有立刻消失，但错误、核实和最终信息都留在同一条公开时间线上。" },
      { text: "先电话核实全部细节，再统一发一份完整说明", effects: { ability: 4, performance: 1, trust: -2, health: -2 }, outcome: "完整说明两小时后才发出，内容准确，超市货架却已经空了一排。你避免了第二次说错，也明白信息真空会自己长出版本。那位同事主动写了复盘，第一行只有四个字：三分钟够了。" },
      { text: "让同事个人解释，单位暂不回应未定稿内容", effects: { performance: 2, trust: -5, family: -1 }, outcome: "同事在群里道歉，很快被追问得说不清演练和停课的区别。单位没有再发错话，却也没有提供可信出口。第二天正式通知没人敢信，大家把同事的头像当成了消息来源。" }
    ]
  },
  {
    id: "town_key_in_trunk", category: "work", once: true,
    title: "钥匙跟着同事去喝喜酒了", roleLevels: [0, 1, 2],
    body: "上级临时要调一册原始台账，档案室钥匙却在请假参加婚礼的同事车里。电话那头音乐震天，他说‘备用钥匙应该在抽屉’，抽屉里只有一张两年前的电池发票。回复时限还剩九十分钟。",
    choices: [
      { text: "请同事联系家人送钥匙，同时先整理电子索引", effects: { ability: 3, performance: 2, family: -1, health: -2 }, outcome: "同事的家人从婚宴赶来，钥匙在最后二十分钟送到。台账准时调出，婚礼合影里却少了一个人。你随后登记了钥匙交接，也记住所谓备用钥匙如果没人见过，就不算真的备用。" },
      { text: "如实说明保管缺陷，申请延时并补做双人交接", effects: { integrity: 4, trust: 2, performance: -3 }, outcome: "延期申请让考核记录多了一行问题，原始台账第二天完整提交。你和同事重新做了双人交接，他苦笑说这次喜酒喝出了制度。进度分不好看，但下一把钥匙终于有了明确位置。" },
      { text: "先用扫描件回复，原始台账以后再补", effects: { performance: 3, ability: 1, integrity: -3 }, outcome: "扫描件暂时过关，原件却在次日核对时发现多了一页手写更正。你不得不再次说明差异。九十分钟的压力过去了，‘以后再补’却把一次回复变成两次解释。" }
    ]
  },
  {
    id: "town_missing_raincoats", category: "work", once: true,
    title: "防汛仓里少了十二件雨衣", roleLevels: [0, 1, 2],
    body: "暴雨预警前夜，仓库台账写着八十件雨衣，现场只数到六十八件。保管员说去年借给巡河队‘应该都还了’，巡河队长反问：‘签字单不是在你们手里吗？’雨已经开始敲铁皮屋顶。",
    choices: [
      { text: "先从邻近点位调足物资，再连夜逐张追查领用单", effects: { ability: 4, performance: 2, health: -4 }, outcome: "雨衣在出发前补齐，十二件旧物资也从三个村的工具柜里找回九件。剩下三件按损耗登记并追责。你没让查账耽误防汛，也没让防汛成为永远不查账的理由，只是一夜没合眼。" },
      { text: "按现有数量先发高风险点，天亮后全面盘点", effects: { performance: 3, integrity: 2, trust: -2, health: -2 }, outcome: "高风险点位先拿到雨衣，外围队伍只能套塑料布。夜里没有险情，清晨的盘点却引来一串相互矛盾的说法。你保住了优先次序，也欠低风险队伍一个更可靠的物资制度。" },
      { text: "先按台账签收八十件，避免影响当晚出库流程", effects: { performance: 4, integrity: -6, trust: -2 }, outcome: "出库表很快签完，雨衣却不会因为签字变多。巡河途中一场急雨让缺口暴露，队员把湿透的照片发进工作群。第二天追查时，问题从少了十二件变成了谁确认过八十件。" }
    ]
  },
  {
    id: "town_wedding_exam_speaker", category: "work", once: true,
    title: "婚礼喇叭撞上听力考试", roleLevels: [0, 1, 2],
    body: "镇中学下午进行重要听力考试，街对面的婚礼已经搭好音响。新人父亲说‘日子半年前就定了’，校方要求整个下午保持安静，婚庆公司则提醒临时改场要损失一大笔钱。",
    choices: [
      { text: "协调考试时段静音，婚礼流程前后错开", effects: { ability: 4, trust: 3, performance: -1, health: -2 }, outcome: "司仪把最热闹的环节提前，新人在静音时段改成给长辈敬茶。考试结束铃响后，婚礼音乐重新响起，学生从校门出来正好碰上礼花。双方都改了计划，也都保住了最在意的那一段。" },
      { text: "以考试为先，要求婚礼下午全面停用音响", effects: { performance: 3, integrity: 2, trust: -4 }, outcome: "听力考试顺利完成，婚宴却安静得只剩碗筷声。新人父亲没有违规开音响，只把损失清单递给你：‘学生重要，我家孩子也只有这一天。’决定容易执行，关系却没有因此变简单。" },
      { text: "让学校加强隔音，婚礼按原计划进行", effects: { performance: 2, family: 1, trust: -5, integrity: -2 }, outcome: "学校临时封窗并借来设备，第一段听力仍混进了鼓点。婚礼没有受到影响，几名考生却申请复核。你避免干预一场私人仪式，却把公共安排的成本全部留给了教室里的人。" }
    ]
  },
  {
    id: "town_water_group_4am", category: "work", once: true,
    title: "凌晨四点，停水群有九百人", roleLevels: [0, 1, 2],
    body: "主管破裂导致大面积停水，维修方说最快上午恢复。一个临时群迅速涌进九百人，置顶消息还写着‘预计两小时’，有人不断@你：‘孩子要上学，老人要吃药，到底听谁的？’",
    choices: [
      { text: "撤下旧时间，每小时只更新已确认的维修节点", effects: { trust: 4, integrity: 3, health: -4, performance: -1 }, outcome: "第一条更正发出后，抱怨反而更多，因为两小时的希望没了。你按节点持续更新，并公布临时取水位置。上午十点恢复供水，比最初承诺晚四小时，却没有再出现第二个被推翻的时间。" },
      { text: "先协调送水覆盖老人和学校，再追问准确工期", effects: { performance: 4, trust: 3, ability: 2, health: -4 }, outcome: "送水车第一趟堵在校门口，你临时拆成多个卸水点。维修时间仍不确定，但急需用水的人先有了去处。天亮后群里有人继续骂，也有人开始转发取水位置；服务先于解释跑了起来。" },
      { text: "沿用两小时口径，避免深夜消息反复变化", effects: { performance: 2, trust: -6, integrity: -3, health: 1 }, outcome: "两小时后水没有来，群人数涨到一千三百。维修最终在上午完成，可每次更新下面都有人贴出凌晨的旧承诺。你少熬了几个小时，那句未经确认的预计时间却一直醒着。" }
    ]
  },
  {
    id: "town_last_bus_seat", category: "work", once: true,
    title: "接驳车只剩最后一个座位", roleLevels: [0, 1, 2],
    body: "山路临时封闭，最后一辆接驳车只剩一个座位。抱着发烧孩子的母亲和拄拐杖的老人同时到了，下一辆至少四十分钟。司机问你：‘带谁先走？’围观的人已经举起手机。",
    choices: [
      { text: "让孩子先走，安排工作人员留下陪老人等车", effects: { trust: 3, performance: 2, health: -3, family: -1 }, outcome: "母亲抱着孩子上车，老人嘴上说没事，手却一直抓着栏杆。你留下陪他等到下一辆，并联系沿途照看。视频只拍到你让孩子上车，没有拍到后面的四十分钟；选择仍然需要你自己记全。" },
      { text: "联系附近车辆加开一趟，两人都暂时留下", effects: { ability: 4, trust: 4, performance: -2, health: -2 }, outcome: "临时车辆二十多分钟后赶到，发烧孩子的母亲急得哭了一次，老人反倒讲笑话安慰她。两人最终一起离开，但加车打乱了后续班次。你没有挑一个人放弃，也没有得到零成本的答案。" },
      { text: "按到达先后让老人上车，请母亲等待医疗车辆", effects: { integrity: 3, trust: -4, performance: 1, health: -2 }, outcome: "记录显示老人早到三分钟，他按顺序上了车。医疗车辆随后接走孩子，没有延误治疗。围观视频却只留下母亲在雨里等待的画面。规则被一致执行，公众感受到的紧迫顺序却完全不同。" }
    ]
  },
  {
    id: "town_duplicate_queue_number", category: "work", once: true,
    title: "窗口前出现两张A017", roleLevels: [0, 1, 2],
    body: "办事大厅叫到A017时，两个人同时站起来。老人说自己等了一上午，年轻人手机里也有同号电子票。系统供应商远程检查要半小时，后面几十双眼睛看着窗口：‘总不能让号码自己当领导吧？’",
    choices: [
      { text: "核对取号时间，先办早到者并给另一人保留顺位", effects: { ability: 3, trust: 3, performance: -1, health: -2 }, outcome: "纸票早了七分钟，老人先办理，年轻人的顺位被单独保留。后面有人质疑为什么不重新排队，你把时间记录投到屏幕上。半小时后系统查出缓存故障，处理原则至少经得起所有人核对。" },
      { text: "临时开双窗口并行办理，事后追查系统故障", effects: { performance: 4, ability: 2, health: -4 }, outcome: "你把后台同事叫到前台，两件业务同时开始，队伍很快恢复。午休被全部占用，系统故障也在下午找到。效率救了现场，但你们发现如果业务更复杂，临时双开可能造成复核缺口。" },
      { text: "暂停A017，等供应商确认后再恢复叫号", effects: { integrity: 2, performance: -4, trust: -3, health: 1 }, outcome: "两位A017都被请到旁边等待，后面的号码继续。规则没有被临时解释，老人却又等了四十分钟。故障确认后两人都顺利办理，你保住了系统结论，也把系统的代价交给了现场的人。" }
    ]
  }
];

module.exports = { ENGAGING_WORK_STORIES };
