import { Port, Param } from "./port.js";

export abstract class DiodeInPort<Params extends Param[]> extends Port<
  Params,
  never
> {
  async send(): Promise<boolean> {
    return false;
  }

  //The same as super, may should be removed
  protected abstract _recv(...params: Params): Promise<boolean>;
}

export class DiodeOutPort<Params extends Param[]> extends Port<never, Params> {
  //The same as super, may should be removed
  async send(...params: Params): Promise<boolean> {
    return await super.send(...params);
  }
  protected async _recv(): Promise<boolean> {
    return false;
  }
}
