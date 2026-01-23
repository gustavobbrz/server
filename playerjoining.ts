import { room, specPlayerIdList, debuggingMode, playerConnStrings, adminAuthList, redPlayerIdList, restartGameWithCallback, bluePlayerIdList } from "./index.js";
import { checkAndHandleBadWords } from "./moderation.js";
import { movePlayerToTeam, moveOneSpecToEachTeam } from "./teammanagement.js";
import { sendDiscordWebhook, createPlayerJoinEmbed } from "./discord.js";
import { getRoomConfig } from "./config.js";

export function handlePlayerJoining(player: PlayerObject): void {
    const playerId: number = player.id;
    const playerName: string = player.name;
    const playerList: PlayerObject[] = room.getPlayerList();
    const config = getRoomConfig();
    
    if (checkAndHandleBadWords(player, playerName)) return;
    if (isPlayerAlreadyConnected(player, player.conn)) return;
    if (adminAuthList.has(player.auth)) {
        room.setPlayerAdmin(playerId, true);
        room.sendAnnouncement(`👑 ${playerName} é um administrador!`, null, 0xFFD700, "bold", 2);
    }
    
    // Mensagem de boas-vindas personalizada
    room.sendAnnouncement("═══════════════════════════════════════", playerId, 0xFFFFFF, "bold", 0);
    room.sendAnnouncement(`🔥 Bem-vindo(a) ${playerName}! 🔥`, playerId, 0xFF6600, "bold", 2);
    room.sendAnnouncement("═══════════════════════════════════════", playerId, 0xFFFFFF, "bold", 0);
    room.sendAnnouncement("", playerId, 0xFFFFFF, "normal", 0);
    room.sendAnnouncement("💬 Entre no nosso Discord para fazer amigos!", playerId, 0x7289DA, "bold", 1);
    room.sendAnnouncement(`🔗 ${config.discordLink}`, playerId, 0x00FFFF, "bold", 1);
    room.sendAnnouncement("", playerId, 0xFFFFFF, "normal", 0);
    room.sendAnnouncement("📜 Digite !regras para ver as regras", playerId, 0xFFFF00, "normal", 1);
    room.sendAnnouncement("❓ Digite !help para ver todos os comandos", playerId, 0xFFFF00, "normal", 1);
    room.sendAnnouncement("═══════════════════════════════════════", playerId, 0xFFFFFF, "bold", 0);
    
    // Anunciar entrada para todos
    room.sendAnnouncement(`🟢 ${playerName} entrou na sala!`, null, 0x00FF00, "normal", 1);
    
    // Enviar webhook do Discord
    if (config.webhookUrl) {
        sendDiscordWebhook(config.webhookUrl, {
            embeds: [createPlayerJoinEmbed(playerName, config.roomName)]
        }).catch(err => console.error("Erro ao enviar webhook:", err));
    }
    
    specPlayerIdList.push(playerId);
    console.log(`>>> ${playerName} entrou na sala.`);
    checkAndRestartWithNewMode(playerList);
}

function checkAndRestartWithNewMode(playerList: PlayerObject[]): void {
    const playerListLength: number = playerList.length;
    if (playerListLength === 1) restartGameWithCallback(() => movePlayerToTeam(playerList[0]!.id, redPlayerIdList));
    if (playerListLength === 2) restartGameWithCallback(() => movePlayerToTeam(specPlayerIdList[0]!, bluePlayerIdList));
    if (playerListLength <= 6 && specPlayerIdList.length === 2) restartGameWithCallback(() => moveOneSpecToEachTeam());
}

function isPlayerAlreadyConnected(player: PlayerObject, conn: string): boolean {
    const playerId = player.id;
    if (!debuggingMode && [...playerConnStrings.values()].some(value => value === conn)) {
        room.kickPlayer(playerId, "Já estás conectado à sala", false);
        console.warn(`>>> ${player.name} foi expulso. Razão: conectar-se duas vezes com o mesmo IP.`);
        return true;
    }
    playerConnStrings.set(playerId, conn);
    return false;
}