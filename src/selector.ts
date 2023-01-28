type SelectorDomain = string;

class SelectorInstance {
  constructor(domain: SelectorDomain, id: number, msg: string) {
    this.domain = domain;
    this.id = id;
    this.msg = msg;
  }
  toUniqueString(): string {
    return `${this.domain}::${this.id}("${this.msg}")`;
  }
  private readonly domain: SelectorDomain;
  private readonly id: number;
  private readonly msg: string;
}

class SelectorFactory {
  private static domain:SelectorDomain = Date.now().toFixed(0);
  private static selectorTable: Record<number, SelectorInstance> = {};
  private static crtId = 0;

  static from(x: {
    domain: SelectorDomain;
    id: number;
  }): SelectorInstance | undefined {
    if (x.domain !== this.domain) {
      throw new Error(
        `Cannor get the Selector from domain "${x.domain}" in domain "${this.domain}"!`
      );
    }
    return this.selectorTable[x.id];
  }

  static new(msg: string): SelectorInstance {
    return (this.selectorTable[this.crtId] = new SelectorInstance(
      this.domain,
      this.crtId++,
      msg
    ));
  }
}

export type Selector = string;

export function Selector(msg = ""): Selector {
  return SelectorFactory.new(msg).toUniqueString();
}
Selector.from = SelectorFactory.from.bind(SelectorFactory);
