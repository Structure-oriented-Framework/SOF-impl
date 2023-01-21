import { Param, Port, type PortToConnect } from "./port.js";

export type ExtenderSelector = string;

export type ExtenderSigleSideI<
  To extends Sels,
  Sels extends ExtenderSelector,
  ParamsDistribute extends ExtenderParamsDistribute<Sels>
> = [to: To, ...params: ParamsDistribute[To]];
export type ExtenderSigleSideO<
  From extends Sels,
  Sels extends ExtenderSelector,
  ParamsCollect extends ExtenderParamsCollect<Sels>
> =([from: From, ...params: ParamsCollect[From]]);

export type ExtenderParamsDistribute<Sels extends ExtenderSelector> = Record<Sels, Param[]>;
export type ExtenderParamsCollect <Sels extends ExtenderSelector>= Record<Sels, Param[]>;

export class ExtenderSingleSidePort<
Sels extends ExtenderSelector,
  ParamsDistribute extends ExtenderParamsDistribute<Sels>,
  ParamsCollect extends ExtenderParamsCollect<Sels>
> extends Port<
  ExtenderSigleSideI<Sels,ExtenderSelector, ParamsDistribute>,
  ExtenderSigleSideO<Sels,ExtenderSelector, ParamsCollect>
> {
  constructor(extenderInstance: Extender<Sels,ParamsDistribute, ParamsCollect>) {
    super();
    this.extenderInstance = extenderInstance;
  }
  extenderInstance: Extender<Sels,ParamsDistribute, ParamsCollect>;
  protected _recv<To extends Sels>(
    to: To,
    ...params: ParamsDistribute[To]
  ): boolean {
    return this.extenderInstance.extend(to, ...params);
  }
}

export class ExtenderMultiSidePort<
  Sel extends Sels,
  Sels extends ExtenderSelector,
  ParamsDistribute extends ExtenderParamsDistribute<Sels>,
  ParamsCollect extends ExtenderParamsCollect<Sels>
> extends Port<ParamsCollect[Sel], ParamsDistribute[Sel]> {
  constructor(
    selector: Sel,
    extenderInstance: Extender<Sels,ParamsDistribute, ParamsCollect>
  ) {
    super();
    this.selector = selector;
    this.extenderInstance = extenderInstance;
  }
  selector: Sel;
  extenderInstance: Extender<Sels,ParamsDistribute, ParamsCollect>;
  protected _recv(...params: ParamsCollect[Sel]): boolean {
    return this.extenderInstance.collect(this.selector, ...params);
  }
}

export class Extender<
Sels extends ExtenderSelector,
  ParamsDistribute extends ExtenderParamsDistribute<Sels>,
  ParamsCollect extends ExtenderParamsCollect<Sels>
> {
  constructor(
    portsToConnect?: [
      toSingleSide: PortToConnect<
        Port<
          ExtenderSigleSideI<Sels,ExtenderSelector, ParamsDistribute>,
          ExtenderSigleSideO<Sels,ExtenderSelector, ParamsCollect>
        >
      >,
      toMultiSide: {
        [Sel in ExtenderSelector]: PortToConnect<
          Port<ParamsDistribute[Sels], ParamsCollect[Sels]>
        >;
      }
    ]
  ) {
    if (portsToConnect) {
      portsToConnect[0];
    }
  }
  singleSidePort = new ExtenderSingleSidePort<Sels,ParamsDistribute, ParamsCollect>(
    this
  );
  multiSidePorts: {
    [Sel in Sels]: ExtenderMultiSidePort<
      Sel,
      Sels,
      ParamsDistribute,
      ParamsCollect
    >;
  } = {} as any;

  select<Sel extends Sels>(
    selector: Sel
  ): ExtenderMultiSidePort<Sel,Sels, ParamsDistribute, ParamsCollect> | undefined {
    return this.multiSidePorts[selector];//Important: this may be undefined!
  }
  extend<To extends Sels>(
    to: To,
    ...params: ParamsDistribute[To]
  ): boolean {
    return this.select(to)?.send(...params) || false;
  }
  collect<From extends Sels>(
    from: From,
    ...params: ParamsCollect[From]
  ): boolean {
    return this.singleSidePort.send(from, ...params);
  }

  connectSigleSide(to: PortToConnect<typeof this.singleSidePort>) {
    Port.connect(this.singleSidePort, to);
  }
  connectMultiSideSide<Sel extends Sels>(
    selector: Sel,
    to: PortToConnect<
      ExtenderMultiSidePort<Sel,Sels, ParamsDistribute, ParamsCollect>
    >
  ) {
    const port = this.select(selector);
    if (!port) return false;
    Port.connect(port, to);
  }
}
