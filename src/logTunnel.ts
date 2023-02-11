import { Data, Port, PortToConnect } from "./port.js";
import { Tunnel, TunnelPort } from "./tunnel.js";

export class LogTunnel<
  ParamsA2B extends Data[],
  ParamsB2A extends Data[]
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

  static connect<ParamsA2B extends Data[], ParamsB2A extends Data[]>(
    a: PortToConnect<TunnelPort<ParamsA2B, ParamsB2A>>,
    b: PortToConnect<TunnelPort<ParamsB2A, ParamsA2B>>,
    name: string = "unNamed"
  ) {
    const t = new LogTunnel(name);
    t.connectAB(a, b);
    return t;
  }
}
