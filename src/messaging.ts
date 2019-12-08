import { safeParseJson, isStringProp, isNumberProp, getJsonProp } from "./json-validation";
import { Jsonable } from "./util";

export type Message =
  | { type: 'join-room', room: string, playerIndex: number }
  | { type: 'ping'|'pong' };

type MessageValidatorMap = {
  [K in Message["type"]]: (obj: Jsonable) => boolean
};

const alwaysValid = () => true;

const MESSAGE_VALIDATORS: MessageValidatorMap = {
  'join-room': obj => isStringProp(obj, 'room') && isNumberProp(obj, 'playerIndex'),
  'ping': alwaysValid,
  'pong': alwaysValid,
};

function isValidMessageType(type: string): type is Message["type"] {
  return type in MESSAGE_VALIDATORS;
}

function isValidMessage(obj: Jsonable, type: Message["type"]): obj is Message {
  return MESSAGE_VALIDATORS[type](obj);
}

export class InvalidMessageError extends Error {
}

export function parseMessage(data: unknown): Message {
  if (typeof(data) !== 'string') {
    throw new InvalidMessageError(`Expected string message but got ${typeof(data)}`);
  }

  const msg = safeParseJson(data);

  if (msg === undefined) {
    throw new InvalidMessageError(`Message is not JSON: ${data}`);
  }

  const type = getJsonProp(msg, 'type');

  if (typeof(type) !== 'string' || !isValidMessageType(type)) {
    throw new InvalidMessageError(`Invalid message type: ${data}`);
  }

  if (!isValidMessage(msg, type)) {
    throw new InvalidMessageError(`Message of type "${type}" is invalid`);
  }

  return msg;
}

export function serializeMessage(message: Message): string {
  return JSON.stringify(message);
}
