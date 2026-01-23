"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pauseUnpauseGame = exports.restartGameWithCallback = exports.room = exports.bluePlayerIdList = exports.redPlayerIdList = exports.specPlayerIdList = exports.badWordList = exports.adminAuthList = exports.playerConnStrings = exports.debuggingMode = void 0;
const haxball_js_1 = __importDefault(require("haxball.js"));
const fs = __importStar(require("fs"));
const afkdetection_js_1 = require("./afkdetection.js");
const playerjoining_js_1 = require("./playerjoining.js");
const playerleaving_js_1 = require("./playerleaving.js");
const teammanagement_js_1 = require("./teammanagement.js");
const moderation_js_1 = require("./moderation.js");
const commands_js_1 = require("./commands.js");
exports.debuggingMode = false;
const scoreLimit = 3;
const timeLimit = 3;
exports.playerConnStrings = new Map();
exports.adminAuthList = new Set(fs.readFileSync("lists/adminlist.txt", "utf8").split("\n").map((line) => line.trim()));
exports.badWordList = new Set(fs.readFileSync("lists/badwords.txt", "utf8").split("\n").map((line) => line.trim()));
const tokenFile = fs.readFileSync("token.txt", "utf8");
const practiceStadium = fs.readFileSync("stadiums/practice.hbs", "utf8");
const stadium2x2 = fs.readFileSync("stadiums/futsal2x2.hbs", "utf8");
const stadium3x3 = fs.readFileSync("stadiums/futsal3x3.hbs", "utf8");
exports.specPlayerIdList = [];
exports.redPlayerIdList = [];
exports.bluePlayerIdList = [];
haxball_js_1.default.then((HBInit) => {
    exports.room = HBInit({
        roomName: "🟡🟢 FUTSAL NIVEL 3X3 - AUTO 🟡🟢",
        maxPlayers: 30,
        public: true,
        noPlayer: true,
        geo: {
            code: "BR",
            lat: -23.51634162,
            lon: -46.6460824,
        },
        token: tokenFile, //https://haxball.com/headlesstoken
    });
    exports.room.setScoreLimit(scoreLimit);
    exports.room.setTimeLimit(timeLimit);
    exports.room.setTeamsLock(true);
    exports.room.setCustomStadium(practiceStadium);
    exports.room.onRoomLink = function (url) {
        console.log(url);
    };
    exports.room.onPlayerJoin = function (player) {
        (0, playerjoining_js_1.handlePlayerJoining)(player);
    };
    exports.room.onPlayerLeave = function (player) {
        (0, playerleaving_js_1.handlePlayerLeaving)(player);
    };
    exports.room.onTeamGoal = function (teamId) {
        const scores = exports.room.getScores();
        const teamScore = teamId === 1 ? scores.red : scores.blue;
        const teamPlayerIdList = teamId === 1 ? exports.redPlayerIdList : exports.bluePlayerIdList;
        if (teamScore === scoreLimit || scores.time > timeLimit * 60)
            restartGameWithCallback(() => (0, teammanagement_js_1.handleTeamWin)(teamPlayerIdList));
    };
    //triggers *only* when a team is winning and the timer runs out, 
    //because the room is also listening for the onTeamGoal event, which triggers first
    exports.room.onTeamVictory = function (scores) {
        const teamPlayerIdList = scores.red > scores.blue ? exports.redPlayerIdList : exports.bluePlayerIdList;
        restartGameWithCallback(() => (0, teammanagement_js_1.handleTeamWin)(teamPlayerIdList));
    };
    exports.room.onPlayerActivity = function (player) {
        (0, afkdetection_js_1.handlePlayerActivity)(player.id);
    };
    exports.room.onGameTick = function () {
        if (!exports.debuggingMode)
            (0, afkdetection_js_1.checkAndHandleInactivePlayers)();
    };
    exports.room.onPlayerChat = function (player, message) {
        console.log(`${player.name}: ${message}`);
        return !(0, commands_js_1.checkAndHandleCommands)(player, message) && !(0, moderation_js_1.checkAndHandleBadWords)(player, message) && !(0, moderation_js_1.checkAndHandleSpam)(player, message);
    };
});
function restartGameWithCallback(callback) {
    exports.room.stopGame();
    callback();
    setAppropriateStadium();
    exports.room.startGame();
    const playerList = exports.room.getPlayerList();
    if (playerList.length !== 1)
        pauseUnpauseGame();
}
exports.restartGameWithCallback = restartGameWithCallback;
function setAppropriateStadium() {
    const playerList = exports.room.getPlayerList();
    const playerListLength = playerList.length;
    if (playerListLength === 1) {
        exports.room.setCustomStadium(practiceStadium);
    }
    else if (playerListLength >= 6) {
        exports.room.setCustomStadium(stadium3x3);
    }
    else {
        exports.room.setCustomStadium(stadium2x2);
    }
}
function pauseUnpauseGame() {
    exports.room.pauseGame(true);
    exports.room.pauseGame(false);
}
exports.pauseUnpauseGame = pauseUnpauseGame;
