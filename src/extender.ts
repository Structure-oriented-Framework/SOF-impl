import { Param, Port, type PortToConnect } from "./port.js";
import { Selector, SelectorMap } from "./selector.js";

export type ExtenderSigleSideI<ParamsDistribute extends Param[]> = [
  to: Selector,
  ...params: ParamsDistribute
];
export type ExtenderSigleSideO<ParamsCollect extends Param[]> = [
  from: Selector,
  ...params: ParamsCollect
];

export class ExtenderSingleSidePort<
  ParamsDistribute extends Param[],
  ParamsCollect extends Param[]
> extends Port<
  ExtenderSigleSideI<ParamsDistribute>,
  ExtenderSigleSideO<ParamsCollect>
> {
  constructor(extenderInstance: Extender<ParamsDistribute, ParamsCollect>) {
    super();
    this.extenderInstance = extenderInstance;
  }
  extenderInstance: Extender<ParamsDistribute, ParamsCollect>;
  protected _recv(to: Selector, ...params: ParamsDistribute): boolean {
    return this.extenderInstance.extend(to, ...params);
  }
}

export class ExtenderMultiSidePort<
  ParamsDistribute extends Param[],
  ParamsCollect extends Param[]
> extends Port<ParamsCollect, ParamsDistribute> {
  constructor(
    selector: Selector,
    extenderInstance: Extender<ParamsDistribute, ParamsCollect>
  ) {
    super();
    this.selector = selector;
    this.extenderInstance = extenderInstance;
  }
  selector: Selector;
  extenderInstance: Extender<ParamsDistribute, ParamsCollect>;
  protected _recv(...params: ParamsCollect): boolean {
    return this.extenderInstance.collect(this.selector, ...params);
  }
}

export class Extender<
  ParamsDistribute extends Param[],
  ParamsCollect extends Param[]
> {
  constructor(
    portsToConnect?: [
      toSingleSide: PortToConnect<
        Port<
          ExtenderSigleSideI<ParamsDistribute>,
          ExtenderSigleSideO<ParamsCollect>
        >
      >,
      toMultiSide: PortToConnect<Port<ParamsDistribute, ParamsCollect>>[]
    ]
  ) {
    if (portsToConnect) {
      portsToConnect[0];
    }
  }
  singleSidePort = new ExtenderSingleSidePort<ParamsDistribute, ParamsCollect>(
    this
  );
  multiSidePorts = new SelectorMap<
    ExtenderMultiSidePort<ParamsDistribute, ParamsCollect>
  >();

  select(
    selector: Selector
  ): ExtenderMultiSidePort<ParamsDistribute, ParamsCollect> | undefined {
    return this.multiSidePorts.get(selector);
  }
  extend(to: Selector, ...params: ParamsDistribute): boolean {
    return this.select(to)?.send(...params) || false;
  }
  collect(from: Selector, ...params: ParamsCollect) {
    return this.singleSidePort.send(from, ...params);
  }

  connectSigleSide(to: PortToConnect<typeof this.singleSidePort>) {
    Port.connect(this.singleSidePort, to);
  }
  connectMultiSideSide(
    selector: Selector,
    to: PortToConnect<ExtenderMultiSidePort<ParamsDistribute, ParamsCollect>>
  ) {
    const port = this.select(selector);
    if (!port) return false;
    Port.connect(port, to);
  }
  addMultiSide(
    connectTo: PortToConnect<
      ExtenderMultiSidePort<ParamsDistribute, ParamsCollect>
    >
  ): Selector {
    const selector = Selector();
    const port = new ExtenderMultiSidePort<ParamsDistribute, ParamsCollect>(
      selector,
      this
    );
    this.multiSidePorts.set(selector, port);
    Port.connect(port, connectTo);
    return selector;
  }
}
