import { DiodeOutPort } from "./diodePort.js";
import { DiodeInForwardPort, ForwardPort } from "./forwardPort.js";
import { Data, Port, PortToConnect } from "./port.js";

export class Fork<ParamsToFork extends Data[], ParamsToMerge extends Data[]> {
  mergedPort = new ForwardPort<ParamsToFork, ParamsToMerge>(
    async (...params: ParamsToFork) => {
      return await this.forkedOutPort.send(...params);
    }
  );
  forkedInPort = new DiodeInForwardPort<ParamsToMerge>(
    async (...params: ParamsToMerge) => {
      return await this.mergedPort.send(...params);
    }
  );
  forkedOutPort = new DiodeOutPort<ParamsToFork>();

  static connect<ParamsToFork extends Data[], ParamsToMerge extends Data[]>(
    toMergedPort: PortToConnect<ForwardPort<ParamsToFork, ParamsToMerge>>,
    toForkedInPort: PortToConnect<DiodeInForwardPort<ParamsToMerge>>,
    toForkedOutPort: PortToConnect<DiodeOutPort<ParamsToFork>>
  ) {
    const s = new Fork<ParamsToFork, ParamsToMerge>();
    Port.connect(s.mergedPort, toMergedPort);
    Port.connect(s.forkedInPort, toForkedInPort);
    Port.connect(s.forkedOutPort, toForkedOutPort);
    return s;
  }
}
