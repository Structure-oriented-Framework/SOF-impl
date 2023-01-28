import { DiodeInPort, DiodeOutPort } from "./diodePort.js";
import { Port } from "./port.js";
import { Selector } from "./selector.js";
import { StaticExtender } from "./staticExtender.js";

export type MethodArgsRetPair = [argTypes: any[], retType: any];

export type MethodMethodsData<Sels extends Selector> = {
  [Sel in Sels]: MethodArgsRetPair;
};

export type MethodFunctionType<Method extends MethodArgsRetPair> = (
  ...args: Method[0]
) => Method[1];

export type MethodFunctions<
  Sels extends Selector,
  Method extends MethodMethodsData<Sels>
> = {
  [Sel in keyof Method]: MethodFunctionType<Method[Sel]>;
};

export type MethodCallCtrlParams<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> = [sel: Sels, serialNo: MethodCallingSerialNo];

export class MethodCalleeCtrlPort<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> extends DiodeInPort<MethodCallCtrlParams<Sels, Methods>> {
  constructor(callee: MethodCallee<Sels, Methods>) {
    super();
    this.callee = callee;
  }
  callee: MethodCallee<Sels, Methods>;
  protected async _recv<Sel extends Sels>(
    sel: Sel,
    serialNo: MethodCallingSerialNo
  ): Promise<boolean> {
    return this.callee.createCallingPortAndConnect<Sel>(sel, serialNo);
  }
}

export class MethodCallerCtrlPort<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> extends DiodeOutPort<MethodCallCtrlParams<Sels, Methods>> {}

export type MethodCallingParams<
  Sel extends Sels,
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> = [args: Methods[Sel][0]];

export type MethodReturningParams<
  Sel extends Sels,
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> = [ret: Methods[Sel][1]];

export type MethodCallingResolver<Method extends MethodArgsRetPair> = (
  value: Method[1] | PromiseLike<Method[1]>
) => void;

export class MethodCalleeCallingPort<
  Sel extends Sels,
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> extends Port<
  MethodCallingParams<Sel, Sels, Methods>,
  MethodReturningParams<Sel, Sels, Methods>
> {
  constructor(method: MethodFunctionType<Methods[Sel]>) {
    super();
    this.method = method;
  }
  method: MethodFunctionType<Methods[Sel]>;
  protected async _recv(args: Methods[Sel][1]): Promise<boolean> {
    return await this.send(this.method(...args));
  }
}

export class MethodCallerCallingPort<
  Sel extends Sels,
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> extends Port<
  MethodReturningParams<Sel, Sels, Methods>,
  MethodCallingParams<Sel, Sels, Methods>
> {
  constructor(caller: MethodCaller<Sels, Methods>) {
    super();
    this.caller = caller;
  }
  caller: MethodCaller<Sels, Methods>;

  protected resolver: MethodCallingResolver<Methods[Sel]> | null = null;

  setResolver(resolver: MethodCallingResolver<Methods[Sel]>) {
    this.resolver = resolver;
  }

  protected async _recv(ret: Methods[Sel][1]): Promise<boolean> {
    if (!this.resolver) {
      throw new Error("No resolver specified!");
    }
    let successed = this.caller.applyRet<Sel>(this.resolver, ret);
    this.resolver = null;
    return successed;
  }
}

export type MethodCallStaticExtenderSels = "ctrl" | "calling";

export type MethodCallStaticExtenderCaller2Callee<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> = {
  ctrl: MethodCallCtrlParams<Sels, Methods>;
  calling: MethodCallingParamsCollected<Sels, Methods>;
};

export type MethodCallStaticExtenderCallee2Caller<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> = {
  ctrl: never;
  calling: MethodReturningParamsCollected<Sels, Methods>;
};

export class MethodCallee<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> {
  constructor(methods: MethodFunctions<Sels, Methods>) {
    this.methods = methods;

    this.staticExtender.connectMultiSideSide("ctrl", this.ctrlPort);
    this.staticExtender.connectMultiSideSide(
      "calling",
      this.callingExtenderPort
    );
  }

  protected methods: MethodFunctions<Sels, Methods>;

  protected readonly ctrlPort = new MethodCalleeCtrlPort<Sels, Methods>(this);
  protected callingExtender = new MethodCalleeCallingPortExtender<
    Sels,
    Methods
  >();
  protected get callingExtenderPort(): MethodCalleeCallingExtenderOutsidePort<
    Sels,
    Methods
  > {
    return this.callingExtender.toOutsidePort;
  }

