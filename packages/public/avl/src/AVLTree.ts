import { ContainerIterator } from '@dsti/shared';
import { AVLNode, AVLNodeType } from './AVLNode';
enum AVLRotateType {
  LL,
  RR,
  LR,
  RL
}

export enum AVLTraverseType {
  PREORDER,
  INORDER,
  POSTORDER,
  ORDER
}

export type AVLKeyValue<Key, T> = [key: Key, value: T];
export type AVLComparer<Key> = (a: Key, b: Key) => number;

type AVLTreeArgs<Key, T> = Key extends number
  ? [
      iterable?: Iterable<AVLKeyValue<Key, T>>,
      comparer?: AVLComparer<Key>,
      repeatable?: boolean
    ]
  : [
      iterable: Iterable<AVLKeyValue<Key, T>> | undefined | null,
      comparer: AVLComparer<Key>,
      repeatable?: boolean
    ];

export class AVLTree<T, Key = number> extends ContainerIterator<Key, T> {
  private _root: AVLNode<Key, T> | null = null;
  private _comparer: AVLComparer<Key>;
  private _size = 0;
  private _repeatable: boolean;

  constructor(...[iterable, comparer, repeatable]: AVLTreeArgs<Key, T>) {
    super();
    this._repeatable = repeatable ?? false;
    this._comparer =
      comparer ?? ((a, b) => Math.sign((a as number) - (b as number)));
    if (iterable) this.batchInsert(iterable);
  }

  get depth() {
    return this._root?.depth ?? 0;
  }

  get size() {
    return this._size;
  }

  get isEmpty() {
    return this._size === 0;
  }

  insert(key: Key, value: T): this {
    if (this._root === null) {
      this._root = new AVLNode(key, value!);
      this._size++;
      return this;
    }

    let current = this._root;
    let type: AVLNodeType | undefined = void 0;
    while (type === void 0) {
      let comp = this._comparer(key, current.key);
      if (this._repeatable && comp === 0) comp = 1;
      if (comp === 1)
        if (current.right === null) type = AVLNodeType.RIGHT;
        else current = current.right;
      else if (comp === -1)
        if (current.left === null) type = AVLNodeType.LEFT;
        else current = current.left;
      else if (comp === 0) return (current.value = value!), this;
      else return this;
    }

    current[type] = new AVLNode(key, value!, current, type);

    this._size++;

    let node: AVLNode<Key, T> | null = current;
    do {
      node.balanceFactor += type === AVLNodeType.LEFT ? 1 : -1;
      if (node.balanceFactor === 0) return this;
      if (Math.abs(node.balanceFactor) > 1) break;
      type = node.type;
      node = node.parent;
    } while (node);

    node && this._adjustment(node);

    return this;
  }

  batchInsert(nodes: Iterable<AVLKeyValue<Key, T>>) {
    for (const [key, value] of nodes) this.insert(key, value);
    return this;
  }

  find(key: Key) {
    return this._findNode(key)?.value;
  }

  remove(key: Key | Key[]) {
    if (!Array.isArray(key)) key = [key];

    key.forEach(k => {
      let target = this._findNode(k);
      if (!target) return;
      let prev, next;
      if ((next = target.next)) {
        target.key = next.key;
        target.value = next.value;

        next.parent![next.type] = next.right;
        if (next.right) next.right.type = next.type;

        target = next;
      } else if ((prev = target.prev)) {
        target.key = prev.key;
        target.value = prev.value;

        prev.parent![prev.type] = prev.left;
        if (prev.left) prev.left.type = prev.type;

        target = prev;
      } else if (this._notRoot(target)) target.parent[target.type] = null;
      else this._root = null;

      let node = target.parent ?? null;
      let type = target.type;
      while (node) {
        node.balanceFactor += type === AVLNodeType.LEFT ? -1 : 1;
        if (
          (Math.abs(node.balanceFactor) > 1 &&
            !(node = this._adjustment(node) ?? null)) ||
          node.balanceFactor !== 0
        )
          break;
        type = node.type;
        node = node.parent;
      }
      this._size--;
    });

    return this;
  }

  forEach(
    callback: (value: T, key: Key) => void,
    type = AVLTraverseType.INORDER
  ) {
    if (type === AVLTraverseType.PREORDER) this._preorder(callback);
    else if (type === AVLTraverseType.INORDER) this._inorder(callback);
    else if (type === AVLTraverseType.POSTORDER) this._postorder(callback);
    else this._order(callback);
  }

  prev(key: Key): AVLKeyValue<Key, T> | null {
    const node = this._findNode(key);
    if (!node) return null;
    const prev = node.prev;
    if (!prev) return null;
    return [prev.key, prev.value];
  }

  next(key: Key): AVLKeyValue<Key, T> | null {
    const node = this._findNode(key);
    if (!node) return null;
    const next = node.next;
    if (!next) return null;
    return [next.key, next.value];
  }

  min() {
    return this._root?.min?.value;
  }

  max() {
    return this._root?.max?.value;
  }

