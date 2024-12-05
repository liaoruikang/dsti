import { LinkedList } from '@dsti/linkedlist';
import { ContainerIterator } from '@dsti/shared';

export class Queue<T> extends ContainerIterator<number, T> {
  private _data = new LinkedList<T>();

  constructor(iterable?: Iterable<T>) {
    super();
    if (iterable) for (const value of iterable) this.enqueue(value);
  }

  get size() {
    return this._data.size;
  }
  get isEmpty() {
    return this._data.isEmpty;
  }

  enqueue(value: T) {
    this._data.push(value);
  }

  dequeue() {
    return this._data.shift();
  }

  peek() {
    return this._data.head;
  }

  clear() {
    this._data.clear();
  }

  forEach(callback: (value: T, key: number) => void): void {
    this._data.forEach(callback);
  }
}
