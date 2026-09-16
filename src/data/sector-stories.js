"use strict";

// 原创虚构的跨部门小剧场。语气可以轻松，职责边界和后果不能含糊。
const SECTOR_STORIES = [
  {
    id: "dept_agri_drone_goat", category: "work", once: true, roleLevels: [2], storyTheme: "agriculture-technology",
    title: "无人机找到了羊，没找到信号",
    body: "镇里演示农业无人机，领导刚夸完‘科技兴农’，屏幕就黑了。飞手说山坳没信号，养羊大叔在旁边乐：‘它要真聪明，先帮我找那三只羊。’媒体镜头正对着你，羊也正好从主席台后面探出头。",
    choices: [
      { text: "先找羊，再把失败原因原样讲清", effects: { trust: 4, ability: 3, performance: -1 }, outcome: "演示从科技大片变成全镇找羊。三只羊找回来了，无人机的问题也写进改造清单。新闻标题不够威风，却有村民留言：这回总算不是拿我们当背景板。" },
      { text: "换到有信号的田里重飞，后续再补山区测试", effects: { performance: 3, ability: 2, integrity: -1 }, outcome: "第二次起飞很顺，掌声也补上了。你随后安排真正的山区测试，发现设备还差得远。场面救回来了，采购标准也必须跟着现实重写。" },
      { text: "宣布演示成功，黑屏只是现场网络波动", effects: { performance: 3, trust: -5, integrity: -4 }, outcome: "台上顺利收官，台下偷拍视频却完整记录了那句‘找不到信号’。第二天羊大叔成了网红，他对镜头说：‘羊找到了，成功在哪儿我还没找到。’" }
    ]
  },
  {
    id: "dept_agri_homestay_tractor", category: "work", once: true, roleLevels: [1, 2], storyTheme: "rural-tourism",
    title: "网红民宿门口停着一台拖拉机",
    body: "返乡青年把老院子改成民宿，开业当天，邻居把拖拉机横在门口：‘他家游客半夜唱歌，我家鸡都开始倒时差了。’博主已经开播，评论区一半要你拆民宿，一半想团购。",
    choices: [
      { text: "先把直播关小声，现场核许可、噪声和消防", effects: { ability: 4, trust: 3, health: -2 }, outcome: "许可证没问题，消防有两处要改，夜间噪声也确实超了。民宿限期整改，拖拉机挪开，鸡暂时不用继续上夜班。两边都没全赢，但都拿到了能执行的清单。" },
      { text: "约定十点静音试营业，七天后拿数据复盘", effects: { performance: 3, trust: 2, integrity: 1 }, outcome: "民宿给每位客人发了‘十点后别逼鸡加班’提示卡，反而成了打卡梗。七天监测基本达标，邻居仍嫌游客多，却不再需要用拖拉机当投诉热线。" },
      { text: "劝邻居给年轻人一点面子，先把车开走", effects: { performance: 2, trust: -6, integrity: -3 }, outcome: "开业直播顺利了，邻居转头把连续三晚的噪声视频发上网。你想保住的面子没保住，反倒多了一个问题：为什么投诉人必须先给生意让路？" }
    ]
  },
  {
    id: "dept_market_wedding_leftovers", category: "work", once: true, roleLevels: [3], storyTheme: "food-safety",
    title: "婚宴还没开席，厨师先跑路了",
    body: "酒店后厨被查出把昨晚剩菜重新摆盘，主厨见势不对从侧门溜了。楼上新人马上交换戒指，老板拉住你：‘今天封了，三十桌亲戚能把我吃了。’伴郎还跑下来问凉菜什么时候上。",
    choices: [
      { text: "问题菜立即封存，协调合格餐食救场", effects: { ability: 4, integrity: 4, performance: 1, health: -3 }, outcome: "凉菜没上，附近两家合规餐厅临时送来热菜。婚礼晚了四十分钟，新郎上台先说‘感谢大家没吃到昨天的’。笑声救了场，证据和后续处理也一项没少。" },
      { text: "暂停后厨，逐批核验能否继续供餐", effects: { integrity: 4, performance: -1, trust: 2 }, outcome: "能证明当天制作的热菜保住了，来源说不清的全部撤下。老板心疼得直拍腿，新娘却说：少几个菜总比全家一起去医院团建强。" },
      { text: "先让婚宴办完，晚上再补检查记录", effects: { performance: 3, integrity: -8, trust: -5 }, outcome: "婚礼如期开席，偷拍视频也如期上传。没有人严重不适算是侥幸，可老板面对采访时说‘检查的人同意先上菜’，把你的通融端上了全网最大的桌。" }
    ]
  },
  {
    id: "dept_market_influencer_shoes", category: "work", once: true, roleLevels: [3, 6], storyTheme: "consumer-protection",
    title: "主播说鞋能跑赢高铁",
    body: "头部主播卖一双‘量子增速鞋’，广告里说穿上能提升30%速度。团队解释这只是夸张修辞，仓库已经打包十万单。老板发来消息：‘今晚给您留个直播间专座，顺便聊聊营商环境。’",
    choices: [
      { text: "固定证据、叫停误导宣传，再处理退款", effects: { integrity: 5, ability: 3, performance: 1 }, outcome: "主播在镜头前改口：鞋不能跑赢高铁，只能正常走路。退款页面一度挤爆，企业抱怨损失大，消费者却第一次看见‘家人们冲’后面还跟着责任。" },
      { text: "要求立即改词并公开说明，继续核查产品质量", effects: { performance: 3, trust: 2, integrity: 2 }, outcome: "直播标题从‘量子增速’改成‘穿着挺轻’，科学含量骤降，诚实含量上升。质量核查继续，已经下单的人获得明确退货入口。" },
      { text: "先去直播间听解释，别伤了头部企业信心", effects: { performance: 2, integrity: -7, trust: -4 }, outcome: "你坐进了专座，主播立刻说‘有关方面也很关心我们的创新’。你一句背书都没说，画面却比任何句子都好用。第二天，投诉材料首页就是你的直播截图。" }
    ]
  },
  {
    id: "dept_justice_uncle_voice", category: "work", once: true, roleLevels: [4], storyTheme: "mediation-boundary",
    title: "舅舅发来一段59秒语音",
    body: "舅舅的朋友和邻居闹宅基地纠纷，他发来59秒语音，核心只有八个字：‘你出面，他们肯定听。’末尾还补一句：‘又不是案子，就是调解。’你看着手机，感觉亲情已经替你把会场都订好了。",
    choices: [
      { text: "说明关系并回避，把正规调解入口发给他", effects: { integrity: 5, family: -2, trust: 2 }, outcome: "舅舅回了一个冷冰冰的‘哦’。纠纷后来由属地依法调解，没有人因为认识你先拿到座位。过年见面时他仍念叨你不帮忙，至少没法说你替谁压过话。" },
      { text: "只请属地确认是否已受理，不碰实体意见", effects: { ability: 2, integrity: 3, family: 1 }, outcome: "你得到的答复是材料缺一张图，便把公开补正要求转给舅舅。事情没有插队，语音也终于从59秒缩成两个字：收到。" },
      { text: "亲自去坐一会儿，强调只是帮大家冷静", effects: { family: 3, integrity: -7, trust: -3 }, outcome: "你说了三次‘我不表态’，对方却只记住你坐在舅舅朋友那一边。调解没成功，另一方投诉时写得很简洁：有领导到场。你的沉默也被位置替你发了言。" }
    ]
  },
  {
    id: "dept_police_mascot", category: "work", once: true, roleLevels: [5], storyTheme: "public-communication",
    title: "警务吉祥物先把自己锁车里了",
    body: "反诈直播开场前，扮吉祥物的民警把钥匙落在车里，自己还穿着厚玩偶服。主持人倒数三分钟，围观学生已经笑成一片。宣传科问：‘要不要把孩子们先赶远点，别拍到这个事故？’",
    choices: [
      { text: "先救人，再拿这次乌龙讲一堂真反诈课", effects: { trust: 4, ability: 3, health: -2 }, outcome: "人很快出来了，吉祥物摘下头套第一句是：‘大家看，着急的时候最容易判断失误。’全场笑完反而听得更认真，这段没剪掉的乌龙成了当天传播最广的反诈片段。" },
      { text: "调整流程让民警缓一缓，直播稍后开始", effects: { performance: 2, integrity: 2, trust: 1 }, outcome: "直播晚了十五分钟，学生围着消防人员看开锁。主持人临时把等待改成安全问答，没制造英雄，也没掩盖失误。" },
      { text: "清场并要求删视频，直播必须准点开始", effects: { performance: 3, trust: -5, ability: -2 }, outcome: "官方直播准点，偷拍视频也准点传开。网友并不在意谁把钥匙落车里，倒是很在意为什么孩子被要求删掉笑声。一次小乌龙，被你的紧张升级成大尴尬。" }
    ]
  },
  {
    id: "dept_reform_boss_coffee", category: "work", once: true, roleLevels: [6], storyTheme: "business-lobbying",
    title: "咖啡杯底压着一张厂房平面图",
    body: "老同学说回乡投资，只想请你喝杯咖啡。聊到第三口，他从杯底抽出厂房图：‘项目没问题，就是能不能进重点清单？进了，银行那边好说。’服务员又端来一杯，杯套上印着‘友情无价’。",
    choices: [
      { text: "咖啡自己结账，项目回公开申报通道", effects: { integrity: 5, family: -1, performance: -1 }, outcome: "老同学盯着付款码说你见外。项目后来按同一套标准评审，技术可行，能耗指标却要重做。友情没有变成通行证，项目也没有因为你拒绝就被偷偷判死刑。" },
      { text: "把共性困难带回公开企业座谈会", effects: { ability: 4, trust: 2, integrity: 3 }, outcome: "下一场座谈来了二十七家企业，大家都在问融资和清单标准。老同学坐在最后一排，散会时嘟囔：‘早知道要排队，我就不请咖啡了。’你说这句话总算说到点上。" },
      { text: "先放进储备名单，后面再慢慢补条件", effects: { performance: 4, integrity: -9 }, accountability: { dutyAbuse: 2, concealment: 1, note: "为熟人项目绕开统一评审进入重点储备名单。" }, outcome: "项目进了清单，融资果然顺了。可正式复核时，评审人员问这条记录为何没有评分表。老同学的平面图能画出每扇门，唯独画不出他是怎么进名单的。" }
    ]
  },
  {
    id: "dept_reform_model_light", category: "work", once: true, roleLevels: [6, 9], storyTheme: "project-feasibility",
    title: "沙盘亮得很，项目账上没钱",
    body: "招商项目沙盘灯光一开，未来园区连树都会发光。你随口问资金来源，现场突然只剩空调声。企业代表笑着说：‘先签意向，钱会被信心吸引来。’摄影师举着相机，等你和那棵发光树合影。",
    choices: [
      { text: "灯先关一半，把资金和风险逐项摊开", effects: { ability: 5, integrity: 4, performance: -2 }, outcome: "沙盘暗下来，会议终于看得见人。项目被拆成可融资的一期和暂缓部分，签约仪式取消。当天没有喜报，半年后一期真的开工，发光树也换成了普通路灯。" },
      { text: "签不具约束力的研究备忘录，设硬退出条件", effects: { performance: 3, ability: 3, integrity: 1 }, outcome: "合影保住了，但文件首页写着不构成投资承诺，三个月拿不出资金证明自动退出。企业代表笑得没那么亮，规则倒比沙盘清楚。" },
      { text: "先签意向制造声势，融资问题交给市场", effects: { performance: 5, trust: -4, integrity: -4 }, outcome: "新闻当天很热闹，项目三个月后仍只有沙盘。企业拿签约照片去谈融资，外界则把你站在发光树旁的笑容当成政府担保。信心没吸来钱，倒吸来一堆解释。" }
    ]
  },
  {
    id: "dept_environment_monitor_cat", category: "work", once: true, roleLevels: [7], storyTheme: "environment-data",
    title: "监测站里最守时的是一只猫",
    body: "空气监测点连续三天在凌晨两点出现异常低值。值班员说设备会‘夜间自愈’，你调监控却看到一只橘猫每天准时趴在进气口旁，旁边还有人为移动设备的痕迹。企业群已经转发‘空气质量创纪录’。",
    choices: [
      { text: "封存原始数据，查猫也查人，异常先不评优", effects: { integrity: 5, ability: 4, performance: -2 }, outcome: "猫只是来取暖，设备却确实被人挪过位置。创纪录的喜报撤回，监测流程重做。值班员后来给猫买了窝，放得离进气口远远的——猫可以背锅一次，不能替人背第二次。" },
      { text: "更换设备交叉监测，待复核后统一说明", effects: { ability: 4, performance: 2, health: -2 }, outcome: "新旧设备并排跑了两天，异常来自位置变化和校准问题。数据更正后不再漂亮，原因却能复现。橘猫照常打卡，只是失去了‘改善空气’的荣誉。" },
      { text: "把异常归因于猫，先保留空气质量喜报", effects: { performance: 4, integrity: -7, trust: -4 }, outcome: "通报把设备异常写成动物干扰，网友给猫做了表情包。维修记录随后显示设备曾被人工搬动，大家才发现真正会‘自愈’的不是机器，是一份会改口径的报告。" }
    ]
  },
  {
    id: "dept_environment_purifier", category: "work", once: true, roleLevels: [7], storyTheme: "supplier-gift",
    title: "办公室突然多了台‘样机’",
    body: "治理项目评审前，供应商送来一台高端空气净化器，贴纸写着‘免费测试样机’。你让人查协议，对方秒回：‘不用签，领导呼吸好，大家工作才好。’机器已经在角落安静地显示空气优秀。",
    choices: [
      { text: "断电封存登记，核查供应商接触记录", effects: { integrity: 6, ability: 2, performance: -1 }, outcome: "净化器停止夸空气，供应商开始夸自己是误会。设备被登记处理，评审人员重新做利益冲突核查。办公室闷了两天，项目的空气反而清爽了一些。" },
      { text: "立即退回，并给所有供应商发统一设备规则", effects: { integrity: 4, performance: 1, trust: 1 }, outcome: "对方当天拉走机器，项目组补了一条：没有测试协议的样机不得进场。后来真需要测试时，所有企业按同样条件送样，谁也不能靠关心领导呼吸抢先一步。" },
      { text: "先试用到评审结束，反正不是送给个人", effects: { ability: 1, integrity: -9 }, accountability: { acceptedValue: 1.2, retainedValue: 1.2, concealment: 1, note: "在项目评审期接受供应商高价值设备并持续使用。" }, outcome: "机器每天显示空气优秀，聊天记录也每天提醒供应商问体验如何。评审结束后，对方说样机不必归还。你没把它搬回家，可它从第一天就不是来净化公共利益的。" }
    ]
  },
  {
    id: "dept_transport_last_bus", category: "work", once: true, roleLevels: [8], storyTheme: "public-transport",
    title: "末班车把厅长也落下了",
    body: "你临时不带随员体验城乡公交，结果末班车提前八分钟开走。站牌下还有六名乘客，一位大姐认出你：‘巧了，今天投诉对象自己也没车。’司机说要赶回场站打卡，调度中心说系统显示准点。",
    choices: [
      { text: "和乘客一起等加班车，完整核对调度记录", effects: { trust: 5, ability: 3, health: -3 }, outcome: "加班车四十分钟后到，你也挨了四十分钟的风和吐槽。后台发现司机终端时间快了八分钟，类似投诉还有十七条。大姐下车前说：‘这回不用我写八百字了吧？’" },
      { text: "先安排车辆送乘客，再追系统和司机两条线", effects: { performance: 4, trust: 2, integrity: 2 }, outcome: "乘客先回家，核查没有停在‘服务到位’。系统时钟确有偏差，司机也长期被不合理打卡时间催赶。修的不只是钟，还有一条逼人提前走的考核规则。" },
      { text: "给场站负责人打电话，只要求马上派车来接你", effects: { performance: 2, integrity: -6, trust: -6 }, outcome: "专车十分钟就到，六名乘客却被告知继续等正常班次。有人拍下你先上车的画面，标题非常省字：末班车没等群众，群众等来了厅长。" }
    ]
  },
  {
    id: "dept_transport_asphalt", category: "work", once: true, roleLevels: [8, 9], storyTheme: "project-quality",
    title: "公路刚通车，鞋底先粘住了",
    body: "重点公路通车仪式前，记者踩上路面，鞋底竟粘下一小块沥青。施工方说只是高温，项目负责人小声求你：‘剪完彩再取样，横幅都挂了。’剪刀已经递到你手里，红绸在风里特别努力。",
    choices: [
      { text: "剪刀放下，封闭问题路段立即取样", effects: { integrity: 5, ability: 4, performance: -3 }, outcome: "仪式取消，横幅成了当天最没用的东西。检测发现局部施工温度控制异常，返工后才重新开放。新闻不好看，但至少没人用轮胎替项目做第二次取样。" },
      { text: "安全路段试通行，问题区隔离复检", effects: { ability: 3, performance: 2, integrity: 2 }, outcome: "红绸没剪，运送急需物资的车辆从合格路段低速通过。问题区很快圈定，返工范围也没有被扩大成整条路。项目晚了，交通没被一刀切断。" },
      { text: "先完成仪式，解释为天气导致的表层现象", effects: { performance: 5, integrity: -8, trust: -5 }, outcome: "剪彩照片按时发出，记者的鞋底照片更快。当天傍晚项目封闭返检，群众看着上午的喜报问：到底是路一日游，还是我们被当成了试车员？" }
    ]
  },
  {
    id: "dept_province_school_lunch", category: "work", once: true, roleLevels: [9], storyTheme: "education-food",
    title: "孩子把午餐拍成了‘考古现场’",
    body: "学生把学校午餐拍上网：一块肉藏在两片土豆下面，配文‘今日考古成果’。教育部门说营养标准达标，市场监管说食材合格，家长问的是肉去哪了。你分管多部门，会议刚开始，食堂供应商的老板就托熟人发来饭局定位。",
    choices: [
      { text: "饭局不去，随机抽校陪孩子吃一周", effects: { trust: 5, ability: 3, health: -2 }, outcome: "第一天大家吃得格外好，第三天你临时换学校，终于吃到那份‘考古餐’。问题不在单次检测，而在分量、验收和结算脱节。孩子们后来继续拍照，只是照片里终于不用找肉。" },
      { text: "把克重、采购和每日菜单一起公开", effects: { integrity: 4, performance: 3, trust: 2 }, outcome: "家长能看到合同里的肉有多少，也能看到盘子里实际有多少。供应商解释损耗，学生负责继续‘民间称重’。玩笑没有消失，账却越来越难糊弄。" },
      { text: "先让学校整改摆盘，别把个例升级成全省问题", effects: { performance: 3, integrity: -5, trust: -6 }, outcome: "第二天土豆摆得很艺术，肉还是那么小。更多学校学生加入‘考古’，大家甚至做出排行榜。你想把问题压成个例，孩子们用午餐把它拼成了一张地图。" }
    ]
  },
  {
    id: "dept_province_ambulance", category: "work", once: true, roleLevels: [9], storyTheme: "health-emergency",
    title: "救护车到了，村口的树不让进",
    body: "山区急救转运时，救护车被村口限高杆和一棵歪树卡住。卫健部门说车辆符合标准，交通部门说村道不归主干网，乡镇说树是村民的。患者家属在电话里吼：‘你们先决定树归谁，人还等着呢！’",
    choices: [
      { text: "先用最近力量接驳救人，责任问题随后拆清", effects: { ability: 5, trust: 4, health: -3 }, outcome: "医护带设备步行接入，农用车完成短距离转运，患者及时送医。天亮后限高和通行障碍逐项整改。树归谁可以开会，人等不起会议纪要。" },
      { text: "建立急救通道清单，先排查同类高风险村", effects: { performance: 4, ability: 4, trust: 1, health: -2 }, outcome: "当天障碍清除，随后全省筛出一批救护车进不去的村。名单不漂亮，却让各部门第一次围着‘车能不能到床边’而不是‘路归谁管’安排预算。" },
      { text: "要求属地自行解决，省里不替基层包办", effects: { performance: 2, trust: -7, integrity: -4 }, outcome: "属地最终也解决了，可耽误的时间写进了病历。新闻发布会上没人讨论层级边界，只反复播放家属那句话：人还等着呢。你的原则听起来完整，落地时却少了最急的一段。" }
    ]
  },
  {
    id: "dept_housing_elevator", category: "work", once: true, roleLevels: [2, 6, 9], storyTheme: "housing-community",
    title: "一楼说不坐，六楼说快爬不动了",
    body: "老楼加装电梯表决卡住。一楼住户把椅子搬到门口：‘我一次不坐，凭什么掏钱？’六楼老人扶着栏杆慢慢下来：‘我不装，可能以后连反对会都下不来。’施工企业又催补贴窗口快关了。",
    choices: [
      { text: "把采光、噪声、费用和补偿逐户摊开谈", effects: { ability: 4, trust: 4, performance: -2, health: -2 }, outcome: "会开了三晚，所有人都至少拍过一次桌子。方案调整连廊、分摊和补偿后通过，一楼仍不喜欢这部电梯，但不再觉得自己只收到一句‘少数服从多数’。" },
      { text: "先做专业评估和可逆方案，再重新表决", effects: { integrity: 4, ability: 3, performance: -1 }, outcome: "补贴窗口差点错过，设计单位赶出两个替代方案。六楼老人说慢一点也行，只要不是永远没下文。第二次表决时，争论终于围绕具体方案而不是互相猜心。" },
      { text: "赶在窗口关闭前开工，反对意见以后再协调", effects: { performance: 4, trust: -7, integrity: -5 }, outcome: "施工围挡一夜立起，一楼住户第二天就坐在挖掘机前直播。补贴保住了，工程却停了。你抢到的是开工日期，不是一部能真正建成的电梯。" }
    ]
  },
  {
    id: "dept_culture_star_rain", category: "work", once: true, roleLevels: [6, 9], storyTheme: "culture-event-safety",
    title: "明星到了，暴雨也来走红毯",
    body: "文旅节开幕前半小时，气象台升级暴雨预警。明星团队说只唱两首歌，观众淋点雨更有氛围；安保负责人指着积水图：‘再等十分钟，出口可能先有氛围。’热搜词条已经买好，就差你点头。",
    choices: [
      { text: "取消现场演出，先把观众分区疏散", effects: { integrity: 4, trust: 3, performance: -3, health: -2 }, outcome: "嘘声比雷声先到，明星改在室内直播清唱。半小时后广场积水没过脚踝，刚才骂退票的人开始帮忙转发疏散路线。热搜还在，只是词条从开幕变成了安全回家。" },
      { text: "缩短流程并开放更多出口，随时硬停", effects: { ability: 4, performance: 3, trust: -1, health: -3 }, outcome: "演出只唱一首，第二首前雨势触发停演。观众意犹未尽，疏散却没有挤成一团。这是一次险些被掌声拖延的决定，复盘时你把硬停阈值写得比节目单更大。" },
      { text: "按原计划办，已经投入这么多不能白花", effects: { performance: 5, trust: -7, integrity: -5 }, outcome: "第一首歌还没结束，出口积水导致人群回流。活动紧急中止，没有造成更严重后果，但现场视频里主持人还在喊‘坚持就是热爱’。后来大家问的不是花了多少钱，而是谁把沉没成本当成了天气预报。" }
    ]
  }
];

SECTOR_STORIES.forEach((event) => { event.contentTag = "跨部门小剧场 · 虚构"; });

module.exports = { SECTOR_STORIES };
