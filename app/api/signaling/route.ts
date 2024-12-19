import { WebSocketServer } from 'ws';
import { NextRequest } from 'next/server';
import type { Server } from 'http';

let wss: WebSocketServer | null = null;

// Type to extend the Next.js request to include the raw HTTP socket
type UpgradeableRequest = NextRequest & {
  raw: {
    socket: {
      server: Server;
    };
  };
};

export async function GET(req: UpgradeableRequest) {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });

    // Handle WebSocket connections
    wss.on('connection', (ws) => {
      console.log('A client connected');

      ws.on('message', (message) => {
        // Broadcast the message to all connected clients except the sender
        wss?.clients.forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(message);
          }
        });
      });

      ws.on('close', () => {
        console.log('A client disconnected');
      });
    });
  }

  // Ensure the request is an upgrade request for WebSocket
  const upgradeHeader = req.headers.get('upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }

  // Handle the WebSocket upgrade
  const { socket } = req.raw;
  wss.handleUpgrade(socket, req.raw, Buffer.alloc(0), (ws) => {
    wss?.emit('connection', ws);
  });

  return new Response(null, { status: 101 });
}
