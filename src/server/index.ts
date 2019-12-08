import WebSocket from 'ws';
import dotenv from 'dotenv';
import { getPositiveIntEnv } from './env';
import { SimRunner } from '../Sim';
import { SIMPLE_SIM_SETUP } from '../simple-sim-setup';
import { safeParseJson, isNumberProp, isStringProp } from '../json-validation';
import { Jsonable } from '../util';

dotenv.config({path: '.env.local'});

export type JoinRoomMsg = {
  room: string,
  playerIndex: number,
};

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

class InvalidMessageError extends Error {
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
    if (typeof(data) !== 'string') {
      throw new InvalidMessageError(`Expected string message but got ${typeof(data)}`);
    }

    const msg = safeParseJson(data);

    if (msg === undefined) {
      throw new InvalidMessageError(`Message is not JSON: ${data}`);
    }

    if (this.room === null) {
      if (isJoinRoomMsg(msg)) {
        console.log("TODO JOIN ROOM", msg);
        return;
      }
    }

    throw new InvalidMessageError(`Got invalid message: ${data}`);
  }
}

function isJoinRoomMsg(obj: Jsonable): obj is JoinRoomMsg {
  return (isStringProp(obj, 'room') && isNumberProp(obj, 'playerIndex'));
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
