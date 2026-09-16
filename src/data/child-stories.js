"use strict";

const { ALL_ROLE_LEVELS } = require("../core/constants");

const CHILD_STORIES = [
  {
    id: "life_child_form", category: "life", title: "职业那一栏", roleLevels: ALL_ROLE_LEVELS,
    requiresChild: true, minChildAge: 6, maxChildAge: 9, once: true,
    body: "小满把学校发的家庭信息表推到你面前，指着家长职业那一栏：‘这里写公务员，还是写你的职务？’你刚想解释，孩子又补了一句：‘同学问你平时做什么，我说你主要在接电话。’你拿着笔，一时没找到比这更好的答案。",
    choices: [
      { text: "放下手机，讲一件自己真正做过的事", effects: { family: 5, trust: 1, performance: -1 }, outcome: "你没讲头衔，讲了一个问题怎样从没人负责变成有人解决。小满听完问：‘那现在那个人不用再跑来跑去了吗？’你发现，孩子问的竟比不少汇报里的问题更直接。" },
      { text: "约好周末细聊，今晚先把急事交接完", effects: { family: 1, ability: 2, health: -1 }, outcome: "你在日历里留出一段不安排工作的时间，并真的赴了约。小满准备了一张问题清单，第一条竟是‘为什么下班以后还有电话’。这一次，你没有用‘等你长大就懂了’结束谈话。" },
      { text: "简单填好表格，继续处理材料", effects: { performance: 3, family: -4 }, outcome: "表格填得很规范，孩子也没有再打扰。晚些时候，你在另一张纸上看见一幅画：一个人坐在桌前，手机比脑袋还大。小满没有写这画的是谁。" }
    ]
  },
  {
    id: "life_child_answer", category: "life", title: "请别替我回答", roleLevels: ALL_ROLE_LEVELS,
    requiresChild: true, minChildAge: 12, maxChildAge: 15, once: true,
    body: "亲友饭桌上，有人问小满以后想做什么。你习惯性地接过话，说了几条自己认为稳妥的路。回家以后，孩子把房门留了一道缝：‘你在外面开会也这样吗？别人还没说，你就替别人总结好了。’",
    choices: [
      { text: "道歉，把没听完的想法认真听完", effects: { family: 5, ability: 2, health: -1 }, outcome: "小满的计划远谈不上成熟，里面有热情，也有几处想得太简单。你忍住了立刻纠正的冲动，先问想从哪一步试起。那晚你们没有定下未来，只把说话的位置还给了对方。" },
      { text: "一起列出选择与代价，不急着定方向", effects: { family: 3, ability: 3, performance: -1 }, outcome: "你们拿来两张纸，一张写想做什么，一张写需要准备什么。孩子否掉了你的第一版表格：‘别搞得像交材料。’你笑着划掉了那行‘完成时限’。" },
      { text: "强调自己的经验，希望孩子少走弯路", effects: { integrity: 1, family: -4, health: 1 }, outcome: "你的道理未必全错，只是这一次，孩子不再接话。房门轻轻关上，你没有追着敲。你慢慢意识到，让别人听见自己的建议，和替别人决定，并不是同一件事。" }
    ]
  },
  {
    id: "life_child_suitcase", category: "life", title: "行李箱留了一半", roleLevels: ALL_ROLE_LEVELS,
    requiresChild: true, minChildAge: 18, maxChildAge: 22, once: true,
    body: "小满准备离家，试着独立安排下一阶段的学习和生活。你把行李箱塞得满满当当，孩子又拿出一半：‘你总不能把往后的路也一起装进去。’你想起刚录用那年，自己的箱子似乎也是这样被人重新整理过。",
    choices: [
      { text: "一起核对生活预算，其余由孩子决定", effects: { family: 4, ability: 2, health: 1 }, outcome: "你们把必要开支、遇到困难时怎样联系说清楚，没有给每一天写好安排。临出门，小满忽然问你当年第一次独自离家怕不怕。你终于承认：怕，只是那时候没说。" },
      { text: "安排好工作交接，陪孩子走这一程", effects: { family: 5, health: -2, performance: -1 }, outcome: "一路上你没再检查行李，只听孩子说接下来的打算。告别时，对方反过来叮嘱你别总熬夜。回程的车上，手机响了，你先把那条‘到了告诉我’的信息发出去。" },
      { text: "让家人去送，自己留下处理事务", effects: { performance: 3, family: -3 }, outcome: "你按时参加了会议。中途收到一张车窗照片，配字只有‘出发啦’。你回复‘照顾好自己’，又删掉一句习惯性的叮嘱。孩子已经上路，这次没等你忙完。" }
    ]
  }
];

module.exports = { CHILD_STORIES };
