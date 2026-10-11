import type { CodeReference } from "../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "trie",
    source:
      'export class TrieNode {\n  public children: Map<string, TrieNode> = new Map();\n  public isEndOfWord = false;\n}\n\n/**\n * Prefix Tree (Trie) for dictionary string indexing.\n */\nexport class Trie {\n  public root: TrieNode = new TrieNode();\n\n  public insert(word: string): void {\n    let current = this.root;\n    for (const char of word.toLowerCase()) {\n      if (!current.children.has(char)) {\n        current.children.set(char, new TrieNode());\n      }\n      current = current.children.get(char)!;\n    }\n    current.isEndOfWord = true;\n  }\n\n  public search(word: string): boolean {\n    let current = this.root;\n    for (const char of word.toLowerCase()) {\n      if (!current.children.has(char)) return false;\n      current = current.children.get(char)!;\n    }\n    return current.isEndOfWord;\n  }\n\n  public startsWith(prefix: string): boolean {\n    let current = this.root;\n    for (const char of prefix.toLowerCase()) {\n      if (!current.children.has(char)) return false;\n      current = current.children.get(char)!;\n    }\n    return true;\n  }\n\n  public wordsWithPrefix(prefix: string): string[] {\n    let current = this.root;\n    for (const char of prefix.toLowerCase()) {\n      if (!current.children.has(char)) return [];\n      current = current.children.get(char)!;\n    }\n\n    const results: string[] = [];\n    function collect(node: TrieNode, path: string): void {\n      if (node.isEndOfWord) {\n        results.push(prefix.toLowerCase() + path);\n      }\n      for (const [char, child] of node.children.entries()) {\n        collect(child, path + char);\n      }\n    }\n\n    collect(current, "");\n    return results;\n  }\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 62 }],
  },
];
