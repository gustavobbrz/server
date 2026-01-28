// ARQUIVO: discord.ts - Refatorado para usar API REST Arena Cup

const API_URL = 'http://54.232.83.230:3005';

// --- FUNÇÕES AJUDANTES (HELPERS) ---

// Converte o IP (String) para Hexadecimal (para o campo Conn)
function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += '' + str.charCodeAt(i).toString(16);
  }
  return hex.toUpperCase();
}

// --- INTERFACES ---

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

// --- FUNÇÃO DE ENVIO PARA API ---

export async function callRoomAPI(roomId: string, endpoint: string, data: any): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error(`[API] Erro ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[API] Falha na conexão:", error);
  }
}

// --- INTEGRAÇÃO COM EVENTOS ---

export function notifyPlayerJoin(roomId: string, player: PlayerObject): void {
  callRoomAPI(roomId, '/events/player-join', {
    playerName: player.name,
    auth: player.auth,
    ip: player.conn.split('.')[0], // Proteção básica de IP
    conn: player.conn
  });
}

export function notifyPlayerLeave(roomId: string, player: PlayerObject): void {
  callRoomAPI(roomId, '/events/player-leave', {
    playerName: player.name,
    reason: 'Saiu da sala'
  });
}

export function notifyGameEnd(roomId: string, stats: any): void {
  callRoomAPI(roomId, '/events/game-end', {
    redScore: stats.redScore,
    blueScore: stats.blueScore,
    redPlayers: stats.redPlayers,
    bluePlayers: stats.bluePlayers,
    duration: stats.duration
  });
}

export function notifyAdminAction(roomId: string, data: any): void {
  callRoomAPI(roomId, '/events/admin-action', {
    action: data.action,
    targetPlayer: data.targetName,
    adminPlayer: data.adminName,
    reason: data.reason
  });
}

export function notifyChat(roomId: string, playerName: string, message: string): void {
  if (message.startsWith('!')) return; // Ignorar comandos
  callRoomAPI(roomId, '/events/chat', {
    playerName: playerName,
    message: message
  });
}

export function notifyReport(roomId: string, data: any): void {
  callRoomAPI(roomId, '/events/report', {
    reporter: data.reporter,
    reported: data.reported,
    reason: data.reason
  });
}

export function updateStatus(roomId: string, data: any): void {
  callRoomAPI(roomId, '/status', {
    online: data.online,
    players: data.players,
    maxPlayers: data.maxPlayers
  });
}
