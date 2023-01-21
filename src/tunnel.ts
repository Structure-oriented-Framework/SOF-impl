import { Param, Port, PortToConnect } from "./port.js";

type TunnelListener<ParamsI extends Param[]> = (params: ParamsI) => boolean;
export class TunnelPort<
  ParamsI extends Param[],
  ParamsO extends Param[]
> extends Port<ParamsI, ParamsO> {
  protected listener: TunnelListener<ParamsI> | null = null;
  setListender(listener: TunnelListener<ParamsI>) {
    this.listener = listener;
  }
  _recv(...params: ParamsI): boolean {
    if (!this.listener) return false;
    return this.listener(params);
  }
}

export abstract class Tunnel<
  ParamsA2B extends Param[],
  ParamsB2A extends Param[]
> {
  constructor() {
    this.portA.setListender(this.listenerA.bind(this));
    this.portB.setListender(this.listenerB.bind(this));
  }
  portA: TunnelPort<ParamsA2B, ParamsB2A> = new TunnelPort();
  portB: TunnelPort<ParamsB2A, ParamsA2B> = new TunnelPort();

  protected abstract listenerA(params: ParamsA2B): boolean;
  protected abstract listenerB(params: ParamsB2A): boolean;

  connectA(to: PortToConnect<TunnelPort<ParamsA2B, ParamsB2A>>): boolean {
    return Port.connect(this.portA, to);
  }
  connectB(to: PortToConnect<TunnelPort<ParamsB2A, ParamsA2B>>): boolean {
    return Port.connect(this.portB, to);
  }
  connectAB(
    toA: PortToConnect<TunnelPort<ParamsA2B, ParamsB2A>>,
    toB: PortToConnect<TunnelPort<ParamsB2A, ParamsA2B>>
  ): boolean {
    return this.connectA(toA) && this.connectB(toB);
  }

  static connect<
    ParamsA2B extends Param[],
    ParamsB2A extends Param[],
    TunnelCtor extends new (...args: TunnelCtorParams) => Tunnel<
      ParamsA2B,
      ParamsB2A
    >,
    TunnelCtorParams extends any[]
  >(
    a: PortToConnect<TunnelPort<ParamsA2B, ParamsB2A>>,
    b: PortToConnect<TunnelPort<ParamsB2A, ParamsA2B>>,
    tunnelCtor: TunnelCtor,
    ...args: TunnelCtorParams
  ) {
    const t = new tunnelCtor(...args);
    t.connectA(a);
    t.connectB(b);
    return t;
  }
}
