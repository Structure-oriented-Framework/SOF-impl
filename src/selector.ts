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
  private static domain = "__";
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

export class SelectorMap<V> {
  private readonly map = new Map<string, V>();
  clear() {
    this.map.clear();
  }
  delete(key: Selector) {
    return this.map.delete(key);
  }
  forEach(callbackfn: (value: V) => void, thisArg?: any): void {
    this.map.forEach((value) => {
      callbackfn.call(thisArg, value);
    });
  }
  get(key: Selector): V | undefined {
    return this.map.get(key);
  }
  has(key: Selector): boolean {
    return this.map.has(key);
  }
  set(key: Selector, value: V): this {
    this.map.set(key, value);
    return this;
  }
}
