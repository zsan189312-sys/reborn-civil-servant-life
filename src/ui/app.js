"use strict";

const { ATTRIBUTE_LABELS, ATTRIBUTES, BACKGROUNDS, ROLES, CIVIL_RANKS, MAX_CAREER_YEARS, START_AGE } = require("../core/constants");
const {
  advanceAfterResult,
  beginYear,
  calculateReview,
  completeReview,
  createNewGame,
  finalizeAnnualPlanning,
  findCurrentEvent,
  leaveCareer,
  PROMOTION_MOVES,
  promotionActionReason,
  setPromotionChoice,
  selectChoice,
  repairLegacyPacing,
  repairRepetitiveCurrentTheme,
  repairRepeatedCurrentEvent,
  validateSavedGame
} = require("../core/engine");
const { EVENTS } = require("../data/events");
const { ENDINGS, getEndingPresentation } = require("../data/endings");
const platform = require("../platform/wechat");
const { HOUSING, RELATIONSHIPS, ACTIONS, getLifeState, childAge, annualChildCost, actionReason, takeLifeAction } = require("../core/life");
const { ACCOUNT_RATES, getAccounts, homeFunding } = require("../core/accounts");

const COLORS = {
  background: "#0c1118",
  paper: "#151e2b",
  ink: "#e8edf5",
  muted: "#a5b2c5",
  teal: "#24c99a",
  tealDark: "#69debe",
  mint: "#bde8dc",
  gold: "#ddba7c",
  red: "#ff969c",
  line: "#2c394b",
  white: "#f5f7fb",
  header: "#111a26",
  buttonInk: "#08251b"
};

const TRANSFER_LABELS = { automatic: "年终组织评定", legacy: "旧版年度考核" };

// 《微信小游戏运营规范》2.6.2：游戏开始前必须在画面显著位置全文登载《健康游戏忠告》。
// The wording is fixed by the platform; do not paraphrase or shorten it.
const HEALTH_ADVICE = "抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。";

// Age rating shown before play (platform rule 11.3). Change this single value
// if the platform requires a different band.
const AGE_RATING = "适龄提示：本游戏适合 16 周岁以上用户";

// The game collects nothing and has no network calls, so the notice states
// that plainly instead of reusing a generic template that overstates it.
const PRIVACY_VERSION = 1;
const PRIVACY_NOTICE = [
  "本游戏为单机小游戏。",
  "收集的信息：不收集姓名、手机号、身份证号、位置、通讯录、相册、麦克风或任何个人身份信息。",
  "使用的设备能力：仅读取屏幕尺寸与安全区用于排版，读取触摸事件用于操作，使用本机存储保存游戏进度与结局收藏。",
  "数据存储与删除：进度仅保存在你的设备上，不上传、不联网、不与第三方共享。可在游戏内删除本地数据，或删除小游戏清除。",
  "广告与支付：当前版本不含广告、充值或任何交易。将来若接入，将只使用平台官方能力，并在接入前更新本说明。",
  "未成年人：请结合适龄提示合理安排游戏时间。"
];

const CAREER_STAGES = [
  "基层起步", "基层历练", "副科履新", "副科历练", "正科主政",
  "县处历练", "市级主政", "厅局履新", "厅局主政", "综合领导", "全局协调"
];

function currentYearChanges(state) {
  return (state.history || []).filter((entry) => entry.year === state.careerYear)
    .reduce((result, entry) => {
      ATTRIBUTES.forEach((key) => { result[key] += entry.changes[key] || 0; });
      return result;
    }, Object.fromEntries(ATTRIBUTES.map((key) => [key, 0])));
}

function householdBalance(state) {
  const life = getLifeState(state);
  const accounts = getAccounts(state);
  const cash = Math.max(0, state.assets);
  const fixedAssets = (life.housing === "owned" ? 50 : 0) + (life.vehicle ? 8 : 0);
  const restricted = accounts.housingFund + accounts.annuity;
  const debt = Math.max(0, -state.assets);
  return { cash, fixedAssets, restricted, debt, netAssets: cash + fixedAssets + restricted - debt };
}

function compactNarrative(value, limit) {
  if (typeof value !== "string") return "";
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  const sentences = text.match(/[^。！？!?]+[。！？!?]?/g) || [text];
  let result = "";
  for (const sentence of sentences) {
    if (result && result.length + sentence.length > limit) break;
    if (!result && sentence.length > limit) return `${text.slice(0, limit - 1)}…`;
    result += sentence;
  }
  if (result.length < limit * 0.6) return `${text.slice(0, limit - 1)}…`;
  return result.length < text.length ? `${result.replace(/[。！？!?]$/, "")}…` : result;
}

const ENDING_HINTS = {
  criminal_conviction: "收钱、用权和掩盖一旦连成证据，履历会在哪里终止？",
  disciplinary_exit: "尚未构成刑事判决，也不代表越过边界没有代价。",
  health_exit: "一直透支身体，会在哪一年停下脚步？",
  family_first: "职位之外，那盏等你回家的灯也很重要。",
  high_office: "从乡镇科员走向市级部门正职及更高岗位，这一世能走多远？",
  public_legacy: "有些投入，要许多年后才能看见回报。",
  clean_retirement: "专业、耐心和清白，也是一份完整的履历。",
  results_only: "如果只有成绩亮眼，其他代价谁来承担？",
  new_beginning: "也许可以主动翻开另一种人生。"
};

