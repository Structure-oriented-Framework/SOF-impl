import { DiodeInPort } from "./diodePort.js";
import { Port, Data } from "./port.js";

export class ForwardPort<
  TIn extends Data[],
  TOut extends Data[]
> extends Port<TIn, TOut> {
  constructor(toFunc: (...params: TIn) => Promise<boolean>) {
    super();
    this.toFunc = toFunc;
  }
  protected toFunc: (...params: TIn) => Promise<boolean>;
  protected async _recv(...params: TIn): Promise<boolean> {
    return await this.toFunc(...params);
  }
}

export class DiodeInForwardPort<
  TIn extends Data[]
> extends DiodeInPort<TIn> {
  constructor(toFunc: (...params: TIn) => Promise<boolean>) {
    super();
    this.toFunc = toFunc;
  }
  protected toFunc: (...params: TIn) => Promise<boolean>;
  protected async _recv(...params: TIn): Promise<boolean> {
    return await this.toFunc(...params);
  }
}
