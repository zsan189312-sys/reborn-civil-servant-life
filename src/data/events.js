"use strict";

const { FOLLOWUPS } = require("./followups");
const { SENIOR_EVENTS } = require("./senior-events");
const { CAREER_STORIES } = require("./career-stories");
const { CAREER_FOLLOWUPS } = require("./career-followups");
const { ETHICS_STORIES } = require("./ethics-stories");
const { CHILD_STORIES } = require("./child-stories");
const { ASSESSMENTS } = require("./assessments");
const { DUTY_STORIES } = require("./duty-stories");
const { LIFE_DILEMMAS } = require("./life-dilemmas");
const { ENGAGING_WORK_STORIES } = require("./engaging-work-stories");
const { DEPARTMENT_STORIES } = require("./department-stories");
const { SECTOR_STORIES } = require("./sector-stories");
const { MORE_SECTOR_STORIES } = require("./more-sector-stories");
const { INTEGRITY_ASSESSMENTS } = require("./integrity-assessments");
const { INSPECTION_CRISIS_STORIES } = require("./inspection-crisis-stories");
const { ALL_ROLE_LEVELS } = require("../core/constants");

const ALL_ROLES = ALL_ROLE_LEVELS;
const EARLY_ROLES = [0, 1, 2];
const MIDDLE_ROLES = [2, 3, 4, 5];
const SENIOR_ROLES = [5, 6];

