import { safeParseJson, isStringProp, isNumberProp, getJsonProp } from "./json-validation";
import { Jsonable } from "./util";

export type JoinRoomMessage = {
  type: 'join-room',
  room: string,
  playerIndex: number,
};

export type Message = JoinRoomMessage;

export class InvalidMessageError extends Error {
}

function checkMsgType(obj: Jsonable, type: Message['type']): boolean {
  return getJsonProp(obj, 'type') === type;
}

function isJoinRoomMessage(obj: Jsonable): obj is JoinRoomMessage {
  return (
    checkMsgType(obj, 'join-room') &&
    isStringProp(obj, 'room') &&
    isNumberProp(obj, 'playerIndex')
  );
}

export function parseMessage(data: unknown): Message {
  if (typeof(data) !== 'string') {
    throw new InvalidMessageError(`Expected string message but got ${typeof(data)}`);
  }

  const msg = safeParseJson(data);

  if (msg === undefined) {
    throw new InvalidMessageError(`Message is not JSON: ${data}`);
  }

  if (isJoinRoomMessage(msg)) return msg;

  throw new InvalidMessageError(`Got invalid message: ${data}`);
}

export function serializeMessage(message: Message): string {
  return JSON.stringify(message);
}
