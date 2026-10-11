import {
  CONTENT_TYPES,
  type ContentPackage,
  type ContentRegistryReferenceProvider,
  type ContentValidationIssue,
} from "./content-types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const idPattern = /^[a-z0-9][a-z0-9._-]*$/;

function issue(issues: ContentValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function requiredString(issues: ContentValidationIssue[], value: unknown, path: string): void {
  if (typeof value !== "string" || value.trim().length === 0)
    issue(issues, path, "must be a non-empty string");
}

function stringArray(issues: ContentValidationIssue[], value: unknown, path: string): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === ""))
    issue(issues, path, "must be an array of non-empty strings");
}

function requiredRichEducationalFields(
  content: ContentPackage,
  issues: ContentValidationIssue[]
): void {
  const m = content.metadata;
  for (const [field, value] of [
    ["mainIdea", m.mainIdea],
    ["whyItWorks", m.whyItWorks],
  ] as const)
    requiredString(issues, value, `metadata.${field}`);
  for (const field of ["howItWorks", "useCases", "supportedInputs", "properties"] as const)
    stringArray(issues, m[field], `metadata.${field}`);
  if (!Array.isArray(m.terminology) || m.terminology.length === 0)
    issue(issues, "metadata.terminology", "must contain at least one term");
  if (!Array.isArray(m.supportedLanguages) || m.supportedLanguages.length === 0)
    issue(issues, "metadata.supportedLanguages", "must contain at least one language");
  if (!Array.isArray(m.practiceReferences) || m.practiceReferences.length === 0)
    issue(issues, "metadata.practiceReferences", "must contain at least one practice reference");
  if (!Array.isArray(m.stepExplanations) || m.stepExplanations.length === 0)
    issue(issues, "metadata.stepExplanations", "must contain step explanations");
  if (!Array.isArray(m.formulas) || m.formulas.length === 0)
    issue(issues, "metadata.formulas", "must contain at least one rule or formula");
  if (!content.execution) issue(issues, "execution", "is required for the initial catalog");
  if (content.execution) {
    stringArray(issues, content.execution.inputRules, "execution.inputRules");
    stringArray(issues, content.execution.metrics, "execution.metrics");
    stringArray(issues, content.execution.edgeCases, "execution.edgeCases");
    requiredString(issues, content.execution.finalResult, "execution.finalResult");
    if (!Array.isArray(content.execution.sampleTrace) || content.execution.sampleTrace.length < 3)
      issue(issues, "execution.sampleTrace", "must contain at least three execution steps");
  }
  if (!content.challenge) issue(issues, "challenge", "is required for the initial catalog");
  if (content.challenge) {
    for (const [field, value] of [
      ["question", content.challenge.question],
      ["answer", content.challenge.answer],
      ["explanation", content.challenge.explanation],
    ] as const)
      requiredString(issues, value, `challenge.${field}`);
    stringArray(issues, content.challenge.hints, "challenge.hints");
  }
  if (!content.pseudocode) issue(issues, "pseudocode", "is required for the initial catalog");
  if (!content.code || content.code.length === 0)
    issue(issues, "code", "must contain at least one language implementation");
  if (!content.visualization) issue(issues, "visualization", "is required for the initial catalog");
  if (content.visualization) {
    requiredString(issues, content.visualization.type, "visualization.type");
    stringArray(issues, content.visualization.states, "visualization.states");
    stringArray(issues, content.visualization.events, "visualization.events");
  }
}

