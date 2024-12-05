export enum AVLNodeType {
  ROOT = 'root',
  LEFT = 'left',
  RIGHT = 'right'
}

export class AVLNode<Key, T> {
  balanceFactor = 0;
  left: AVLNode<Key, T> | null = null;
  right: AVLNode<Key, T> | null = null;
  constructor(
    public key: Key,
    public value: T,
    public parent: AVLNode<Key, T> | null = null,
    public type = AVLNodeType.ROOT
  ) {
    if (!parent) this.type = AVLNodeType.ROOT;
  }

  get depth(): number {
    return 1 + Math.max(this.left?.depth ?? 0, this.right?.depth ?? 0);
  }

  get prev() {
    let current = this.left;
    while (current?.right) current = current.right;
    return current as (AVLNode<Key, T> & { type: AVLNodeType.RIGHT }) | null;
  }

  get next() {
    let current = this.right;
    while (current?.left) current = current.left;
    return current as (AVLNode<Key, T> & { type: AVLNodeType.LEFT }) | null;
  }

  get min() {
    let current: AVLNode<Key, T> = this;
    while (current?.left) current = current.left;
    return current;
  }

  get max() {
    let current: AVLNode<Key, T> = this;
    while (current?.right) current = current.right;
    return current;
  }
}
