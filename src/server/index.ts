import WebSocket from 'ws';
import dotenv from 'dotenv';
import { getPositiveIntEnv } from './env';
import { SimRunner } from '../Sim';
import { SIMPLE_SIM_SETUP } from '../simple-sim-setup';
import { InvalidMessageError, parseMessage } from '../messaging';

dotenv.config({path: '.env.local'});

const PORT = getPositiveIntEnv('PORT', '3001');

class Room {
  simRunner: SimRunner;
  players: {[playerIndex: number]: WebSocket} = {};

  constructor() {
    this.simRunner = new SimRunner(SIMPLE_SIM_SETUP);
  }
}

class Lobby {
  rooms: Map<string, Room> = new Map();
}

class Client {
  room: Room|null = null;

  constructor(readonly ws: WebSocket, readonly lobby: Lobby) {
    ws.on('message', data => {
      try {
        this.handleMessage(data);
      } catch (e) {
        if (e instanceof InvalidMessageError) {
          console.log(e.message);
        } else {
          console.error(e);
        }
      }
    });
  }

  handleMessage(data: WebSocket.Data) {
    const msg = parseMessage(data);

    switch (msg.type) {
      case 'join-room':
      if (this.room === null) {
        console.log("TODO JOIN ROOM", msg);
      }
      break;

      default:
      console.log("TODO process message type", msg.type);
      break;
    }
  }
}

export function run() {
  const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`WebSocket server listening on port ${PORT}.`);
  });

  const lobby = new Lobby();

  wss.on('connection', ws => {
    console.log("CONNECT");

    new Client(ws, lobby);

    ws.on('close', () => {
      console.log("DISCONNECT");
    });
  });
};
