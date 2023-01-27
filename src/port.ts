import { Serializable } from "./serializableType.js";

import "reflect-metadata";

export type Param = Serializable;

export type Receiver<Params extends Param[]> = (
  ...params: Params
) => Promise<boolean>;

export abstract class Port<ParamsI extends Param[], ParamsO extends Param[]> {
  protected _linkedTo: Port<ParamsO, ParamsI> | null = null;

  public get linkedTo(): Port<ParamsO, ParamsI> | null{
    return this._linkedTo;
  }

  protected link(to: Port<ParamsO, ParamsI>): boolean {
    this._linkedTo = to;
    return true;
  }

  async send(...params: ParamsO): Promise<boolean> {
    if (!this.linkedTo) return false;
    return await this.linkedTo._recv.apply(this.linkedTo, params);
  }

  // async
  protected abstract _recv(...params: ParamsI): Promise<boolean>;

  static connect<ParamsA2B extends Param[], ParamsB2A extends Param[]>(
    portA: Port<ParamsB2A, ParamsA2B>,
    portB: Port<ParamsA2B, ParamsB2A>
  ): boolean {
    return portA.link(portB) && portB.link(portA);
  }
}

export type PortToConnect<ThisPort extends Port<any, any>> =
  ThisPort extends Port<infer ParamsI, infer ParamsO>
    ? Port<ParamsO, ParamsI>
    : never;