  protected readonly staticExtender = new StaticExtender<
    MethodCallStaticExtenderSels,
    MethodCallStaticExtenderCaller2Callee<Sels, Methods>,
    MethodCallStaticExtenderCallee2Caller<Sels, Methods>
  >();

  public get port() {
    return this.staticExtender.singleSidePort;
  }

  createCallingPortAndConnect<Sel extends Sels>(
    sel: Sel,
    serialNo: MethodCallingSerialNo
  ): boolean {
    Port.connect(
      new MethodCalleeCallingPort<Sel, Sels, Methods>(this.methods[sel]),
      this.callingExtender.createInside<Sel>(serialNo)
    );
    return true;
  }
}

export class MethodCaller<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> {
  constructor() {
    this.staticExtender.connectMultiSideSide("ctrl", this.ctrlPort);
    this.staticExtender.connectMultiSideSide(
      "calling",
      this.callingExtenderPort
    );
  }

  protected crtSerialNo = 0;

  protected readonly ctrlPort = new MethodCallerCtrlPort<Sels, Methods>();
  protected readonly callingExtender = new MethodCallerCallingPortExtender<
    Sels,
    Methods
  >();
  protected get callingExtenderPort(): MethodCallerCallingExtenderOutsidePort<
    Sels,
    Methods
  > {
    return this.callingExtender.toOutsidePort;
  }

  protected readonly staticExtender = new StaticExtender<
    MethodCallStaticExtenderSels,
    MethodCallStaticExtenderCallee2Caller<Sels, Methods>,
    MethodCallStaticExtenderCaller2Callee<Sels, Methods>
  >();

  public get port() {
    return this.staticExtender.singleSidePort;
  }

  async createCallingConnection<Sel extends Sels>(
    sel: Sel
  ): Promise<MethodCallerCallingPort<Sel, Sels, Methods>> {
    const newPort = new MethodCallerCallingPort<Sel, Sels, Methods>(this);
    const serialNo = this.crtSerialNo++;
    Port.connect(this.callingExtender.createInside<Sel>(serialNo), newPort);
    await this.ctrlPort.send(sel, serialNo);
    return newPort;
  }

  async call<Sel extends Sels>(
    sel: Sel,
    ...args: Methods[Sel][0]
  ): Promise<Methods[Sel][1]> {
    return new Promise<Methods[Sel][1]>(async (resolve, reject) => {
      const port = await this.createCallingConnection<Sel>(sel);
      port.setResolver(resolve);
      await port.send(args);
    });
  }

  applyRet<Sel extends Sels>(
    resolve: MethodCallingResolver<Methods[Sel]>,
    ret: Methods[Sel][1]
  ): boolean {
    resolve(ret);
    return true;
  }
}

export type MethodCallingSerialNo = number;

export type MethodCallingParamsCollected<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> = [serialNo: MethodCallingSerialNo, args: Methods[Sels][0]];

export type MethodReturningParamsCollected<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> = [serialNo: MethodCallingSerialNo, ret: Methods[Sels][1]];

export class MethodCalleeCallingExtenderOutsidePort<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> extends Port<
  MethodCallingParamsCollected<Sels, Methods>,
  MethodReturningParamsCollected<Sels, Methods>
> {
  constructor(extender: MethodCalleeCallingPortExtender<Sels, Methods>) {
    super();
    this.extender = extender;
  }
  extender: MethodCalleeCallingPortExtender<Sels, Methods>;
  protected async _recv(
    serialNo: number,
    args: Methods[Sels][0]
  ): Promise<boolean> {
    return await this.extender.forwardInside(serialNo, args);
  }
}

export class MethodCallerCallingExtenderOutsidePort<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> extends Port<
  MethodReturningParamsCollected<Sels, Methods>,
  MethodCallingParamsCollected<Sels, Methods>
> {
  constructor(extender: MethodCallerCallingPortExtender<Sels, Methods>) {
    super();
    this.extender = extender;
  }
  extender: MethodCallerCallingPortExtender<Sels, Methods>;
  protected async _recv(
    serialNo: number,
    args: Methods[Sels][0]
  ): Promise<boolean> {
    return await this.extender.forwardInside(serialNo, args);
  }
}

export class MethodCalleeCallingExtenderInsidePort<
  Sel extends Sels,
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> extends Port<
  MethodReturningParams<Sel, Sels, Methods>,
  MethodCallingParams<Sel, Sels, Methods>
