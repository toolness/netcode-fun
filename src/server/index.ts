import WebSocket from 'ws';
import dotenv from 'dotenv';
import { getPositiveIntEnv } from './env';

dotenv.config({path: '.env.local'});

const PORT = getPositiveIntEnv('PORT', '3001');

export function run() {
  const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`WebSocket server listening on port ${PORT}.`);
  });

  wss.on('connection', ws => {
    console.log('connection!');

    ws.send('hallo.');
  });
};
