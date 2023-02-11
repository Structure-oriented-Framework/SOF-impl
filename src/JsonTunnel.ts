import { Data, PortToConnect } from "./port.js";
import {
  JsonString,
  safeJsonParse,
  safeJsonStringify,
} from "./serializableType.js";
import { Tunnel, TunnelPort } from "./tunnel.js";

export type JsonStringParams<Params extends Data[]> = [
  jsonStr: JsonString<Params>
];

export class JsonTunnel<
  TInn extends Data[],
  TOutut extends Data[]
> extends Tunnel<
  TInn,
  TOutut,
  JsonStringParams<TOutut>,
  JsonStringParams<TInn>
> {
  protected async listenerA(...params: TInn): Promise<boolean> {
    return await this.portB.send(safeJsonStringify(params));
  }

  protected async listenerB(jsonStr: JsonString<TOutut>): Promise<boolean> {
    return await this.portA.send(...safeJsonParse(jsonStr));
  }

  static connect<TInn extends Data[], TOutut extends Data[]>(
    toRawSide: PortToConnect<TunnelPort<TInn, TOutut>>,
    toJsonSide: PortToConnect<
      TunnelPort<JsonStringParams<TOutut>, JsonStringParams<TInn>>
    >
  ) {
    const t = new JsonTunnel();
    t.connectAB(toRawSide, toJsonSide);
    return t;
  }
}
