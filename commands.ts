import { room } from "./index.js";
import { getRoomConfig } from "./config.js";
import { getAdminCommandsList } from "./admincommands.js";
import { notifyReport } from "./discord.js";

interface Command {
    name: string;
    description: string;
    emoji: string;
    adminOnly: boolean
    response: (player: PlayerObject, args: string[]) => void;
}

const commands: Command[] = [
    {
        name: "help",
        description: "mostrar a lista dos comandos e respectivas funções",
        emoji: "❓",
        adminOnly: false,
        response: (player: PlayerObject) => {
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
            sendBoldWhiteAnnouncement("📋 COMANDOS DISPONÍVEIS:", player.id);
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
            commands.forEach((command) => {
                if (command.adminOnly && !player.admin) return;
                sendBoldWhiteAnnouncement(`${command.emoji} !${command.name}: ${command.description}`, player.id);
            });
            
            if (player.admin) {
                sendBoldWhiteAnnouncement("", player.id);
                sendBoldWhiteAnnouncement("👑 COMANDOS DE ADMIN:", player.id);
                const adminCmds = getAdminCommandsList();
                adminCmds.forEach(cmd => sendBoldWhiteAnnouncement(cmd, player.id));
            }
            
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
        }
    },
    {
        name: "discord",
        description: "mostrar o link do servidor do Discord",
        emoji: "💬",
        adminOnly: false,
        response: (player: PlayerObject) => {
            const config = getRoomConfig();
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
            sendBoldWhiteAnnouncement("💬 JUNTE-SE AO NOSSO DISCORD!", player.id);
            sendBoldWhiteAnnouncement(`🔗 ${config.discordLink}`, player.id);
            sendBoldWhiteAnnouncement("Venha conversar, fazer amigos e participar de eventos!", player.id);
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
        }
    },
    {
        name: "denunciar",
        description: "denunciar um jogador para os admins",
        emoji: "🚨",
        adminOnly: false,
        response: (player: PlayerObject, args: string[]) => {
            if (args.length < 2) {
                room.sendAnnouncement("❌ Uso: !denunciar <nome> <motivo>", player.id, 0xFF0000, "bold", 0);
                return;
            }
            
            const reportedName = args[0];
            const reason = args.slice(1).join(" ");
            const config = getRoomConfig();
            
            notifyReport(config.roomType, {
                reporter: player.name,
                reported: reportedName,
                reason: reason
            });
            
            room.sendAnnouncement("✅ Sua denúncia foi enviada para os administradores!", player.id, 0x00FF00, "bold", 1);
        }
    },
    {
        name: "github",
        description: "mostrar o link para o repositório da sala",
        emoji: "👨‍💻",
        adminOnly: false,
        response: (player: PlayerObject) => {
            sendBoldWhiteAnnouncement("👨‍💻 O código desta sala é open source: github.com/gustavobbrz/server", player.id);
        }
    },
    {
        name: "bb",
        description: "sair da sala",
        emoji: "👋",
        adminOnly: false,
        response: (player: PlayerObject) => {
            room.sendAnnouncement(`👋 ${player.name} saiu da sala. Até logo!`, null, 0xFFFF00, "bold", 1);
            room.kickPlayer(player.id, "Comando !bb", false);
        }
    },
    {
        name: "regras",
        description: "mostrar as regras da sala",
        emoji: "📜",
        adminOnly: false,
        response: (player: PlayerObject) => {
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
            sendBoldWhiteAnnouncement("📜 REGRAS DA SALA:", player.id);
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
            sendBoldWhiteAnnouncement("1️⃣ Respeite todos os jogadores", player.id);
            sendBoldWhiteAnnouncement("2️⃣ Não use palavrões ou linguagem ofensiva", player.id);
            sendBoldWhiteAnnouncement("3️⃣ Não faça spam no chat", player.id);
            sendBoldWhiteAnnouncement("4️⃣ Não fique AFK (ausente) durante as partidas", player.id);
            sendBoldWhiteAnnouncement("5️⃣ Jogue limpo e divirta-se!", player.id);
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
        }
    },
    {
        name: "afk",
        description: "marcar-se como AFK e ir para espectadores",
        emoji: "😴",
        adminOnly: false,
        response: (player: PlayerObject) => {
            room.setPlayerTeam(player.id, 0);
            room.sendAnnouncement(`😴 ${player.name} está AFK.`, null, 0xFFFF00, "normal", 1);
        }
    },
    {
        name: "stats",
        description: "ver estatísticas da sala",
        emoji: "📊",
        adminOnly: false,
        response: (player: PlayerObject) => {
            const players = room.getPlayerList();
            const redTeam = players.filter(p => p.team === 1);
            const blueTeam = players.filter(p => p.team === 2);
            const specs = players.filter(p => p.team === 0);
            
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
            sendBoldWhiteAnnouncement("📊 ESTATÍSTICAS DA SALA:", player.id);
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
            sendBoldWhiteAnnouncement(`👥 Total de jogadores: ${players.length}`, player.id);
            sendBoldWhiteAnnouncement(`🔴 Time Vermelho: ${redTeam.length}`, player.id);
            sendBoldWhiteAnnouncement(`🔵 Time Azul: ${blueTeam.length}`, player.id);
            sendBoldWhiteAnnouncement(`👁️ Espectadores: ${specs.length}`, player.id);
            sendBoldWhiteAnnouncement("═══════════════════════════════", player.id);
        }
    }
];

export function checkAndHandleCommands(player: PlayerObject, message: string): boolean {
    if (!isCommand(message)) return false;
    const parts = message.substring(1).split(" ");
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    const command = commands.find((command) => command.name === commandName);
    if (!command) {
        room.sendAnnouncement("🚫 Esse comando não existe. Digite !help para ver a lista de comandos.", player.id, 0xFF0000, "bold", 0);
        return true;
    }
    command.response(player, args);
    return true;
}

export function isCommand(message: string): boolean {
    return (message !== "!" && message.startsWith("!"))
}

function sendBoldWhiteAnnouncement(message: string, playerId: number) {
    room.sendAnnouncement(message, playerId, 0xFFFFFF, "bold", 0);
}
