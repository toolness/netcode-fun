import { performance } from 'perf_hooks';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { getPositiveIntEnv } from './env';
import { SimRunner, SimCommand } from '../Sim';
import { SIMPLE_SIM_SETUP } from '../simple-sim-setup';
import { InvalidMessageError, parseMessage, serializeMessage, Message } from '../messaging';
import { FPSTimer } from '../fps-timer';

dotenv.config({path: '.env.local'});

const PORT = getPositiveIntEnv('PORT', '3001');
const FPS = 60;
const INPUT_TICK_DELAY = 3;

class Room {
  simRunner: SimRunner;
  timeOrigin: number = performance.now();
  players: {[playerIndex: number]: Client} = {};
  fpsTimer: FPSTimer;

  constructor(readonly name: string, readonly lobby: Lobby) {
    this.simRunner = new SimRunner(SIMPLE_SIM_SETUP, {
      inputTickDelay: INPUT_TICK_DELAY
    });
    this.fpsTimer = new FPSTimer(
      FPS,
      this.handleTick.bind(this),
      () => performance.now(),
      this.timeOrigin
    );
  }

  handleTick() {
    try {
      this.simRunner.tick();
    } catch (e) {
      console.error(e);
      console.log(`Sim error occurred in room "${this.name}", shutting it down.`);
      this.shutdown();
    }
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

  private playerIndexForClient(client: Client): number|null {
    for (let playerIndex in this.players) {
      if (this.players[playerIndex] === client) {
        return parseInt(playerIndex);
      }
    }
    return null;
  }

  leave(client: Client) {
    const index = this.playerIndexForClient(client);
    if (index !== null) {
      delete this.players[index];
      client.handleLeaveRoom();
    } else {
      console.log('Player index for client not found!');
    }
  }

  handleSimCommand(command: SimCommand, fromClient: Client) {
    this.simRunner.queuedCommands.push(command);
    Object.values(this.players).forEach(c => {
      if (c !== fromClient) {
        c.sendMessage({type: 'sim-command', command});
      }
    });
  }

  shutdown() {
    this.fpsTimer.stop();
    this.lobby.rooms.delete(this.name);
    Object.values(this.players).forEach(client => {
      this.leave(client);
    });
  }
}

class Lobby {
  readonly rooms: Map<string, Room> = new Map();

  getRoom(name: string) {
    let room = this.rooms.get(name);
    if (!room) {
      room = new Room(name, this);
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

  handleLeaveRoom() {
    this.room = null;
    this.sendMessage({type: 'room-left'});
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

      case 'sim-command':
      if (this.room) {
        this.room.handleSimCommand(msg.command, this);
      }
      break;

      case 'ping':
      this.sendMessage({type: 'pong', now: performance.now()});
      break;

      default:
      console.log(`Don't know what to do with message type "${msg.type}"!`);
      break;
    }
  }

  shutdown() {
    if (this.room) {
      this.room.leave(this);
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

    const client = new Client(ws, lobby);

    ws.on('close', () => {
      console.log("DISCONNECT");
      client.shutdown();
    });
  });
};
