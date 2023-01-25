import { Port, Param } from "./port.js";

export class ForwardPort<
  ParamsI extends Param[],
  ParamsO extends Param[]
> extends Port<ParamsI, ParamsO> {
  constructor(toFunc: (...params: ParamsI) => Promise<boolean>) {
    super();
    this.toFunc = toFunc;
  }
  toFunc: (...params: ParamsI) => Promise<boolean>;
  protected async _recv(...params: ParamsI): Promise<boolean> {
    return await this.toFunc(...params);
  }
}
