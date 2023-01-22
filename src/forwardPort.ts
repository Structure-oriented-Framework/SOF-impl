import { Port, Param } from "./port.js";

export class ForwardPort<
  ParamsI extends Param[],
  ParamsO extends Param[]
> extends Port<ParamsI, ParamsO> {
  constructor(toFunc: (...params: ParamsI) => boolean) {
    super();
    this.toFunc = toFunc;
  }
  toFunc: (...params: ParamsI) => boolean;
  protected _recv(...params: ParamsI): boolean {
    return this.toFunc(...params);
  }
}
