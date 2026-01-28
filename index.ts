import 'dotenv/config';
import HaxballJS from "haxball.js";
import * as fs from "fs";
import { handlePlayerActivity, checkAndHandleInactivePlayers } from "./afkdetection.js";
import { handlePlayerJoining } from "./playerjoining.js";
import { handlePlayerLeaving } from "./playerleaving.js";
import { handleTeamWin } from "./teammanagement.js";
import { checkAndHandleBadWords, checkAndHandleSpam } from "./moderation.js";
import { checkAndHandleCommands } from "./commands.js";
import { checkAndHandleAdminCommands } from "./admincommands.js";
import { getRoomConfig } from "./config.js";
import { notifyGameEnd, notifyChat, updateStatus } from "./discord.js";

export const debuggingMode = false;

export const playerConnStrings = new Map<number, string>();
export const adminAuthList: Set<string> = new Set(fs.readFileSync("lists/adminlist.txt", "utf8").split("\n").map((line: string) => line.trim()));
export const badWordList: Set<string> = new Set(fs.readFileSync("lists/badwords.txt", "utf8").split("\n").map((line: string) => line.trim()));
const tokenFile: string = fs.readFileSync("token.txt", "utf8");
const practiceStadium: string = fs.readFileSync("stadiums/practice.hbs", "utf8");
const stadium2x2: string = fs.readFileSync("stadiums/futsal2x2.hbs", "utf8");
const stadium3x3: string = fs.readFileSync("stadiums/futsal3x3.hbs", "utf8");

export let specPlayerIdList: number[] = [];
export let redPlayerIdList: number[] = [];
export let bluePlayerIdList: number[] = [];

export let room: RoomObject;

const config = getRoomConfig();

HaxballJS.then((HBInit) => {
  room = HBInit({
    roomName: config.roomName,
    maxPlayers: config.maxPlayers,
    public: true,
    noPlayer: true,
    geo: {
      code: "BR",
      lat: -19.81,
      lon: -43.95,
    },
    token: tokenFile, //https://haxball.com/headlesstoken
  });

  room.setScoreLimit(config.scoreLimit);
  room.setTimeLimit(config.timeLimit);
  room.setTeamsLock(true);
  room.setCustomStadium(practiceStadium);

  room.onRoomLink = function (url: string) {
    console.log("═══════════════════════════════════════");
    console.log(`🔥 SALA: ${config.roomName}`);
    console.log(`🔗 LINK: ${url}`);
    console.log("═══════════════════════════════════════");
    
    // Notificar API que a sala abriu
    updateStatus(config.roomType, {
      online: true,
      players: 0,
      maxPlayers: config.maxPlayers
    });
  };

  room.onPlayerJoin = function (player: PlayerObject): void {
    handlePlayerJoining(player);
    
    // Atualizar status na API
    updateStatus(config.roomType, {
      online: true,
      players: room.getPlayerList().length,
      maxPlayers: config.maxPlayers
    });
  }

  room.onPlayerLeave = function (player: PlayerObject): void {
    handlePlayerLeaving(player);
    
    // Atualizar status na API
    updateStatus(config.roomType, {
      online: true,
      players: room.getPlayerList().length,
      maxPlayers: config.maxPlayers
    });
  }

  room.onTeamGoal = function (teamId: number) {
    const scores = room.getScores();
    const teamScore = teamId === 1 ? scores.red : scores.blue;
    const teamPlayerIdList = teamId === 1 ? redPlayerIdList : bluePlayerIdList;
    
    // Anunciar gol
    const goalScorer = teamId === 1 ? "🔴 Time Vermelho" : "🔵 Time Azul";
    room.sendAnnouncement(`⚽ GOOOOOL! ${goalScorer} marcou!`, null, teamId === 1 ? 0xFF0000 : 0x0000FF, "bold", 2);
    room.sendAnnouncement(`📊 Placar: 🔴 ${scores.red} x ${scores.blue} 🔵`, null, 0xFFFFFF, "bold", 1);
    
    if (teamScore === config.scoreLimit || scores.time > config.timeLimit * 60) {
      restartGameWithCallback(() => handleTeamWin(teamPlayerIdList));
      sendGameResultToAPI(scores);
    }
  }

  room.onTeamVictory = function (scores: ScoresObject): void {
    const teamPlayerIdList = scores.red > scores.blue ? redPlayerIdList : bluePlayerIdList;
    restartGameWithCallback(() => handleTeamWin(teamPlayerIdList));
    sendGameResultToAPI(scores);
  }

  room.onPlayerActivity = function (player: PlayerObject): void {
    handlePlayerActivity(player.id);
  }

  room.onGameTick = function (): void {
    if (!debuggingMode) checkAndHandleInactivePlayers();
  }

  room.onPlayerChat = function (player: PlayerObject, message: string): boolean {
    console.log(`${player.name}: ${message}`);
    
    // Notificar chat na API
    notifyChat(config.roomType, player.name, message);
    
    // Verificar comandos de admin primeiro
    if (checkAndHandleAdminCommands(player, message)) return false;
    
    // Depois comandos normais
    return !checkAndHandleCommands(player, message) && !checkAndHandleBadWords(player, message) && !checkAndHandleSpam(player, message);
  }
});

export function restartGameWithCallback(callback: () => void): void {
  room.stopGame();
  callback();
  setAppropriateStadium();
  room.startGame();
  const playerList: PlayerObject[] = room.getPlayerList();
  if (playerList.length !== 1) pauseUnpauseGame();
}

function setAppropriateStadium() {
  const playerList = room.getPlayerList();
  const playerListLength = playerList.length;
  if (playerListLength === 1) {
    room.setCustomStadium(practiceStadium);
  } else if (playerListLength >= 6) {
    room.setCustomStadium(stadium3x3);
  } else {
    room.setCustomStadium(stadium2x2);
  }
}

export function pauseUnpauseGame() {
  room.pauseGame(true);
  room.pauseGame(false);
}

function sendGameResultToAPI(scores: ScoresObject): void {
  const playerList = room.getPlayerList();
  const redPlayers = playerList.filter(p => redPlayerIdList.includes(p.id)).map(p => p.name);
  const bluePlayers = playerList.filter(p => bluePlayerIdList.includes(p.id)).map(p => p.name);
  
  notifyGameEnd(config.roomType, {
    redScore: scores.red,
    blueScore: scores.blue,
    redPlayers: redPlayers,
    bluePlayers: bluePlayers,
    duration: Math.floor(scores.time)
  });
}
