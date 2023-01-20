import { Port } from "./port.js";

export class LogPort<ParamsI extends any[], ParamsO extends any[]> extends Port<
  ParamsI,
  ParamsO
> {
  constructor(name = "unNamed") {
    super();
    this.name = name;
  }
  name;
  _recv(...params: ParamsI) {
    console.log("LogPort [" + this.name + "]: Receive", ...params);
    return true;
  }
  send(...params: ParamsO) {
    console.log("LogPort [" + this.name + "]: Send", ...params);
    return super.send(...params);
  }
}
