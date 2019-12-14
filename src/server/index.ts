import { performance } from 'perf_hooks';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { getPositiveIntEnv } from './env';
import { SimRunner } from '../Sim';
import { SIMPLE_SIM_SETUP } from '../simple-sim-setup';
import { InvalidMessageError, parseMessage, serializeMessage, Message } from '../messaging';
import { FPSTimer } from '../fps-timer';

dotenv.config({path: '.env.local'});

const PORT = getPositiveIntEnv('PORT', '3001');
const FPS = 1;

class Room {
  simRunner: SimRunner;
  timeOrigin: number = performance.now();
  players: {[playerIndex: number]: Client} = {};
  fpsTimer: FPSTimer;

  constructor() {
    this.simRunner = new SimRunner(SIMPLE_SIM_SETUP);
    this.fpsTimer = new FPSTimer(
      FPS,
      this.handleTick.bind(this),
      () => performance.now(),
      this.timeOrigin
    );
  }

  handleTick() {
    this.simRunner.tick();
    console.log("TICK", this.simRunner.currentState.time);
  }

  join(playerIndex: number, client: Client) {
    // TODO: What if the player index is already taken?
    this.players[playerIndex] = client;
    client.sendMessage({
      type: 'room-joined',
      timeOrigin: this.timeOrigin,
      fps: this.fpsTimer.fps,
      simRunner: this.simRunner.serialize()
    });
  }

  shutdown() {
    this.fpsTimer.stop();
  }
}

class Lobby {
  rooms: Map<string, Room> = new Map();

  getRoom(name: string) {
    let room = this.rooms.get(name);
    if (!room) {
      room = new Room();
      this.rooms.set(name, room);
    }
    return room;
  }
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

  sendMessage(msg: Message) {
    this.ws.send(serializeMessage(msg));
  }

  handleMessage(data: WebSocket.Data) {
    const msg = parseMessage(data);

    switch (msg.type) {
      case 'join-room':
      if (this.room) {
        throw new InvalidMessageError('Client is already in a room!');
      }
      const room = this.lobby.getRoom(msg.room);
      room.join(msg.playerIndex, this);
      this.room = room;
      break;

      case 'ping':
      this.sendMessage({type: 'pong', now: performance.now()});
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
