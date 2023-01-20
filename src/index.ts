import { LogPort } from "./logPort.js";
import { Tunnel } from "./tunnel.js";

console.log("Start");

const portA = new LogPort<[string], [string]>("A");
const portB = new LogPort<[string], [string]>("B");

let tunnel = new Tunnel<[string], [string]>([portA, portB]);

portA.send("Hello from portA");
portA.send("Hello from portB");
