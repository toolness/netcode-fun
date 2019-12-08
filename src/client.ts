import { JoinRoomMsg } from "./server";

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

export function connectToServer() {
  const ws = new WebSocket(getServerURL());

  ws.onopen = ev => {
    console.log("OPEN!");
    const msg: JoinRoomMsg = {playerIndex: 0, room: 'boop'};
    ws.send(JSON.stringify(msg));
  };

  ws.onmessage = ev => {
    console.log("MESSAGE", ev.data);
  };

  ws.onclose = ev => {
    console.log("CLOSE");
  };
}
