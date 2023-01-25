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
  async listenerA(...params: ParamsA2B): Promise<boolean> {
    console.log(
      "LogTunnel [" + this.name + "]: A2B ",
      params.length < 2 ? params[0] : params
    );
    return await this.portB.send(...params);
  }
  async listenerB(...params: ParamsB2A): Promise<boolean> {
    console.log(
      "LogTunnel [" + this.name + "]: B2A ",
      params.length < 2 ? params[0] : params
    );
    return await this.portA.send(...params);
  }
}
