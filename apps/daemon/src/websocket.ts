import { WebSocketServer, WebSocket } from 'ws';
import { createLogger } from '@accomplish_ai/agent-core';

const logger = createLogger('WebSocket');
import type { Server } from 'http';

export type DaemonEvent =
  | { type: 'task:update'; taskId: string; data: unknown }
  | { type: 'task:progress'; taskId: string; data: unknown }
  | { type: 'task:status-change'; taskId: string; status: string }
  | { type: 'task:complete'; taskId: string; data: unknown }
  | { type: 'task:error'; taskId: string; error: string }
  | { type: 'task:thought'; data: unknown }
  | { type: 'task:checkpoint'; data: unknown }
  | { type: 'task:todo-update'; taskId: string; data: unknown }
  | { type: 'permission:request'; data: unknown }
  | { type: 'auth:error'; data: unknown };

export type ClientMessage =
  | { type: 'permission:response'; requestId: string; allowed: boolean }
  | { type: 'question:response'; requestId: string; data: unknown };

type MessageHandler = (clientMessage: ClientMessage) => void;

let wss: WebSocketServer | null = null;
const messageHandlers = new Set<MessageHandler>();

export function setupWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    logger.info(`Client connected. Total: ${wss?.clients.size ?? 0}`);

    ws.on('message', (raw) => {
      let msg: ClientMessage;
      try {
        const parsed = JSON.parse(raw.toString()) as unknown;
        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          typeof (parsed as Record<string, unknown>).type !== 'string'
        ) {
          logger.warn('Received message with invalid shape, ignoring');
          return;
        }
        msg = parsed as ClientMessage;
      } catch (err) {
        logger.warn('Failed to parse incoming message:', err);
        return;
      }
      messageHandlers.forEach((handler) => {
        try {
          handler(msg);
        } catch (err) {
          logger.error('Handler error:', err);
        }
      });
    });

    ws.on('close', () => {
      logger.info(`Client disconnected. Total: ${wss?.clients.size ?? 0}`);
    });
  });

  logger.info('Server ready on /ws');
  return wss;
}

/**
 * Broadcast an event to all connected WebSocket clients.
 */
export function broadcast(event: DaemonEvent): void {
  if (!wss) return;
  const data = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/**
 * Register a handler for incoming client messages (permission/question responses).
 */
export function onClientMessage(handler: MessageHandler): () => void {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

export function getConnectedClientCount(): number {
  return wss?.clients.size ?? 0;
}
