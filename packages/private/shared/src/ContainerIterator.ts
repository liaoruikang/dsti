export abstract class ContainerIterator<Key, T> implements Iterable<[Key, T]> {
  [Symbol.iterator]() {
    return this.entries();
  }

  *entries() {
    for (const item of this._traverser()) yield item;
  }

  *values() {
    for (const item of this._traverser()) yield item[1];
  }

  *keys() {
    for (const item of this._traverser()) yield item[0];
  }

  private _traverser(): [Key, T][] {
    const result: [Key, T][] = [];
    this.forEach((value, key) => result.push([key, value]));
    return result;
  }

  abstract forEach(callback: (value: T, key: Key) => void): void;
}
