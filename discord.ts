import https from 'https';
import { URL } from 'url';

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

export function sendDiscordWebhook(webhookUrl: string, payload: DiscordWebhookPayload): Promise<void> {
  if (!webhookUrl || webhookUrl === "") {
    console.log("Webhook não configurado, pulando envio...");
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      const url = new URL(webhookUrl);
      const data = JSON.stringify(payload);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Webhook enviado com sucesso!');
            resolve();
          } else {
            console.error(`Erro ao enviar webhook: ${res.statusCode} - ${responseData}`);
            reject(new Error(`Webhook failed with status ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Erro ao enviar webhook:', error);
        reject(error);
      });

      req.write(data);
      req.end();
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      reject(error);
    }
  });
}

export function createPlayerJoinEmbed(playerName: string, roomName: string): DiscordEmbed {
  return {
    title: "🟢 Jogador Entrou",
    description: `**${playerName}** entrou na sala!`,
    color: 0x00FF00,
    fields: [
      {
        name: "Sala",
        value: roomName,
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  };
}

export function createPlayerLeaveEmbed(playerName: string, roomName: string): DiscordEmbed {
  return {
    title: "🔴 Jogador Saiu",
    description: `**${playerName}** saiu da sala.`,
    color: 0xFF0000,
    fields: [
      {
        name: "Sala",
        value: roomName,
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  };
}

export function createGameResultEmbed(
  redScore: number,
  blueScore: number,
  redPlayers: string[],
  bluePlayers: string[],
  roomName: string
): DiscordEmbed {
  const winner = redScore > blueScore ? "🔴 Time Vermelho" : "🔵 Time Azul";
  
  return {
    title: "⚽ Resultado da Partida",
    description: `**${winner}** venceu a partida!`,
    color: redScore > blueScore ? 0xFF0000 : 0x0000FF,
    fields: [
      {
        name: "Placar",
        value: `🔴 ${redScore} x ${blueScore} 🔵`,
        inline: false
      },
      {
        name: "Time Vermelho",
        value: redPlayers.join(", ") || "Nenhum jogador",
        inline: true
      },
      {
        name: "Time Azul",
        value: bluePlayers.join(", ") || "Nenhum jogador",
        inline: true
      },
      {
        name: "Sala",
        value: roomName,
        inline: false
      }
    ],
    timestamp: new Date().toISOString()
  };
}

export function createAdminActionEmbed(
  adminName: string,
  action: string,
  targetPlayer: string,
  reason: string,
  roomName: string
): DiscordEmbed {
  return {
    title: "⚠️ Ação de Admin",
    description: `**${adminName}** executou uma ação administrativa.`,
    color: 0xFFA500,
    fields: [
      {
        name: "Ação",
        value: action,
        inline: true
      },
      {
        name: "Jogador Alvo",
        value: targetPlayer,
        inline: true
      },
      {
        name: "Motivo",
        value: reason || "Não especificado",
        inline: false
      },
      {
        name: "Sala",
        value: roomName,
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  };
}
