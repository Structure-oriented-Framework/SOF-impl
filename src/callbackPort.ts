import { DiodeOutPort } from "./diodePort";
import { Data } from "./port";
import { ToSerializableValues, toSerializableValues } from "./serializableType";

export class CallbackPort<
  Func extends (...args: any[]) => Promise<Data | void>
> extends DiodeOutPort<
  [[ToSerializableValues<Parameters<Func>>, Awaited<ReturnType<Func>>]]
> {
  readonly callback: Func = (async (...params: Parameters<Func>) => {
    return await this.send(...toSerializableValues(params));
  }) as any;
}
