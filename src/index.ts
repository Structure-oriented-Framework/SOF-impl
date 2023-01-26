import { LogPort } from "./logPort.js";
import { Selector } from "./selector.js";
import { LogTunnel } from "./logTunnel.js";
import { Tunnel } from "./tunnel.js";
import {
  StaticExtender,
  StaticExtenderSelector,
  StaticExtenderSigleSideI,
} from "./staticExtender.js";
import { Param, Port } from "./port.js";
import { MethodCall, MethodCallee, MethodCaller } from "./methodCall.js";
import { PropsExposer, PropsShadow } from "./props.js";
import { WebBridgeServer, WebBridgeClient } from "./webBridge.js";

console.log("----TEST WebBridge----");

const portA = new LogPort<[string], [number]>("A");
const portB = new LogPort<[number], [string]>("B");

Port.connect(portA, new WebBridgeServer(3000).port);
setTimeout(() => {
  Port.connect(portB, new WebBridgeClient("ws://locolhost:3000").port);
}, 1000);

setInterval(async () => {
  await portA.send(12345);
  await portB.send("Hello from portB");
}, 2000);
/*
console.log("----TEST Props----");

const prop = {
  a: 1,
  b: 2,
};

const exposer = new PropsExposer(),
  shadow = new PropsShadow();

const log = (name: string) => {
  console.log(`[${name}]:`);
  console.log("\texposer.props =", exposer.props);
  console.log("\t       .propsVer =", exposer.propsVersion);
  console.log("\tshadow.props =", shadow.props);
  console.log("\t      .propsVer =", shadow.propsVersion);
};

log("0");
Port.connect(exposer.port, shadow.port);
log("1");

exposer.init(prop);
log("2");

exposer.patch("a", 3);
log("3");
*/
/*
console.log("----TEST MethodCall----");

const methods = {
  add: (a: number, b: number) => {
    console.log("fn add called");
    return a + b;
  },
  cat: (a: string, b: string) => {
    console.log("fn cat called");
    return a + " " + b;
  },
};
type Sels = "add" | "cat";
type Methods = {
  add: [[a: number, b: number], number];
  cat: [[a: string, b: string], string];
};

const callee = new MethodCallee<Sels, Methods>(methods);
const caller = new MethodCaller<Sels, Methods>();

MethodCall.connect(callee, caller);

(async () => {
  console.log("1+2=" + (await caller.call("add", 1, 2)));
  console.log('"a"+"b"=' + (await caller.call("cat", "a", "b")));
})();
*/
/*
console.log("----TEST Extender----");

//"A1" <DI1<>DO1> {Sel1}+
//                      +[M]--Extender--[S] <<>> [A]--Tunnel--[B] <[Sel,DI1]<>[Sel,DO1]> "B"
//"A2" <DI2<>DO2> {Sel2}+

type DI1 = { di1: number };
type DO1 = { do1: number };
type DI2 = { di2: number };
type DO2 = { do2: number };

type Sels = "1" | "2";

const pA1 = new LogPort<[data: DI1], [data: DO1]>("A1"),
  pA2 = new LogPort<[data: DI2], [data: DO2]>("A2"),
  pB = new LogPort<
    [from: "1", data: DO1] | [from: "2", data: DO2],
    [to: "1", data: DI1] | [to: "2", data: DI2]
  >("B");

const tunnel = new LogTunnel<
  [from: "1", data: DO1] | [from: "2", data: DO2],
  [to: "1", data: DI1] | [to: "2", data: DI2]
>("tunnel");
tunnel.connectB(pB);

const extender = Extender.connect<
  Sels,
  {
    "1": [data: DI1];
    "2": [data: DI2];
  },
  {
    "1": [data: DO1];
    "2": [data: DO2];
  },
  typeof Extender,
  []
>(
  tunnel.portA,
  {
    "1": pA1,
    "2": pA2,
  },
  Extender
);

pA1.send({ do1: 1 });
console.log("---");
pA2.send({ do2: 2 });
console.log("---");
pB.send("1", { di1: 3 });
*/
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
