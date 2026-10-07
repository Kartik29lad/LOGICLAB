export class TrieNode {
  public children: Map<string, TrieNode> = new Map();
  public isEndOfWord = false;
}

/**
 * Prefix Tree (Trie) for dictionary string indexing.
 */
export class Trie {
  public root: TrieNode = new TrieNode();

  public insert(word: string): void {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
  }

  public search(word: string): boolean {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) return false;
      current = current.children.get(char)!;
    }
    return current.isEndOfWord;
  }

  public startsWith(prefix: string): boolean {
    let current = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) return false;
      current = current.children.get(char)!;
    }
    return true;
  }

  public wordsWithPrefix(prefix: string): string[] {
    let current = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) return [];
      current = current.children.get(char)!;
    }

    const results: string[] = [];
    function collect(node: TrieNode, path: string): void {
      if (node.isEndOfWord) {
        results.push(prefix.toLowerCase() + path);
      }
      for (const [char, child] of node.children.entries()) {
        collect(child, path + char);
      }
    }

    collect(current, "");
    return results;
  }
}
