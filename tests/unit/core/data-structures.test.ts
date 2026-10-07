import { describe, expect, it } from "vitest";

import {
  BinarySearchTree,
  DoublyLinkedList,
  HashTable,
  MaxHeap,
  MinHeap,
  Queue,
  SinglyLinkedList,
  Stack,
  Trie,
} from "../../../src/core/data-structures";

describe("Phase 5: Core Data Structures", () => {
  describe("Stack (LIFO)", () => {
    it("obeys last-in first-out semantics", () => {
      const stack = new Stack<number>();
      stack.push(10);
      stack.push(20);
      stack.push(30);

      expect(stack.size()).toBe(3);
      expect(stack.peek()).toBe(30);
      expect(stack.pop()).toBe(30);
      expect(stack.pop()).toBe(20);
      expect(stack.pop()).toBe(10);
      expect(stack.pop()).toBeUndefined();
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe("Queue (FIFO)", () => {
    it("obeys first-in first-out semantics", () => {
      const queue = new Queue<string>();
      queue.enqueue("a");
      queue.enqueue("b");
      queue.enqueue("c");

      expect(queue.size()).toBe(3);
      expect(queue.peek()).toBe("a");
      expect(queue.dequeue()).toBe("a");
      expect(queue.dequeue()).toBe("b");
      expect(queue.dequeue()).toBe("c");
      expect(queue.dequeue()).toBeUndefined();
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe("Linked Lists", () => {
    it("handles SinglyLinkedList insertions, deletions, and lookups", () => {
      const list = new SinglyLinkedList<number>();
      list.insertTail(1);
      list.insertTail(2);
      list.insertHead(0);

      expect(list.toArray()).toEqual([0, 1, 2]);
      expect(list.size()).toBe(3);
      expect(list.find((x) => x === 1)).toBe(1);

      expect(list.delete(1)).toBe(true);
      expect(list.toArray()).toEqual([0, 2]);
      expect(list.size()).toBe(2);
    });

    it("handles DoublyLinkedList bidirectional link operations", () => {
      const list = new DoublyLinkedList<string>();
      list.insertTail("B");
      list.insertHead("A");
      list.insertTail("C");

      expect(list.toArray()).toEqual(["A", "B", "C"]);
      expect(list.head?.value).toBe("A");
      expect(list.tail?.value).toBe("C");
      expect(list.head?.next?.prev?.value).toBe("A");

      expect(list.delete("B")).toBe(true);
      expect(list.toArray()).toEqual(["A", "C"]);
      expect(list.head?.next?.value).toBe("C");
      expect(list.tail?.prev?.value).toBe("A");
    });
  });

  describe("Binary Heap (Priority Queue)", () => {
    it("MinHeap maintains minimum element at root", () => {
      const minHeap = new MinHeap();
      minHeap.push(30);
      minHeap.push(10);
      minHeap.push(50);
      minHeap.push(5);

      expect(minHeap.peek()).toBe(5);
      expect(minHeap.pop()).toBe(5);
      expect(minHeap.pop()).toBe(10);
      expect(minHeap.pop()).toBe(30);
      expect(minHeap.pop()).toBe(50);
    });

    it("MaxHeap maintains maximum element at root", () => {
      const maxHeap = new MaxHeap();
      maxHeap.push(10);
      maxHeap.push(40);
      maxHeap.push(20);
      maxHeap.push(99);

      expect(maxHeap.peek()).toBe(99);
      expect(maxHeap.pop()).toBe(99);
      expect(maxHeap.pop()).toBe(40);
      expect(maxHeap.pop()).toBe(20);
      expect(maxHeap.pop()).toBe(10);
    });
  });

  describe("Hash Table", () => {
    it("stores and retrieves key-value pairs with collision resolution", () => {
      const ht = new HashTable<string, number>(4); // small capacity to force collisions
      ht.set("alpha", 1);
      ht.set("beta", 2);
      ht.set("gamma", 3);
      ht.set("delta", 4);

      expect(ht.get("alpha")).toBe(1);
      expect(ht.get("gamma")).toBe(3);
      expect(ht.has("beta")).toBe(true);
      expect(ht.has("omega")).toBe(false);

      expect(ht.delete("beta")).toBe(true);
      expect(ht.has("beta")).toBe(false);
      expect(ht.size()).toBe(3);
    });
  });

  describe("Binary Search Tree", () => {
    it("maintains sorted order during inOrder traversal", () => {
      const bst = new BinarySearchTree();
      [50, 30, 70, 20, 40, 60, 80].forEach((v) => bst.insert(v));

      expect(bst.inOrder()).toEqual([20, 30, 40, 50, 60, 70, 80]);
      expect(bst.min()).toBe(20);
      expect(bst.max()).toBe(80);
      expect(bst.search(40)).not.toBeNull();
      expect(bst.search(999)).toBeNull();
    });
  });

  describe("Trie (Prefix Tree)", () => {
    it("indexes words and performs prefix searches", () => {
      const trie = new Trie();
      trie.insert("apple");
      trie.insert("app");
      trie.insert("application");
      trie.insert("banana");

      expect(trie.search("apple")).toBe(true);
      expect(trie.search("app")).toBe(true);
      expect(trie.search("appl")).toBe(false);
      expect(trie.startsWith("app")).toBe(true);
      expect(trie.startsWith("ban")).toBe(true);
      expect(trie.startsWith("cat")).toBe(false);

      const matches = trie.wordsWithPrefix("app");
      expect(matches).toContain("app");
      expect(matches).toContain("apple");
      expect(matches).toContain("application");
      expect(matches).not.toContain("banana");
    });
  });
});
