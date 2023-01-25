import { Param, Port } from "./port.js";

export class LogPort<
  ParamsI extends Param[],
  ParamsO extends Param[]
> extends Port<ParamsI, ParamsO> {
  constructor(name = "unNamed") {
    super();
    this.name = name;
  }
  name;
  protected async _recv(...params: ParamsI) {
    console.log(
      "LogPort [" + this.name + "]: Receive",
      params.length < 2 ? params[0] : params
    );
    return true;
  }
  async send(...params: ParamsO) {
    console.log(
      "LogPort [" + this.name + "]: Send",
      params.length < 2 ? params[0] : params
    );
    return await super.send(...params);
  }
}
