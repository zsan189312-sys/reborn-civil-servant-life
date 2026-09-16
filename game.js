"use strict";

const { GameApp } = require("./src/ui/app");

if (typeof wx === "undefined") {
  throw new Error("《重生之我是公务员的一生》需要在微信开发者工具的小游戏环境中运行");
}

const canvas = wx.createCanvas();
new GameApp(canvas);
