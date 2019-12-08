import React, { useState } from 'react';
import { Message, serializeMessage, parseMessage } from './messaging';
import { useEffect } from 'react';

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

class BrowserClient {
  private readonly ws: WebSocket;
  private pingTimeout: number|null = null;
  private pingStart: number = 0;
  private roundTripTime: number|null = null;
  onOpen?: () => void;
  onClose?: () => void;
  onPing?: (ms: number) => void;

  constructor(readonly url = getServerURL()) {
    this.ws = new WebSocket(url);
    this.ws.onopen = this.handleOpen;
    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
  }

  private get isConnected(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }

  private ping = () => {
    this.pingStart = Date.now();
    this.ws.send(serializeMessage({type: 'ping'}));
  };

  private handleOpen = () => {
    this.ping();
    this.onOpen && this.onOpen();
  };

  private handleMessage = (ev: MessageEvent) => {
    const msg: Message = parseMessage(ev.data);

    switch (msg.type) {
      case 'pong':
      this.roundTripTime = Date.now() - this.pingStart;
      if (this.onPing) {
        this.onPing(this.roundTripTime);
        this.pingTimeout = window.setTimeout(this.ping, PING_INTERVAL_MS);
      }
      return;

      default:
      console.log(`Don't know what to do with message type "${msg.type}"`);
      return;
    }
  };

  private handleClose = () => {
    this.onClose && this.onClose();
  };

  shutdown() {
    if (this.pingTimeout !== null) {
      window.clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }
}

export const Client: React.FC<{
  room: string,
  playerIndex: number
}> = props => {
  const [connState, setConnState] = useState('connecting');
  const [ping, setPing] = useState<number|null>(null);

  useEffect(() => {
    const client = new BrowserClient();
    client.onOpen = () => setConnState('connected');
    client.onClose = () => setConnState('disconnected');
    client.onPing = ms => setPing(ms);
  }, []);

  return <div>
    <p>Connection state: {connState}</p>
    {ping && <p>Ping: {ping} ms</p>}
    <p><strong>TODO</strong> connect to room {props.room} as player index {props.playerIndex}</p>
  </div>;
};
