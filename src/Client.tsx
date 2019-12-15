import React, { useState, useRef, useCallback } from 'react';
import { Message, serializeMessage, parseMessage } from './messaging';
import { useEffect } from 'react';
import { ServerTimeSynchronizer } from './time-sync';
import { SimRunner, Sim } from './Sim';
import { FPSTimer } from './fps-timer';
import { SimViz } from './SimViz';
import "./Client.css";
import { Vec2 } from './Vec2';
import { Vec2Input } from './Vec2Input';

const PING_INTERVAL_MS = 1000;

function getServerURL(): string {
  const url = process.env.REACT_APP_SERVER_URL;
  if (url) {
    return url;
  }
  const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
  const port = parseInt(window.location.port) + 1;
  if (isNaN(port)) {
    throw new Error('Please define the environment variable REACT_APP_SERVER_URL!');
  }
  return `${protocol}//${window.location.hostname}:${port}/`;
}

const NUM_TIME_SYNC_PINGS = 3;

enum ClientState {
  syncingTime,
  initialized
}

class BrowserClient {
  private readonly ws: WebSocket;
  private pingTimeout: number|null = null;
  private pingStart: number = 0;
  private roundTripTime: number|null = null;
  private state = ClientState.syncingTime;
  private timeSync = new ServerTimeSynchronizer();
  private simRunner: SimRunner|null = null;
  private fpsTimer: FPSTimer|null = null;
  onSim?: (sim: Sim) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onPing?: (ms: number) => void;

  constructor(readonly room: string, readonly playerIndex: number, readonly url = getServerURL()) {
    this.ws = new WebSocket(url);
    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
  }

  private get isConnected(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }

  private ping = () => {
    this.pingStart = performance.now();
    this.sendMessage({type: 'ping'});
  };

  private handleOpen = () => {
    this.ping();
    this.onOpen && this.onOpen();
  };

  private sendMessage(msg: Message) {
    this.ws.send(serializeMessage(msg));
  }

  private handleTick() {
    if (this.simRunner) {
      this.simRunner.tick();
      if (this.onSim) {
        this.onSim(this.simRunner.currentState);
      }
    }
  }

  movePlayer(v: Vec2) {
    if (this.simRunner) {
      const command = this.simRunner.setPlayerVelocity(this.playerIndex, v);
      this.sendMessage({type: 'sim-command', command});
    }
  }

  private handleMessage = (ev: MessageEvent) => {
    const msg: Message = parseMessage(ev.data);

    switch (msg.type) {
      case 'pong':
      this.roundTripTime = performance.now() - this.pingStart;
      if (this.state === ClientState.syncingTime) {
        this.timeSync.update(this.roundTripTime, msg.now);
        this.ping();
        if (this.timeSync.updates >= NUM_TIME_SYNC_PINGS) {
          this.state = ClientState.initialized;
          this.sendMessage({
            type: 'join-room',
            room: this.room,
            playerIndex: this.playerIndex
          });
        }
      } else if (this.onPing) {
        this.onPing(this.roundTripTime);
        this.pingTimeout = window.setTimeout(this.ping, PING_INTERVAL_MS);
      }
      return;

      case 'room-joined':
      this.simRunner = SimRunner.deserialize(msg.simRunner);
      this.fpsTimer = new FPSTimer(
        msg.fps,
        this.handleTick.bind(this),
        () => performance.now(),
        this.timeSync.fromServerTime(msg.timeOrigin),
      );
      if (this.onSim) {
        this.onSim(this.simRunner.currentState);
      }
      return;

      case 'sim-command':
      if (this.simRunner) {
        this.simRunner.queuedCommands.push(msg.command);
      } else {
        console.log(`Received sim command but no sim runner is set!`);
      }
      return;

      default:
      console.log(`Don't know what to do with message type "${msg.type}"`);
      return;
    }
  };

  private handleClose = () => {
    this.shutdown();
    this.onClose && this.onClose();
  };

  shutdown() {
    if (this.pingTimeout !== null) {
      window.clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
    this.fpsTimer?.stop();
    this.fpsTimer = null;
    this.onOpen = undefined;
    this.onClose = undefined;
    this.onPing = undefined;
    this.ws.close();
  }
}

export const Client: React.FC<{
  room: string,
  playerIndex: number
}> = props => {
  const [connState, setConnState] = useState('connecting');
  const [ping, setPing] = useState<number|null>(null);
  const [sim, setSim] = useState<Sim|null>(null);
  const activeClient = useRef<BrowserClient|null>(null);

  useEffect(() => {
    const client = new BrowserClient(props.room, props.playerIndex);
    client.onOpen = () => setConnState('connected');
    client.onClose = () => {
      setConnState('disconnected');
      setSim(null);
    };
    client.onPing = ms => setPing(ms);
    client.onSim = setSim;
    activeClient.current = client;

    return () => client.shutdown();
  }, [props.room, props.playerIndex]);

  const movePlayer = useCallback((v: Vec2) => {
    if (activeClient.current) {
      activeClient.current.movePlayer(v);
    }
  }, []);

  return <div className="Sim">
    <p>Connection state: {connState}</p>
    {sim && <>
      <SimViz sim={sim} />
      <Vec2Input up="w" down="s" left="a" right="d" onChange={movePlayer} />
    </>}
    {ping !== null && <p>Ping: {ping.toFixed(0)} ms</p>}
  </div>;
};
