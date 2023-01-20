export type Receiver<Params extends any[]> = (...params: Params) => boolean;

export abstract class Port<ParamsI extends any[], ParamsO extends any[]> {
  protected receiver: Receiver<ParamsO> | null = null;

  setReceiver(receiver: Receiver<ParamsO>): void {
    this.receiver = receiver;
  }

  send(...params: ParamsO): boolean {
    if (!this.receiver) return false;
    return this.receiver(...params);
  }

  protected abstract _recv(...params: ParamsI): boolean;

  static connect<ParamsA2B extends any[], ParamsB2A extends any[]>(
    portA: Port<ParamsB2A, ParamsA2B>,
    portB: Port<ParamsA2B, ParamsB2A>
  ) {
    portA.setReceiver(portB._recv.bind(portB));
    portB.setReceiver(portA._recv.bind(portA));
  }
}

export type PortToConnect<ThisPort extends Port<any, any>> =
  ThisPort extends Port<infer ParamsI, infer ParamsO>
    ? Port<ParamsO, ParamsI>
    : never;
