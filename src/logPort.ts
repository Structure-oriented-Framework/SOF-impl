import { Data, Port } from "./port.js";

export class LogPort<
  TIn extends Data[],
  TOut extends Data[]
> extends Port<TIn, TOut> {
  constructor(name = "unNamed") {
    super();
    this.name = name;
  }
  name;
  protected async _recv(...params: TIn) {
    console.log(
      "LogPort [" + this.name + "]: Receive",
      params.length < 2 ? params[0] : params
    );
    return true;
  }
  async send(...params: TOut) {
    console.log(
      "LogPort [" + this.name + "]: Send",
      params.length < 2 ? params[0] : params
    );
    return await super.send(...params);
  }
}
