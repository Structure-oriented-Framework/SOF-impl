import { Port, Param } from "./port.js";

export abstract class DiodeInPort<Params extends Param[]> extends Port<Params, []> {
  send(): boolean {
    return false;
  }
  //The same as super, may should be removed
  protected abstract _recv(...params: Params): boolean;
}

export class DiodeOutPort<Params extends Param[]> extends Port<[], Params> {
  //The same as super, may should be removed
  send(...params: Params): boolean {
    return super.send(...params);
  }
  _recv(): boolean {
    return false;
  }
}
