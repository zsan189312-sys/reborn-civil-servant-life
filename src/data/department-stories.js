"use strict";

// 原创虚构剧情。利益冲突用于检验选择与后果，不提供规避监督或干预案件的方法。
const DEPARTMENT_STORIES = [
  {
    id: "dept_clerk_red_packet", category: "work", once: true, roleLevels: [0], storyTheme: "favor-access",
    title: "群聊里那个没人敢点的红包",
    body: "你刚帮村里补齐一份救助材料，村干部在三人小群里发了800元红包：‘一点辛苦费，别让领导知道。’红包十分钟后过期，另一名同事一直没有说话。",
    choices: [
      { text: "不领取，截图说明并按规定报告", effects: { integrity: 5, trust: 1, performance: -1 }, outcome: "红包退回后，群里安静了半天。负责人没有表扬你，只让你把材料办理和红包处置分别留痕。第二天，村干部当面说你太认真，你回答：救助资格不能和谁请客、谁发红包混在一起。" },
      { text: "退回红包，私下提醒以后别这样", effects: { integrity: 2, trust: 2 }, outcome: "对方连说三次‘就是心意’，最终收回了钱。事情没有扩大，但你也明白：只靠口头提醒，下一次换个人、换个群，边界可能又会变得模糊。" },
      { text: "领取，告诉自己只是加班辛苦费", effects: { integrity: -8, performance: 2 }, assetChange: 0.08, accountability: { acceptedValue: 0.08, retainedValue: 0.08, note: "收受管理服务对象红包已进入责任记录。" }, outcome: "钱到账很快。此后那名村干部每次来办事都先叫你的名字，还会在别人面前说‘我们熟’。800元没有替他买到决定，却买走了你公开说不熟的底气。" }
    ]
  },
  {
    id: "dept_welfare_cousin", category: "work", once: true, roleLevels: [1], storyTheme: "welfare-eligibility",
    title: "表姨拿来两张不同的收入证明",
    body: "低保复核前，表姨把材料推到你面前。系统里那张收入证明超过标准，她手里这张却刚好压线：‘你只要告诉我用哪张，家里都记你的情。’",
    choices: [
      { text: "说明亲属关系，回避并交由他人独立核验", effects: { integrity: 5, trust: 1, performance: -1 }, outcome: "同事重新调取数据并入户核验，最终按真实家庭状况作出决定。表姨在家族群里说你不近人情，母亲只回了一句：他不签，才是不给我们家留话柄。" },
      { text: "两张都收下，要求出具单位说明", effects: { ability: 3, integrity: 2, health: -1 }, outcome: "证明差异来自一次性补偿是否计入。你没有替她选更有利的一张，而是把争议交给完整证据和复核程序。结果未必如她所愿，但理由终于说得清。" },
      { text: "暗示她先交金额较低的那张", effects: { trust: 2, integrity: -7 }, accountability: { dutyAbuse: 1, concealment: 1, note: "利用岗位便利为亲属规避核验已被记录。" }, outcome: "表姨顺利递了材料，还夸你懂变通。三个月后交叉核验发现两张证明，你的那句暗示没写在纸上，却被她当成解释讲给了调查人员。" }
    ]
  },
  {
    id: "dept_care_home_dinner", category: "work", once: true, roleLevels: [1, 3, 4, 9], storyTheme: "safety-oversight",
    title: "消防门后摆着一桌菜",
    body: "养老机构检查发现安全出口被储物柜挡住。负责人约你晚饭，说整改需要时间：‘老人现在搬出去更危险，先别下停业意见，酒我都开了。’",
    choices: [
      { text: "拒绝饭局，联合专业人员制定限时整改和安置预案", effects: { ability: 4, integrity: 4, health: -2 }, outcome: "储物柜当晚先移走，高风险区域暂停使用，确需转移的老人由家属和社区共同衔接。机构不满意你的严格，也承认方案没有把老人当成一句整改口号。" },
      { text: "只谈整改不赴宴，安排次日复查", effects: { performance: 2, integrity: 3, trust: 1 }, outcome: "负责人把酒退回柜台。第二天复查时，出口已经清空，但线路问题还在。你按风险分项处理，没有用一顿饭换延期，也没有用一纸停业把照护责任推出门外。" },
      { text: "去吃饭，口头答应先不写进检查记录", effects: { integrity: -9, performance: 2 }, accountability: { acceptedValue: 0.12, dutyAbuse: 1, concealment: 2, publicHarm: 1, note: "接受监管对象宴请并隐瞒安全隐患已进入责任链。" }, outcome: "席间每个人都说只是沟通。后来另一名检查员拍到被遮挡的出口，机构负责人第一句话不是解释整改，而是说：‘那晚你们领导也在。’" }
    ]
  },
  {
    id: "dept_town_dispute_video", category: "work", once: true, roleLevels: [2], storyTheme: "public-order-mediation",
    title: "十五秒视频把全镇分成两边",
    body: "校园门口冲突被剪成十五秒视频，一方家长要求你‘给派出所打招呼’，另一方堵在镇政府门口直播。你负责协调秩序和矛盾化解，却不能替办案人员定性。",
    choices: [
      { text: "分开事实核查、秩序维护与调解，公开说明各自边界", effects: { ability: 4, integrity: 4, trust: 2, health: -2 }, outcome: "完整版视频和证人陈述很快补齐，事实与十五秒片段并不完全一致。依法办理和自愿调解分别推进，直播间骂声没有立刻消失，至少没人再把你的协调会当成定案会。" },
      { text: "先约双方家长闭门谈，争取撤掉视频", effects: { trust: 2, performance: 2, integrity: -1 }, outcome: "视频暂时下架，双方却各自保存了聊天记录。闭门谈话压低了音量，没有补上事实。你随后仍得把该走的程序一项项走完。" },
      { text: "给熟悉的民警打电话，暗示先压住一方", effects: { performance: 3, integrity: -8, trust: -4 }, accountability: { dutyAbuse: 2, concealment: 1, note: "以协调名义干预具体处置已被记录。" }, outcome: "现场很快安静，录音却在第二天流出。电话里你没有直接下命令，但那句‘先把他控制住再说’让所有公开解释都变得苍白。" }
    ]
  },
  {
    id: "dept_relative_case_call", category: "work", once: true, roleLevels: [2, 4, 5, 6, 8, 9], storyTheme: "case-boundary",
    title: "亲戚问的不是结果，只是‘到哪一步了’",
    body: "舅舅深夜来电，说表弟卷入一起案件：‘不用你捞人，就告诉我现在到哪一步、谁在办。’你因工作协调看过一份进度清单，但这些信息不能拿去换亲情。",
    choices: [
      { text: "说明不能透露，指引家属走公开查询和律师渠道", effects: { integrity: 5, family: -2, trust: 1 }, outcome: "舅舅在电话里沉默很久，最后只说你变了。第二天律师通过正式渠道了解到可公开的信息。亲戚的埋怨没有立刻消失，但案件也没有因为你的姓氏多出一条暗线。" },
      { text: "主动报告亲属关系，回避后续相关协调", effects: { integrity: 6, performance: -1, family: -1 }, outcome: "工作由其他人接手，你不再接触后续清单。家里觉得你把小事搞大，同事却少了猜测：回避不是证明谁有问题，而是让决定不必依赖大家相信你会克制。" },
      { text: "私下透露承办单位和当前环节", effects: { family: 3, integrity: -8 }, accountability: { dutyAbuse: 1, concealment: 2, note: "向亲属泄露非公开案件进度已进入责任记录。" }, outcome: "舅舅保证不外传，转头却拿信息去质问另一方家属。消息绕了一圈回到承办人员那里，他们开始追查谁接触过进度清单。" }
    ]
  },
  {
    id: "dept_charity_nameplate", category: "work", once: true, roleLevels: [1, 6, 9], storyTheme: "charity-procurement",
    title: "捐赠牌匾后面藏着一份名单",
    body: "本地商人承诺捐一千万元建设养老项目，揭牌宴前却递来一张施工和设备供应名单：‘都是可靠朋友，你帮着优先考虑，善款明天到账。’",
    choices: [
      { text: "把捐赠与采购彻底分开，名单作为利益关联披露", effects: { integrity: 6, ability: 3, performance: -2 }, outcome: "商人取消了豪华揭牌宴，善款也晚到一周。采购重新公开，名单中的企业仍可依法竞争，却不再因为牌匾上的名字拥有捷径。" },
      { text: "接受捐赠，但请第三方全程监督采购", effects: { integrity: 4, performance: 2, trust: 1 }, outcome: "第三方把关联关系写进报告，几家企业因资格不足退出。捐赠方脸色难看，最终还是签下无附加条件文件。项目少了一场热闹，多了一条可追查的线。" },
      { text: "先答应重点推荐，确保善款尽快落地", effects: { performance: 5, integrity: -10 }, accountability: { acceptedValue: 2, dutyAbuse: 2, concealment: 1, note: "以项目便利交换附条件利益已进入责任链。" }, outcome: "善款如期到账，新闻照片很好看。招标公告发布后，名单上的公司比别人早拿到关键参数。后来被问起时，捐赠方拿出了那晚你说‘可以照顾’的录音。" }
    ]
  },
  {
    id: "dept_subordinate_tea_box", category: "work", once: true, roleLevels: [3, 5, 6, 7, 8, 9], storyTheme: "subordinate-gift",
    title: "茶叶盒比茶叶沉",
    body: "干部考核前，下属把一盒茶放在你车后座：‘家里自己炒的。’你回家打开，茶叶下面压着五张购物卡，每张1000元。手机正好跳出他询问推荐名额的消息。",
    choices: [
      { text: "封存登记，说明情况并退出对他的单独评价", effects: { integrity: 7, performance: -1, trust: 1 }, outcome: "卡和茶一起登记。考核由其他人员依标准复核，下属没进推荐名单，也没有因为送礼额外被扣分。办公室里流言很多，最关键的事实却很简单：礼物没有进入你的生活，评价也没有落在你一个人手里。" },
      { text: "当面退回并书面重申考核纪律", effects: { integrity: 4, ability: 1 }, outcome: "下属先说不知道有卡，随后又说是家属放错。你没有替他选择解释，只把物品退回和纪律提醒留痕，考核仍由集体按事实讨论。" },
      { text: "留下购物卡，考核时多说两句好话", effects: { performance: 2, integrity: -12 }, assetChange: 0.5, accountability: { acceptedValue: 0.5, retainedValue: 0.5, dutyAbuse: 2, concealment: 2, sentenceExposure: 3, note: "收受下属5000元购物卡并在人事评价中提供关照。" }, outcome: "他得到推荐后，送卡的司机却因另一件事接受谈话。司机记不住茶叶品牌，却清楚记得车牌、时间和那只比茶叶沉的盒子。" }
    ]
  },
  {
    id: "dept_petition_numbers", category: "work", once: true, roleLevels: [4, 6, 9], storyTheme: "performance-metric",
    title: "撤回率漂亮得不正常",
    body: "季度表里，群众诉求撤回率突然全省领先。下属解释是‘工作做通了’，你随机回访三户，其中两户说有人暗示：不撤回会影响后续办理。表彰材料明早上报。",
    choices: [
      { text: "暂停上报，抽查原始记录并纠正评价指标", effects: { integrity: 6, ability: 4, performance: -4 }, outcome: "漂亮排名没能进入表彰会。抽查发现问题集中在两个单位，你推动把‘撤回’与‘实质解决’分开统计。短期数字难看了，来访者终于不用拿沉默换办理。" },
      { text: "先撤掉表彰措辞，限期完成内部复核", effects: { integrity: 3, performance: -1, health: -1 }, outcome: "材料按时上报，只保留客观数据并注明正在复核。你守住了时限，没有替异常盖章；代价是接下来几周，每条撤回都要重新打电话确认。" },
      { text: "按现有口径上报，等下季度再整改", effects: { performance: 5, integrity: -8, trust: -5 }, accountability: { concealment: 2, dutyAbuse: 1, note: "明知统计受不当施压影响仍用于成绩上报。" }, outcome: "表彰拿到了，回访录音也在后来被公开。所有人都听见群众说‘是他们让我撤的’，那张奖状于是成了最醒目的证据。" }
    ]
  },
  {
    id: "dept_police_breath_call", category: "work", once: true, roleLevels: [5], storyTheme: "family-pressure",
    title: "酒精检测单上的名字很熟",
    body: "值班报告里出现堂兄的名字。叔叔马上来电：‘他没出事故，你让他们教育一下算了。’办案单位已依法处理，你没有权限替他改结果，却能让一个电话变成压力。",
    choices: [
      { text: "不联系办案人员，告知家属依法申辩渠道", effects: { integrity: 6, family: -3, trust: 1 }, outcome: "叔叔挂了电话。案件照程序办理，堂兄后来承认最难堪的不是处罚，而是以为你一定会出面。家里冷了一阵，但没有任何人需要解释一通不该存在的电话。" },
      { text: "报告亲属关系，回避接触相关信息", effects: { integrity: 7, performance: -1, family: -2 }, outcome: "你把值班报告交给其他负责人处理，自己不再查看细节。回避没让亲戚舒服，却把亲情和执法之间那扇门真正关上。" },
      { text: "打给承办负责人，强调‘没有造成后果’", effects: { family: 3, integrity: -11, performance: 1 }, accountability: { dutyAbuse: 3, concealment: 1, note: "为亲属向办案人员施加不当影响已进入责任链。" }, outcome: "对方只回答‘依法办理’，并按规定记录了来电。你没换来结果，却留下了一次清楚的干预痕迹。" }
    ]
  },
  {
    id: "dept_nightclub_supper", category: "work", once: true, roleLevels: [5], storyTheme: "regulatory-dinner",
    title: "宵夜桌上空着主位",
    body: "专项检查前，娱乐场所老板通过同学约你吃宵夜。包间主位一直空着，同学说：‘不求照顾，只想知道检查重点，大家别误伤。’桌下放着两箱名酒。",
    choices: [
      { text: "不入席，保留邀约信息并要求检查随机分组", effects: { integrity: 6, ability: 2, trust: 1 }, outcome: "那张空椅子整晚没人坐。随机分组后，检查人员直到出发才知道对象；你也不参加具体检查。老板后来抱怨不给面子，却找不到提前准备的名单。" },
      { text: "当面说明边界，公开告知所有经营者通用要求", effects: { integrity: 4, trust: 2, performance: 1 }, outcome: "你没去包间，而是让部门统一发布合规提示。所有经营者看到同一份要求，朋友想要的‘独家提醒’变成了公开信息。" },
      { text: "赴宴透露检查重点，不收酒就算没问题", effects: { performance: 2, integrity: -10 }, accountability: { dutyAbuse: 2, concealment: 1, acceptedValue: 0.3, note: "接受监管对象宴请并泄露检查安排已进入责任记录。" }, outcome: "酒留在包间，你以为边界还在。检查当天，对方所有重点区域都异常整洁，另一家经营者很快质疑消息泄露。饭钱不在你账户里，提前透露的话却在很多人的耳朵里。" }
    ]
  },
  {
    id: "dept_missing_child_live", category: "work", once: true, roleLevels: [5, 9], storyTheme: "public-opinion",
    title: "寻人直播间冲进十万人",
    body: "儿童走失消息迅速传播，家属正在直播中点名质疑进度。网上出现未经核实的嫌疑人照片。你要保障搜寻效率，也要避免谣言伤害无辜和泄露侦查信息。",
    choices: [
      { text: "发布核实过的寻人信息，设统一线索入口并及时辟谣", effects: { ability: 5, trust: 4, health: -3 }, outcome: "有效线索从数千条转为几十条，错误照片很快撤下。孩子最终被找到时，发布会上没有披露不该公开的细节，只说明哪些公众帮助真正有用。" },
      { text: "请家属暂停直播，由专人持续通报可公开进展", effects: { trust: 2, integrity: 3, performance: 1 }, outcome: "家属起初拒绝，看到固定联系人每小时回电后才关掉直播。网络热度下降，搜索没有停。你守住了信息边界，也没用一句‘正在处理’让家属独自等待。" },
      { text: "把尚未证实的方向先放出去发动网友", effects: { performance: 3, trust: -7, integrity: -4 }, outcome: "热心网友迅速围堵了一名无关人员。真正的线索反而被噪声淹没。几个小时后警方澄清，搜索仍在继续，那名被误认的人却已经登上热搜。" }
    ]
  },
  {
    id: "dept_lawyer_classmate", category: "work", once: true, roleLevels: [4, 6, 9], storyTheme: "old-friend-request",
    title: "老同学只想借你一句话",
    body: "多年未见的律师同学约你吃饭，拿出一宗企业纠纷材料：‘案子怎么判我不问，你只要让他们早点开庭。’服务员送来一瓶昂贵的酒，说已经记在他账上。",
    choices: [
      { text: "拒绝宴请，说明只能通过法定渠道反映程序问题", effects: { integrity: 6, family: -1, trust: 2 }, outcome: "老同学收起材料，说你现在说话像文件。你仍把公开投诉和查询渠道发给他，但没有替他打电话。后来程序问题得到处理，不需要任何人欠你一句人情。" },
      { text: "不谈个案，邀请相关部门公开梳理共性积压问题", effects: { ability: 4, integrity: 4, performance: -1 }, outcome: "一个人的请托没有变成特殊通道，却暴露出一批普遍的排期问题。整改面对所有当事人，同学的案件也只按统一规则推进。" },
      { text: "喝完这顿饭，替他问一句排期", effects: { performance: 2, integrity: -9 }, accountability: { acceptedValue: 0.25, dutyAbuse: 2, concealment: 1, note: "接受案件关系人宴请并为个案打探、施压。" }, outcome: "你自认只问了时间，没有问结果。对方却把你的来电记入工作记录，同学也在客户面前说‘上面有人帮忙问过’。一句话被他包装成了你从未承诺的权力。" }
    ]
  },
  {
    id: "dept_case_coordination_blank", category: "work", once: true, roleLevels: [4, 9], storyTheme: "case-boundary",
    title: "会签单最后一栏留给了你",
    body: "一家重点企业涉诉，商会担心停产影响就业，希望政法协调会‘统一认识’。材料最后一栏写着“建议暂缓财产处置”，只等你签字，但具体措施应由有权机关依法决定。",
    choices: [
      { text: "删去个案结果建议，只协调信息、风险预案和依法衔接", effects: { integrity: 7, ability: 4, performance: -2 }, outcome: "会议仍然召开，却不再讨论该怎么判、该不该采取措施，而是明确职工安置、信息通报和法定救济。企业没得到想要的保证，但就业风险有了合法的应对方案。" },
      { text: "请承办单位说明程序边界，会议不形成倾向性意见", effects: { integrity: 5, trust: 1, performance: -1 }, outcome: "承办单位只说明可公开程序，不汇报实体判断。会签单最后一栏改成‘各单位依法履职’，这句话听起来普通，却让协调没有越过案件边界。" },
      { text: "签下暂缓建议，先稳住企业再说", effects: { performance: 5, integrity: -12 }, accountability: { dutyAbuse: 3, concealment: 1, publicHarm: 1, note: "以协调名义对具体案件处置提出不当倾向性要求。" }, outcome: "企业暂时稳住，却把会签单当成了保护承诺。另一方当事人拿到复印件后公开质疑干预，原本的经营风险变成了对程序公正的信任危机。" }
    ]
  },
  {
    id: "dept_eldercare_bid", category: "work", once: true, roleLevels: [1, 6, 9], storyTheme: "project-procurement",
    title: "三家养老集团，四场饭局",
    body: "全省养老服务项目招标前，三家集团先后邀你调研、吃饭、出席论坛。第四场饭局由老朋友组局：‘只谈行业趋势，评委名单一句不问。’但他递来的座次表上全是投标方。",
    choices: [
      { text: "取消非必要接触，统一书面答疑并登记接触情况", effects: { integrity: 7, performance: -2, ability: 2 }, outcome: "论坛照常开，饭局取消。所有企业的问题和回答同时公开，评审人员也做了回避核查。项目慢了几天，却没人能把某一桌饭说成入场券。" },
      { text: "改成公开行业座谈，邀请监督人员全程参加", effects: { ability: 4, integrity: 4, trust: 1 }, outcome: "圆桌没有主位，发言和材料全部归档。企业仍会展示优势，但信息不再只流向某一家。你听到了真实行业难题，也没有欠下一顿私宴。" },
      { text: "参加朋友饭局，只听不表态", effects: { ability: 2, integrity: -8 }, accountability: { acceptedValue: 0.4, concealment: 1, note: "在采购敏感期接受投标相关方宴请。" }, outcome: "你确实没说评委是谁，却在闲聊里确认了预算侧重点。两周后，朋友的公司方案恰好把那部分写得最细。没人能证明一句话改变结果，但所有人都开始怀疑。" }
    ]
  },
  {
    id: "dept_relief_warehouse", category: "work", once: true, roleLevels: [2, 8, 9], storyTheme: "resource-triage",
    title: "仓库只剩六千条毯子",
    body: "寒潮突袭，三地共申请一万条救灾毯。仓库只有六千条，其中一个人口较少的山区道路将在六小时后封闭。平均分最容易解释，却未必能让物资及时到人。",
    choices: [
      { text: "按低温、受灾人数和到达窗口动态分配并公开依据", effects: { ability: 5, integrity: 4, trust: 2, health: -3 }, outcome: "山区先装车，其余地区按安置点实有人数配送，并同步启动社会储备。三地都嫌不够，但每一条毯子的去向和下一批时间都能查到。" },
      { text: "先保山区运输窗口，余量由两地共同调剂", effects: { performance: 4, trust: 1, health: -2 }, outcome: "最后一辆车赶在封路前通过。另两地把学校和社区库存临时并入统一调度，代价是很多人忙了一整夜。你解决的不是总量不足，只是没让时间把不足变成灾难。" },
      { text: "三地各发两千条，避免谁都说不公平", effects: { integrity: 1, ability: -5, trust: -3 }, outcome: "表格最整齐，山区车辆却只装到两千条就出发。次日封路后，缺口无法补进；受灾较轻的一地仓库里还压着几百条未拆封的毯子。" }
    ]
  },
  {
    id: "dept_data_watch", category: "work", once: true, roleLevels: [5, 6, 7, 8], storyTheme: "technology-procurement",
    title: "演示结束，桌上多了一块表",
    body: "执法数据平台供应商完成演示后，负责人把一只名表留在会议室：‘测试机，您戴着体验健康功能。’项目正处于技术评分阶段，手表包装内没有任何测试协议。",
    choices: [
      { text: "封存登记并报告，重新审查接触和评审安排", effects: { integrity: 7, ability: 3, performance: -2 }, outcome: "供应商声称是员工失误，调查未先替任何人定性。评审调整并补全接触记录，那块表从未戴到你手上，却迫使整个采购流程重新接受检查。" },
      { text: "立即退回，要求所有测试设备统一登记", effects: { integrity: 4, performance: 1 }, outcome: "手表当天退回，项目组补上设备登记和留样制度。一个看似尴尬的小插曲变成了以后所有厂商都要遵守的同一条规则。" },
      { text: "留下体验，等评分结束再归还", effects: { ability: 1, integrity: -10 }, assetChange: 1.8, accountability: { acceptedValue: 1.8, retainedValue: 1.8, concealment: 2, sentenceExposure: 7, note: "在采购评审期收受供应商高价值物品。" }, outcome: "你把表设成勿扰模式，却挡不住供应商在聊天里问‘体验如何’。评分结束后，测试设备清单里没有这只表，聊天记录里却有它。" }
    ]
  },
  {
    id: "dept_team_transfer_list", category: "work", once: true, roleLevels: [6, 8, 9], storyTheme: "team-integrity",
    title: "名单上突然多了一个名字",
    body: "重要岗位交流名单送到你桌上，临时多出一名履历普通的干部。分管负责人低声说：‘上面有人打过招呼，能力也不差，别为一个名字把会开僵。’",
    choices: [
      { text: "退回补齐提名依据，所有人按同一标准重新比较", effects: { integrity: 6, ability: 3, performance: -2 }, outcome: "会议延期，几名原本已安排好的干部都得重新说明。新增人选可以继续参与，却不再带着一句无法核实的‘上面意思’直接进名单。" },
      { text: "保留人选，但把新增过程和不同意见写入纪要", effects: { integrity: 3, trust: 1, performance: 1 }, outcome: "人选进入集体讨论，支持和反对理由都落在纸上。结果未必改变，但一句打招呼不再是唯一依据，也不能在事后假装从未发生。" },
      { text: "默认加入，换取会议顺利通过", effects: { performance: 4, integrity: -9, trust: -3 }, accountability: { dutyAbuse: 2, concealment: 1, note: "在干部安排中隐瞒非正常提名并放弃程序核验。" }, outcome: "名单全票通过。半年后那名干部出现履职问题，最先撇清关系的人正是当初说‘上面有人打过招呼’的负责人，而会议纪要里找不到新增过程。" }
    ]
  },
  {
    id: "dept_business_private_room", category: "work", once: true, roleLevels: [9], storyTheme: "business-lobbying",
    title: "包间里没有菜单，只有三份诉求",
    body: "商会负责人以研究营商环境为名邀你赴宴。入座后，三名企业主分别要求协调涉案资产、工程资质和检查频次；桌边还摆着一张未署名的会员卡。",
    choices: [
      { text: "立即结束饭局，将共性问题转公开座谈、个案走法定渠道", effects: { integrity: 7, trust: 2, performance: -1 }, outcome: "饭菜还没上齐，会议就散了。次周公开座谈只讨论制度问题，三个个案各自回到法定程序。商会说你不给面子，却再也不能把私人包间描述成正式协调会。" },
      { text: "只听共性诉求并公开记录，会员卡当场退回", effects: { ability: 3, integrity: 4, health: -1 }, outcome: "你让工作人员进场记录，包间气氛立刻变了。企业主不再谈具体案件，转而说制度衔接。会员卡退回后，真正能公开讨论的问题反而清楚起来。" },
      { text: "留下吃饭，答应分别让有关单位‘关注一下’", effects: { performance: 3, integrity: -13 }, accountability: { acceptedValue: 1, dutyAbuse: 3, concealment: 2, sentenceExposure: 7, note: "接受利益相关方宴请和会员权益并为多个事项施加不当影响。" }, outcome: "三通电话换来三句‘收到’，企业主却对外说问题已经得到高层协调。会员卡随后在另一宗调查中被查到来源，你的名字和三个诉求出现在同一份席位表上。" }
    ]
  },
  {
    id: "dept_national_foundation", category: "work", once: true, roleLevels: [10], storyTheme: "outside-interest",
    title: "退休后的席位，提前十年送到",
    body: "一家大型公益基金会请你担任未来顾问，年酬可观，现在无需签约，只希望你推动它参与跨区域试点。邀请函写着‘待离任后生效’，利益却从今天就开始。",
    choices: [
      { text: "拒绝安排并主动申报接触，试点按公开条件遴选", effects: { integrity: 7, trust: 2, performance: -1 }, outcome: "邀请函归档，基金会仍可按同样条件申报。多年后的工作去向没有变成今天的交换筹码，试点也不需要靠相信你会忘记那份年酬。" },
      { text: "要求建立利益冲突规则，由他人负责相关遴选", effects: { integrity: 5, ability: 3 }, outcome: "你退出具体工作，规则覆盖所有潜在任后安排，不只针对这一次邀请。基金会不满，但它面对的是公开制度，而不是你个人的一句拒绝。" },
      { text: "口头接受未来席位，眼下先给试点机会", effects: { performance: 4, integrity: -14 }, accountability: { acceptedValue: 8, dutyAbuse: 3, concealment: 3, sentenceExposure: 12, note: "以未来高额利益安排交换当前职务便利，形成严重责任风险。" }, outcome: "纸面上没有当日转账，双方却都按约定行动。后来基金会内部邮件被调取，‘顾问席位换试点’写得比任何合同都直白。未来的报酬，最终成为今天用权的证据。" }
    ]
  }
];

DEPARTMENT_STORIES.forEach((event) => { event.contentTag = "部门履职 · 虚构剧情"; });

module.exports = { DEPARTMENT_STORIES };
