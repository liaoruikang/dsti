import { ContainerIterator } from '@dsti/shared';
import { BSNode, BSNodeType } from './BSNode';

export enum BSTraverseType {
  PREORDER,
  INORDER,
  POSTORDER,
  ORDER
}

export type BSComparer<Key> = (a: Key, b: Key) => number;

type BSTreeArgs<Key, T> = Key extends number
  ? [
      iterable?: Iterable<[key: Key, value: T]>,
      comparer?: BSComparer<Key>,
      repeatable?: boolean
    ]
  : [
      iterable: Iterable<[key: Key, value: T]> | undefined | null,
      comparer: BSComparer<Key>,
      repeatable?: boolean
    ];

export class BSTree<T, Key = number> extends ContainerIterator<Key, T> {
  protected _root: BSNode<Key, T> | null = null;
  protected _comparer: BSComparer<Key>;
  protected _size = 0;
  protected _repeatable: boolean;

  constructor(...[iterable, comparer, repeatable]: BSTreeArgs<Key, T>) {
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

  insert(key: Key, value: T) {
    this._insert(key, value);
    return this;
  }

  batchInsert(nodes: Iterable<[key: Key, value: T]>) {
    for (const [key, value] of nodes) this.insert(key, value);
    return this;
  }

  find(key: Key) {
    return this._findNode(key)?.value;
  }

  remove(key: Key | Key[]) {
    if (!Array.isArray(key)) key = [key];

    key.forEach(k => this._remove(k));

    return this;
  }

  forEach(
    callback: (value: T, key: Key) => void,
    type = BSTraverseType.INORDER
  ) {
    if (type === BSTraverseType.PREORDER) this._preorder(callback);
    else if (type === BSTraverseType.INORDER) this._inorder(callback);
    else if (type === BSTraverseType.POSTORDER) this._postorder(callback);
    else this._order(callback);
  }

  prev(key: Key): [key: Key, value: T] | null {
    const node = this._findNode(key);
    if (!node) return null;
    const prev = node.prev;
    if (!prev) return null;
    return [prev.key, prev.value];
  }

  next(key: Key): [key: Key, value: T] | null {
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

  protected _insert(key: Key, value: T) {
    if (this._root === null) {
      this._root = new BSNode(key, value!);
      this._size++;
      return this._root;
    }
    let current = this._root;
    let type: BSNodeType | undefined = void 0;
    while (type === void 0) {
      let comp = this._comparer(key, current.key);
      if (this._repeatable && comp === 0) comp = 1;
      if (comp === 1)
        if (current.right === null) type = BSNodeType.RIGHT;
        else current = current.right;
      else if (comp === -1)
        if (current.left === null) type = BSNodeType.LEFT;
        else current = current.left;
      else if (comp === 0) return (current.value = value!), current;
      else return null;
    }

    this._size++;
    return (current[type] = new BSNode(key, value!, current, type));
  }

  protected _remove(key: Key) {
    let target = this._findNode(key);
    if (!target) return null;
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
    this._size--;
    return target;
  }

  protected _isRoot(
    node: BSNode<Key, T>
  ): node is BSNode<Key, T> & { parent: null; type: BSNodeType.ROOT } {
    return node.type === BSNodeType.ROOT;
  }

  protected _notRoot(node: BSNode<Key, T>): node is BSNode<Key, T> & {
    parent: BSNode<Key, T>;
    type: BSNodeType.LEFT | BSNodeType.RIGHT;
  } {
    return !this._isRoot(node);
  }

  protected _findNode(key: Key) {
    let current = this._root;
    while (current) {
      const comp = this._comparer(key, current.key);
      if (comp === -1) current = current.left;
      else if (comp === 1) current = current.right;
      else if (comp === 0) return current;
    }
    return null;
  }

  protected _preorder(callback: (value: T, key: Key) => void) {
    let current = this._root;
    const stack: BSNode<Key, T>[] = [];
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

  protected _inorder(callback: (value: T, key: Key) => void) {
    let current = this._root;
    const stack: BSNode<Key, T>[] = [];
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

  protected _postorder(callback: (value: T, key: Key) => void) {
    let visited: BSNode<Key, T> | null = null;
    let current = this._root;
    const stack: BSNode<Key, T>[] = [];
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

  protected _order(callback: (value: T, key: Key) => void) {
    if (!this._root) return;
    const queue: BSNode<Key, T>[] = [this._root];
    while (queue.length) {
      const node = queue.shift()!;
      callback(node.value, node.key);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }

  protected _rotateLeft(node: BSNode<Key, T>) {
    const { right, parent } = node;
    if (!right) return false;
    right.parent = parent;
    if (this._notRoot(node)) parent![node.type] = right;
    else this._root = right;

    right.type = node.type;
    node.type = BSNodeType.LEFT;

    node.right = right.left;
    if (right.left)
      (right.left.parent = node), (right.left.type = BSNodeType.RIGHT);

    node.parent = right;
    right.left = node;
    return true;
  }

  protected _rotateRight(node: BSNode<Key, T>) {
    const { left, parent } = node;
    if (!left) return false;
    left.parent = parent;
    if (this._notRoot(node)) parent![node.type] = left;
    else this._root = left;

    left.type = node.type;
    node.type = BSNodeType.RIGHT;

    node.left = left.right;
    if (left.right)
      (left.right.parent = node), (left.right.type = BSNodeType.LEFT);

    left.right = node;
    node.parent = left;
    return true;
  }
}
