import { Param, Port, type PortToConnect } from "./port.js";

export type StaticExtenderSelector = string;

export type StaticExtenderSigleSideI<
  To extends Sels,
  Sels extends StaticExtenderSelector,
  ParamsDistribute extends StaticExtenderParamsDistribute<Sels>
> = {
  [K in To]: [to: K, ...data: ParamsDistribute[K]];
}[To];

export type StaticExtenderSigleSideO<
  From extends Sels,
  Sels extends StaticExtenderSelector,
  ParamsCollect extends StaticExtenderParamsCollect<Sels>
> = {
  [K in From]: [from: K, ...data: ParamsCollect[K]];
}[From];

export type StaticExtenderParamsDistribute<Sels extends StaticExtenderSelector> = Record<
  Sels,
  Param[]
>;

export type StaticExtenderParamsCollect<Sels extends StaticExtenderSelector> = Record<
  Sels,
  Param[]
>;

export class StaticExtenderSingleSidePort<
  Sels extends StaticExtenderSelector,
  ParamsDistribute extends StaticExtenderParamsDistribute<Sels>,
  ParamsCollect extends StaticExtenderParamsCollect<Sels>
> extends Port<
  StaticExtenderSigleSideI<Sels, StaticExtenderSelector, ParamsDistribute>,
  StaticExtenderSigleSideO<Sels, StaticExtenderSelector, ParamsCollect>
> {
  constructor(
    extenderInstance: StaticExtender<Sels, ParamsDistribute, ParamsCollect>
  ) {
    super();
    this.extenderInstance = extenderInstance;
  }
  extenderInstance: StaticExtender<Sels, ParamsDistribute, ParamsCollect>;
  protected _recv<To extends Sels>(
    to: To, ...data: ParamsDistribute[To]
  ): boolean {
    return this.extenderInstance.extend(to, ...data);
  }
}

export class StaticExtenderMultiSidePort<
  Sel extends Sels,
  Sels extends StaticExtenderSelector,
  ParamsDistribute extends StaticExtenderParamsDistribute<Sels>,
  ParamsCollect extends StaticExtenderParamsCollect<Sels>
> extends Port<ParamsCollect[Sel], ParamsDistribute[Sel]> {
  constructor(
    selector: Sel,
    extenderInstance: StaticExtender<Sels, ParamsDistribute, ParamsCollect>
  ) {
    super();
    this.selector = selector;
    this.extenderInstance = extenderInstance;
  }
  selector: Sel;
  extenderInstance: StaticExtender<Sels, ParamsDistribute, ParamsCollect>;
  protected _recv(...data: ParamsCollect[Sel]): boolean {
    return this.extenderInstance.collect(this.selector, ...data);
  }
}

export class StaticExtender<
  Sels extends StaticExtenderSelector,
  ParamsDistribute extends StaticExtenderParamsDistribute<Sels>,
  ParamsCollect extends StaticExtenderParamsCollect<Sels>
> {
  singleSidePort = new StaticExtenderSingleSidePort<
    Sels,
    ParamsDistribute,
    ParamsCollect
  >(this);
  multiSidePorts: {
    [Sel in Sels]: StaticExtenderMultiSidePort<
      Sel,
      Sels,
      ParamsDistribute,
      ParamsCollect
    >;
  } = {} as any;

  select<Sel extends Sels>(
    selector: Sel
  ):
    | StaticExtenderMultiSidePort<Sel, Sels, ParamsDistribute, ParamsCollect>
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
      StaticExtenderMultiSidePort<Sel, Sels, ParamsDistribute, ParamsCollect>
    >
  ) {
    let port = this.select(selector);
    if (!port) {
      port = this.multiSidePorts[selector] = new StaticExtenderMultiSidePort<
        Sel,
        Sels,
        ParamsDistribute,
        ParamsCollect
      >(selector, this);
    }
    Port.connect(port, to);
  }

  static connect<
    Sels extends StaticExtenderSelector,
    ParamsDistribute extends StaticExtenderParamsDistribute<Sels>,
    ParamsCollect extends StaticExtenderParamsCollect<Sels>,
    StaticExtenderCtor extends new (...args: StaticExtenderCtorParams) => StaticExtender<
      Sels,
      ParamsDistribute,
      ParamsCollect
    >,
    StaticExtenderCtorParams extends any[]
  >(
    toSingleSide: PortToConnect<
      Port<
        StaticExtenderSigleSideI<Sels, Sels, ParamsDistribute>,
        StaticExtenderSigleSideO<Sels, Sels, ParamsCollect>
      >
    >,
    toMultiSide: {
      [Sel in Sels]: PortToConnect<
        StaticExtenderMultiSidePort<Sel, Sels, ParamsDistribute, ParamsCollect>
      >;
    },
    extenderCtor: StaticExtenderCtor,
    ...args: StaticExtenderCtorParams
  ) {
    const t = new extenderCtor(...args);
    t.connectSigleSide(toSingleSide);
    for (const selector in toMultiSide) {
      t.connectMultiSideSide(selector, toMultiSide[selector]);
    }
    return t;
  }
}