  clear() {
    this._root = null;
    this._size = 0;
  }

  has(key: Key) {
    return !!this._findNode(key);
  }

  private _isRoot(
    node: AVLNode<Key, T>
  ): node is AVLNode<Key, T> & { parent: null; type: AVLNodeType.ROOT } {
    return node.type === AVLNodeType.ROOT;
  }

  private _notRoot(node: AVLNode<Key, T>): node is AVLNode<Key, T> & {
    parent: AVLNode<Key, T>;
    type: AVLNodeType.LEFT | AVLNodeType.RIGHT;
  } {
    return !this._isRoot(node);
  }

  private _findNode(key: Key) {
    let current = this._root;
    while (current) {
      const comp = this._comparer(key, current.key);
      if (comp === -1) current = current.left;
      else if (comp === 1) current = current.right;
      else if (comp === 0) return current;
    }
    return null;
  }

  private _preorder(callback: (value: T, key: Key) => void) {
    let current = this._root;
    const stack: AVLNode<Key, T>[] = [];
    while (current || stack.length) {
      if (current) {
        callback(current.value, current.key);
        stack.push(current);
        current = current.left;
        continue;
      }

      current = stack.pop()!.right;
    }
  }

  private _inorder(callback: (value: T, key: Key) => void) {
    let current = this._root;
    const stack: AVLNode<Key, T>[] = [];
    while (current || stack.length) {
      if (current) {
        stack.push(current);
        current = current.left;
        continue;
      }
      const node = stack.pop()!;
      callback(node.value, node.key), (current = node.right);
    }
  }

  private _postorder(callback: (value: T, key: Key) => void) {
    let visited: AVLNode<Key, T> | null = null;
    let current = this._root;
    const stack: AVLNode<Key, T>[] = [];
    while (current || stack.length) {
      if (current) {
        stack.push(current);
        current = current.left;
        continue;
      }
      const node = stack[stack.length - 1];
      if (node.right && node.right !== visited) {
        current = node.right;
        continue;
      }

      callback(node.value, node.key);
      current = null;
      visited = node;
      stack.pop();
    }
  }

  private _order(callback: (value: T, key: Key) => void) {
    if (!this._root) return;
    const queue: AVLNode<Key, T>[] = [this._root];
    while (queue.length) {
      const node = queue.shift()!;
      callback(node.value, node.key);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  private _adjustment(node: AVLNode<Key, T>): AVLNode<Key, T> | undefined {
    const rotateType = this._getRotateType(node);
    if (rotateType !== void 0) return this._rotate(node, rotateType), node;
    else if (node.parent) return this._adjustment(node.parent);
  }

  private _getRotateType(node: AVLNode<Key, T>) {
    if (node.balanceFactor === 2) {
      if (node.left?.balanceFactor === 1) return AVLRotateType.LL;
      if (node.left?.balanceFactor === -1) return AVLRotateType.LR;
    }
    if (node.balanceFactor === -2) {
      if (node.right?.balanceFactor === -1) return AVLRotateType.RR;
      if (node.right?.balanceFactor === 1) return AVLRotateType.RL;
    }
  }

  private _rotate(node: AVLNode<Key, T>, type: AVLRotateType) {
    const { parent, left, right } = node;

    let balanceFactor: number | undefined;
    switch (type) {
      case AVLRotateType.LL:
        if (!left) break;

        left.parent = parent;
        if (this._notRoot(node)) parent![node.type] = left;
        else this._root = left;

        left.type = node.type;
        node.type = AVLNodeType.RIGHT;

        node.left = left.right;
        if (left.right)
          (left.right.parent = node), (left.right.type = AVLNodeType.LEFT);

        left.right = node;
        node.parent = left;

        node.balanceFactor = left.balanceFactor = 0;
        break;
      case AVLRotateType.RR:
        if (!right) break;
        right.parent = parent;
        if (this._notRoot(node)) parent![node.type] = right;
        else this._root = right;

        right.type = node.type;
        node.type = AVLNodeType.LEFT;

        node.right = right.left;
        if (right.left)
          (right.left.parent = node), (right.left.type = AVLNodeType.RIGHT);

        node.parent = right;
        right.left = node;

        node.balanceFactor = right.balanceFactor = 0;
        break;
      case AVLRotateType.LR:
        if (!left) break;
        balanceFactor = left.right?.balanceFactor;

        this._rotate(left, AVLRotateType.RR);
        this._rotate(node, AVLRotateType.LL);

        if (balanceFactor === -1) {
          left.balanceFactor = 1;
        } else if (balanceFactor === 1) {
          node.balanceFactor = -1;
        }

        break;
      case AVLRotateType.RL:
        if (!right) break;
        balanceFactor = right.left?.balanceFactor;

        this._rotate(right, AVLRotateType.LL);
        this._rotate(node, AVLRotateType.RR);

        if (balanceFactor === 1) {
          right.balanceFactor = -1;
        } else if (balanceFactor === -1) {
          node.balanceFactor = 1;
        }
        break;
    }
  }
}
