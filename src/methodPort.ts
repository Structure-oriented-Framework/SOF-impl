import { DiodeInPort } from "./diodePort";
import { Data } from "./port";

export class MethodPort<
  K extends string | number | symbol,
  Func extends (...args: Data[]) => Data | void
> extends DiodeInPort<[[Parameters<Func>, ReturnType<Func>]]> {
  constructor(obj: { [Key in K]: Func }, key: K) {
    super();
    this.obj = obj;
    this.key = key;
  }
  protected readonly obj: { [key in K]: Func };
  protected readonly key: K;

  protected async _recv(
    ...params: Parameters<Func>
  ): Promise<ReturnType<Func>> {
    return this.obj[this.key].call(this.obj, ...params) as ReturnType<Func>;
  }
}
