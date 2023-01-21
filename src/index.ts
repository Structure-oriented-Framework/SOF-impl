import { LogPort } from "./logPort.js";
import { Selector } from "./selector.js";
import { LogTunnel } from "./logTunnel.js";
import { Tunnel } from "./tunnel.js";
import { Extender, ExtenderSelector } from "./extender.js";
import { Param } from "./port.js";

console.log("----TEST Extender----");

type D1 = { a: number };
type D2 = { b: number };
type D3 = { c: number };
type SS = "1" | "2";

const tunnel = new LogTunnel<
  [from: SS, data: D1],
  [to: "1", data: D2] | [to: "2", data: D3]
>("single side tunnel");
tunnel.connectB(new LogPort("B"));
const extender = new Extender<
  SS,
  {
    "1": [data: D2];
    "2": [data: D3];
  },
  {
    "1": [data: D1];
    "2": [data: D1];
  }
>([
  tunnel.portA,
  {
    "1": new LogPort<[data: D1], [data: D2]>("B1"),
    "2": new LogPort<[data: D1], [data: D3]>("B2"),
  },
]);

/*
console.log("----TEST Connection----");

const portA = new LogPort<[string], [string]>("A");
const portB = new LogPort<[string], [string]>("B");

let t = Tunnel.connect(portA, portB, LogTunnel, "Port A<=>B");

portA.send("Hello from portA");
portA.send("Hello from portB");
*/
/*
console.log("----TEST Selector----");

let s1 = Selector("I'm S1");
let s2 = Selector("I'm S2");

console.log("S1", s1);
console.log("S2", s2);
console.log("Equal?", s1 === s2);

let jstr1 = JSON.stringify(s1);
let y = Selector.from(JSON.parse(jstr1));

console.log("Y:", y);
console.log("Eq1:", y === s1);
console.log("Eq2:", y === s2);
*/
