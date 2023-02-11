import { DiodeInPort } from "./diodePort";
import { Data } from "./port";

export class ReadonlyPropPort<
  K extends string | number | symbol,
  T extends Data
> extends DiodeInPort<
  [
    [[], T] //get
  ]
> {
  constructor(obj: { readonly [Key in K]: T }, key: K) {
    super();
    this.obj = obj;
    this.key = key;
  }
  protected readonly obj: { [key in K]: T };
  protected readonly key: K;

  protected async _recv(): Promise<T> {
    return this.obj[this.key];
  }
}

export class PropPort<
  K extends string | number | symbol,
  T extends Data
> extends DiodeInPort<
  [
    [[], T], //get
    [[v: T], void] //set
  ]
> {
  constructor(obj: { [Key in K]: T }, key: K) {
    super();
    this.obj = obj;
    this.key = key;
  }
  protected readonly obj: { [key in K]: T };
  protected readonly key: K;

  protected async _recv(v: T): Promise<void>;
  protected async _recv(): Promise<T>;
  protected async _recv(v?: T): Promise<T | void> {
    if (v == undefined) {
      return this.obj[this.key];
    } else {
      this.obj[this.key] = v;
      return;
    }
  }
}
