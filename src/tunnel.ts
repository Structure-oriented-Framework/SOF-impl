import { Port, PortToConnect } from "./port.js";

export class TunnelPort<
  ParamsI extends any[],
  ParamsO extends any[]
> extends Port<ParamsI, ParamsO> {
  protected otherPort: TunnelPort<ParamsO, ParamsI> | null = null;
  setOtherPort(otherPort: TunnelPort<ParamsO, ParamsI>) {
    this.otherPort = otherPort;
  }
  _recv(...params: ParamsI): boolean {
    if (!this.otherPort) return false;
    return this.otherPort.send(...params);
  }
}

export class Tunnel<ParamsA2B extends any[], ParamsB2A extends any[]> {
  constructor(
    portsToConnect?: [
      toA: Port<ParamsB2A, ParamsA2B>,
      toB: Port<ParamsA2B, ParamsB2A>
    ]
  ) {
    this.portA.setOtherPort(this.portB);
    this.portB.setOtherPort(this.portA);
    if (portsToConnect) {
      this.connectA(portsToConnect[0]);
      this.connectB(portsToConnect[1]);
    }
  }
  portA: TunnelPort<ParamsA2B, ParamsB2A> = new TunnelPort();
  portB: TunnelPort<ParamsB2A, ParamsA2B> = new TunnelPort();

  connectA(to: PortToConnect<typeof this.portA>) {
    return Port.connect(this.portA, to);
  }
  connectB(to: PortToConnect<typeof this.portB>) {
    return Port.connect(this.portB, to);
  }
}
