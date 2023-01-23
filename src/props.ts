import { ForwardPort } from "./forwardPort.js";
import { PropsVersion, serializable2Hash } from "./serializable2Hash.js";
import { Serializable } from "./serializableType.js";

export type PropsSelector = string;

export type PropsType<Sels extends PropsSelector> = {
  [Sel in Sels]: Serializable;
};

export type PropsPatchParams<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>
> = {
  [Sel in Sels]: [
    oldVer: PropsVersion,
    newVer: PropsVersion,
    sel: Sel,
    newVal: Props[Sel]
  ];
}[Sels];

export type PropsExposer2ShadowActionType = "init" | "patch";

export type PropsExposer2ShadowActionArgs<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>
> = {
  init: [propsVal: Props, propsVersion: PropsVersion];
  patch: PropsPatchParams<Sels, Props>;
};

export type PropsExposer2ShadowParams<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>,
  ActionType extends PropsExposer2ShadowActionType
> = {
  [A in ActionType]: [
    actionType: A,
    ...args: PropsExposer2ShadowActionArgs<Sels, Props>[A]
  ];
}[ActionType];

export type PropsShadow2ExposerActionType = "patch";

export type PropsShadow2ExposerActionArgs<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>
> = {
  patch: PropsPatchParams<Sels, Props>;
};

export type PropsShadow2ExposerParams<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>,
  ActionType extends PropsShadow2ExposerActionType
> = {
  [A in ActionType]: [
    actionType: A,
    ...args: PropsShadow2ExposerActionArgs<Sels, Props>[A]
  ];
}[ActionType];

export class PropsExposerPort<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>
> extends ForwardPort<
  PropsShadow2ExposerParams<Sels, Props, PropsShadow2ExposerActionType>,
  PropsExposer2ShadowParams<Sels, Props, PropsExposer2ShadowActionType>
> {}

export class PropsShadowPort<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>
> extends ForwardPort<
  PropsExposer2ShadowParams<Sels, Props, PropsExposer2ShadowActionType>,
  PropsShadow2ExposerParams<Sels, Props, PropsShadow2ExposerActionType>
> {}

export class PropsExtenderShadowBase<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>
> {
  constructor() {
    this.propsVersion = this.updateVersion(); // To avoid TS error
  }

  protected _props: Props | null = null;

  get props(): Props | null {
    return this._props;
  }

  protected propsVersion: PropsVersion;

  protected updateVersion(): PropsVersion {
    return (this.propsVersion = serializable2Hash(this._props));
  }
}
export class PropsExposer<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>
> extends PropsExtenderShadowBase<Sels, Props> {
  port = new PropsExposerPort<Sels, Props>(this.recv.bind(this));

  init(props: Props) {
    this._props = props;
    this.propsVersion = serializable2Hash(this._props);
    this.port.send("init", this._props, this.propsVersion);
  }

  patch<Sel extends Sels>(sel: Sel, newVal: Props[Sel]) {
    const oldVer = this.propsVersion;
    if (!this._props) throw new Error("Cannot patch null props!");
    this._props[sel] = newVal;
    const newVer = this.updateVersion();
    // See https://github.com/microsoft/TypeScript/issues/52354, that's why I use `any` next line
    this.port.send(...(["patch", oldVer, newVer, sel, newVal] as any));
  }

  protected recv<ActionType extends PropsShadow2ExposerActionType>(
    actionType: ActionType,
    ...args: PropsShadow2ExposerActionArgs<Sels, Props>[ActionType]
  ): boolean {
    switch (actionType) {
      case "patch": {
        const [oldVer, newVer, sel, newVal] = args;
        if (oldVer !== this.propsVersion) {
          return false;
        }
        if (!this._props) throw new Error("Cannot patch null props!");
        this._props[sel] = newVal;
        this.propsVersion = newVer;
      }
    }
    return false;
  }
}

export class PropsShadow<
  Sels extends PropsSelector,
  Props extends PropsType<Sels>
> extends PropsExtenderShadowBase<Sels, Props> {
  // The using of `any` next line may because of https://github.com/microsoft/TypeScript/issues/52354
  port = new PropsShadowPort<Sels, Props>(this.recv.bind(this) as any);

  patch<Sel extends Sels>(sel: Sel, newVal: Props[Sel]) {
    const oldVer = this.propsVersion;
    if (!this._props) throw new Error("Cannot patch null props!");
    this._props[sel] = newVal;
    const newVer = this.updateVersion();
    this.port.send("patch", oldVer, newVer, sel, newVal);
  }

  protected recv<ActionType extends PropsExposer2ShadowActionType>(
    actionType: ActionType,
    ...args: PropsExposer2ShadowActionArgs<Sels, Props>[ActionType]
  ): boolean {
    switch (actionType) {
      case "init": {
        const [propsVal, propsVersion] = args as PropsExposer2ShadowActionArgs<
          Sels,
          Props
        >["init"];
        this._props = propsVal;
        this.propsVersion = propsVersion;
      }
      case "patch": {
        const [_oldVer, newVer, sel, newVal] =
          args as PropsExposer2ShadowActionArgs<Sels, Props>["patch"];
        // No matter what `oldVer` is, the Shadow props must follow the Exposer,
        //  so `_oldVer` is not used here.
        // Maybe we can report it to Exposer when `oldVer`!==`this.propsVersion` if necessary.
        if (!this._props) throw new Error("Cannot patch null props!");
        this._props[sel] = newVal;
        this.propsVersion = newVer;
      }
    }
    return false;
  }
}
