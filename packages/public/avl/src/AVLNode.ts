import { BSNode, BSNodeType } from '@dsti/bstree';

export class AVLNode<Key, T> extends BSNode<Key, T> {
  balanceFactor = 0;
  declare left: AVLNode<Key, T> | null;
  declare right: AVLNode<Key, T> | null;
  declare parent: AVLNode<Key, T> | null;

  constructor(
    key: Key,
    value: T,
    parent?: AVLNode<Key, T> | null,
    type?: BSNodeType
  ) {
    super(key, value, parent, type);
  }
}
