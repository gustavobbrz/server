// ARQUIVO: discord.ts - Refatorado para usar API REST Arena Cup e Chat Bidirecional

const API_URL = 'http://54.232.83.230:3005';

// --- FUNÇÕES AJUDANTES (HELPERS) ---

export async function callRoomAPI(roomId: string, endpoint: string, data: any): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}${endpoint}`, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      console.error(`[API] Erro ${response.status}: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("[API] Falha na conexão:", error);
    return null;
  }
}

// --- INTEGRAÇÃO COM EVENTOS (Haxball -> Discord) ---

export function notifyPlayerJoin(roomId: string, player: PlayerObject): void {
  callRoomAPI(roomId, '/events/player-join', {
    playerName: player.name,
    auth: player.auth,
    ip: player.conn.split('.')[0],
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
  callRoomAPI(roomId, '/events/game-end', stats);
}

export function notifyAdminAction(roomId: string, data: any): void {
  callRoomAPI(roomId, '/events/admin-action', data);
}

export function notifyChat(roomId: string, playerName: string, message: string): void {
  if (message.startsWith('!')) return;
  callRoomAPI(roomId, '/events/chat', { playerName, message });
}

export function notifyReport(roomId: string, data: any): void {
  callRoomAPI(roomId, '/events/report', data);
}

export function updateStatus(roomId: string, data: any): void {
  callRoomAPI(roomId, '/status', data);
}

// --- INTEGRAÇÃO COM MENSAGENS (Discord -> Haxball) ---

export async function checkDiscordMessages(roomId: string, room: RoomObject): Promise<void> {
  const result = await callRoomAPI(roomId, '/pending-messages', null);
  if (result && result.success && result.messages) {
    result.messages.forEach((msg: any) => {
      const prefix = msg.isAnnouncement ? "📢 [ANÚNCIO]" : "💬 [DISCORD]";
      const color = msg.isAnnouncement ? 0xFFFF00 : 0x7289DA;
      room.sendAnnouncement(`${prefix} ${msg.user}: ${msg.message}`, null, color, "bold", 1);
    });
  }
}
