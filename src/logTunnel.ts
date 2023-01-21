import { Param, Port } from "./port.js";
import { Tunnel } from "./tunnel.js";

export class LogTunnel<
  ParamsA2B extends Param[],
  ParamsB2A extends Param[]
> extends Tunnel<ParamsA2B, ParamsB2A> {
  constructor(name = "unNamed") {
    super();
    this.name = name;
  }
  name;
  listenerA(params: ParamsA2B): boolean {
    console.log(
      "LogTunnel [" + this.name + "]: A2B ",
      params.length < 2 ? params[0] : params
    );
    return this.portB.send(...params);
  }
  listenerB(params: ParamsB2A): boolean {
    console.log(
      "LogTunnel [" + this.name + "]: B2A ",
      params.length < 2 ? params[0] : params
    );
    return this.portA.send(...params);
  }
}
