// import { Component } from "../component.js";
// import { Port } from "../port.js";
// import { Selector } from "../selector.js";

// //#region `componentClass` Metadata
// export const componentClassMetadataKey = Symbol("componentInfo");

// export interface ComponentPortsMetadata {
//   name: string;
//   desc: string;
//   info: PortInfoMetadata;
// }

// export interface ComponentSubComponentsMetadata {
//   name: string;
//   desc: string;
//   info: ComponentInfoMetadata;
// }

// export interface ComponentConstructorMetadata {
//   selector: Selector;
//   ports: ComponentPortsMetadata[];
//   subComponents: ComponentSubComponentsMetadata[];
//   get value(): Component;
// }

// export function appendComponentPortsMetadata(
//   target: any,
//   newPort: ComponentPortsMetadata
// ) {
//   const oldMetadata: ComponentInfoMetadata | undefined = Reflect.getMetadata(
//     componentInfoMetadataKey,
//     target
//   );
//   Reflect.defineMetadata(
//     componentInfoMetadataKey,
//     {
//       selector: oldMetadata?.selector,
//       ports: [...(oldMetadata?.ports ?? []), newPort],
//       subComponents: oldMetadata?.subComponents ?? [],
//     } as ComponentInfoMetadata,
//     target
//   );
// }

// export function appendComponentSubComponentsMetadata(
//   target: any,
//   newSubComponent: ComponentSubComponentsMetadata
// ) {
//   const oldMetadata: ComponentInfoMetadata | undefined = Reflect.getMetadata(
//     componentInfoMetadataKey,
//     target
//   );
//   Reflect.defineMetadata(
//     componentInfoMetadataKey,
//     {
//       selector: oldMetadata?.selector,
//       ports: oldMetadata?.ports ?? [],
//       subComponents: [...(oldMetadata?.subComponents ?? []), newSubComponent],
//     } as ComponentInfoMetadata,
//     target
//   );
// }

// export function getComponentInfoMetadata(
//   target: any
// ): ComponentPortsMetadata[] {
//   return Reflect.getMetadata(componentInfoMetadataKey, target) ?? [];
// }
// //#endregion

// //#region `portInfo` Metadata
// export const portInfoMetadataKey = Symbol("ports");

// export interface PortInfoMetadata {
//   selector: Selector;
//   owner: Component | null;
//   get value(): Port<any, any>|null;
// }

// export function setPortInfoMetadata(
//   target: Port<any, any>,
//   metadata: PortInfoMetadata
// ) {
//   //@ts-ignore
//   target[portInfoMetadataKey] = metadata;
// }

// export function getPortInfoMetadata(target: any): PortInfoMetadata[] {
//   return Reflect.getMetadata(portInfoMetadataKey, target) ?? [];
// }
// //#endregion
