import { Param, Port, type PortToConnect } from "./port.js";

export type ExtenderSelector = string;

export type ExtenderSigleSideI<
  To extends Sels,
  Sels extends ExtenderSelector,
  ParamsDistribute extends ExtenderParamsDistribute<Sels>
> = {
  [K in To]: [to: K, ...data: ParamsDistribute[K]];
}[To];

export type ExtenderSigleSideO<
  From extends Sels,
  Sels extends ExtenderSelector,
  ParamsCollect extends ExtenderParamsCollect<Sels>
> = {
  [K in From]: [from: K, ...data: ParamsCollect[K]];
}[From];

export type ExtenderParamsDistribute<Sels extends ExtenderSelector> = Record<
  Sels,
  Param[]
>;

export type ExtenderParamsCollect<Sels extends ExtenderSelector> = Record<
  Sels,
  Param[]
>;

export class ExtenderSingleSidePort<
  Sels extends ExtenderSelector,
  ParamsDistribute extends ExtenderParamsDistribute<Sels>,
  ParamsCollect extends ExtenderParamsCollect<Sels>
> extends Port<
  ExtenderSigleSideI<Sels, ExtenderSelector, ParamsDistribute>,
  ExtenderSigleSideO<Sels, ExtenderSelector, ParamsCollect>
> {
  constructor(
    extenderInstance: Extender<Sels, ParamsDistribute, ParamsCollect>
  ) {
    super();
    this.extenderInstance = extenderInstance;
  }
  extenderInstance: Extender<Sels, ParamsDistribute, ParamsCollect>;
  protected _recv<To extends Sels>(
    to: To, ...data: ParamsDistribute[To]
  ): boolean {
    return this.extenderInstance.extend(to, ...data);
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
    extenderInstance: Extender<Sels, ParamsDistribute, ParamsCollect>
  ) {
    super();
    this.selector = selector;
    this.extenderInstance = extenderInstance;
  }
  selector: Sel;
  extenderInstance: Extender<Sels, ParamsDistribute, ParamsCollect>;
  protected _recv(...data: ParamsCollect[Sel]): boolean {
    return this.extenderInstance.collect(this.selector, ...data);
  }
}

export class Extender<
  Sels extends ExtenderSelector,
  ParamsDistribute extends ExtenderParamsDistribute<Sels>,
  ParamsCollect extends ExtenderParamsCollect<Sels>
> {
  singleSidePort = new ExtenderSingleSidePort<
    Sels,
    ParamsDistribute,
    ParamsCollect
  >(this);
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
  ):
    | ExtenderMultiSidePort<Sel, Sels, ParamsDistribute, ParamsCollect>
    | undefined {
    return this.multiSidePorts[selector]; //Important: this may be undefined!
  }
  extend<To extends Sels>(to: To, ...data: ParamsDistribute[To]): boolean {
    return this.select(to)?.send(...data) || false;
  }
  collect<From extends Sels>(
    from: From,
    ...data: ParamsCollect[From]
  ): boolean {
    return this.singleSidePort.send(from, ...data);
  }

  connectSigleSide(to: PortToConnect<typeof this.singleSidePort>) {
    Port.connect(this.singleSidePort, to);
  }
  connectMultiSideSide<Sel extends Sels>(
    selector: Sel,
    to: PortToConnect<
      ExtenderMultiSidePort<Sel, Sels, ParamsDistribute, ParamsCollect>
    >
  ) {
    let port = this.select(selector);
    if (!port) {
      port = this.multiSidePorts[selector] = new ExtenderMultiSidePort<
        Sel,
        Sels,
        ParamsDistribute,
        ParamsCollect
      >(selector, this);
    }
    Port.connect(port, to);
  }

  static connect<
    Sels extends ExtenderSelector,
    ParamsDistribute extends ExtenderParamsDistribute<Sels>,
    ParamsCollect extends ExtenderParamsCollect<Sels>,
    ExtenderCtor extends new (...args: ExtenderCtorParams) => Extender<
      Sels,
      ParamsDistribute,
      ParamsCollect
    >,
    ExtenderCtorParams extends any[]
  >(
    toSingleSide: PortToConnect<
      Port<
        ExtenderSigleSideI<Sels, Sels, ParamsDistribute>,
        ExtenderSigleSideO<Sels, Sels, ParamsCollect>
      >
    >,
    toMultiSide: {
      [Sel in Sels]: PortToConnect<
        ExtenderMultiSidePort<Sel, Sels, ParamsDistribute, ParamsCollect>
      >;
    },
    extenderCtor: ExtenderCtor,
    ...args: ExtenderCtorParams
  ) {
    const t = new extenderCtor(...args);
    t.connectSigleSide(toSingleSide);
    for (const selector in toMultiSide) {
      t.connectMultiSideSide(selector, toMultiSide[selector]);
    }
    return t;
  }
}
