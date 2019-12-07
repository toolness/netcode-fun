import WebSocket from 'ws';
import dotenv from 'dotenv';
import twilio from 'twilio';
import { getPositiveIntEnv, getRequiredEnv } from './env';

dotenv.config({path: '.env.local'});

const PORT = getPositiveIntEnv('PORT', '3001');
const TWILIO_ACCOUNT_SID = getRequiredEnv('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = getRequiredEnv('TWILIO_AUTH_TOKEN');

export function run() {
  const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`WebSocket server listening on port ${PORT}.`);
  });
  const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  wss.on('connection', ws => {
    console.log('connection!');

    ws.send('hallo.');
  });
};