export function validateContentPackage(
  content: ContentPackage,
  registry?: ContentRegistryReferenceProvider
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  const metadata = content?.metadata;
  if (!metadata || typeof metadata !== "object")
    return [{ path: "metadata", message: "is required" }];

  requiredString(issues, metadata.id, "metadata.id");
  requiredString(issues, metadata.slug, "metadata.slug");
  if (typeof metadata.id === "string" && !idPattern.test(metadata.id))
    issue(issues, "metadata.id", "must use stable id syntax");
  if (typeof metadata.slug === "string" && !slugPattern.test(metadata.slug))
    issue(issues, "metadata.slug", "must be kebab-case");
  if (!CONTENT_TYPES.includes(metadata.type))
    issue(issues, "metadata.type", "is not a supported source content type");
  for (const field of ["title", "summary", "description", "category"] as const)
    requiredString(issues, metadata[field], `metadata.${field}`);
  if (!["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(metadata.difficulty))
    issue(issues, "metadata.difficulty", "is invalid");
  stringArray(issues, metadata.learningObjectives, "metadata.learningObjectives");
  stringArray(issues, metadata.prerequisites, "metadata.prerequisites");
  stringArray(issues, metadata.commonMistakes, "metadata.commonMistakes");
  stringArray(issues, metadata.tags, "metadata.tags");
  if (!Array.isArray(metadata.examples) || metadata.examples.length === 0)
    issue(issues, "metadata.examples", "must contain at least one example");
  if (!Array.isArray(metadata.relatedContent))
    issue(issues, "metadata.relatedContent", "must be an array");
  if (
    metadata.links &&
    (!Array.isArray(metadata.links) ||
      metadata.links.some(
        (link) =>
          !link ||
          typeof link.label !== "string" ||
          typeof link.href !== "string" ||
          !["INTERNAL", "EXTERNAL"].includes(link.kind)
      ))
  )
    issue(issues, "metadata.links", "must contain valid link objects");
  for (const link of metadata.links ?? []) {
    if (link.kind === "INTERNAL" && !link.href.startsWith("/"))
      issue(issues, "metadata.links", "internal links must start with /");
    if (link.kind === "EXTERNAL" && !/^https?:\/\//.test(link.href))
      issue(issues, "metadata.links", "external links must use http(s)");
  }
  if (metadata.schemaVersion !== 1) issue(issues, "metadata.schemaVersion", "must equal 1");
  requiredString(issues, content.explanation, "explanation");

  if (metadata.type === "ALGORITHM" && !metadata.implementationSlug)
    issue(issues, "metadata.implementationSlug", "is required for algorithms");
  if (metadata.type === "ALGORITHM" && !metadata.complexity)
    issue(issues, "metadata.complexity", "is required for algorithms");
  if (metadata.complexity)
    for (const field of ["timeBest", "timeAverage", "timeWorst", "space"] as const)
      requiredString(issues, metadata.complexity[field], `metadata.complexity.${field}`);
  if (metadata.type === "DATA_STRUCTURE" && !metadata.implementationSlug)
    issue(issues, "metadata.implementationSlug", "is required for data structures");
  if (
    metadata.visualizationType &&
    !registry?.hasVisualization(metadata.visualizationType) &&
    registry
  )
    issue(issues, "metadata.visualizationType", "does not resolve to a registered visualization");

  if (registry) {
    if (
      metadata.type === "ALGORITHM" &&
      metadata.implementationSlug &&
      !registry.hasAlgorithm(metadata.implementationSlug)
    )
      issue(
        issues,
        "metadata.implementationSlug",
        "does not resolve to an algorithm registry entry"
      );
    if (
      metadata.type === "DATA_STRUCTURE" &&
      metadata.implementationSlug &&
      !registry.hasDataStructure(metadata.implementationSlug)
    )
      issue(
        issues,
        "metadata.implementationSlug",
        "does not resolve to a data-structure registry entry"
      );
    for (const relation of metadata.relatedContent) {
      if (
        !["RELATED", "NEXT", "ALTERNATIVE", "PREREQUISITE"].includes(relation.relationship) ||
        !slugPattern.test(relation.slug)
      )
        issue(
          issues,
          `metadata.relatedContent.${relation.slug}`,
          "must reference a valid content slug and relationship"
        );
    }
  }

  if (["ALGORITHM", "DATA_STRUCTURE"].includes(metadata.type))
    requiredRichEducationalFields(content, issues);
  return issues;
}

export function assertValidContentPackage(
  content: ContentPackage,
  registry?: ContentRegistryReferenceProvider
): void {
  const issues = validateContentPackage(content, registry);
  if (issues.length === 0) return;
  throw new Error(
    `Invalid educational content:\n${issues.map((item) => `- ${item.path}: ${item.message}`).join("\n")}`
  );
}
