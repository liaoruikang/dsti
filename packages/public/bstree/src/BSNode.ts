export enum BSNodeType {
  ROOT = 'root',
  LEFT = 'left',
  RIGHT = 'right'
}

export class BSNode<Key, T> {
  left: BSNode<Key, T> | null = null;
  right: BSNode<Key, T> | null = null;
  constructor(
    public key: Key,
    public value: T,
    public parent: BSNode<Key, T> | null = null,
    public type = BSNodeType.ROOT
  ) {
    if (!parent) this.type = BSNodeType.ROOT;
  }

  get prev() {
    let current = this.left;
    while (current?.right) current = current.right;
    return current as (BSNode<Key, T> & { type: BSNodeType.RIGHT }) | null;
  }

  get next() {
    let current = this.right;
    while (current?.left) current = current.left;
    return current as (BSNode<Key, T> & { type: BSNodeType.LEFT }) | null;
  }

  get min() {
    let current: BSNode<Key, T> = this;
    while (current?.left) current = current.left;
    return current;
  }

  get max() {
    let current: BSNode<Key, T> = this;
    while (current?.right) current = current.right;
    return current;
  }
}
