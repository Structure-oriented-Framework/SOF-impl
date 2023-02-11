import { Data, Port, PortToConnect } from "./port.js";

type TunnelListener<TIn extends Data[]> = (
  ...params: TIn
) => Promise<boolean>;

export class TunnelPort<
  TIn extends Data[],
  TOut extends Data[]
> extends Port<TIn, TOut> {
  protected listener: TunnelListener<TIn> | null = null;
  setListender(listener: TunnelListener<TIn>) {
    this.listener = listener;
  }
  protected async _recv(...params: TIn): Promise<boolean> {
    if (!this.listener) return false;
    return await this.listener(...params);
  }
}

export abstract class Tunnel<
  ParamsAIn extends Data[],
  ParamsAOut extends Data[],
  ParamsBIn extends Data[] = ParamsAOut,
  ParamsBOut extends Data[] = ParamsAIn
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
}
