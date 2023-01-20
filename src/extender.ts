import { Port, type PortToConnect } from "./port.js";

export type ExtenderSelector = symbol;

export type ExtenderSigleSideI<ParamsDistribute extends any[]> = [
  to: ExtenderSelector,
  ...params: ParamsDistribute
];
export type ExtenderSigleSideO<ParamsCollect extends any[]> = [
  from: ExtenderSelector,
  ...params: ParamsCollect
];

export class ExtenderSingleSidePort<
  ParamsDistribute extends any[],
  ParamsCollect extends any[]
> extends Port<
  ExtenderSigleSideI<ParamsDistribute>,
  ExtenderSigleSideO<ParamsCollect>
> {
  constructor(extenderInstance: Extender<ParamsDistribute, ParamsCollect>) {
    super();
    this.extenderInstance = extenderInstance;
  }
  extenderInstance: Extender<ParamsDistribute, ParamsCollect>;
  protected _recv(to: ExtenderSelector, ...params: ParamsDistribute): boolean {
    return this.extenderInstance.extend(to, ...params);
  }
}

export class ExtenderMultiSidePort<
  ParamsDistribute extends any[],
  ParamsCollect extends any[]
> extends Port<ParamsCollect, ParamsDistribute> {
  constructor(
    selector: ExtenderSelector,
    extenderInstance: Extender<ParamsDistribute, ParamsCollect>
  ) {
    super();
    this.selector = selector;
    this.extenderInstance = extenderInstance;
  }
  selector: ExtenderSelector;
  extenderInstance: Extender<ParamsDistribute, ParamsCollect>;
  protected _recv(...params: ParamsCollect): boolean {
    return this.extenderInstance.collect(this.selector, ...params);
  }
}

export class Extender<
  ParamsDistribute extends any[],
  ParamsCollect extends any[]
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
  multiSidePorts: Record<
    ExtenderSelector,
    ExtenderMultiSidePort<ParamsDistribute, ParamsCollect>
  > = {};

  select(
    selector: ExtenderSelector
  ): ExtenderMultiSidePort<ParamsDistribute, ParamsCollect> {
    return this.multiSidePorts[selector]; // TODO!
  }
  extend(to: ExtenderSelector, ...params: ParamsDistribute): boolean {
    return this.select(to).send(...params);
  }
  collect(from: ExtenderSelector, ...params: ParamsCollect) {
    return this.singleSidePort.send(from, ...params);
  }

  connectSigleSide(to: PortToConnect<typeof this.singleSidePort>) {
    Port.connect(this.singleSidePort, to);
  }
  connectMultiSideSide(
    selector: ExtenderSelector,
    to: PortToConnect<typeof this.multiSidePorts[symbol]>
  ) {
    Port.connect(this.select(selector), to);
  }
  addMultiSide(
    connectTo: PortToConnect<typeof this.multiSidePorts[symbol]>
  ): ExtenderSelector {
    const selector = Symbol();
    this.multiSidePorts[selector] = new ExtenderMultiSidePort<
      ParamsDistribute,
      ParamsCollect
    >(selector, this);
    Port.connect(this.multiSidePorts[selector], connectTo);
    return selector;
  }
}