> {
  constructor(
    serialNo: MethodCallingSerialNo,
    extender: MethodCalleeCallingPortExtender<Sels, Methods>
  ) {
    super();
    this.serialNo = serialNo;
    this.extender = extender;
  }
  serialNo: MethodCallingSerialNo;
  extender: MethodCalleeCallingPortExtender<Sels, Methods>;
  protected async _recv(ret: Methods[Sel][1]): Promise<boolean> {
    return await this.extender.forwardOutside(this.serialNo, ret);
  }
}

export class MethodCallerCallingExtenderInsidePort<
  Sel extends Sels,
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> extends Port<
  MethodCallingParams<Sel, Sels, Methods>,
  MethodReturningParams<Sel, Sels, Methods>
> {
  constructor(
    serialNo: MethodCallingSerialNo,
    extender: MethodCallerCallingPortExtender<Sels, Methods>
  ) {
    super();
    this.serialNo = serialNo;
    this.extender = extender;
  }
  serialNo: MethodCallingSerialNo;
  extender: MethodCallerCallingPortExtender<Sels, Methods>;
  protected async _recv(ret: Methods[Sel][1]): Promise<boolean> {
    return await this.extender.forwardOutside(this.serialNo, ret);
  }
}

type MethodCalleeCallingExtenderInsidePortHelper<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>,
  SelsCopy extends Sels = Sels
> = SelsCopy extends unknown
  ? MethodCalleeCallingExtenderInsidePort<SelsCopy, Sels, Methods>
  : never;

export class MethodCalleeCallingPortExtender<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> {
  toOutsidePort = new MethodCalleeCallingExtenderOutsidePort<Sels, Methods>(
    this
  );

  toInsidePort: Record<
    MethodCallingSerialNo,
    MethodCalleeCallingExtenderInsidePortHelper<Sels, Methods>
  > = {};

  createInside<Sel extends Sels>(
    serialNo: MethodCallingSerialNo
  ): MethodCalleeCallingExtenderInsidePort<Sel, Sels, Methods> {
    const newPort = new MethodCalleeCallingExtenderInsidePort<
      Sel,
      Sels,
      Methods
    >(serialNo, this);
    this.toInsidePort[serialNo] = newPort as any;
    return newPort;
  }

  async forwardInside(
    serialNo: MethodCallingSerialNo,
    args: Methods[Sels][0]
  ): Promise<boolean> {
    let port = this.toInsidePort[serialNo];
    if (!port) return false;
    return await port.send(args);
  }

  async forwardOutside(
    serialNo: MethodCallingSerialNo,
    ret: Methods[Sels][1]
  ): Promise<boolean> {
    return await this.toOutsidePort.send(serialNo, ret);
  }
}

export class MethodCallerCallingPortExtender<
  Sels extends Selector,
  Methods extends MethodMethodsData<Sels>
> {
  toOutsidePort = new MethodCallerCallingExtenderOutsidePort<Sels, Methods>(
    this
  );

  toInsidePort: Record<
    MethodCallingSerialNo,
    Sels extends unknown
      ? MethodCallerCallingExtenderInsidePort<Sels, Sels, Methods>
      : never
  > = {};

  createInside<Sel extends Sels>(
    serialNo: MethodCallingSerialNo
  ): MethodCallerCallingExtenderInsidePort<Sel, Sels, Methods> {
    const newPort = new MethodCallerCallingExtenderInsidePort<
      Sel,
      Sels,
      Methods
    >(serialNo, this);
    this.toInsidePort[serialNo] = newPort as any;
    return newPort;
  }

  async forwardInside(
    serialNo: MethodCallingSerialNo,
    args: Methods[Sels][0]
  ): Promise<boolean> {
    let port = this.toInsidePort[serialNo];
    if (!port) return false;
    return await port.send(args);
  }

  async forwardOutside(
    serialNo: MethodCallingSerialNo,
    ret: Methods[Sels][1]
  ): Promise<boolean> {
    return await this.toOutsidePort.send(serialNo, ret);
  }
}

export class MethodCall {
  static connect<
    Sels extends Selector,
    Methods extends MethodMethodsData<Sels>
  >(
    callee: MethodCallee<Sels, Methods>,
    caller: MethodCaller<Sels, Methods>
  ): boolean {
    return Port.connect(callee.port, caller.port);
  }
}

/*
    [[Callee]]
        + [ctrlPort] <<======================================================>> [ctrl] +
        + [callingPort1] <<>> [inside1] +                                              +--StaticExtender--[collected] <<==~~~
        + [callingPort2] <<>> [inside2] +--CallingExtender--[outside] <<==>> [calling] +
        + [callingPort3] <<>> [inside3] +
*/
