import { DiodeInPort, DiodeOutPort } from "./diodePort.js";
import { Port } from "./port.js";

export type MethodSelector = string;

export type MethodArgsRetPair = [argTypes: any[], retType: any];

export type MethodMethodsData<Sels extends MethodSelector> = {
  [Sel in Sels]: MethodArgsRetPair;
};

export type MethodFunctionType<Method extends MethodArgsRetPair> = (
  ...args: Method[0]
) => Method[1];

export type MethodFunctions<
  Sels extends MethodSelector,
  Method extends MethodMethodsData<Sels>
> = {
  [Sel in keyof Method]: MethodFunctionType<Method[Sel]>;
};

export type MethodCalleeCtrlParams<
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> = {
  [Sel in Sels]: [sel: Sel, serialNo: MethodCallingSerialNo];
}[Sels];

export class MethodCalleeCtrlPort<
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> extends DiodeInPort<MethodCalleeCtrlParams<Sels, Methods>> {
  constructor(callee: MethodCallee<Sels, Methods>) {
    super();
    this.callee = callee;
  }
  callee: MethodCallee<Sels, Methods>;
  protected _recv<Sel extends Sels>(
    sel: Sel,
    serialNo: MethodCallingSerialNo
  ): boolean {
    return this.callee.createCallingPortAndConnect<Sel>(sel, serialNo);
  }
}

export class MethodCallerCtrlPort<
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> extends DiodeOutPort<MethodCalleeCtrlParams<Sels, Methods>> {}

export type MethodCallingParams<
  Sel extends Sels,
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> = [args: Methods[Sel][0]];

export type MethodReturningParams<
  Sel extends Sels,
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> = [ret: Methods[Sel][1]];

export type MethodCallingResolver<Method extends MethodArgsRetPair> = (
  value: Method[1] | PromiseLike<Method[1]>
) => void;

export class MethodCalleeCallingPort<
  Sel extends Sels,
  Sels extends MethodSelector,
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
  _recv(args: Methods[Sel][1]) {
    return this.send(this.method(...args));
  }
}

export class MethodCallerCallingPort<
  Sel extends Sels,
  Sels extends MethodSelector,
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

  protected _recv(ret: Methods[Sel][1]): boolean {
    if (!this.resolver) {
      throw new Error("No resolver specified!");
    }
    let successed = this.caller.applyRet<Sel>(this.resolver, ret);
    this.resolver = null;
    return successed;
  }
}

export class MethodCallee<
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> {
  constructor(methods: MethodFunctions<Sels, Methods>) {
    this.methods = methods;
  }

  readonly ctrlPort = new MethodCalleeCtrlPort<Sels, Methods>(this);

  protected methods: MethodFunctions<Sels, Methods>;
  protected callingExtender = new MethodCalleeCallingPortExtender<
    Sels,
    Methods
  >();

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
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> {
  readonly ctrlPort = new MethodCallerCtrlPort<Sels, Methods>();

  private readonly callingExtender = new MethodCallerCallingPortExtender<
    Sels,
    Methods
  >();

  protected crtSerialNo = 0;

  createCallingConnection<Sel extends Sels>(
    sel: Sel
  ): MethodCallerCallingPort<Sel, Sels, Methods> {
    const newPort = new MethodCallerCallingPort<Sel, Sels, Methods>(this);
    Port.connect(
      this.callingExtender.createInside<Sel>(this.crtSerialNo++),
      newPort
    );
    return newPort;
  }

  async call<Sel extends Sels>(
    sel: Sel,
    ...args: Methods[Sel][0]
  ): Promise<Methods[Sel][1]> {
    return new Promise<Methods[Sel][1]>(async (resolve, reject) => {
      const port = this.createCallingConnection<Sel>(sel);
      port.setResolver(resolve);
      port.send(args);
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
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> = [serialNo: MethodCallingSerialNo, args: Methods[Sels][0]];

export type MethodReturningParamsCollected<
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> = [serialNo: MethodCallingSerialNo, ret: Methods[Sels][1]];

export class MethodCalleeCallingExtenderOutsidePort<
  Sels extends MethodSelector,
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
  protected _recv(serialNo: number, args: Methods[Sels][0]): boolean {
    return this.extender.forwardInside(serialNo, args);
  }
}

export class MethodCallerCallingExtenderOutsidePort<
  Sels extends MethodSelector,
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
  protected _recv(serialNo: number, args: Methods[Sels][0]): boolean {
    return this.extender.forwardInside(serialNo, args);
  }
}

export class MethodCalleeCallingExtenderInsidePort<
  Sel extends Sels,
  Sels extends MethodSelector,
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
    this.sendSerialNo = serialNo;
    this.extender = extender;
  }
  sendSerialNo: MethodCallingSerialNo;
  extender: MethodCalleeCallingPortExtender<Sels, Methods>;
  protected _recv(ret: Methods[Sel][1]): boolean {
    return this.extender.forwardOutside(this.sendSerialNo, ret);
  }
}

export class MethodCallerCallingExtenderInsidePort<
  Sel extends Sels,
  Sels extends MethodSelector,
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
    this.sendSerialNo = serialNo;
    this.extender = extender;
  }
  sendSerialNo: MethodCallingSerialNo;
  extender: MethodCallerCallingPortExtender<Sels, Methods>;
  protected _recv(ret: Methods[Sel][1]): boolean {
    return this.extender.forwardOutside(this.sendSerialNo, ret);
  }
}

