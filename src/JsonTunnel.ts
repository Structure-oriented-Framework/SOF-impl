import { Param } from "./port.js";
import {
  StringifiedSerializableValues,
  safeJSONParse,
  safeJSONStringify,
} from "./serializableType.js";
import { Tunnel } from "./tunnel.js";

export class JsonTunnel<
  ParamsIn extends Param[],
  ParamsOut extends Param[]
> extends Tunnel<
  ParamsIn,
  ParamsOut,
  StringifiedSerializableValues<ParamsOut>,
  StringifiedSerializableValues<ParamsIn>
> {
  protected async listenerA(params: ParamsIn): Promise<boolean> {
    return await this.portB.send(
      ...(params.map(
        safeJSONStringify
      ) as unknown as StringifiedSerializableValues<ParamsIn>)
    );
  }

  protected async listenerB(
    params: StringifiedSerializableValues<ParamsOut>
  ): Promise<boolean> {
    return await this.portA.send(
      ...(params.map(safeJSONParse as any) as ParamsOut)
    );
  }
}
