import { Port, Data, IOType } from "./port.js";

export abstract class DiodeInPort<TIn extends IOType> extends Port<
  TIn,
  []
> {
  async send(): Promise<never> {
    throw new Error("Cannot send anything in a DiodeInPort");
  }
}

export class DiodeOutPort<TOut extends IOType> extends Port<[], TOut> {
  protected async _recv(): Promise<never> {
    throw new Error("Cannot recv anything in a DiodeOutPort");
  }
}
