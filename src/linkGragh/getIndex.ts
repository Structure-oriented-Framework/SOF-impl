// // import {
// //   ComponentInfoMetadata,
// //   PortInfoMetadata,
// // } from "../decorator";
import { Component } from "../component.js";
import { Port } from "../port.js";
import { Selector } from "../selector.js";

export interface LinkTreePortClass {
  name: string;
  type: string;
  instances: Set<Selector>;
}
export interface LinkTreePortInstance {
  ref: Port<any, any>;
  owner: Selector | null;
  clazz: Selector;
  linkedTo: Selector | null;
}
export interface LinkTreeComponentClass {
  name: string;
  instances: Set<Selector>;
}
export interface LinkTreeComponentInstance {
  ref: Component;
  owner: Selector | null;
  clazz: Selector;
  ports: {
    keyName: string;
    desc: string;
    instance: Selector;
  }[];
  subComponents: {
    keyName: string;
    desc: string;
    instance: Selector;
  }[];
}

export type PortClassIndex = Map<Selector, LinkTreePortClass>;
export type PortInstanceIndex = Map<Selector, LinkTreePortInstance>;
export type ComponentClassIndex = Map<Selector, LinkTreeComponentClass>;
export type ComponentInstanceIndex = Map<Selector, LinkTreeComponentInstance>;

const getIndexMarkSymbol = Symbol("getIndexMark");
interface GetIndexMark {
  selector: Selector;
  isOwnerRegistered: boolean | null; // null for classes
}
function indexMarkExists<T extends object>(
  obj: T
): obj is T & { [getIndexMarkSymbol]: GetIndexMark } {
  return Object.hasOwn(obj, getIndexMarkSymbol);
}
function setIndexMark(obj: object, mark: GetIndexMark) {
  Object.defineProperty(obj, getIndexMarkSymbol, {
    value: mark,
    enumerable: false,
    configurable: false,
    writable: true,
  });
}

export class LinkGraghIndex {
  componentClasss: ComponentClassIndex = new Map();
  componentInstances: ComponentInstanceIndex = new Map();
  portClasss: PortClassIndex = new Map();
  portInstances: PortInstanceIndex = new Map();
}

export function indexLinkTreeComponentClass(
  index: LinkGraghIndex,
  component: Component
): Selector {
  const ctor: new () => {} = Object.getPrototypeOf(component).constructor;
  if (!indexMarkExists(ctor)) {
    const selector = Selector();
    setIndexMark(ctor, {
      selector,
      isOwnerRegistered: null,
    });
    const result: LinkTreeComponentClass = {
      name: ctor.name,
      instances: new Set(),
    };
    index.componentClasss.set(selector, result);
    return selector;
  } else {
    return ctor[getIndexMarkSymbol].selector;
  }
}
export function indexLinkTreeComponentInstance(
  index: LinkGraghIndex,
  component: Component,
  owner: Selector | null = null
): Selector {
  if (!indexMarkExists(component)) {
    const selector = Selector();
    setIndexMark(component, {
      selector,
      isOwnerRegistered: false,
    });
    const clazzSel = indexLinkTreeComponentClass(index, component);
    const result: LinkTreeComponentInstance = {
      ref: component,
      owner,
      clazz: clazzSel,
      ports: [],
      subComponents: [],
    };
    const clazzIdxVal = index.componentClasss.get(clazzSel);
    if (!clazzIdxVal) throw new Error("Index not found at " + clazzSel);
    clazzIdxVal.instances.add(selector);
    for (const [k, v] of Object.entries(component)) {
      if (v instanceof Port) {
        result.ports.push({
          keyName: k,
          desc: "UNKNOWN",
          instance: indexLinkTreePortInstance(index, v, selector),
        });
      } else if (typeof v === "object" && v !== null) {
        result.subComponents.push({
          keyName: k,
          desc: "UNKNOWN",
          instance: indexLinkTreeComponentInstance(index, v),
        });
      }
    }
    index.componentInstances.set(selector, result);
    return selector;
  } else {
    return component[getIndexMarkSymbol].selector;
  }
}
export function indexLinkTreePortClass(
  index: LinkGraghIndex,
  port: Port<any, any>
): Selector {
  const ctor: new () => {} = Object.getPrototypeOf(port).constructor;
  if (!indexMarkExists(ctor)) {
    const selector = Selector();
    setIndexMark(ctor, {
      selector,
      isOwnerRegistered: null,
    });
    const result: LinkTreePortClass = {
      name: ctor.name,
      type: "UNKNOWN TYPE",
      instances: new Set(),
    };
    index.portClasss.set(selector, result);
    return selector;
  } else {
    return ctor[getIndexMarkSymbol].selector;
  }
}
export function indexLinkTreePortInstance(
  index: LinkGraghIndex,
  port: Port<any, any>,
  owner: Selector | null = null
): Selector {
  if (!indexMarkExists(port)) {
    const selector = Selector();
    setIndexMark(port, {
      selector,
      isOwnerRegistered: false,
    });
    const clazzSel = indexLinkTreePortClass(index, port);
    const result: LinkTreePortInstance = {
      ref: port,
      owner,
      clazz: clazzSel,
      linkedTo: port.linkedTo
        ? indexLinkTreePortInstance(index, port.linkedTo)
        : null,
    };
    const clazzIdxVal = index.portClasss.get(clazzSel);
    if (!clazzIdxVal) throw new Error("Index not found at " + clazzSel);
    clazzIdxVal.instances.add(selector);
    index.portInstances.set(selector, result);
    return selector;
  } else {
    if (port[getIndexMarkSymbol].isOwnerRegistered === false) {
      const idxVal = index.portInstances.get(port[getIndexMarkSymbol].selector);
      if (idxVal) {
        // throw new Error(
        //   "Index not found at " +
        //     port[getIndexMarkSymbol].selector
        // );
        idxVal.owner = owner;
        port[getIndexMarkSymbol].isOwnerRegistered = owner!==null;
      }
    }
    return port[getIndexMarkSymbol].selector;
  }
}

// export const getComponentPortsSymbol = Symbol("getPorts");

// export const getComponentSubComponentsSymbol = Symbol("getSubComponents");

// export function component<T extends { new (...args: any[]): {} }>(
//   constructor: T
// ) {
//   return class extends constructor {
//     [getComponentPortsSymbol] = () => {
//       return getComponentPortsMetadata(this);
//     };
//     [getComponentSubComponentsSymbol] = () => {
//       return getComponentSubComponentsMetadata(this);
//     };
//   };
// }

// export function forceChangeToDecoratedComponent<T extends Component>(v: T) {
//   return v as T & {
//     [getComponentPortsSymbol]: () => ComponentPortsMetadataValue[];
//     [getComponentSubComponentsSymbol]: () => ComponentSubComponentsMetadataValue[];
//   };
// }
