import { Param, PortToConnect } from "./port.js";
import {
  JsonString,
  safeJsonParse,
  safeJsonStringify,
} from "./serializableType.js";
import { Tunnel, TunnelPort } from "./tunnel.js";

export type JsonStringParams<Params extends Param[]> = [
  jsonStr: JsonString<Params>
];

export class JsonTunnel<
  ParamsIn extends Param[],
  ParamsOut extends Param[]
> extends Tunnel<
  ParamsIn,
  ParamsOut,
  JsonStringParams<ParamsOut>,
  JsonStringParams<ParamsIn>
> {
  protected async listenerA(...params: ParamsIn): Promise<boolean> {
    return await this.portB.send(safeJsonStringify(params));
  }

  protected async listenerB(jsonStr: JsonString<ParamsOut>): Promise<boolean> {
    return await this.portA.send(...safeJsonParse(jsonStr));
  }

  static connect<ParamsIn extends Param[], ParamsOut extends Param[]>(
    toRawSide: PortToConnect<TunnelPort<ParamsIn, ParamsOut>>,
    toJsonSide: PortToConnect<
      TunnelPort<JsonStringParams<ParamsOut>, JsonStringParams<ParamsIn>>
    >
  ) {
    const t = new JsonTunnel();
    t.connectAB(toRawSide, toJsonSide);
    return t;
  }
}
