import { Serializable } from "./serializableType.js";

export type Param = Serializable;

export type Receiver<Params extends Param[]> = (
  ...params: Params
) => Promise<boolean>;

export abstract class Port<ParamsI extends Param[], ParamsO extends Param[]> {
  protected receiver: Receiver<ParamsO> | null = null;

  private setReceiver(receiver: Receiver<ParamsO>): boolean {
    this.receiver = receiver;
    return true;
  }

  async send(...params: ParamsO): Promise<boolean> {
    if (!this.receiver) return false;
    return await this.receiver(...params);
  }

  // async
  protected abstract _recv(...params: ParamsI): Promise<boolean>;

  static connect<ParamsA2B extends Param[], ParamsB2A extends Param[]>(
    portA: Port<ParamsB2A, ParamsA2B>,
    portB: Port<ParamsA2B, ParamsB2A>
  ): boolean {
    return (
      portA.setReceiver(portB._recv.bind(portB)) &&
      portB.setReceiver(portA._recv.bind(portA))
    );
  }
}

export type PortToConnect<ThisPort extends Port<any, any>> =
  ThisPort extends Port<infer ParamsI, infer ParamsO>
    ? Port<ParamsO, ParamsI>
    : never;