export class MethodCalleeCallingPortExtender<
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> {
  toOutside = new MethodCalleeCallingExtenderOutsidePort<Sels, Methods>(this);

  toInside: Record<
    MethodCallingSerialNo,
    {
      [Sel in Sels]: MethodCalleeCallingExtenderInsidePort<Sel, Sels, Methods>;
    }[Sels]
  > = {};

  createInside<Sel extends Sels>(
    serialNo: MethodCallingSerialNo
  ): MethodCalleeCallingExtenderInsidePort<Sel, Sels, Methods> {
    const newPort = new MethodCalleeCallingExtenderInsidePort<
      Sel,
      Sels,
      Methods
    >(serialNo, this);
    this.toInside[serialNo] = newPort as any;
    return newPort;
  }

  forwardInside(
    serialNo: MethodCallingSerialNo,
    args: Methods[Sels][0]
  ): boolean {
    let port = this.toInside[serialNo];
    if (!port) return false;
    return port.send(args);
  }

  forwardOutside(
    serialNo: MethodCallingSerialNo,
    ret: Methods[Sels][1]
  ): boolean {
    return this.toOutside.send(serialNo, ret);
  }
}

export class MethodCallerCallingPortExtender<
  Sels extends MethodSelector,
  Methods extends MethodMethodsData<Sels>
> {
  toOutside = new MethodCallerCallingExtenderOutsidePort<Sels, Methods>(this);

  toInside: Record<
    MethodCallingSerialNo,
    {
      [Sel in Sels]: MethodCallerCallingExtenderInsidePort<Sel, Sels, Methods>;
    }[Sels]
  > = {};

  createInside<Sel extends Sels>(
    serialNo: MethodCallingSerialNo
  ): MethodCallerCallingExtenderInsidePort<Sel, Sels, Methods> {
    const newPort = new MethodCallerCallingExtenderInsidePort<
      Sel,
      Sels,
      Methods
    >(serialNo, this);
    this.toInside[serialNo] = newPort as any;
    return newPort;
  }

  forwardInside(
    serialNo: MethodCallingSerialNo,
    args: Methods[Sels][0]
  ): boolean {
    let port = this.toInside[serialNo];
    if (!port) return false;
    return port.send(args);
  }

  forwardOutside(
    serialNo: MethodCallingSerialNo,
    ret: Methods[Sels][1]
  ): boolean {
    return this.toOutside.send(serialNo, ret);
  }
}

/*
    [[Callee]]
        + [ctrlPort] <<===================================================>> ...the opposite ctrlPort -------+
        + [callingPort1] <<>> [inside1] +                                                                    +-(Caller)
        + [callingPort2] <<>> [inside2] +--CallingExtender--[outside] <<==>> ...the opposite CallingExtender +
        + [callingPort3] <<>> [inside3] +
*/
