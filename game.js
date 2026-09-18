"use strict";

const { GameApp } = require("./src/ui/app");

// The same entry runs on WeChat (wx.*) and Douyin (tt.*). The platform
// adapter in src/platform/wechat.js resolves whichever global is present.
const api = typeof wx !== "undefined" ? wx : typeof tt !== "undefined" ? tt : null;

if (!api) {
  throw new Error("《重生之我是公务员的一生》需要在小游戏环境中运行（微信开发者工具或抖音开发者工具）");
}

const canvas = api.createCanvas();
new GameApp(canvas);
