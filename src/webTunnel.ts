import { Param,Port } from "./port.js";
import { Tunnel } from "./tunnel.js";
import { Socket } from "node:net";

export class WebTunnelSidePort<
  ParamsI extends Param[],
  ParamsO extends Param[]
> extends Port<ParamsI,ParamsO> {
    constructor(){
      super();
    }
    socket = new Socket();
    protected _recv(...params: ParamsI): boolean {
        
    }
}
