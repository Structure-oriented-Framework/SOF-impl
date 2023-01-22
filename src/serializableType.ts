import { Selector } from "./selector.js";

/**
 * In fact, this should be extendable for users.
 * Maybe, by declaring module like Pinia
 */
export type SerializableSimpleValue =
  | number
  | bigint
  | string
  | boolean
  | undefined
  | null
  | Selector;

export type SerializableIndex = number | string;

export interface SerializableObject
  extends Record<SerializableIndex, Serializable> {}

export type Serializable =
  | SerializableSimpleValue
  | Array<Serializable>
  | SerializableObject;

export function safeJSONStringify(value: Serializable): string {
  return JSON.stringify(value);
}

export function safeJSONParse(value: string): Serializable {
  return JSON.parse(value);
}
