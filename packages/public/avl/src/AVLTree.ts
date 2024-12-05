import { BSNode, BSNodeType, BSTree } from '@dsti/bstree';
import { isUndefined } from '@dsti/shared';
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

export interface AVLNode<Key, T> extends BSNode<Key, T> {
  balanceFactor?: number;
  left: AVLNode<Key, T> | null;
  right: AVLNode<Key, T> | null;
  parent: AVLNode<Key, T> | null;
}

export class AVLTree<T, Key = number> extends BSTree<T, Key> {
  declare protected _root: AVLNode<Key, T> | null;

  protected _insert(key: Key, value: T): AVLNode<Key, T> | null {
    const current = super._insert(key, value);
    let node: AVLNode<Key, T> | null = current?.parent ?? null;
    let type = current?.type;
    while (node && !isUndefined(type)) {
      node.balanceFactor ??= 0;
      node.balanceFactor += type === BSNodeType.LEFT ? 1 : -1;
      if (node.balanceFactor === 0) return current;
      if (Math.abs(node.balanceFactor) > 1) break;
      type = node.type;
      node = node.parent;
    }
    node && this._adjustment(node);
    return current;
  }
  protected _remove(key: Key): AVLNode<Key, T> | null {
    const target: AVLNode<Key, T> | null = super._remove(key);
    if (!target) return null;
    let node = target.parent ?? null;
    let type = target.type;
    while (node) {
      node.balanceFactor ??= 0;
      node.balanceFactor += type === BSNodeType.LEFT ? -1 : 1;
      if (
        (Math.abs(node.balanceFactor) > 1 &&
          !(node = this._adjustment(node) ?? null)) ||
        node.balanceFactor !== 0
      )
        break;
      type = node.type;
      node = node.parent;
    }
    return target;
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
    const { left, right } = node;

    let balanceFactor: number | undefined;
    switch (type) {
      case AVLRotateType.LL:
        if (left && this._rotateRight(node))
          node.balanceFactor = left.balanceFactor = 0;
        break;
      case AVLRotateType.RR:
        if (right && this._rotateLeft(node))
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