class GameApp {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.scrollY = 0;
    this.panel = null;
    this.notice = "";
    this.buttons = [];
    this.screen = "home";
    this.state = null;
    this.gesture = null;
    this.applyMetrics();
    this.savedGame = platform.loadGame();
    this.archive = platform.loadArchive();
    if (!validateSavedGame(this.savedGame)) {
      if (this.savedGame) this.notice = "旧存档无法读取，已保留原数据；新开局将替换它。";
      this.savedGame = null;
    } else if (this.savedGame) {
      const deduplicated = repairRepeatedCurrentEvent(this.savedGame, EVENTS);
      const themeRepaired = repairRepetitiveCurrentTheme(deduplicated, EVENTS);
      const repaired = repairLegacyPacing(themeRepaired);
      const duplicateRepaired = deduplicated !== this.savedGame;
      const themeWasRepaired = themeRepaired !== deduplicated;
      const pacingRepaired = repaired !== themeRepaired;
      if (repaired !== this.savedGame) {
        this.savedGame = repaired;
        platform.saveGame(repaired);
        this.notice = duplicateRepaired || themeWasRepaired
          ? "已替换旧存档中重复或雷同的待选故事。"
          : pacingRepaired ? "旧存档已切换为一年一个主故事。" : "旧存档已更新。";
      }
    }
    this.settings = platform.loadSettings();
    // Douyin rule 11.3 and the general privacy requirement: the notice must be
    // shown before play, once per device (and again if the wording changes).
    if (this.settings.privacyVersion !== PRIVACY_VERSION) this.panel = { id: "privacy" };
    platform.setPreferredFramesPerSecond(30);
    platform.onTouchStart((event) => this.handleTouch(event));
    platform.onTouchMove((event) => this.handleMove(event));
    platform.onTouchEnd((event) => this.handleEnd(event));
    platform.onTouchCancel(() => { this.gesture = null; });
    // Returning to the foreground or a window-metric change can leave a stale
    // or blank frame (and can move the safe area) while a story is open.
    platform.onShow(() => this.handleResume());
    platform.onWindowResize(() => this.handleResume());
    platform.onHide(() => { this.gesture = null; });
    this.render();
  }

  // Re-read the device metrics and resize the backing canvas. Assigning
  // canvas.width also resets the 2D transform, so the pixel-ratio scale is
  // applied exactly once per call.
  applyMetrics() {
    this.metrics = platform.getWindowMetrics();
    this.width = this.metrics.width;
    this.viewportHeight = this.metrics.height;
    this.topInset = (this.metrics.safeArea ? this.metrics.safeArea.top : 0) + 44;
    this.bottomInset = this.metrics.safeArea ? Math.max(0, this.viewportHeight - this.metrics.safeArea.bottom) : 0;
    this.height = Math.max(708, this.viewportHeight - this.topInset - this.bottomInset);
    this.pixelRatio = this.metrics.pixelRatio;
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.viewportHeight * this.pixelRatio);
    this.context.scale(this.pixelRatio, this.pixelRatio);
    this.contentHeight = this.height;
  }

  handleResume() {
    // Drop any half-finished gesture so a touch interrupted by backgrounding
    // cannot register as a tap after the player comes back.
    this.gesture = null;
    this.applyMetrics();
    this.render();
    const clamped = Math.max(0, Math.min(this.scrollY, this.maxScroll()));
    if (clamped !== this.scrollY) { this.scrollY = clamped; this.render(); }
  }

  handleTouch(event) {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    this.gesture = { x: touch.clientX, y: touch.clientY, scrollY: this.scrollY, moved: false };
  }

  handleMove(event) {
    const touch = event.touches && event.touches[0];
    if (!touch || !this.gesture) return;
    const delta = touch.clientY - this.gesture.y;
    if (Math.abs(delta) > 8 || Math.abs(touch.clientX - this.gesture.x) > 8) this.gesture.moved = true;
    this.scrollY = Math.max(0, Math.min(this.maxScroll(), this.gesture.scrollY - delta));
    this.render();
  }

  handleEnd(event) {
    const touch = event.changedTouches && event.changedTouches[0];
    const gesture = this.gesture;
    this.gesture = null;
    if (!touch || !gesture || gesture.moved || Math.hypot(touch.clientX - gesture.x, touch.clientY - gesture.y) > 8) return;
    if (touch.clientY < this.topInset || touch.clientY > this.viewportHeight - this.bottomInset) return;
    const x = touch.clientX;
    const y = touch.clientY - this.topInset + this.scrollY;
    const target = [...this.buttons].reverse().find((button) => (
      x >= button.x && x <= button.x + button.width &&
      y >= button.y && y <= button.y + button.height
    ));
    if (target) target.onPress();
  }

  maxScroll() {
    return Math.max(0, this.contentHeight - (this.viewportHeight - this.topInset - this.bottomInset));
  }

  saveAndRender() {
    if (this.state && this.state.phase !== "event" && this.panel && this.panel.id === "desk") this.panel = null;
    if (this.state) {
      const saved = platform.saveGame(this.state);
      if (saved) this.archive = platform.loadArchive();
      this.notice = saved ? "" : "保存失败：本次进度仅在内存中，请勿关闭游戏。";
      this.savedGame = this.state;
    }
    this.render();
  }

  startGame(backgroundId) {
    if (this.savedGame && !this.replaceConfirmed) {
      this.confirm("新开局将替换当前进度，已完成的结局收藏会保留。", () => {
        this.replaceConfirmed = true;
        this.startGame(backgroundId);
      });
      return;
    }
    this.replaceConfirmed = false;
    this.state = beginYear(createNewGame(backgroundId), EVENTS);
    this.screen = "play";
    this.panel = { id: "desk" };
    this.saveAndRender();
  }

  continueGame() {
    if (!this.savedGame) return;
    // Saves made by the immediately previous build may be parked on the now
    // removed manual year-end step. Settle them on resume so nobody is stuck.
    const legacyPlanning = this.savedGame.phase === "planning";
    this.state = legacyPlanning ? finalizeAnnualPlanning(this.savedGame) : this.savedGame;
    this.screen = "play";
    this.panel = legacyPlanning ? null : { id: "desk" };
    if (legacyPlanning) this.saveAndRender();
    else this.render();
  }

  render() {
    const key = `${this.screen}:${this.panel ? this.panel.id : ""}:${this.state ? `${this.state.phase}:${this.state.currentEventId}:${this.state.careerYear}` : ""}`;
    if (key !== this.renderKey) this.scrollY = 0;
    this.renderKey = key;
    this.buttons = [];
    this.contentHeight = this.height;
    this.context.clearRect(0, 0, this.width, this.viewportHeight);
    this.context.fillStyle = COLORS.background;
    this.context.fillRect(0, 0, this.width, this.viewportHeight);
    this.context.save();
    this.context.beginPath();
    this.context.rect(0, this.topInset, this.width, this.viewportHeight - this.topInset - this.bottomInset);
    this.context.clip();
    this.context.translate(0, this.topInset - this.scrollY);
    if (this.panel) this.renderPanel();
    else if (this.screen === "home") this.renderHome();
    else if (this.screen === "background") this.renderBackgrounds();
    else this.renderPlay();
    this.context.restore();
    if (this.notice) this.text(this.notice, 12, this.viewportHeight - 12, 11, COLORS.red);
    else if (this.maxScroll() > 0) this.text("上下滑动查看", this.width / 2, this.viewportHeight - 10, 11, COLORS.muted, "center");
  }

  confirm(message, action) {
    this.panel = { id: "confirm", message, action };
    this.render();
  }

  renderPanel() {
    this.drawHeader();
    if (this.panel.id === "desk") {
      this.renderDashboard();
      if (this.state && this.state.phase === "event" && this.state.appointment) {
        this.buttons = [];
        this.renderAppointment();
      }
      return;
    }
    if (["profile", "lifeActions", "career", "lifeResult"].includes(this.panel.id)) { this.renderLifePanel(); return; }
    if (this.panel.id === "attribute") { this.renderAttributePanel(); return; }
    if (this.panel.id === "history") { this.renderHistory(); return; }
    if (this.panel.id === "rules") { this.renderRules(); return; }
    if (this.panel.id === "promotion") { this.renderPromotionPanel(); return; }
    if (this.panel.id === "accounts") { this.renderAccountsPanel(); return; }
    if (this.panel.id === "collection") { this.renderCollection(); return; }
    if (this.panel.id === "privacy") { this.renderPrivacy(); return; }
    if (this.panel.id === "confirm") {
      const lines = this.wrapText(this.panel.message, 28, 148, this.width - 56, 28, 17, COLORS.ink);
      const confirmY = Math.max(266, 148 + lines * 28 + 24);
      this.button("确认", 28, confirmY, this.width - 56, 54, () => {
        const action = this.panel.action;
        this.panel = null;
        action();
      });
      this.button("取消", 28, confirmY + 70, this.width - 56, 54, () => { this.panel = null; this.render(); }, { secondary: true });
      return;
    }
    this.text("本地存档与游戏选项", 24, 122, 22, COLORS.ink, "left", "600");
    this.wrapText("进度只保存在本设备。清理微信缓存或删除此小游戏可能丢失存档；当前没有云同步。", 28, 162, this.width - 56, 25, 15, COLORS.muted);
    this.button("返回上一页", 28, 268, this.width - 56, 54, () => { this.panel = null; this.render(); });
    this.button("回到首页", 28, 336, this.width - 56, 54, () => { this.panel = null; this.screen = "home"; this.render(); }, { secondary: true });
    this.button("删除本地数据", 28, 404, this.width - 56, 54, () => this.confirm("将删除本设备的游戏进度与结局收藏，无法恢复。确认删除？", () => {
      if (!platform.clearGame()) { this.notice = "删除失败，请重试。"; this.render(); return; }
      this.state = null;
      this.savedGame = null;
      this.archive = [];
      this.notice = "";
      this.screen = "home";
      this.render();
    }), { secondary: true });
    if (this.state && this.state.phase === "event") {
      this.button("主动离任，结算本局", 28, 472, this.width - 56, 54, () => this.confirm("主动离任会结束本局，无法撤销。确认继续？", () => {
        this.state = leaveCareer(this.state);
        this.screen = "play";
        this.saveAndRender();
      }), { secondary: true });
    }
    if (this.state || this.savedGame) {
      this.button("回看本局履历", 28, 540, this.width - 56, 54, () => {
        this.panel = { id: "history", page: 0 };
        this.render();
      }, { secondary: true });
    }
    this.button("岗位条件与玩法说明", 28, 608, this.width - 56, 54, () => {
      this.panel = { id: "rules" };
      this.render();
    }, { secondary: true });
  }

  renderCollection() {
    const unlocked = new Set(this.archive.map((item) => item.endingId));
    this.text("人生的不同答案", 24, 110, 24, COLORS.ink, "left", "600");
    this.text(`已发现 ${unlocked.size} / ${ENDINGS.length} 种结局`, 24, 140, 14, COLORS.muted);
    let y = 178;
    ENDINGS.forEach((ending, index) => {
      this.text(unlocked.has(ending.id) ? ending.title : `待书写的第 ${index + 1} 页`, 28, y, 18, unlocked.has(ending.id) ? COLORS.tealDark : COLORS.muted, "left", "600");
      y += 29;
      const description = unlocked.has(ending.id) ? ending.description : ENDING_HINTS[ending.id];
      y += this.wrapText(description, 28, y, this.width - 56, 23, 14, COLORS.muted) * 23 + 34;
    });
    this.button("返回首页", 28, y, this.width - 56, 52, () => { this.panel = null; this.screen = "home"; this.render(); });
  }

  renderDashboard() {
    const state = this.state || this.savedGame;
    if (!state) return;
    const role = ROLES[state.roleIndex];
    const nextRole = ROLES[state.roleIndex + 1];
    const life = getLifeState(state);
    const accounts = getAccounts(state);
    const review = state.review || calculateReview(state);
    const yearChanges = currentYearChanges(state);
    const balance = householdBalance(state);
    const projectedNet = review.annualIncome - review.livingCost;
    const firstStory = state.phase === "event" && state.careerYear === 1 && !(state.history || []).length;
    const workLabel = state.phase === "planning" || state.phase === "review"
      ? "查看年终结果"
      : state.phase === "ending" ? "查看人生结局"
        : firstStory ? "开始我的仕途" : "继续剧情";
    const openStory = () => { this.state = state; this.screen = "play"; this.panel = null; this.render(); };
    const openPromotion = () => { this.panel = { id: "promotion", returnTo: "desk" }; this.render(); };
    const openLife = () => {
      if (!["event", "planning"].includes(state.phase)) {
        this.notice = "人生安排需在本年度工作结束前完成";
        this.render();
        return;
      }
      this.panel = { id: "lifeActions", returnTo: "desk" };
      this.render();
    };

    this.text(`第 ${state.careerYear} 年 · ${START_AGE + state.careerYear - 1} 岁`, 18, 82, 13, COLORS.gold, "left", "600");
    this.text(`仕途阶段：${CAREER_STAGES[state.roleIndex]}`, this.width - 18, 82, 12, COLORS.muted, "right");

    const heroTop = 96;
    this.roundedRect(16, heroTop, this.width - 32, 174, 14, COLORS.paper, COLORS.line);
    const roleTitleSize = role.name.length > 14 ? 16 : role.name.length > 10 ? 19 : 22;
    this.text(role.name, 30, heroTop + 31, roleTitleSize, COLORS.ink, "left", "700");
    this.text(`${role.department} · ${role.scope}`, 30, heroTop + 57, 13, COLORS.tealDark);
    const rank = state.roleIndex < 7 ? CIVIL_RANKS[state.rankIndex] : "职级不适用";
    this.text(`${role.level || "非领导岗位"} · ${rank}`, 30, heroTop + 80, 12, COLORS.muted);
    const lifeLine = `${life.housing === "owned" ? "有房" : "租住"} · ${life.vehicle ? "有车" : "无车"} · ${RELATIONSHIPS[life.relationship]} · ${life.child ? `${life.child.name} ${childAge(state)} 岁` : "子女 0"}`;
    this.text(lifeLine, 30, heroTop + 102, 11, COLORS.muted);
    this.text(`🎯 当前目标：完成${role.scope}年度治理任务`, 30, heroTop + 124, 11, COLORS.gold);
    const conditions = nextRole
      ? `晋升条件：任职≥${role.minYears}年｜政绩≥${role.minPerformance}｜廉洁≥${role.minIntegrity}｜综合≥${role.threshold}`
      : "当前已到履历最高阶段，继续接受年度组织评价";
    this.text(conditions, 30, heroTop + 146, this.width <= 340 ? 9 : 10, COLORS.muted);
    const progressWidth = this.width - 60;
    this.roundedRect(30, heroTop + 160, progressWidth, 4, 2, COLORS.line);
    this.roundedRect(30, heroTop + 160, progressWidth * (state.roleIndex + 1) / ROLES.length, 4, 2, COLORS.teal);

    const statTop = 284;
    const statGap = 6;
    const statWidth = (this.width - 44) / 3;
    ATTRIBUTES.forEach((key, index) => {
      const x = 16 + (index % 3) * (statWidth + statGap);
      const top = statTop + Math.floor(index / 3) * 49;
      const value = state.stats[key];
      this.roundedRect(x, top, statWidth, 43, 8, COLORS.paper, COLORS.line);
      this.text(ATTRIBUTE_LABELS[key], x + 10, top + 18, 10, COLORS.muted);
      const delta = yearChanges[key];
      if (delta) this.text(`${delta > 0 ? "↑" : "↓"}${Math.abs(delta)}`, x + 39, top + 18, 9, delta > 0 ? COLORS.tealDark : COLORS.red);
      this.text(String(value), x + statWidth - 10, top + 29, 17, value < 25 ? COLORS.red : COLORS.tealDark, "right", "700");
      this.buttons.push({ label: `查看${ATTRIBUTE_LABELS[key]}变化`, x, y: top, width: statWidth, height: 43, onPress: () => {
        this.panel = { id: "attribute", key, returnTo: "desk" }; this.render();
      } });
    });

    this.button(workLabel, 16, 384, this.width - 32, 52, openStory);
    const half = (this.width - 38) / 2;
    this.button(`02  人生安排${life.lastActionYear === state.careerYear ? " · 已完成" : " · 可选"}`, 16, 446, half, 44, openLife, { small: true, secondary: !["event", "planning"].includes(state.phase) });
    const promotionPlan = state.promotionPlan && state.promotionPlan.year === state.careerYear ? state.promotionPlan : null;
    this.button(`晋升风声${promotionPlan ? " · 已选" : " · 可选"}`, 22 + half, 446, half, 44, openPromotion, { small: true, secondary: true });
    this.text(firstStory ? "22岁，到青禾镇报到。第一件事在等你。" : "继续故事 → 自动年终评定 → 下一年", this.width / 2, 512, 11, COLORS.muted, "center");

    const financeTop = 528;
    this.roundedRect(16, financeTop, this.width - 32, 142, 12, COLORS.paper, COLORS.line);
    this.text("家庭资产负债表 · 万元游戏资金", 30, financeTop + 25, 12, COLORS.gold, "left", "600");
    this.text(`本年收入 ${review.annualIncome.toFixed(2)}  /  本年支出 ${review.livingCost.toFixed(2)}`, 30, financeTop + 50, 12, COLORS.ink);
    this.text(`本年预计结余 ${projectedNet >= 0 ? "+" : ""}${projectedNet.toFixed(2)}`, 30, financeTop + 72, 12, projectedNet >= 0 ? COLORS.tealDark : COLORS.red);
    this.text(`可支配现金 ${balance.cash.toFixed(2)}  ·  预计年终 ${Math.max(0, balance.cash + projectedNet).toFixed(2)}`, 30, financeTop + 94, 11, COLORS.muted);
    this.text(`家庭净资产 ${balance.netAssets.toFixed(2)}  ·  负债 ${balance.debt.toFixed(2)}`, 30, financeTop + 115, 11, COLORS.ink);
    this.text(`公积金 ${accounts.housingFund.toFixed(2)} · 年金 ${accounts.annuity.toFixed(2)} · 房车 ${balance.fixedAssets.toFixed(2)}`, 30, financeTop + 134, 10, COLORS.muted);

    this.text("更多档案", 18, 704, 14, COLORS.ink, "left", "600");
    const shortcuts = [
      ["03  财务账户", () => { this.panel = { id: "accounts", focus: "housingFund", returnTo: "desk" }; this.render(); }],
      ["04  房车安排", () => { this.panel = { id: "lifeActions", returnTo: "desk" }; this.render(); }],
      ["05  健康管理", () => { this.panel = { id: "lifeActions", focus: "rest", returnTo: "desk" }; this.render(); }],
      ["06  任职履历", () => { this.panel = { id: "career", returnTo: "desk" }; this.render(); }],
      ["07  生活详情", () => { this.panel = { id: "profile", returnTo: "desk" }; this.render(); }],
      ["08  故事履历", () => { this.panel = { id: "history", page: 0 }; this.render(); }]
    ];
    shortcuts.forEach(([label, action], index) => {
      const x = 16 + (index % 2) * (half + 6);
      const top = 718 + Math.floor(index / 2) * 54;
      this.button(label, x, top, half, 44, action, { small: true, secondary: true });
    });
    const footerY = 890;
    this.text(`故事选择 → 自动年终结算 · 人生安排可选 · 最多 ${MAX_CAREER_YEARS} 年`, this.width / 2, footerY, 11, COLORS.muted, "center");
    this.contentHeight = Math.max(this.contentHeight, footerY + 30);
  }

  renderAttributePanel() {
    const state = this.state || this.savedGame;
    if (!state) return;
    const key = ATTRIBUTES.includes(this.panel.key) ? this.panel.key : "performance";
    const yearDelta = currentYearChanges(state)[key];
    this.text(`${ATTRIBUTE_LABELS[key]}为什么是 ${state.stats[key]}？`, 24, 112, 23, COLORS.ink, "left", "600");
    this.text(`本年净变化 ${yearDelta > 0 ? "+" : ""}${yearDelta}`, 24, 145, 14, yearDelta >= 0 ? COLORS.tealDark : COLORS.red);
    let y = 190;
    const sources = (state.history || []).filter((entry) => entry.changes && entry.changes[key])
      .map((entry) => ({ year: entry.year, title: entry.eventTitle, detail: entry.choiceText, value: entry.changes[key] }));
    getLifeState(state).actions.filter((action) => action.effects && action.effects[key])
      .forEach((action) => sources.push({ year: action.year, title: `人生安排：${action.title}`, detail: action.outcome, value: action.effects[key] }));
    sources.sort((a, b) => b.year - a.year);
    if (!sources.length) {
      y += this.wrapText("这一项还没有事件变动。当前数值来自基础属性和重生前经历。", 26, y, this.width - 52, 25, 15, COLORS.muted) * 25 + 24;
    }
    sources.slice(0, 12).forEach((source) => {
      this.text(`第 ${source.year} 年 · ${source.value > 0 ? "+" : ""}${source.value}`, 26, y, 13, source.value > 0 ? COLORS.tealDark : COLORS.red, "left", "600");
      y += 27;
      y += this.wrapText(source.title, 26, y, this.width - 52, 24, 16, COLORS.ink) * 24 + 6;
      y += this.wrapText(source.detail, 26, y, this.width - 52, 21, 12, COLORS.muted) * 21 + 24;
    });
    this.text("只显示最近 12 条变化；完整因果保存在故事履历。", 26, y, 11, COLORS.muted);
    this.button("回到年度档案", 24, y + 30, this.width - 48, 48, () => { this.panel = { id: "desk" }; this.render(); });
  }

  renderAccountsPanel() {
    const state = this.state || this.savedGame;
    if (!state) return;
    const accounts = getAccounts(state);
    const focus = this.panel.focus || "housingFund";
    const housing = focus === "housingFund";
    const name = housing ? "公积金" : "职业年金";
    const review = state.review || calculateReview(state);
    const settled = accounts.entries.some((entry) => entry.type === "annual" && entry.year === state.careerYear);
    const projection = state.phase === "ending" ? (settled ? "本年度已结算" : "本局已结束，本年度未结算") : review.accountCredit ? `本年预计入账 +${review.accountCredit[focus].toFixed(2)} 万` : "沿用旧版考核，本年度不补记账户";
    [["housingFund", "公积金"], ["annuity", "职业年金"]].forEach(([id, label], index) => this.button(label, 18 + index * (this.width / 2 - 14), 72, this.width / 2 - 22, 38, () => {
      this.panel = { id: "accounts", focus: id, returnTo: "desk" }; this.scrollY = 0; this.render();
    }, { small: true, secondary: focus !== id }));
    this.text(`${name}账户`, 24, 150, 23, COLORS.ink, "left", "600");
    this.text(`${accounts[focus].toFixed(2)} 万`, 24, 201, 34, COLORS.gold, "left", "600");
    let y = 237;
    const paragraphs = [
      "已到账余额 · 万元游戏资金",
      projection,
      `游戏年度入账 = 年薪的 ${ACCOUNT_RATES[focus] * 100}%。作为额外福利，年末到账，不从现金工资另扣；不是现实缴存规则。`,
      housing ? "已到账公积金仅能在游戏中购置自住住房时抵扣，优先使用，差额付现金。不支持自由提现、贷款、购车或充值。" : "这笔长期积累与日常现金分开。当前版本只累计与展示，不设退休领取、提前提取或收益；结局仍保留余额，不自动变成现金。",
      state.accounts ? `第 ${accounts.startedYear} 年起记账；旧版未记录的年份不补记。` : "旧存档尚未开立账户，从下次新版年度结算起记账，不补记过去的年份。"
    ];
    paragraphs.forEach((line) => { y += this.wrapText(line, 24, y, this.width - 48, 23, 14, COLORS.muted) * 23 + 15; });
    if (housing) {
      const funding = homeFunding(state);
      y += this.wrapText(`自住房总价 50.00 万：当前公积金可抵 ${funding.housingFundUsed.toFixed(2)} 万，现金需 ${funding.cashCost.toFixed(2)} 万。${getLifeState(state).housing === "owned" ? "你已持有自住房，不能重复购置。" : "购置仍需满足年度安排条件。"}`, 24, y, this.width - 48, 23, 14, COLORS.ink) * 23 + 15;
      this.button("查看住房购置条件", 24, y, this.width - 48, 46, () => { this.panel = { id: "lifeActions", focus: "home", returnTo: "desk" }; this.render(); }, { secondary: true });
      y += 72;
    }
    const entries = accounts.entries.filter((entry) => housing || entry.type === "annual").slice().reverse();
    const page = this.panel.page || 0;
    const pageCount = Math.max(1, Math.ceil(entries.length / 8));
    this.text(`账户流水 · ${page + 1}/${pageCount}`, 24, y, 18, COLORS.ink, "left", "600"); y += 31;
    if (!entries.length) { y += this.wrapText("尚无入账记录。年度结算前，预计入账不能提前花。", 24, y, this.width - 48, 23, 14, COLORS.muted) * 23 + 18; }
    entries.slice(page * 8, page * 8 + 8).forEach((entry) => {
      const line = entry.type === "annual" ? `第 ${entry.year} 年 · ${ROLES[entry.roleIndex].name}任内入账 +${entry[focus].toFixed(2)} 万` : `第 ${entry.year} 年 · 自住房抵扣 −${entry.amount.toFixed(2)} 万`;
      y += this.wrapText(line, 24, y, this.width - 48, 24, 14, entry.type === "annual" ? COLORS.tealDark : COLORS.gold) * 24 + 14;
    });
    if (page > 0) { this.button("上一页流水", 24, y, this.width - 48, 44, () => { this.panel.page = page - 1; this.scrollY = 0; this.render(); }, { secondary: true }); y += 56; }
    if (page + 1 < pageCount) { this.button("下一页流水", 24, y, this.width - 48, 44, () => { this.panel.page = page + 1; this.scrollY = 0; this.render(); }, { secondary: true }); y += 56; }
    this.button("回到年度档案", 24, y, this.width - 48, 48, () => { this.panel = { id: "desk" }; this.render(); });
  }

  renderPromotionPanel() {
    const state = this.state || this.savedGame;
    if (!state) return;
    const role = ROLES[state.roleIndex];
    const nextRole = ROLES[state.roleIndex + 1];
    const review = state.review || calculateReview(state);
    const opportunity = review.competition;
    const plan = state.promotionPlan && state.promotionPlan.year === state.careerYear ? state.promotionPlan : null;
    const hardConditions = nextRole && state.yearsInRole + 1 >= role.minYears &&
      state.stats.performance >= role.minPerformance && state.stats.integrity >= role.minIntegrity && state.stats.health > 10;
    const requiredScore = opportunity && opportunity.available
      ? Math.max(role.threshold, opportunity.candidate.score + 1) : role.threshold;
    const chance = !hardConditions || !opportunity || !opportunity.available || (plan && plan.detected) ? 0
      : Math.max(0, Math.min(100, Math.round(((6.5 - (requiredScore - review.baseScore - (review.relationshipBonus || 0))) / 12) * 100)));
    let y = 108;
    this.text("晋升风声", 22, y, 22, COLORS.ink, "left", "600");
    y += 34;
    y += this.wrapText(nextRole
      ? `${role.name} → ${nextRole.name}。空缺 ${opportunity && opportunity.available ? 1 : 0} 个，当前晋升机会约 ${chance}%。`
      : "你已到达本局最高岗位，不再安排晋升运作。", 24, y, this.width - 48, 24, 14, COLORS.gold) * 24 + 18;
    if (plan && PROMOTION_MOVES[plan.choice]) {
      const move = PROMOTION_MOVES[plan.choice];
      const cardTop = y;
      const outcomeHeight = this.measureWrappedLines(plan.outcome, this.width - 68, 14).length * 23;
      const changes = Object.entries(plan.changes).map(([key, value]) => `${ATTRIBUTE_LABELS[key]}${value > 0 ? "+" : ""}${value}`).join(" · ");
      const changesHeight = changes ? this.measureWrappedLines(changes, this.width - 68, 12).length * 20 + 4 : 0;
      const cardHeight = 59 + outcomeHeight + 12 + changesHeight + 42;
      this.roundedRect(18, cardTop, this.width - 36, cardHeight, 14, COLORS.paper, COLORS.line);
      this.text(`今年选择：${move.short}`, 34, cardTop + 31, 18, COLORS.tealDark, "left", "600");
      y = cardTop + 59;
      y += this.wrapText(plan.outcome, 34, y, this.width - 68, 23, 14, COLORS.ink) * 23 + 12;
      if (changes) y += this.wrapText(changes, 34, y, this.width - 68, 20, 12, COLORS.muted) * 20 + 4;
      this.text(plan.detected ? "风险兑现：已引发核查，本年不予提拔" : `年终评价影响 +${plan.bonus}（不保证晋升）`, 34, y, 13, plan.detected ? COLORS.red : COLORS.gold);
      y += 42;
    } else if (nextRole) {
      y += this.wrapText("办公室传来风声：位置可能要动。你可以什么都不做，也可以选一种方式让自己被看见——越走捷径，代价和反噬越大。", 24, y, this.width - 48, 24, 14, COLORS.muted) * 24 + 17;
      Object.values(PROMOTION_MOVES).forEach((move) => {
        const reason = promotionActionReason(state, move.id);
        const suffix = move.id === "report" ? "稳妥" : move.id === "dinner" ? "花 3000 元 · 有风险" : "花 8000 元 · 高风险";
        this.button(`${move.name}｜${suffix}`, 20, y, this.width - 40, 50, () => {
          try {
            this.state = setPromotionChoice(this.state || this.savedGame, move.id);
            this.panel = { id: "promotion", returnTo: "desk" };
            this.saveAndRender();
          } catch (error) { this.notice = error.message; this.render(); }
        }, { small: true, secondary: Boolean(reason) || move.id !== "report" });
        y += 62;
        if (reason) { y += this.wrapText(reason, 24, y, this.width - 48, 20, 12, COLORS.red) * 20 + 8; }
      });
      y += this.wrapText("请客送礼是虚构风险选择，不是现实晋升规则；可能短期加分，也可能留任、降任或被查。", 24, y, this.width - 48, 21, 12, COLORS.muted) * 21 + 14;
    }
    this.button("回到年度档案", 24, y, this.width - 48, 48, () => { this.panel = { id: "desk" }; this.render(); });
  }

  renderLifePanel() {
    const state = this.state || this.savedGame;
    if (!state) { this.text("先开启一份履历", 28, 130, 20, COLORS.ink); return; }
    const life = getLifeState(state);
    const tabs = [["profile", "人生总览"], ["lifeActions", "年度安排"], ["career", "任职履历"]];
    const tabWidth = (this.width - 48) / 3;
    tabs.forEach(([id, label], index) => this.button(label, 16 + index * (tabWidth + 8), 72, tabWidth, 38, () => {
      this.panel = { id }; this.render();
    }, { small: true, secondary: this.panel.id !== id }));

    if (this.panel.id === "lifeResult") {
      const action = life.actions[life.actions.length - 1];
      this.text(action.title, 24, 154, 23, COLORS.tealDark, "left", "600");
      let y = 200;
      y += this.wrapText(action.outcome, 28, y, this.width - 56, 27, 16, COLORS.ink) * 27 + 25;
      if (action.housingFundUsed > 0) y += this.wrapText(`本次支付：公积金 ${action.housingFundUsed.toFixed(2)} 万 + 现金 ${action.cashCost.toFixed(2)} 万。抵扣已写入账户流水。`, 28, y, this.width - 56, 24, 14, COLORS.gold) * 24 + 18;
      this.text(`已支出 ${action.cost} 万 · 本年度安排已使用`, 28, y, 13, COLORS.muted);
      const settledYear = state.phase === "review";
      this.button(settledYear ? "查看本年自动结算结果" : "完成安排，继续剧情", 28, y + 30, this.width - 56, 52, () => {
        this.screen = "play";
        this.panel = null;
        this.saveAndRender();
      });
      this.button("先看看这一生的变化", 28, y + 96, this.width - 56, 46, () => { this.panel = { id: "profile" }; this.render(); }, { secondary: true });
      return;
    }

    if (this.panel.id === "lifeActions") {
      this.text("今年，为自己安排一次", 24, 151, 22, COLORS.ink, "left", "600");
      let y = 186;
      y += this.wrapText("年度工作期间可以主动安排一次，也可以完全跳过；最后一项工作完成后系统直接年终结算。金额都是游戏资金，不充值、不代表现实价格。", 28, y, this.width - 56, 23, 14, COLORS.muted) * 23 + 24;
      ACTIONS.filter((action) => !this.panel.focus || action.id === this.panel.focus).forEach((action) => {
        const reason = actionReason(state, action.id);
        const funding = action.id === "home" ? homeFunding(state, action.cost) : null;
        const payment = funding ? `总价 ${action.cost.toFixed(2)} 万：公积金抵扣 ${funding.housingFundUsed.toFixed(2)} 万，现金支付 ${funding.cashCost.toFixed(2)} 万。` : `支出 ${action.cost} 万可用游戏资金。`;
        this.text(`${action.name} · ${action.cost} 万`, 28, y, 18, COLORS.ink, "left", "600");
        y += 28;
        y += this.wrapText(action.description, 28, y, this.width - 56, 23, 14, COLORS.muted) * 23 + 10;
        if (funding) y += this.wrapText(payment, 28, y, this.width - 56, 23, 14, COLORS.gold) * 23 + 10;
        if (reason) {
          y += this.wrapText(reason, 28, y, this.width - 56, 22, 13, COLORS.red) * 22 + 25;
        } else {
          this.button(`安排：${action.name}`, 28, y, this.width - 56, 46, () => this.confirm(
            `${action.name}：${payment}占用本年度唯一一次人生安排。${action.description}确认安排？`,
            () => {
              try {
                this.state = takeLifeAction(this.state || this.savedGame, action.id);
                // A legacy/internal state can still arrive here after all work
                // is complete. Settle it now instead of reviving a manual
                // year-end step.
                if (this.state.phase === "planning") this.state = finalizeAnnualPlanning(this.state);
                this.screen = "play";
                this.panel = { id: "lifeResult" };
                this.saveAndRender();
              } catch (error) { this.notice = error.message; this.panel = { id: "lifeActions" }; this.render(); }
            }
          ));
          y += 73;
        }
      });
      this.button("回到年度档案", 28, y, this.width - 56, 48, () => {
        this.panel = { id: "desk" }; this.render();
      });
      return;
    }

    if (this.panel.id === "career") {
      this.text("职务变了，来路还在", 24, 151, 22, COLORS.ink, "left", "600");
      let y = 192;
      const records = [{ year: 1, title: "录用起点", body: `${ROLES[0].post} · 一级科员` }];
      (state.annualReports || []).forEach((report) => {
        if (report.demoted && ROLES[report.roleIndex - 1]) records.push({ year: report.year, title: `年末组织调整 · 降任至${ROLES[report.roleIndex - 1].name}`, body: `${ROLES[report.roleIndex].post} → ${ROLES[report.roleIndex - 1].post}` });
        else if (report.promoted && ROLES[report.roleIndex + 1]) records.push({ year: report.year, title: `年末${ROLES[report.roleIndex + 1].entryMode} · ${ROLES[report.roleIndex + 1].name}`, body: `${ROLES[report.roleIndex].post} → ${ROLES[report.roleIndex + 1].post}` });
        else if (report.rankPromoted && CIVIL_RANKS[report.rankIndex + 1]) records.push({ year: report.year, title: `年末职级晋升 · ${CIVIL_RANKS[report.rankIndex + 1]}`, body: `${ROLES[report.roleIndex].post}，领导职务不变` });
      });
      records.reverse().forEach((record) => {
        this.text(`第 ${record.year} 年 · ${START_AGE + record.year - 1} 岁`, 28, y, 13, COLORS.gold);
        y += 28;
        y += this.wrapText(record.title, 28, y, this.width - 56, 26, 18, COLORS.tealDark) * 26 + 8;
        y += this.wrapText(record.body, 28, y, this.width - 56, 24, 14, COLORS.ink) * 24 + 30;
      });
      this.button("完整故事与年度记录", 28, y, this.width - 56, 48, () => { this.panel = { id: "history", page: 0 }; this.render(); });
      return;
    }

    const role = ROLES[state.roleIndex];
    const review = state.review || calculateReview(state);
    this.text(`${START_AGE + state.careerYear - 1} 岁 · 第 ${state.careerYear} 年`, 24, 150, 21, COLORS.ink, "left", "600");
    this.roundedRect(20, 171, this.width - 40, 144, 15, COLORS.header, COLORS.line);
    this.text(role.level || "尚未担任领导职务", 36, 200, 14, COLORS.mint);
    this.wrapText(role.post, 36, 232, this.width - 72, 26, 20, COLORS.white);
    this.text(`现职已满 ${state.yearsInRole} 年 · 职级${state.roleIndex < 7 ? "：" + CIVIL_RANKS[state.rankIndex] : "不适用"}`, 36, 291, 12, COLORS.mint);
    let y = 350;
    const sections = [
      ["账本 · 万元游戏资金", [
        `可用结余 ${Math.max(0, state.assets).toFixed(2)} · 预算缺口 ${Math.max(0, -state.assets).toFixed(2)}`,
        `公积金 ${getAccounts(state).housingFund.toFixed(2)} · 职业年金 ${getAccounts(state).annuity.toFixed(2)}（不计入可用结余）`,
        `现职模拟年收入 ${review.annualIncome} · 预计支出 ${review.livingCost}`,
        `其中养车 ${life.vehicle ? 2 : 0} · 子女预算 ${annualChildCost(state)} · 自住房节省 ${life.housing === "owned" ? 1 : 0}`,
        "预算缺口不是贷款；本版无借贷、利息与资产交易。"
      ]],
      ["生活有了具体的模样", [
        `住房：${HOUSING[life.housing]} · ${life.vehicle ? "有代步车" : "无车"}`,
        `通勤：${life.housing === "near" ? "近单位步行" : life.vehicle ? "可自行驾车" : "沿用原通勤路线"}`,
        `关系：${RELATIONSHIPS[life.relationship]}${life.longDistance ? " · 两地生活" : ""}`,
        life.child ? `孩子：${life.child.name} · ${childAge(state)} 岁。${childAge(state) < 18 ? "每年养育预算 2 万，已计入支出。" : "已停止固定养育扣款，不代表现实抚养责任终止。"}` : "子女：暂无。可自愿选择迎接孩子，也可以不安排。",
        life.relocationPending ? "调动意向：已了解渠道，尚未实现调动" : "调动意向：暂无记录",
        `年度安排：${life.lastActionYear === state.careerYear ? "已使用" : "未使用"}`
      ]]
    ];
    sections.forEach(([title, lines]) => {
      this.text(title, 28, y, 18, COLORS.tealDark, "left", "600"); y += 30;
      lines.forEach((line) => { y += this.wrapText(line, 28, y, this.width - 56, 24, 14, COLORS.ink) * 24 + 8; });
      y += 20;
    });
    const latest = life.actions[life.actions.length - 1];
    if (latest) {
      this.text(`最近安排 · 第 ${latest.year} 年`, 28, y, 16, COLORS.gold); y += 28;
      y += this.wrapText(latest.outcome, 28, y, this.width - 56, 24, 14, COLORS.ink) * 24 + 24;
    }
    this.button("去安排今年的人生", 28, y, this.width - 56, 50, () => { this.panel = { id: "lifeActions" }; this.render(); });
    this.button("回到当前故事", 28, y + 64, this.width - 56, 48, () => { this.panel = null; this.render(); }, { secondary: true });
  }

  renderRules() {
    const state = this.state || this.savedGame;
    const index = state ? state.roleIndex : 0;
    const role = ROLES[index];
    this.text("先了解下一步", 24, 110, 24, COLORS.ink, "left", "600");
    const paragraphs = [
      "你重回公务员录用那年，从乡镇科员开始。人物、地区与剧情虚构；职务层次和职级名称参考公开制度。年限、工资、考核分与晋升过程是游戏化设定。",
      "年度流程固定为：处理本年工作；期间可主动做一次人生安排，也可以跳过。最后一项工作结束后，系统立即生成年度报告并自动评定提拔、交流、留任、职级晋升或降任，不再要求点击年终总结。",
      index < ROLES.length - 1
        ? `${role.name} → ${ROLES[index + 1].name}：当前岗位至少 ${role.minYears} 年、政绩至少 ${role.minPerformance}、廉洁至少 ${role.minIntegrity}、总分至少 ${role.threshold}，且健康大于 0。这里的年限与分数仅是游戏条件。`
        : "你已到达最高岗位，之后不再调任，继续处理事务直至本局结束。",
      "评分 = 政绩 35% + 能力 20% + 民望 15% + 廉洁 20% + 岗位匹配 10%。岗位匹配取能力和民望的平均值。年末另有 −6 至 +6 的随机分，并公开列出。",
      "晋升风声页每年可选一次：正常汇报最稳妥；请客或送礼可能带来短期评价影响，但会损害廉洁并有核查风险，绝不保证晋升。年终仍综合考虑个人条件、公开波动、空缺和竞争结果。",
      "路线会在党政办公室、民政、乡镇政府、市场监管、政法、公安、发展改革、生态环境、交通运输和综合领导岗位之间调任。跨部门资格、年限和任职程序被游戏化简化，不代表现实中的直接任免路径。",
      "职务与职级分开：主任科员、调研员、巡视员不自动拥有相应领导职权。游戏中未获职务提拔时，职级年限满 2 年、廉洁和总分均至少 60，可继续晋升职级；不代表现实规定。",
      "未晋升不会清空积累。综合评价低于 42 或廉洁低于 25，可能降任；健康降到 10 以下，或廉洁低于 15，本局会提前结束。也可以在选项里主动离任。",
      `这条履历从青禾镇科员起步，横跨十类部门与综合岗位，最高到国家层面的虚构综合协调副职。每局最多 ${MAX_CAREER_YEARS} 年；这不是现实任免路径。`
    ];
    let y = 160;
    paragraphs.forEach((paragraph) => {
      y += this.wrapText(paragraph, 28, y, this.width - 56, 26, 15, COLORS.ink) * 26 + 24;
    });
    this.button("了解了，返回", 28, y, this.width - 56, 52, () => { this.panel = { id: this.panel.returnTo || "menu", returnTo: this.panel.returnTo === "promotion" ? "desk" : undefined }; this.render(); });
  }

  renderHistory() {
    const state = this.state || this.savedGame;
    this.text("一页页走过的路", 24, 110, 24, COLORS.ink, "left", "600");
    const entries = [...state.history].reverse().map((item) => ({ ...item, type: "event" }));
    getLifeState(state).actions.forEach((item) => entries.push({ ...item, type: "arrangement", eventTitle: item.title, choiceText: `人生安排 · 支出 ${item.cost} 万游戏资金`, changes: {} }));
    (state.annualReports || []).forEach((item) => entries.push({ ...item, type: "annual" }));
    entries.sort((a, b) => b.year - a.year || (a.type === b.type ? 0 : a.type === "annual" ? -1 : 1));
    const pageSize = 6;
    const pages = Math.max(1, Math.ceil(entries.length / pageSize));
    this.text(`第 ${this.panel.page + 1} / ${pages} 页 · 最新经历在前`, 24, 140, 13, COLORS.muted);
    let y = 180;
    if (!entries.length) { this.text("还没有作出选择，履历正待书写。", 24, y, 14, COLORS.muted); y += 50; }
    entries.slice(this.panel.page * pageSize, (this.panel.page + 1) * pageSize).forEach((entry) => {
      this.text(`第 ${entry.year} 年 · ${ROLES[entry.roleIndex].name}`, 28, y, 13, COLORS.teal);
      y += 27;
      const title = entry.type === "annual" ? `年度 ${entry.score} 分 · ${entry.demoted ? "降任" : entry.promoted ? "提拔" : entry.rankPromoted ? "职级晋升" : "留任"}` : entry.eventTitle;
      y += this.wrapText(title, 28, y, this.width - 56, 25, 18, COLORS.ink) * 25 + 5;
      const moveLabel = entry.promotionChoice && PROMOTION_MOVES[entry.promotionChoice] ? `；晋升选择：${PROMOTION_MOVES[entry.promotionChoice].short}${entry.promotionDetected ? "（引发核查）" : ""}` : "";
      const body = entry.type === "annual" ? `${TRANSFER_LABELS[entry.promotionMode || "legacy"]}${moveLabel}；结余 ${entry.netIncome}；${entry.reasons.join("；") || "各项自动调任条件已满足"}` : entry.choiceText;
      y += this.wrapText(body, 28, y, this.width - 56, 23, 14, COLORS.muted) * 23 + 5;
      if (entry.type === "annual" && entry.competition) {
        const competitionText = entry.competition.available
          ? `岗位竞争：空缺 1 个；同场人选 ${entry.competition.candidate.name}，竞争线 ${entry.competition.candidate.score} 分。`
          : "岗位竞争：本年度目标岗位未形成空缺。";
        y += this.wrapText(competitionText, 28, y, this.width - 56, 23, 14, COLORS.gold) * 23 + 8;
      }
      if (entry.accountCredit) y += this.wrapText(`另入账户：公积金 +${entry.accountCredit.housingFund.toFixed(2)}，职业年金 +${entry.accountCredit.annuity.toFixed(2)} 万。`, 28, y, this.width - 56, 23, 14, COLORS.gold) * 23 + 8;
      if (entry.childCost) y += this.wrapText(`本年度支出已含子女预算 ${entry.childCost.toFixed(2)} 万。`, 28, y, this.width - 56, 23, 14, COLORS.muted) * 23 + 8;
      if (entry.housingFundUsed > 0) y += this.wrapText(`其中公积金 ${entry.housingFundUsed.toFixed(2)}，现金 ${entry.cashCost.toFixed(2)} 万。`, 28, y, this.width - 56, 23, 14, COLORS.gold) * 23 + 8;
      if (entry.type !== "annual") {
        if (entry.outcome) y += this.wrapText(entry.outcome, 28, y, this.width - 56, 23, 14, COLORS.ink) * 23 + 10;
        const delta = Object.entries(entry.changes).map(([key, value]) => `${ATTRIBUTE_LABELS[key]}${value > 0 ? "+" : ""}${value}`).join(" · ");
        y += this.wrapText(delta, 28, y, this.width - 56, 22, 13, COLORS.teal) * 22;
      }
      y += 30;
    });
    if (this.panel.page > 0) this.button("上一页", 24, y, (this.width - 60) / 2, 48, () => { this.panel.page -= 1; this.scrollY = 0; this.render(); }, { secondary: true });
    if (this.panel.page + 1 < pages) this.button("下一页", this.width / 2 + 6, y, (this.width - 60) / 2, 48, () => { this.panel.page += 1; this.scrollY = 0; this.render(); });
    this.button("返回选项", 24, y + 62, this.width - 48, 48, () => { this.panel = { id: "menu" }; this.render(); }, { secondary: true });
  }

  drawCityLines() {
    const ctx = this.context;
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = COLORS.teal;
    ctx.lineWidth = 1;
    for (let x = -40; x < this.width + 80; x += 62) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 110, this.height);
      ctx.stroke();
    }
    for (let y = 34; y < this.height; y += 84) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y + 38);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawHeader(showBack = false) {
    this.context.fillStyle = COLORS.header;
    this.context.fillRect(0, 0, this.width, 58);
    this.text("重生之我是公务员的一生", 14, 34, 13, COLORS.white, "left", "600");
    if (!this.panel) this.button("选项", this.width - 82, 7, 64, 44, () => { this.panel = { id: "menu" }; this.render(); }, { small: true });
    else if (this.panel.id !== "confirm") this.button("返回", this.width - 82, 7, 64, 44, () => {
      if (this.panel.returnTo) this.panel = { id: this.panel.returnTo };
      else if (this.panel.id === "desk") { this.panel = null; this.screen = "home"; }
      else if (["history", "rules"].includes(this.panel.id)) this.panel = { id: "menu" };
      else this.panel = null;
      this.render();
    }, { small: true });
    if ((!this.panel || this.panel.id === "desk") && (this.state || this.savedGame) && !showBack) this.button("人生", this.width - 153, 7, 64, 44, () => { this.panel = { id: "desk" }; this.render(); }, { small: true });
    if (showBack) {
      this.button("返回", this.width - 76, 68, 58, 34, () => {
        this.screen = "home";
        this.render();
      }, { secondary: true, small: true });
    }
  }

  renderHome() {
    this.drawHeader(false);
    const centerX = this.width / 2;
    this.text("重生之我是", centerX, 132, 30, COLORS.ink, "center", "700");
    this.text("公务员的一生", centerX, 168, 30, COLORS.ink, "center", "700");
    this.text("重生一次，重走仕途", centerX, 196, 15, COLORS.muted, "center");
    this.roundedRect(28, 220, this.width - 56, 128, 16, COLORS.paper, COLORS.line);
    this.text("这一世，履历由你来写", centerX, 253, 20, COLORS.tealDark, "center", "600");
    this.wrapText(
      "醒来那天，你又拿到了录用通知。这次，从科员开始，是平稳退休，还是一步步走向更高的职位？",
      52,
      286,
      this.width - 104,
      23,
      14,
      COLORS.muted
    );

    // 《健康游戏忠告》must be legible before the game starts, so it sits
    // directly above the entry buttons instead of below the fold.
    const adviceTop = 358;
    const adviceLines = this.measureWrappedLines(HEALTH_ADVICE, this.width - 84, 11).length;
    const adviceHeight = 36 + adviceLines * 17 + 22;
    this.roundedRect(28, adviceTop, this.width - 56, adviceHeight, 12, COLORS.paper, COLORS.line);
    this.text("健康游戏忠告", 42, adviceTop + 20, 12, COLORS.gold, "left", "600");
    this.wrapText(HEALTH_ADVICE, 42, adviceTop + 38, this.width - 84, 17, 11, COLORS.muted);
    this.text(AGE_RATING, 42, adviceTop + 38 + adviceLines * 17 + 4, 11, COLORS.tealDark, "left", "600");

    let firstY = adviceTop + adviceHeight + 20;
    if (this.savedGame) {
      const role = ROLES[this.savedGame.roleIndex];
      this.text(role.name, centerX, firstY + 11, 13, COLORS.gold, "center", "600");
      this.button(`继续第 ${this.savedGame.careerYear} 年`, 34, firstY + 24, this.width - 68, 54, () => this.continueGame());
      this.button("开始新的履历", 34, firstY + 92, this.width - 68, 50, () => {
        this.screen = "background";
        this.render();
      }, { secondary: true });
      firstY += 142;
    } else {
      this.button("重回录用那一年", 34, firstY + 24, this.width - 68, 56, () => {
        this.screen = "background";
        this.render();
      });
      firstY += 88;
    }

    const collectionY = firstY + 14;
    this.button(`结局收藏 · ${new Set(this.archive.map((item) => item.endingId)).size} / ${ENDINGS.length}`, 34, collectionY, this.width - 68, 48, () => {
      this.panel = { id: "collection" };
      this.render();
    }, { secondary: true });

    const footerTop = collectionY + 62;
    this.text("内部原型 · 本地存档 · 无广告与充值", centerX, footerTop, 11, COLORS.muted, "center");
    this.text("人物剧情虚构 · 多部门履历 · 游戏化调任", centerX, footerTop + 19, 11, COLORS.muted, "center");
    // The advice block can push the footer past a short viewport; let it scroll.
    this.contentHeight = Math.max(this.height, footerTop + 44);
  }

  // First-run privacy notice. The game collects nothing, so this is a plain
  // disclosure rather than a consent gate that blocks play.
  renderPrivacy() {
    this.text("隐私说明", 24, 122, 22, COLORS.ink, "left", "600");
    let y = 160;
    PRIVACY_NOTICE.forEach((line) => {
      const lines = this.wrapText(line, 28, y, this.width - 56, 22, 13, COLORS.muted);
      y += lines * 22 + 10;
    });
    const buttonY = Math.max(320, y + 18);
    this.button("我已了解，开始游戏", 28, buttonY, this.width - 56, 54, () => {
      this.settings = { ...this.settings, privacyVersion: PRIVACY_VERSION };
      platform.saveSettings(this.settings);
      this.panel = null;
      this.render();
    });
    this.contentHeight = Math.max(this.height, buttonY + 74);
  }

  renderBackgrounds() {
    this.drawHeader(true);
    this.text("选择你的前世经历", 24, 126, 25, COLORS.ink, "left", "700");
    this.wrapText("这决定你的起点，不是结局。这次重新走一次仕途。", 24, 153, this.width - 48, 20, 13, COLORS.muted);
    let y = 186;
    BACKGROUNDS.forEach((background) => {
      this.roundedRect(22, y, this.width - 44, 118, 14, COLORS.paper, COLORS.line);
      this.text(background.name, 40, y + 31, 20, COLORS.tealDark, "left", "600");
      this.wrapText(background.description, 40, y + 57, this.width - 160, 20, 13, COLORS.muted);
      const effectText = Object.entries(background.effects)
        .map(([key, value]) => `${ATTRIBUTE_LABELS[key]}${value > 0 ? "+" : ""}${value}`)
        .join("  ");
      this.text(effectText, 40, y + 96, 12, COLORS.ink);
      this.button("选择", this.width - 104, y + 38, 66, 42, () => this.startGame(background.id), { small: true });
      y += 132;
    });
  }

  renderPlay() {
    this.drawHeader(false);
    if (!this.state) return;
    if (this.state.phase === "event" && this.state.appointment) { this.renderAppointment(); return; }
    if (this.state.phase === "event" && (this.state.startOfYearResults || []).length) {
      this.renderYearNews();
      return;
    }
    if (this.state.phase === "event") this.renderEvent();
    else if (this.state.phase === "result") this.renderResult();
    // The last result is settled immediately by its action. This branch only
    // protects an in-memory state created by an older build or a test harness.
    else if (this.state.phase === "planning") this.renderDashboard();
    else if (this.state.phase === "review") this.renderReview();
    else if (this.state.phase === "ending") this.renderEnding();
  }

  renderAppointment() {
    this.buttons = [];
    const appointment = this.state.appointment;
    const role = ROLES[appointment.roleIndex];
    const leadership = appointment.type === "leadership";
    const demotion = appointment.type === "demotion";
    const description = leadership
      ? `上一任：${ROLES[Math.max(0, appointment.roleIndex - 1)].post}。本次通过${role.entryMode}到任：${role.post}（${role.level || "非领导岗位"}）。职责变化：${role.responsibility}。`
      : demotion
        ? `上一任：${ROLES[Math.min(ROLES.length - 1, appointment.roleIndex + 1)].post}。因年度组织评价触发降任，本次调整到：${role.post}。职级暂按游戏规则保留，新的岗位职责重新起算。`
        : `你晋升为${CIVIL_RANKS[appointment.rankIndex]}，当前职务不变。职级待遇进步，不代表新增领导职权。`;
    const title = leadership || demotion ? role.name : CIVIL_RANKS[appointment.rankIndex];
    const titleY = 181;
    const titleLineHeight = 32;
    const titleLines = this.measureWrappedLines(title, this.width - 72, 26).length;
    const bodyY = titleY + titleLines * titleLineHeight + 13;
    const lines = this.measureWrappedLines(description, this.width - 72, 15).length;
    const buttonY = Math.max(362, bodyY + lines * 24 + 46);
    this.context.save();
    this.context.globalAlpha = 0.86;
    this.context.fillStyle = "#05080d";
    this.context.fillRect(0, 58, this.width, Math.max(this.contentHeight, buttonY + 90));
    this.context.restore();
    this.roundedRect(20, 99, this.width - 40, buttonY + 76 - 99, 14, "#253249", "#526079");
    this.text(leadership ? `${role.entryMode}结果` : demotion ? "组织调整结果" : "职级晋升结果", 36, 136, 23, COLORS.white, "left", "600");
    this.wrapText(title, 36, titleY, this.width - 72, titleLineHeight, 26, COLORS.tealDark);
    this.wrapText(description, 36, bodyY, this.width - 72, 24, 15, COLORS.ink);
    this.text("游戏任职记录 · 不是真实任免文件", this.width / 2, buttonY - 21, 11, COLORS.muted, "center");
    this.button(demotion ? "接受调整，重新履职" : "赴任，开始新一年", 32, buttonY, this.width - 64, 54, () => {
      this.state = { ...this.state, appointment: null };
      this.panel = null;
      this.screen = "play";
      this.scrollY = 0;
      this.saveAndRender();
    });
    this.contentHeight = Math.max(this.height, buttonY + 100);
  }

  renderYearNews() {
    this.text("过去的选择有了回音", 24, 114, 23, COLORS.ink, "left", "600");
    let y = 160;
    this.state.startOfYearResults.forEach((item) => {
      const count = this.wrapText(item.message, 28, y, this.width - 56, 25, 16, COLORS.ink);
      y += count * 25 + 16;
      const changes = Object.entries(item.changes).map(([key, value]) => `${ATTRIBUTE_LABELS[key]} ${value > 0 ? "+" : ""}${value}`).join(" · ");
      y += this.wrapText(changes, 28, y, this.width - 56, 23, 14, COLORS.teal) * 23 + 28;
    });
    this.button("带着这些变化，进入新一年", 28, y, this.width - 56, 54, () => {
      this.state = { ...this.state, startOfYearResults: [] };
      this.scrollY = 0;
      this.saveAndRender();
    });
  }

  renderStatus() {
    const role = ROLES[this.state.roleIndex];
    this.text(`${START_AGE + this.state.careerYear - 1}岁 · 第${this.state.careerYear}年`, 18, 84, 12, COLORS.muted);
    this.text(this.state.roleIndex === 0 && this.state.rankIndex > 1 ? "未任领导" : role.name, this.width / 2, 84, 16, COLORS.tealDark, "center", "600");
    this.text(`现金 ${this.state.assets.toFixed(2)}`, this.width - 18, 84, 13, COLORS.muted, "right");
    const cardX = 16;
    const cardY = 98;
    const gap = 5;
    const cellWidth = (this.width - cardX * 2 - gap * 2) / 3;
    ATTRIBUTES.forEach((key, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = cardX + col * (cellWidth + gap);
      const y = cardY + row * 41;
      this.roundedRect(x, y, cellWidth, 35, 8, COLORS.paper, COLORS.line);
      this.text(ATTRIBUTE_LABELS[key], x + 9, y + 22, 11, COLORS.muted);
      const value = this.state.stats[key];
      const color = value < 25 ? COLORS.red : COLORS.tealDark;
      this.text(String(value), x + cellWidth - 9, y + 23, 15, color, "right", "700");
    });
    this.text(`${role.post}`, 18, 189, 12, COLORS.tealDark);
    this.text(this.state.roleIndex < 7 ? CIVIL_RANKS[this.state.rankIndex] : "职级：不适用", this.width - 18, 189, 11, COLORS.muted, "right");
  }

  renderEvent() {
    this.renderStatus();
    const event = findCurrentEvent(this.state, EVENTS);
    if (!event) return;
    const top = 206;
    const body = compactNarrative(event.body, 82);
    // Long story titles are authored in natural language. Drawing them on one
    // line overflowed narrow (320px) screens, so titles now scale down and
    // wrap, and the card grows to fit the measured title height.
    const titleSize = event.title.length > 16 ? 19 : event.title.length > 12 ? 21 : 23;
    const titleLineHeight = titleSize + 5;
    const titleLines = this.measureWrappedLines(event.title, this.width - 68, titleSize).length;
    const bodyLines = this.measureWrappedLines(body, this.width - 68, 15).length;
    const bodyTop = top + 60 + titleLines * titleLineHeight + 6;
    const cardHeight = Math.max(208, (bodyTop - top) + bodyLines * 25 + 14);
    this.roundedRect(16, top, this.width - 32, cardHeight, 15, COLORS.paper, COLORS.line);
    const categoryLabel = event.contentTag || { work: "工作事项", life: "生活片段", city: "城市事件", integrity: "廉洁考察", assessment: "旧版考察收尾" }[event.category];
    this.text(categoryLabel, 34, top + 28, 12, COLORS.gold, "left", "600");
    this.wrapText(event.title, 34, top + 60, this.width - 68, titleLineHeight, titleSize, COLORS.ink);
    this.wrapText(body, 34, bodyTop, this.width - 68, 25, 15, COLORS.ink);

    let y = top + cardHeight + 20;
    const previous = event.afterEvent && this.state.history.slice().reverse().find((item) => item.eventId === event.afterEvent.id);
    if (previous) {
      y += this.wrapText(`往事回响 · 第 ${previous.year} 年「${previous.eventTitle}」`, 24, y, this.width - 48, 22, 13, COLORS.gold) * 22 + 4;
      y += this.wrapText(`当时你选择：${previous.choiceText}`, 24, y, this.width - 48, 22, 13, COLORS.muted) * 22 + 16;
    }
    event.choices.forEach((choice, index) => {
      const lines = this.measureWrappedLines(choice.text, this.width - 98, 15);
      const height = Math.max(50, 29 + lines.length * 18);
      this.button(`${index + 1}. ${choice.text}`, 24, y, this.width - 48, height, () => {
        this.state = selectChoice(this.state, EVENTS, index);
        this.saveAndRender();
      }, { align: "left" });
      y += height + 10;
    });
    const footerY = Math.max(this.height - 20, y + 20);
    this.contentHeight = Math.max(this.contentHeight, footerY + 24);
    this.text("选择后自动保存 · 岗位条件见右上角选项", this.width / 2, footerY, 10, COLORS.muted, "center");
  }

  renderResult() {
    this.renderStatus();
    const result = this.state.lastResult;
    const textWidth = this.width - 84;
    const titleLines = this.measureWrappedLines(result.eventTitle, textWidth, 22).length;
    const choiceY = 280 + titleLines * 28;
    const choiceLines = this.measureWrappedLines(`你的选择：${result.choiceText}`, textWidth, 15).length;
    const outcome = compactNarrative(result.outcome, 82);
    const outcomeY = choiceY + choiceLines * 24 + 12;
    const outcomeLines = outcome ? this.measureWrappedLines(outcome, textWidth, 15).length : 0;
    const changesY = outcomeY + outcomeLines * 25 + (outcomeLines ? 22 : 10);
    const changes = Object.entries(result.changes).filter(([, value]) => value !== 0);
    let extraY = changesY + Math.max(1, Math.ceil(changes.length / 2)) * 30;
    const messages = result.delayedMessages || [];
    const accountabilityHeight = result.accountabilityNote
      ? this.measureWrappedLines(result.accountabilityNote, textWidth, 13).length * 22 + 8
      : 0;
    const notesHeight = messages.reduce((height, message) => height + this.measureWrappedLines(message, textWidth, 13).length * 22, 0);
    const bottom = extraY + (result.assetChange ? 28 : 0) + accountabilityHeight + notesHeight + 20;
    this.roundedRect(20, 204, this.width - 40, bottom - 204, 16, COLORS.paper, COLORS.line);
    this.text("这一页写下了", this.width / 2, 242, 13, COLORS.gold, "center", "600");
    this.wrapText(result.eventTitle, 42, 280, textWidth, 28, 22, COLORS.ink);
    this.wrapText(`你的选择：${result.choiceText}`, 42, choiceY, textWidth, 24, 15, COLORS.muted);
    if (outcome) this.wrapText(outcome, 42, outcomeY, textWidth, 25, 15, COLORS.ink);
    if (!changes.length) this.text("各项状态暂时没有变化", this.width / 2, changesY, 14, COLORS.muted, "center");
    changes.forEach(([key, value], index) => {
      const x = 48 + (index % 2) * ((this.width - 96) / 2);
      const rowY = changesY + Math.floor(index / 2) * 30;
      const color = value > 0 ? COLORS.teal : COLORS.red;
      this.text(`${ATTRIBUTE_LABELS[key]} ${value > 0 ? "+" : ""}${value}`, x, rowY, 15, color, "left", "600");
    });
    if (result.assetChange) {
      this.text(`积蓄 ${result.assetChange > 0 ? "+" : ""}${result.assetChange}`, 48, extraY, 14, COLORS.muted);
      extraY += 28;
    }
    if (result.accountabilityNote) {
      extraY += this.wrapText(result.accountabilityNote, 42, extraY, textWidth, 22, 13, COLORS.gold) * 22 + 8;
    }
    messages.forEach((message) => { extraY += this.wrapText(message, 42, extraY, textWidth, 22, 13, COLORS.muted) * 22; });
    this.button(this.state.queue.length ? "继续处理本年工作" : "完成工作，自动年终结算", 32, bottom + 20, this.width - 64, 54, () => {
      this.state = advanceAfterResult(this.state, EVENTS);
      if (this.state.phase === "planning") this.state = finalizeAnnualPlanning(this.state);
      this.saveAndRender();
    });
    this.contentHeight = Math.max(this.contentHeight, bottom + 100);
  }

  renderReview() {
    this.renderStatus();
    const review = this.state.review;
    const nextRole = ROLES[Math.min(this.state.roleIndex + 1, ROLES.length - 1)];
    const decision = `${TRANSFER_LABELS[review.promotionMode || "legacy"]}。${review.reasons.join("；") || "年末条件均已满足，自动调任。"}`;
    const reasonHeight = this.measureWrappedLines(decision, this.width - 88, 13).length * 21;
    const reportHeight = Math.max(330, 264 + reasonHeight + 48);
    this.roundedRect(18, 196, this.width - 36, reportHeight, 16, COLORS.paper, COLORS.line);
    this.text("年度履职报告", this.width / 2, 234, 25, COLORS.ink, "center", "700");
    this.text(String(review.finalScore), this.width / 2, 302, 52, review.promoted ? COLORS.teal : COLORS.gold, "center", "700");
    this.text(`基础 ${review.baseScore} · 波动 ${review.randomShift >= 0 ? "+" : ""}${review.randomShift} · 人情 ${review.relationshipBonus > 0 ? "+" : ""}${review.relationshipBonus || 0}`, this.width / 2, 329, 13, COLORS.muted, "center");
    this.text(`组织评价门槛 ${review.threshold}`, this.width / 2, 354, 13, COLORS.muted, "center");
    if (review.demoted) {
      this.text(`组织调整：降任至 ${ROLES[Math.max(0, this.state.roleIndex - 1)].name}`, this.width / 2, 394, 15, COLORS.red, "center", "600");
    } else if (review.promoted) {
      this.text(`${nextRole.entryMode}：${nextRole.name}`, this.width / 2, 394, 15, COLORS.tealDark, "center", "600");
    } else {
      this.text(review.rankPromoted ? `职级晋升：${CIVIL_RANKS[this.state.rankIndex + 1]}` : "本年度留任", this.width / 2, 394, 17, COLORS.ink, "center", "600");
    }
    this.wrapText(decision, 44, 424, this.width - 88, 21, 13, COLORS.muted, "center");
    this.text(`模拟薪资 +${review.annualIncome}  ·  支出 -${review.livingCost}`, this.width / 2, 196 + reportHeight - 28, 13, COLORS.muted, "center");
    let y = 196 + reportHeight + 28;
    if (review.noNewStory) {
      y += this.wrapText("你已读完当前岗位范围内的全部原创故事。本年度不重复旧事项，直接完成常规履职考核。", 32, y, this.width - 64, 24, 14, COLORS.gold) * 24 + 18;
    }
    (review.contributions || []).forEach((item) => {
      this.text(`${item.label} ${item.value} × ${item.weight}%`, 36, y, 14, COLORS.muted);
      this.text(item.score.toFixed(1), this.width - 36, y, 14, COLORS.tealDark, "right");
      y += 27;
    });
    y += this.wrapText(review.accountCredit ? `年度额外入账（不计入现金）：公积金 +${review.accountCredit.housingFund.toFixed(2)} 万；职业年金 +${review.accountCredit.annuity.toFixed(2)} 万。确认结算后到账。` : "本年度沿用旧版账户规则，不补记公积金或职业年金。", 32, y + 8, this.width - 64, 24, 14, COLORS.gold) * 24 + 20;
    if (review.childCost) y += this.wrapText(`年度支出已包含子女预算 ${review.childCost.toFixed(2)} 万，不会在翻年时重复扣款。`, 32, y, this.width - 64, 24, 14, COLORS.muted) * 24 + 16;
    this.button(this.state.careerYear >= MAX_CAREER_YEARS ? "完成人生履历" : "翻到下一年", 32, y + 12, this.width - 64, 54, () => {
      this.state = completeReview(this.state, EVENTS);
      this.panel = null;
      this.screen = "play";
      this.scrollY = 0;
      this.saveAndRender();
    });
  }

  renderEnding() {
    const ending = getEndingPresentation(this.state);
    const role = ROLES[this.state.roleIndex];
    this.text("履历完成", this.width / 2, 118, 15, COLORS.gold, "center", "600");
    this.text(ending.title, this.width / 2, 166, 31, COLORS.ink, "center", "700");
    const textWidth = this.width - 96;
    let y = 244;
    const descriptionHeight = this.measureWrappedLines(ending.description, textWidth, 16).length * 27;
    const detailHeight = ending.detail ? this.measureWrappedLines(ending.detail, textWidth, 14).length * 24 + 14 : 0;
    const storyHeight = this.measureWrappedLines(ending.story, textWidth, 14).length * 24;
    const cardHeight = 70 + descriptionHeight + detailHeight + storyHeight + 112;
    this.roundedRect(24, 205, this.width - 48, cardHeight, 16, COLORS.paper, COLORS.line);
    y += this.wrapText(ending.description, 48, y, textWidth, 27, 16, COLORS.ink, "center") * 27 + 18;
    if (ending.detail) y += this.wrapText(ending.detail, 48, y, textWidth, 24, 14, COLORS.red, "center") * 24 + 14;
    y += this.wrapText(ending.story, 48, y, textWidth, 24, 14, COLORS.muted, "left") * 24 + 24;
    this.text(`最终岗位 · ${role.name}`, this.width / 2, y, 15, COLORS.tealDark, "center", "600");
    y += 31;
    this.text(`职业 ${this.state.careerYear} 年 · 积蓄 ${this.state.assets}`, this.width / 2, y, 13, COLORS.muted, "center");
    y += 27;
    this.text(`重要选择 ${this.state.history.length} 次`, this.width / 2, y, 13, COLORS.muted, "center");
    const buttonsY = 205 + cardHeight + 20;
    this.button("回看本局履历", 32, buttonsY, this.width - 64, 44, () => {
      this.panel = { id: "history", page: 0 };
      this.render();
    }, { secondary: true });
    this.button("再写一份履历", 32, buttonsY + 54, this.width - 64, 54, () => {
      this.screen = "background";
      this.render();
    });
    this.button("回到首页", 32, buttonsY + 120, this.width - 64, 48, () => {
      this.screen = "home";
      this.render();
    }, { secondary: true });
    this.text("人物与案件均为虚构 · 不构成现实量刑说明", this.width / 2, buttonsY + 194, 10, COLORS.muted, "center");
    this.contentHeight = Math.max(this.contentHeight, buttonsY + 220);
  }

  button(label, x, y, width, height, onPress, options = {}) {
    this.contentHeight = Math.max(this.contentHeight, y + height + 32);
    const secondary = Boolean(options.secondary);
    this.roundedRect(
      x,
      y,
      width,
      height,
      options.small ? 10 : 13,
      secondary ? COLORS.paper : COLORS.teal,
      secondary ? COLORS.teal : COLORS.teal
    );
    const color = secondary ? COLORS.tealDark : COLORS.buttonInk;
    const size = options.small ? 13 : 15;
    const align = options.align || "center";
    if (align === "left") {
      const lines = this.measureWrappedLines(label, width - 32, size);
      const totalHeight = lines.length * (size + 4);
      const startY = y + (height - totalHeight) / 2 + size;
      lines.forEach((line, index) => this.text(line, x + 16, startY + index * (size + 4), size, color, "left", "600"));
    } else {
      this.text(label, x + width / 2, y + height / 2 + size * 0.36, size, color, "center", "600");
    }
    this.buttons.push({ label, x, y, width, height, onPress });
  }

  roundedRect(x, y, width, height, radius, fill, stroke) {
    const ctx = this.context;
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  text(value, x, y, size, color, align = "left", weight = "400") {
    const ctx = this.context;
    ctx.font = `${weight} ${size}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(value), x, y);
  }

  measureWrappedLines(text, maxWidth, size) {
    const ctx = this.context;
    ctx.font = `400 ${size}px sans-serif`;
    const lines = [];
    let current = [];
    // Keep money, percentages and progress fractions together on narrow screens.
    const tokens = String(text).match(/[+−-]?\d+(?:[./]\d+)*%?|[\s\S]/g) || [];
    tokens.forEach((character) => {
      const candidate = current.join("") + character;
      if (ctx.measureText(candidate).width > maxWidth && current.length) {
        if (/^[，。！？、；：）》】”’]$/.test(character) && current.length > 1) {
          lines.push(current.slice(0, -1).join(""));
          current = [current[current.length - 1], character];
        } else {
          lines.push(current.join(""));
          current = [character];
        }
      } else {
        current.push(character);
      }
    });
    if (current.length) lines.push(current.join(""));
    return lines;
  }

  wrapText(text, x, y, maxWidth, lineHeight, size, color, align = "left") {
    const lines = this.measureWrappedLines(text, maxWidth, size);
    let drawX = x;
    if (align === "center") drawX = x + maxWidth / 2;
    lines.forEach((line, index) => this.text(line, drawX, y + index * lineHeight, size, color, align));
    return lines.length;
  }
}

module.exports = { GameApp };
