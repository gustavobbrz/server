"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePlayerJoining = void 0;
const index_js_1 = require("./index.js");
const moderation_js_1 = require("./moderation.js");
const teammanagement_js_1 = require("./teammanagement.js");
function handlePlayerJoining(player) {
    const playerId = player.id;
    const playerName = player.name;
    const playerList = index_js_1.room.getPlayerList();
    if ((0, moderation_js_1.checkAndHandleBadWords)(player, playerName))
        return;
    if (isPlayerAlreadyConnected(player, player.conn))
        return;
    if (index_js_1.adminAuthList.has(player.auth))
        index_js_1.room.setPlayerAdmin(playerId, true);
    index_js_1.room.sendAnnouncement(`👋 Bem-vindo, ${playerName}.`, playerId, 0x00FF00, "bold", 0);
    index_js_1.specPlayerIdList.push(playerId);
    console.log(`>>> ${playerName} entrou na sala.`);
    checkAndRestartWithNewMode(playerList);
}
exports.handlePlayerJoining = handlePlayerJoining;
function checkAndRestartWithNewMode(playerList) {
    const playerListLength = playerList.length;
    if (playerListLength === 1)
        (0, index_js_1.restartGameWithCallback)(() => (0, teammanagement_js_1.movePlayerToTeam)(playerList[0].id, index_js_1.redPlayerIdList));
    if (playerListLength === 2)
        (0, index_js_1.restartGameWithCallback)(() => (0, teammanagement_js_1.movePlayerToTeam)(index_js_1.specPlayerIdList[0], index_js_1.bluePlayerIdList));
    if (playerListLength <= 6 && index_js_1.specPlayerIdList.length === 2)
        (0, index_js_1.restartGameWithCallback)(() => (0, teammanagement_js_1.moveOneSpecToEachTeam)());
}
function isPlayerAlreadyConnected(player, conn) {
    const playerId = player.id;
    if (!index_js_1.debuggingMode && [...index_js_1.playerConnStrings.values()].some(value => value === conn)) {
        index_js_1.room.kickPlayer(playerId, "Já estás conectado à sala", false);
        console.warn(`>>> ${player.name} foi expulso. Razão: conectar-se duas vezes com o mesmo IP.`);
        return true;
    }
    index_js_1.playerConnStrings.set(playerId, conn);
    return false;
}
