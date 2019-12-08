import { Jsonable } from "./util";

export function safeParseJson(content: string): Jsonable|undefined {
  try {
    return JSON.parse(content);
  } catch (e) {
    return undefined;
  }
}

function getJsonProp(obj: Jsonable, prop: string): Jsonable|undefined {
  if (obj === undefined || obj === null) return undefined;
  const desc = Object.getOwnPropertyDescriptor(obj, prop);
  if (!desc) return undefined;
  return desc.value;
}

export function isStringProp(obj: Jsonable, prop: string): boolean {
  return typeof(getJsonProp(obj, prop)) === 'string';
}

export function isNumberProp(obj: Jsonable, prop: string): boolean {
  return typeof(getJsonProp(obj, prop)) === 'number';
}
