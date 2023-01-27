// import { Component } from "../component.js";
// import { Port } from "../port.js";
// import { Selector } from "../selector.js";
// import {
//   appendComponentPortsMetadata,
//   setPortInfoMetadata,
//   PortInfoMetadata,
//   appendComponentSubComponentsMetadata,
//   componentInfoMetadataKey,
//   ComponentInfoMetadata,
//   portInfoMetadataKey,
// } from "./metadatas.js";

// // type TypeConstructorAbstractOrNot<T extends Object> =
// //   | (abstract new (...args: any[]) => T)
// //   | (new (...args: any[]) => T);

// //decorator
// export function componentDef() {
//   return function wrapper(
//     constructor: any
//   ) {
//     constructor.prototype[portInfoMetadataKey] = {
//       selector: Selector(),
//       get value() {
//         return null;
//       },
//     } satisfies ComponentInfoMetadata;
//     return constructor;
//   };
// }

// //decorator
// export function portDef(type: string) {
//   return function wrapper<
//     P extends Port<any, any>,
//     T extends { new (...args: any[]): P }
//   >(constructor: T) {
//     constructor.prototype[portInfoMetadataKey] = {
//       selector: Selector(),
//       owner: null,
//       get value() {
//         return null;
//       },
//     } satisfies PortInfoMetadata;
//     return constructor;
//   };
// }

// //decorator
// export function port(desc: string) {
//   return function wrapper<K extends string>(
//     component: {
//       [key in K]: Port<any, any>;
//     },
//     propertyKey: K
//   ) {
//     const portValue = component[propertyKey];
//     const info: PortInfoMetadata = {
//       selector: Selector(),
//       owner: null,
//       get value() {
//         return component[propertyKey];
//       },
//     };
//     setPortInfoMetadata(portValue, info);
//     appendComponentPortsMetadata(component, {
//       name: propertyKey,
//       desc,
//       info,
//     });
//   };
// }

// //decorator
// export function subComponent(desc: string) {
//   return function wrapper<K extends string>(
//     component: {
//       [key in K]: Component;
//     },
//     propertyKey: K
//   ) {
//     appendComponentSubComponentsMetadata(component, {
//       name: propertyKey,
//       desc,
//       info: component[propertyKey],
//     });
//   };
// }

// // //decorator
// // export function exposedPort(desc: string) {
// //   return function wrapper<K extends string>(
// //     component: {
// //       [key in K]: Port<any, any>;
// //     },
// //     propertyKey: K
// //   ) {
// //     const portValue = component[propertyKey];
// //     const info: PortInfoMetadata = {
// //       selector: Selector(),
// //       owner: null,
// //       get value() {
// //         return component[propertyKey];
// //       },
// //     };
// //   };
// // }
