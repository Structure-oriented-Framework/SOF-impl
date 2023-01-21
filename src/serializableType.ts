import { Selector } from "./selector.js";

/**
 * In fact, this should be extendable for users.
 * Maybe, by declaring module like Pinia
 */
export type SerializableSimpleValue =
  | number
  | string
  | boolean
  | undefined
  | null
  | Selector;

export type SerializableValue =
  | SerializableSimpleValue
  | Array<SerializableSimpleValue>;
export type SerializableIndex = number | string;

type SerializableObject1 = Record<SerializableIndex, SerializableValue>;
type SerializableObject2 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject1
>;
type SerializableObject3 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject2
>;
type SerializableObject4 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject3
>;
type SerializableObject5 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject4
>;
type SerializableObject6 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject5
>;
type SerializableObject7 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject6
>;
type SerializableObject8 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject7
>;
type SerializableObject9 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject8
>;
type SerializableObject10 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject9
>;
type SerializableObject11 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject10
>;
type SerializableObject12 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject11
>;
type SerializableObject13 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject12
>;
type SerializableObject14 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject13
>;
type SerializableObject15 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject14
>;
type SerializableObject16 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject15
>;
type SerializableObject17 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject16
>;
type SerializableObject18 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject17
>;
type SerializableObject19 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject18
>;
type SerializableObject20 = Record<
  SerializableIndex,
  SerializableValue | SerializableObject19
>;

export type SerializableObject = SerializableObject20;

export type Serializable = SerializableValue | SerializableObject;
