import { CallbackPort } from "./callbackPort";
import { MethodPort } from "./methodPort";
import { Data } from "./port";
import { PropPort, ReadonlyPropPort } from "./propPort";

export type ElementEventHandlerPorts = {
  [K in keyof GlobalEventHandlers]: CallbackPort<
    Extract<GlobalEventHandlers[K], (...args: any[]) => Promise<Data | void>>
  >;
};

// See https://juejin.cn/post/6895538129227546638#heading-18
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? A
  : B;

type ReadonlyPropKeys<T> = {
  [P in keyof T]-?: T[P] extends Data
    ? IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>
    : never;
}[keyof T];

type NonReadonlyPropKeys<T> = {
  [P in keyof T]-?: T[P] extends Data
    ? IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
    : never;
}[keyof T];

type MethodKeys<T> = {
  [P in keyof T]: T[P] extends (...args: Data[]) => Data | void ? P : never;
}[keyof T];

export type ElementPorts<Element extends HTMLElement> = {
  [K in ReadonlyPropKeys<Element>]: Element[K] extends Data
    ? ReadonlyPropPort<K, Element[K]>
    : never;
} & {
  [K in NonReadonlyPropKeys<Element>]: Element[K] extends Data
    ? PropPort<K, Element[K]>
    : never;
} & {
  [K in MethodKeys<Element>]: Element[K] extends (
    ...args: Data[]
  ) => Data | void
    ? MethodPort<K, Element[K]>
    : never;
} & ElementEventHandlerPorts;

type ButtonPorts = ElementPorts<HTMLButtonElement>;
