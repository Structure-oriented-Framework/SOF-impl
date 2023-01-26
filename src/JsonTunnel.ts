import { Param } from "./port.js";
import {
<<<<<<< HEAD
  JSONString,
=======
  StringifiedSerializableValues,
>>>>>>> d43d33fd187901a5de94a3560d73e09274234a0f
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
  [jsonStr: JSONString<ParamsOut>],
  [jsonStr: JSONString<ParamsIn>]
> {
  protected async listenerA(...params: ParamsIn): Promise<boolean> {
    return await this.portB.send(safeJSONStringify(params));
  }

  protected async listenerB(
    jsonStr: JSONString<ParamsOut>
  ): Promise<boolean> {
    return await this.portA.send(...safeJSONParse(jsonStr));
  }
}
