import { Param, Port, PortToConnect } from "./port.js";

type TunnelListener<ParamsI extends Param[]> = (
  ...params: ParamsI
) => Promise<boolean>;

export class TunnelPort<
  ParamsI extends Param[],
  ParamsO extends Param[]
> extends Port<ParamsI, ParamsO> {
  protected listener: TunnelListener<ParamsI> | null = null;
  setListender(listener: TunnelListener<ParamsI>) {
    this.listener = listener;
  }
  protected async _recv(...params: ParamsI): Promise<boolean> {
    if (!this.listener) return false;
    return await this.listener(...params);
  }
}

export abstract class Tunnel<
  ParamsAIn extends Param[],
  ParamsAOut extends Param[],
  ParamsBIn extends Param[] = ParamsAOut,
  ParamsBOut extends Param[] = ParamsAIn
> {
  constructor() {
    this.portA.setListender(this.listenerA.bind(this));
    this.portB.setListender(this.listenerB.bind(this));
  }
  portA: TunnelPort<ParamsAIn, ParamsAOut> = new TunnelPort();
  portB: TunnelPort<ParamsBIn, ParamsBOut> = new TunnelPort();

  //async
  protected abstract listenerA(...params: ParamsAIn): Promise<boolean>;
  //async
  protected abstract listenerB(...params: ParamsBIn): Promise<boolean>;

  connectA(to: PortToConnect<TunnelPort<ParamsAIn, ParamsAOut>>): boolean {
    return Port.connect(this.portA, to);
  }
  connectB(to: PortToConnect<TunnelPort<ParamsBIn, ParamsBOut>>): boolean {
    return Port.connect(this.portB, to);
  }
  connectAB(
    toA: PortToConnect<TunnelPort<ParamsAIn, ParamsAOut>>,
    toB: PortToConnect<TunnelPort<ParamsBIn, ParamsBOut>>
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
