import { ContainerIterator } from '@dsti/shared';

export class Stack<T> extends ContainerIterator<number, T> {
  private _data: T[] = [];

  constructor(iterable?: Iterable<T>) {
    super();
    if (iterable) for (const value of iterable) this.push(value);
  }

  get size() {
    return this._data.length;
  }

  get isEmpty() {
    return this.size === 0;
  }
  get top() {
    if (this.isEmpty) return;
    return this._data[this.size - 1];
  }

  push(value: T) {
    this._data.push(value);
  }

  pop() {
    return this._data.pop();
  }

  clear() {
    this._data = [];
  }

  forEach(callback: (value: T, key: number) => void): void {
    for (let i = this.size - 1; i >= 0; i--) callback(this._data[i], i);
  }
}
