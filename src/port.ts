import { Serializable } from "./serializableType.js";

export type Data = Serializable;

export type ParamsRetPair = [params: Data[], ret: Data | void];

export type IOType = ParamsRetPair[];

export type Receiver<Params extends Data[]> = (
  ...params: Params
) => Promise<boolean>;

export abstract class Port<TIn extends IOType, TOut extends IOType> {
  protected _linkedTo: Port<TOut, TIn> | null = null;

  public get linkedTo(): Port<TOut, TIn> | null {
    return this._linkedTo;
  }

  protected link(to: Port<TOut, TIn>): boolean {
    this._linkedTo = to;
    return true;
  }

  async send<K extends Extract<keyof TOut, number>>(
    ...params: TOut[K][0]
  ): Promise<TOut[K][1]> {
    if (!this.linkedTo) return false;
    return await this.linkedTo._recv.apply(this.linkedTo, params);
  }

  // async
  protected abstract _recv<K extends Extract<keyof TIn, number>>(
    ...params: TIn[K][0]
  ): Promise<TIn[K][1]>;

  static connect<TA2b extends IOType, TB2A extends IOType>(
    portA: Port<TB2A, TA2b>,
    portB: Port<TA2b, TB2A>
  ): boolean {
    return portA.link(portB) && portB.link(portA);
  }
}

export type PortToConnect<ThisPort extends Port<any, any>> =
  ThisPort extends Port<infer TIn, infer TOut> ? Port<TOut, TIn> : never;
