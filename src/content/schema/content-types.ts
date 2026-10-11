export const CONTENT_TYPES = [
  "ALGORITHM",
  "DATA_STRUCTURE",
  "CHALLENGE",
  "LEARNING_PATH",
  "CONCEPT_EXPLANATION",
] as const;

export type SourceContentType = (typeof CONTENT_TYPES)[number];
export type DatabaseContentType = SourceContentType;
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface ComplexityContent {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  space: string;
  stable?: boolean;
  inPlace?: boolean;
}

export interface ExampleContent {
  id: string;
  title: string;
  description: string;
  input: unknown;
  output: unknown;
  explanation?: string;
}

export interface CodeStepMapping {
  action: string;
  startLine: number;
  endLine: number;
}

export interface CodeReference {
  language: "typescript" | "javascript" | "python" | "java" | "cpp";
  source: string;
  entryPoint?: string;
  stepMappings?: CodeStepMapping[];
}

export interface ContentLink {
  label: string;
  href: string;
  kind: "INTERNAL" | "EXTERNAL";
}

export interface ContentRelationship {
  slug: string;
  relationship: "PREREQUISITE" | "RELATED" | "NEXT" | "ALTERNATIVE";
}

export interface ChallengeContent {
  question: string;
  answer: string;
  explanation: string;
  hints: string[];
  expectedInteraction?: string;
}

export interface VisualizationContent {
  type: string;
  states: string[];
  events: string[];
  notes?: string[];
}

export interface ExecutionContent {
  inputRules: string[];
  metrics: string[];
  finalResult: string;
  edgeCases: string[];
  sampleTrace: string[];
}

export interface ContentMetadata {
  id: string;
  type: SourceContentType;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  learningObjectives: string[];
  prerequisites: string[];
  complexity?: ComplexityContent;
  examples: ExampleContent[];
  commonMistakes: string[];
  relatedContent: ContentRelationship[];
  links?: ContentLink[];
  implementationSlug?: string;
  visualizationType?: string;
  tags: string[];
  mainIdea?: string;
  howItWorks?: string[];
  whyItWorks?: string;
  useCases?: string[];
  supportedInputs?: string[];
  properties?: string[];
  terminology?: Array<{ term: string; definition: string; example?: string }>;
  formulas?: string[];
  supportedLanguages?: Array<"typescript" | "javascript" | "python" | "java" | "cpp">;
  practiceReferences?: string[];
  stepExplanations?: Array<{ event: string; explanation: string }>;
  isActive: boolean;
  schemaVersion: 1;
}

export interface ContentPackage {
  metadata: ContentMetadata;
  explanation: string;
  pseudocode?: string;
  code?: CodeReference[];
  visualization?: VisualizationContent;
  concepts?: string[];
  challenge?: ChallengeContent;
  execution?: ExecutionContent;
  learningPath?: { itemSlugs: string[]; order: number };
}

export interface ContentRegistryReference {
  slug: string;
  type: SourceContentType;
  package: ContentPackage;
}

export interface ContentRegistryReferenceProvider {
  hasAlgorithm(slug: string): boolean;
  hasDataStructure(slug: string): boolean;
  hasChallenge(slug: string): boolean;
  hasLearningPath(slug: string): boolean;
  hasVisualization(type: string): boolean;
}

export interface ContentValidationIssue {
  path: string;
  message: string;
}
