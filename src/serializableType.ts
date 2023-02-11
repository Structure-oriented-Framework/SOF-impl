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

export type ToSerializable<T> = T extends object
  ? {
      [K in Extract<keyof T, SerializableIndex>]: ToSerializable<T[K]>;
    }
  : [T] extends [Serializable]
  ? T
  : undefined | Extract<T, Serializable>;

export type ToSerializableValues<T extends any[]> = T extends [
  infer T0,
  ...infer Ts
]
  ? [ToSerializable<T0>, ...ToSerializableValues<Ts>]
  : T;

export function toSerializable<T>(v: T): ToSerializable<T> {
  return v as ToSerializable<T>; // Do nothing since unserializable props in `v` will be ignored.
}

export function toSerializableValues<T extends any[]>(
  v: T
): ToSerializableValues<T> {
  return v as ToSerializableValues<T>; // Do nothing since unserializable props in `v` will be ignored.
}

export const JsonStringTypeSym = Symbol();

export type JsonString<T extends Serializable> = string & {
  /**
   * This is always `undefined` in runtime!
   * It is only a trick to make TypeScript happy.
   * Every assignment to it uses `as` operator.
   */
  [JsonStringTypeSym]: T;
};

export function safeJsonStringify<T extends Serializable>(
  value: T
): JsonString<T> {
  let str = JSON.stringify(value);
  return str as JsonString<T>;
}

export function safeJsonParse<T extends Serializable>(value: JsonString<T>): T {
  return JSON.parse(value);
}

export type StringifiedSerializableValues<T extends Serializable[]> =
  T extends [infer T0, ...infer Ts]
    ? T0 extends Serializable
      ? Ts extends Serializable[]
        ? [JsonString<T0>, ...StringifiedSerializableValues<Ts>]
        : never
      : never
    : T;
