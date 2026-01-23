"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCommand = exports.checkAndHandleCommands = void 0;
const index_js_1 = require("./index.js");
const commands = [
    {
        name: "help",
        description: "mostrar a lista dos comandos e respetivas funções",
        emoji: "❓",
        adminOnly: false,
        response: (player) => {
            commands.forEach((command) => {
                if (command.adminOnly && !player.admin)
                    return;
                sendBoldWhiteAnnouncement(`${command.emoji} !${command.name}: ${command.description}.`, player.id);
            });
        }
    },
    {
        name: "github",
        description: "mostrar o link para o repositório público da sala",
        emoji: "👨‍💻",
        adminOnly: false,
        response: (player) => {
            sendBoldWhiteAnnouncement("👨‍💻 O código desta sala é open source: github.com/DazzDev/SimpleHaxballFutsal.", player.id);
        }
    },
    {
        name: "bb",
        description: "sair da sala",
        emoji: "👋",
        adminOnly: false,
        response: (player) => {
            index_js_1.room.kickPlayer(player.id, "Comando !bb", false);
        }
    }
];
function checkAndHandleCommands(player, message) {
    if (!isCommand(message))
        return false;
    const commandMessage = message.substring(1);
    const command = commands.find((command) => command.name === commandMessage);
    if (!command) {
        index_js_1.room.sendAnnouncement("🚫 Esse comando não existe. Escreve !help para veres a lista dos comandos.", player.id, 0xFF0000, "bold", 0);
        return true;
    }
    command.response(player);
    return true;
}
exports.checkAndHandleCommands = checkAndHandleCommands;
function isCommand(message) {
    return (message !== "!" && message.startsWith("!"));
}
exports.isCommand = isCommand;
function sendBoldWhiteAnnouncement(message, playerId) {
    index_js_1.room.sendAnnouncement(message, playerId, 0xFFFFFF, "bold", 0);
}
