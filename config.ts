export interface RoomConfig {
  roomName: string;
  maxPlayers: number;
  scoreLimit: number;
  timeLimit: number;
  discordLink: string;
  webhookUrl?: string;
  roomType: 'x1' | 'x3-nivel' | 'x3-noobs' | 'x4';
}

export const roomConfigs: Record<string, RoomConfig> = {
  'x3-nivel': {
    roomName: "🔥HAX HOST🔥 FUTSAL X3 NIVEL 🔥",
    maxPlayers: 30,
    scoreLimit: 3,
    timeLimit: 3,
    discordLink: "https://discord.gg/SEU_LINK_AQUI",
    webhookUrl: process.env.WEBHOOK_X3_NIVEL || "",
    roomType: 'x3-nivel'
  },
  'x3-noobs': {
    roomName: "🔥HAX HOST🔥 FUTSAL X3 NOOBS🔥",
    maxPlayers: 30,
    scoreLimit: 3,
    timeLimit: 3,
    discordLink: "https://discord.gg/SEU_LINK_AQUI",
    webhookUrl: process.env.WEBHOOK_X3_NOOBS || "",
    roomType: 'x3-noobs'
  },
  'x1': {
    roomName: "🔥HAX HOST🔥 FUTSAL X1 🔥",
    maxPlayers: 20,
    scoreLimit: 3,
    timeLimit: 3,
    discordLink: "https://discord.gg/SEU_LINK_AQUI",
    webhookUrl: process.env.WEBHOOK_X1 || "",
    roomType: 'x1'
  },
  'x4': {
    roomName: "🔥HAX HOST 🔥FUTSAL X4  🔥",
    maxPlayers: 40,
    scoreLimit: 3,
    timeLimit: 4,
    discordLink: "https://discord.gg/SEU_LINK_AQUI",
    webhookUrl: process.env.WEBHOOK_X4 || "",
    roomType: 'x4'
  }
};

// Pegar configuração da sala baseado em variável de ambiente
export function getRoomConfig(): RoomConfig {
  const roomType = process.env.ROOM_TYPE || 'x3-nivel';
  return roomConfigs[roomType] || roomConfigs['x3-nivel'];
}
