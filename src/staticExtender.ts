import { Param, Port, type PortToConnect } from "./port.js";
import { Selector } from "./selector.js";

export type StaticExtenderSigleSideI<
  To extends Sels,
  Sels extends Selector,
  ParamsDistribute extends StaticExtenderParamsDistribute<Sels>
> = {
  [K in To]: [to: K, ...data: ParamsDistribute[K]];
}[To];

export type StaticExtenderSigleSideO<
  From extends Sels,
  Sels extends Selector,
  ParamsCollect extends StaticExtenderParamsCollect<Sels>
> = {
  [K in From]: [from: K, ...data: ParamsCollect[K]];
}[From];

export type StaticExtenderParamsDistribute<
  Sels extends Selector
> = Record<Sels, Param[]>;

export type StaticExtenderParamsCollect<Sels extends Selector> =
  Record<Sels, Param[]>;

export class StaticExtenderSingleSidePort<
  Sels extends Selector,
  ParamsDistribute extends StaticExtenderParamsDistribute<Sels>,
  ParamsCollect extends StaticExtenderParamsCollect<Sels>
> extends Port<
  StaticExtenderSigleSideI<Sels, Selector, ParamsDistribute>,
  StaticExtenderSigleSideO<Sels, Selector, ParamsCollect>
> {
  constructor(
    extenderInstance: StaticExtender<Sels, ParamsDistribute, ParamsCollect>
  ) {
    super();
    this.extenderInstance = extenderInstance;
  }
  extenderInstance: StaticExtender<Sels, ParamsDistribute, ParamsCollect>;
  protected async _recv<To extends Sels>(
    to: To,
    ...data: ParamsDistribute[To]
  ): Promise<boolean> {
    return this.extenderInstance.extend(to, ...data);
  }
}

export class StaticExtenderMultiSidePort<
  Sel extends Sels,
  Sels extends Selector,
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
  protected async _recv(...data: ParamsCollect[Sel]): Promise<boolean> {
    return await this.extenderInstance.collect(this.selector, ...data);
  }
}

export class StaticExtender<
  Sels extends Selector,
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
  async extend<To extends Sels>(
    to: To,
    ...data: ParamsDistribute[To]
  ): Promise<boolean> {
    return (await this.select(to)?.send(...data)) ?? false;
  }
  async collect<From extends Sels>(
    from: From,
    ...data: ParamsCollect[From]
  ): Promise<boolean> {
    return await this.singleSidePort.send(from, ...data);
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
    Sels extends Selector,
    ParamsDistribute extends StaticExtenderParamsDistribute<Sels>,
    ParamsCollect extends StaticExtenderParamsCollect<Sels>,
    StaticExtenderCtor extends new (
      ...args: StaticExtenderCtorParams
    ) => StaticExtender<Sels, ParamsDistribute, ParamsCollect>,
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
