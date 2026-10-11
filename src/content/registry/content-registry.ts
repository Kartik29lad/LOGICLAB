import type {
  ContentPackage,
  ContentRegistryReference,
  ContentRegistryReferenceProvider,
  SourceContentType,
} from "../schema/content-types";

export class ContentRegistry implements ContentRegistryReferenceProvider {
  private readonly entries = new Map<string, ContentRegistryReference>();
  private readonly algorithms = new Set<string>();
  private readonly dataStructures = new Set<string>();
  private readonly challenges = new Set<string>();
  private readonly learningPaths = new Set<string>();
  private readonly visualizations = new Set<string>();

  public register(content: ContentPackage): void {
    const { slug, type, visualizationType } = content.metadata;
    if (this.entries.has(slug)) throw new Error(`Content slug already registered: ${slug}`);
    this.entries.set(slug, { slug, type, package: content });
    if (type === "ALGORITHM") this.algorithms.add(content.metadata.implementationSlug ?? slug);
    if (type === "DATA_STRUCTURE")
      this.dataStructures.add(content.metadata.implementationSlug ?? slug);
    if (type === "CHALLENGE") this.challenges.add(slug);
    if (type === "LEARNING_PATH") this.learningPaths.add(slug);
    if (visualizationType) this.visualizations.add(visualizationType);
  }

  public registerAlgorithm(slug: string): void {
    this.algorithms.add(slug);
  }
  public registerDataStructure(slug: string): void {
    this.dataStructures.add(slug);
  }
  public registerChallenge(slug: string): void {
    this.challenges.add(slug);
  }
  public registerLearningPath(slug: string): void {
    this.learningPaths.add(slug);
  }
  public registerVisualization(type: string): void {
    this.visualizations.add(type);
  }

  public hasAlgorithm(slug: string): boolean {
    return this.algorithms.has(slug);
  }
  public hasDataStructure(slug: string): boolean {
    return this.dataStructures.has(slug);
  }
  public hasChallenge(slug: string): boolean {
    return this.challenges.has(slug);
  }
  public hasLearningPath(slug: string): boolean {
    return this.learningPaths.has(slug);
  }
  public hasVisualization(type: string): boolean {
    return this.visualizations.has(type);
  }

  public get(slug: string): ContentPackage | undefined {
    return this.entries.get(slug)?.package;
  }
  public list(type?: SourceContentType): ContentPackage[] {
    return [...this.entries.values()]
      .filter((entry) => !type || entry.type === type)
      .map((entry) => entry.package);
  }
}

export function buildContentRegistry(content: ContentPackage[]): ContentRegistry {
  const registry = new ContentRegistry();
  for (const item of content) registry.register(item);
  return registry;
}