const EVENTS = [
  {
    id: "work_shared_room",
    once: true,
    category: "work",
    title: "共享活动室",
    body: "两支社区小组都想在周末使用唯一的活动室，一方服务老人，另一方辅导儿童。预算暂时无法扩建。",
    roleLevels: EARLY_ROLES,
    choices: [
      { text: "召集双方排出轮换表", effects: { ability: 2, trust: 4, health: -2 }, flags: { sharedRoomTrial: true } },
      { text: "按申请先后直接分配", effects: { performance: 2, trust: -3 } },
      { text: "暂停开放，等待扩建", effects: { integrity: 1, performance: -4, trust: -2 } }
    ]
  },
  {
    id: "work_rain_shelter",
    once: true,
    category: "work",
    title: "雨季临时安置",
    body: "连续降雨让低洼住宅面临进水风险。临时安置点容量有限，居民对搬离意见不一。",
    roleLevels: ALL_ROLES,
    choices: [
      { text: "先入户说明，再分批转移", effects: { trust: 4, performance: 3, health: -3 } },
      { text: "优先转移高风险住户", effects: { ability: 3, integrity: 2, trust: 1 } },
      { text: "等待天气数据更明确", effects: { ability: 1, performance: -5, health: 2 } }
    ]
  },
  {
    id: "work_old_records",
    once: true,
    category: "work",
    title: "签字日期在他调走以后",
    body: "档案柜最底层掉出一张未归档的验收单。签字人周师傅三个月前已经调走，落款日期却是上周；项目款早已支付，下午审计人员就来调材料。办公室里没人能说清这张纸是谁放进去的。",
    roleLevels: EARLY_ROLES,
    choices: [
      { text: "封存原件，逐份核对付款与验收时间", effects: { ability: 4, integrity: 4, performance: -2, health: -2 }, outcome: "你把下午原定的工作全部推迟，逐页核对。最后发现验收本身发生在周师傅任内，是新同事补录时照着旧签名誊写，却擅自写了当天日期。不是惊天大案，但一张‘省事’的纸足以让整个项目失去可信度。" },
      { text: "先补齐审计急用目录，异常单另做标记", effects: { performance: 3, ability: 2, integrity: -1 }, outcome: "审计调档时目录完整，异常单被你夹在待核页里。当天顺利过去，周师傅却在电话里说从没见过那张新单。你没有隐瞒，也没有当场查清；这件事从火烧眉毛变成了一根必须记住的刺。" },
      { text: "联系周师傅，并请现经办人一起说明来源", effects: { trust: 3, integrity: 3, performance: 1, health: -1 }, outcome: "周师傅赶来第一句话就是：‘这不是我写的。’现经办人沉默很久，承认补材料时沿用了旧签名扫描件。你们当场形成情况记录并更正，审计进度慢了半天，但责任不再藏在一句含糊的‘前任留下’里。" }
    ]
  },
  {
    id: "work_quiet_market",
    once: true,
    category: "work",
    title: "夜市噪声争议",
    body: "夜市给周边带来收入，也让邻近住户难以入睡。双方都要求你立即给出答案。",
    roleLevels: [0, 1, 2, 3, 4],
    choices: [
      { text: "试行分区和限时经营", effects: { ability: 3, trust: 3, performance: 2 } },
      { text: "立即取消夜间经营", effects: { integrity: 1, trust: -4, performance: 1 } },
      { text: "暂不调整，继续观察", effects: { health: 1, trust: -3, performance: -2 } }
    ]
  },
  {
    id: "work_supplier_gift",
    once: true,
    category: "work",
    title: "没有署名的礼盒",
    body: "项目评审前，你在办公室收到一份没有署名的礼盒。快递信息指向一名候选供应方。",
    roleLevels: ALL_ROLES,
    choices: [
      { text: "登记上交并主动回避评审", effects: { integrity: 7, trust: 2, performance: -1 }, flags: { declaredGift: true } },
      { text: "退回礼盒，继续参加评审", effects: { integrity: 3, performance: 2 } },
      { text: "放在办公室不作处理", effects: { integrity: -8, health: -2 }, flags: { unresolvedGift: true } }
    ]
  },
  {
    id: "work_accessible_path",
    once: true,
    category: "work",
    title: "被忽略的坡道",
    body: "改造方案已经接近定稿，一名轮椅使用者指出主入口仍有台阶。调整会增加少量工期。",
    roleLevels: [1, 2, 3, 4],
    choices: [
      { text: "补做无障碍评估并修改", effects: { trust: 5, integrity: 3, performance: -1 } },
      { text: "另设侧门临时坡道", effects: { performance: 2, trust: 1, ability: 1 } },
      { text: "按原方案按时交付", effects: { performance: 4, trust: -6, integrity: -2 } }
    ]
  },
  {
    id: "work_public_budget",
    once: true,
    category: "work",
    title: "预算说明会",
    body: "一个长期项目超出最初预算。团队担心公开细节会引发质疑，但不说明会进一步损害信任。",
    roleLevels: MIDDLE_ROLES,
    choices: [
      { text: "公开原因、责任和修正计划", effects: { integrity: 5, trust: 4, performance: -2 } },
      { text: "只公布调整后的总金额", effects: { performance: 2, integrity: -3, trust: -2 } },
      { text: "先暂停项目并独立复核", effects: { integrity: 4, ability: 2, performance: -4 } }
    ]
  },
  {
    id: "work_team_burnout",
    once: true,
    category: "work",
    title: "疲惫的项目组",
    body: "项目连续赶工，成员开始频繁出错。按期完成仍有可能，但团队已经接近极限。",
    roleLevels: MIDDLE_ROLES,
    choices: [
      { text: "缩小范围并调整期限", effects: { integrity: 2, trust: 4, performance: -2 } },
      { text: "自己承担最紧急的部分", effects: { performance: 4, trust: 2, health: -6 } },
      { text: "维持计划并增加检查", effects: { performance: 2, ability: 2, trust: -4 } }
    ]
  },
  {
    id: "work_cross_district",
    once: true,
    category: "work",
    title: "跨片区资源",
    body: "两个片区同时申请同一支技术队伍。数据支持先处理甲区，但乙区的居民等待时间更久。",
    roleLevels: MIDDLE_ROLES,
    choices: [
      { text: "公开指标并安排先后顺序", effects: { integrity: 4, ability: 3, trust: 1 } },
      { text: "先处理等待更久的乙区", effects: { trust: 4, performance: -1 } },
      { text: "拆分队伍同时开工", effects: { performance: 3, ability: -2, health: -2 } }
    ]
  },
  {
    id: "work_bad_dashboard",
    once: true,
    category: "work",
    title: "漂亮但失真的数字",
    body: "季度看板表现亮眼，你却发现统计口径把未完事项也算作完成。纠正后成绩会明显下降。",
    roleLevels: [2, 3, 4, 5, 6, 7],
    choices: [
      { text: "立即更正并解释口径", effects: { integrity: 7, trust: 3, performance: -5 } },
      { text: "本季度保留，下季度修正", effects: { performance: 4, integrity: -7 } },
      { text: "请独立人员复核全部数据", effects: { integrity: 5, ability: 2, performance: -2 } }
    ]
  },
  {
    id: "work_long_project",
    once: true,
    category: "work",
    title: "看不见的长期项目",
    body: "你可以选择短期见效的景观改善，也可以修复老旧地下管线。后者更重要，却很难在本年展示成果。",
    roleLevels: [3, 4, 5, 6, 7],
    choices: [
      {
        text: "优先修复地下管线",
        effects: { performance: -2, integrity: 3 },
        delayed: [{ afterYears: 2, effects: { performance: 8, trust: 5 }, message: "早年的管线修复经受住了暴雨。" }]
      },
      { text: "先做可见的景观改善", effects: { performance: 5, trust: 2 } },
      { text: "缩减两个项目并行推进", effects: { ability: 3, performance: 2, health: -4 } }
    ]
  },
  {
    id: "work_public_hearing",
    once: true,
    category: "work",
    title: "意见会上的反对声",
    body: "一项城市更新计划获得多数支持，但会给少数老住户带来搬迁压力。现场反对声越来越大。",
    roleLevels: SENIOR_ROLES,
    choices: [
      { text: "暂停表决，补充安置方案", effects: { integrity: 5, trust: 5, performance: -4 } },
      { text: "按多数意见继续推进", effects: { performance: 5, trust: -5, integrity: -2 } },
      { text: "拆分项目，先做无争议部分", effects: { ability: 4, performance: 2, trust: 2 } }
    ]
  },
  {
    id: "life_family_dinner",
    once: true,
    category: "life",
    title: "蜡烛还没点",
    body: "母亲发来一张照片：父亲戴着歪歪的生日帽，面前摆着三副碗筷。她说：‘不急，你爸刚到家。’可窗外明明已经黑了。你记得上一世，自己也回过一句‘马上’。桌上的材料明早交，今晚做完，明天就能腾手争取新任务。",
    roleLevels: ALL_ROLES,
    choices: [
      { text: "合上电脑：这次我来点蜡烛", effects: { family: 6, health: 2, performance: -1 }, flags: { birthdayHome: true }, outcome: "门一开，父亲先把生日帽摘了：‘这么大的人，戴这个不像话。’你说挺好看，又给他扣上。他嘴上嫌你闹，吹蜡烛时却让你连拍了三张。明早得赶材料，今晚的位置没空着。" },
      { text: "先交材料，打电话请他们开饭", effects: { performance: 3, family: -5, health: -2 }, flags: { birthdayMissed: true }, outcome: "材料按时发出，对接人回了句‘收到，辛苦’。到家时，父亲已经睡了，蛋糕上留着一根没点过的蜡烛。母亲正擦桌子：‘他说这根留给你。’你没再解释那份材料有多重要。" }
    ]
  },
  {
    id: "life_evening_course",
    once: true,
    category: "life",
    title: "全班就你没交作业",
    body: "晚间课程的老师把你拉进预备群。头像全是猫和风景，群名却叫‘今晚谁也别想摸鱼’。第一份练习已经发来，你盯了十分钟，竟不如刚入职时做得快。报名要占半年、每周两个晚上，家里的周历早已写得满满当当。",
    roleLevels: ALL_ROLES,
    choices: [
      {
        text: "报名，把周四晚上从全世界手里抢回来",
        effects: { ability: 5, family: -1, health: -2 },
        outcome: "你在群里问了一道‘可能很基础’的题，立刻收到七个同款问号。原来大家也不会。晚上，家人在周历上划掉一项安排，补上：‘周四下课，记得带夜宵。’",
        delayed: [{ afterYears: 1, effects: { ability: 3, performance: 2 }, message: "工作中碰到一道熟悉的难题，你翻出那门夜课的笔记。群里有人发‘终于用上了’，你也跟了一条。那几晚没有白熬。" }]
      },
      { text: "这期不报，先把答应家人的时间还上", effects: { family: 5, health: 2 }, outcome: "你退出预备群，把日历上的两个晚上圈了起来。家人问：‘确定不会临时有事？’你没说保证，只把手机放远了一点。那份没做完的练习，仍压在书桌角上。" },
      { text: "嘴硬选自学，凌晨和第三章互相熬", effects: { ability: 2, health: -4 }, outcome: "凌晨一点，你终于弄懂了第二章。第三章翻开时，额头已经碰到书页。第二天同事问你脸上的印子是什么，你说：‘知识，刚盖的章。’" }
    ]
  },
  {
    id: "life_health_check",
    once: true,
    category: "life",
    title: "裤子先提出了意见",
    body: "早晨换衣服，裤扣啪地弹进床底。你趴着找了半天，翻出一张早该处理的体检复查提醒。家人在门口憋笑：‘裤子都催你了。’今天没有紧急任务，但你原打算趁空补完积压的材料。手机上，复查预约还有空位。",
    roleLevels: ALL_ROLES,
    choices: [
      { text: "把扣子装进“证物袋”，今天就去复查", effects: { health: 7, performance: -1 }, outcome: "你按预约去复查，把后续交给医生判断。晚上出门散步，家人坚持拿着那颗扣子当‘出勤监督员’。走到第二条街，你笑着求饶，脚步倒没停。积压材料只能分几天补。" },
      { text: "换条宽松的，假装裤子什么都没说", effects: { performance: 2, health: -6 }, outcome: "宽松的裤子解决了今天的尴尬，却没替你处理那张提醒。材料又清掉一摞，家人把扣子装进小袋，贴在门边：‘失物招领。别连自己也弄丢了。’" }
    ]
  },
  {
    id: "life_old_friend",
    once: true,
    category: "life",
    title: "他忽然不叫你外号了",
    body: "从小一起长大的马川约你吃面。小时候他能抢走你半个馒头，今天却先替你擦了筷子。聊到一半，他把一份申请回执推过来：‘你认识人，帮我催一下？店等着开呢。’这事有公开查询渠道。他那句没叫出口的外号，比回执更让你难受。",
    roleLevels: ALL_ROLES,
    choices: [
      { text: "不替他插队，陪他查公开进度", effects: { integrity: 5, family: -1, trust: 1 }, flags: { friendPublicRoute: true }, outcome: "马川把回执收了回去，面也不拌了。你把查询入口写在纸上，推到他手边。他临走说‘行，麻烦你了’，还是没叫你的外号。你付了自己的面钱，没追上去许别的诺。" },
      { text: "对照公开清单，只帮他检查材料", effects: { integrity: 1, family: 2 }, flags: { friendPublicRoute: true }, outcome: "你们在面馆摊开清单，真找出一处漏填。他嘀咕：‘你早说是这里。’你回：‘你早拿出来，面都不用坨。’他终于笑了，临走又顺走你一颗卤蛋。" },
      { text: "念着旧交情，私下托人提前办", effects: { integrity: -9, family: 3 }, flags: { improperFavor: true }, outcome: "电话打完，马川又喊起你的外号，拍着胸口说记一辈子。你也笑了。几天后他发来进度提前的消息，你却盯着回执上的顺序号——排在他前面的人，并没有你的号码。" }
    ]
  },
  {
    id: "life_weekend_walk",
    once: true,
    category: "life",
    title: "同学群突然热闹了",
    body: "周末同学聚餐，群里有人喊你‘领导’，还说主位已经留好。你还没回复，当年同桌就发来私信：‘别理他们。毕业那年你周转不开，借我的 5000 元，今天带了没？’同一晚，家里等你看一部老电影，书桌上也放着尚未动笔的工作计划。",
    roleLevels: ALL_ROLES,
    choices: [
      { text: "去坐同桌旁边，吃完早点回家", effects: { family: 5, health: 3 }, assetChange: -0.5, outcome: "你当着他的面转了 5000 元，备注写着‘欠了好多年的旧账’。全桌笑得比你进门时真诚多了。有人刚要敬‘领导’，同桌已经讲起你跳远摔进沙坑的旧事。回家时电影才到开头，沙发上还给你留着位置。" },
      { text: "谢过邀请，把今晚留给安静", effects: { health: 6, trust: -1 }, outcome: "你回了句‘这次不去了，下次约’，把手机扣在桌上。同桌发来语音：‘5000 元的利息继续算啊。’你笑了一声。聚餐照片没有你，但这一晚也不必向谁解释自己过得怎样。" },
      { text: "这次缺席，先准备下一阶段工作", effects: { ability: 2, performance: 3, health: -3 }, outcome: "计划写到第三页，群里开始轮流唱走调的歌。你听了半段，把声音关掉。临睡前，同桌单独发来一张空椅子的照片：‘菜给你留过。下次来，别只在群里鼓掌。’" }
    ]
  },
  {
    id: "life_move_house",
    once: true,
    category: "life",
    title: "房东说，只留到今晚",
    body: "单位附近有套住处空出来，窗外能看见一棵大树，步行上班只要十分钟。房东催你今晚决定。你算着能省下的通勤，家人却在旧屋门框边站了很久：‘这边哪块地板会响，我闭着眼都知道。’搬家和预付租金，会吃掉一大笔积蓄。",
    roleLevels: ALL_ROLES,
    minYear: 4,
    choices: [
      { text: "商量后搬过去，把通勤时间还给生活", effects: { health: 5, family: -2 }, assetChange: -12, outcome: "第一晚找不到盐，也找不到充电线。家人蹲在纸箱堆里，说这房子最大的优点是‘离原来的家很远’。第二天你多睡了半小时，出门前把那瓶盐放到了最顺手的位置。" },
      { text: "不被今晚催着走，继续住老地方", effects: { health: -2, family: 1 }, assetChange: 2, outcome: "你谢过房东，把预留搬家的钱放回家庭结余。第二天又挤了很久的车，到家时那块地板照旧吱呀一声。家人没回头，就知道是你：‘饭在锅里。’" }
    ]
  },
  {
    id: "life_hobby_group",
    once: true,
    category: "life",
    title: "这里没人叫你领导",
    body: "楼下老唐拉你去参加业余乐队。你说自己多少年没碰吉他，他把琴往你怀里一塞：‘正好，我们也没几个会的。’第一遍合奏，你慢了半拍，鼓手笑得鼓槌都掉了。老唐问，下个月还来不来？那晚可能正好要整理季度材料。",
    roleLevels: ALL_ROLES,
    choices: [
      { text: "认领“不太稳的吉他手”，每月失误一次", effects: { health: 5, family: 2, performance: -1 }, flags: { bandCommitted: true }, outcome: "老唐当场把你的备注改成‘吉他，暂时不稳’。回家你弹了两句，家人从厨房探头：‘这首你年轻时也弹不利索。’你把季度材料提前摊开，给下个月那晚腾位置。" },
      { text: "先当编外队员，有空来一起制造噪声", effects: { health: 2 }, outcome: "老唐说随时来，把备用凳子往墙边一靠。你出门时听见他们又错了一遍拍子，几个人争了两句，接着笑。走到楼下，你才发现自己一路都在哼。" },
      { text: "把琴还回去：等我忙完——这句又来了", effects: { performance: 3, health: -3, family: -2 }, outcome: "你把琴放回琴盒，说等忙完再来。老唐没劝，只把背带替你理直了：‘行，别等到我们都弹利索了。’晚上你多改完一份材料，手指却还在桌沿上无声地按和弦。" }
    ]
  },
  {
    id: "life_family_choice",
    requiresPartner: true,
    minRelationshipYears: 2,
    once: true,
    category: "life",
    title: "这次，换我往前走",
    body: "伴侣把外地的工作邀请放在饭桌上，连信封都抚平了。‘以前总是跟着你的安排走，这次我想试试。’你刚在现在的岗位站稳脚跟，真要两地生活，连一起吃饭都得提前排时间。你记得上一世，也在这样的饭桌前说过‘再等等’。",
    roleLevels: ALL_ROLES,
    minYear: 6,
    choices: [
      { text: "支持这次机会，一起算团聚的日子", effects: { family: 5, health: -2 }, outcome: "你们把两座城市之间的车次看了一遍，发现想得容易，走起来真折腾。伴侣还是笑了，第一次主动谈起新工作的细节。后来有个周日，你拖着行李赶末班车，手机亮起：‘到家说一声。’" },
      { text: "坦白舍不得，请对方再考虑留下", effects: { family: -5, health: 1 }, outcome: "伴侣把邀请收回信封，没有当场答应你。晚饭照常吃完，只是没再聊新工作的事。你保住了熟悉的作息，却不知道那张被抚平的信封，最后会放进哪个抽屉。" },
      { text: "了解正式调动渠道，不先许下结果", effects: { family: 4, performance: -4, ability: 2 }, outcome: "你们一起查正式渠道和条件，还没有空缺，更没有保证。伴侣看着你写下待咨询的问题：‘不用为了我硬答应。肯一起想，就和以前不一样了。’这阵准备和沟通，挤掉了不少业务时间。" }
    ]
  },
  {
    id: "city_heat_wave",
    once: true,
    category: "city",
    title: "持续高温",
    body: "澄川连续多日高温。临时避暑空间有限，需要在开放时间、服务范围和维护成本之间取舍。",
    roleLevels: ALL_ROLES,
    choices: [
      { text: "优先覆盖独居老人和户外人员", effects: { trust: 5, integrity: 3, performance: 2 } },
      { text: "平均分配到所有片区", effects: { integrity: 2, performance: 1 } },
      { text: "维持现有开放时间", effects: { performance: -4, trust: -5, health: 1 } }
    ]
  },
  {
    id: "city_library_future",
    once: true,
    category: "city",
    title: "旧图书馆的未来",
    body: "旧图书馆维护成本逐年增加。有人建议改成商业空间，也有人希望保留公共阅读功能。",
    roleLevels: ALL_ROLES,
    choices: [
      {
        text: "分区改造并保留公共空间",
        flags: { libraryRenovation: true },
        effects: { performance: -2, ability: 3 },
        delayed: [{ afterYears: 2, effects: { trust: 7, performance: 4 }, message: "旧图书馆的新空间逐渐成为社区活动中心。" }]
      },
      { text: "整体改成商业空间", effects: { performance: 5, trust: -5 } },
      { text: "只做最低限度维修", effects: { integrity: 1, performance: -1 } }
    ]
  },
  {
    id: "city_water_plan",
    once: true,
    category: "city",
    title: "节水方案",
    body: "供水压力上升，统一限额最容易执行，但不同家庭和小型经营者承受能力差异很大。",
    roleLevels: ALL_ROLES,
    minYear: 3,
    choices: [
      { text: "按基本需求分级设置", effects: { ability: 4, integrity: 4, performance: 1 } },
      { text: "统一限额，快速执行", effects: { performance: 4, trust: -4 } },
      { text: "先做自愿节水宣传", effects: { trust: 2, performance: -3 } }
    ]
  },
  {
    id: "city_open_data",
    once: true,
    category: "city",
    title: "开放数据提议",
    body: "团队建议公开一批去标识化的城市运行数据，方便公众监督和研究，但前期清理工作量很大。",
    roleLevels: [3, 4, 5, 6, 7],
    minYear: 8,
    choices: [
      { text: "先做隐私评估，再分批开放", effects: { integrity: 5, ability: 3, performance: -2 } },
      { text: "一次性全部公开", effects: { trust: 4, ability: -3, integrity: -2 } },
      { text: "暂不开放，只发布摘要", effects: { performance: 2, trust: -2 } }
    ]
  },
  ...FOLLOWUPS,
  ...SENIOR_EVENTS,
  ...CAREER_STORIES,
  ...CAREER_FOLLOWUPS,
  ...ETHICS_STORIES,
  ...CHILD_STORIES,
  ...ASSESSMENTS,
  ...DUTY_STORIES,
  ...LIFE_DILEMMAS,
  ...ENGAGING_WORK_STORIES,
  ...DEPARTMENT_STORIES,
  ...SECTOR_STORIES,
  ...MORE_SECTOR_STORIES,
  ...INTEGRITY_ASSESSMENTS,
  ...INSPECTION_CRISIS_STORIES
];

module.exports = { EVENTS };
