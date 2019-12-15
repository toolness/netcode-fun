import { safeParseJson, isStringProp, isNumberProp, getJsonProp, isObjectProp } from "./json-validation";
import { Jsonable } from "./util";
import { SerializedSimRunner, SimCommand } from "./Sim";

export type Message =
  | { type: 'join-room', room: string, playerIndex: number }
  | { type: 'room-joined', timeOrigin: number, fps: number, simRunner: SerializedSimRunner }
  | { type: 'sim-command', command: SimCommand }
  | { type: 'ping' }
  | { type: 'pong', now: number };

type MessageValidatorMap = {
  [K in Message["type"]]: (obj: Jsonable) => boolean
};

const alwaysValid = () => true;

const MESSAGE_VALIDATORS: MessageValidatorMap = {
  'join-room': obj => isStringProp(obj, 'room') && isNumberProp(obj, 'playerIndex'),
  'ping': alwaysValid,
  'pong': obj => isNumberProp(obj, 'now'),
  'room-joined': obj => isNumberProp(obj, 'timeOrigin') && isObjectProp(obj, 'simRunner'),
  'sim-command': obj => isObjectProp(obj, 'command'),
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
