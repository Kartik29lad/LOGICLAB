import type { ExecutionTraceStep } from "@/contracts/events/trace-events";
import type { CodeReference, ContentPackage } from "@/content/schema/content-types";

export interface SynchronizedCodeView {
  source: string;
  language: CodeReference["language"];
  entryPoint?: string;
  activeLines: number[];
  lines?: number[];
  synchronized: boolean;
  referenceId?: string;
}

export interface SynchronizedPseudocodeView {
  source: string;
  activeLines: number[];
  synchronized: boolean;
  sectionId?: string;
}

export interface ExecutionReferenceView {
  code: SynchronizedCodeView | null;
  pseudocode: SynchronizedPseudocodeView | null;
}

export function resolveExecutionReferences(
  content: ContentPackage,
  step: ExecutionTraceStep
): ExecutionReferenceView {
  return {
    code: resolveCodeReference(content, step),
    pseudocode: resolvePseudocodeReference(content, step),
  };
}

function resolveCodeReference(
  content: ContentPackage,
  step: ExecutionTraceStep
): SynchronizedCodeView | null {
  const reference = selectCodeReference(content, step.event.codeReference?.codeId);
  if (!reference) return null;

  const eventLines = step.event.codeReference?.lineNumbers ?? [];
  const mappedLines =
    eventLines.length > 0 ? eventLines : resolveMappedLines(reference, step.event.type);

  return {
    source: reference.source,
    language: reference.language,
    entryPoint: reference.entryPoint,
    activeLines: mappedLines,
    lines: mappedLines,
    synchronized: mappedLines.length > 0,
    referenceId: step.event.codeReference?.codeId ?? reference.entryPoint,
  };
}

function resolvePseudocodeReference(
  content: ContentPackage,
  step: ExecutionTraceStep
): SynchronizedPseudocodeView | null {
  if (!content.pseudocode) return null;

  const sectionId = step.event.pseudocodeReference?.sectionId;
  const activeLines = resolvePseudocodeLines(content.pseudocode, sectionId);

  return {
    source: content.pseudocode,
    activeLines,
    synchronized: activeLines.length > 0,
    sectionId,
  };
}

function selectCodeReference(content: ContentPackage, codeId?: string): CodeReference | null {
  const references = content.code ?? [];
  if (references.length === 0) return null;
  if (codeId) {
    const exact = references.find((reference) => reference.entryPoint === codeId);
    if (exact) return exact;
  }
  return (
    references.find((reference) => reference.language === "typescript") ?? references[0] ?? null
  );
}

function resolveMappedLines(reference: CodeReference, eventType: string): number[] {
  const mapping = reference.stepMappings?.find((item) => item.action === eventType);
  if (!mapping) return [];
  return range(mapping.startLine, mapping.endLine);
}

function resolvePseudocodeLines(source: string, sectionId?: string): number[] {
  const lines = source.split("\n");
  if (!sectionId) return [];
  const numericLine = /^line[-_:]?(\d+)$/i.exec(sectionId)?.[1];
  if (numericLine) {
    const line = Number(numericLine);
    return line >= 1 && line <= lines.length ? [line] : [];
  }
  const markerIndex = lines.findIndex((line) => line.includes(sectionId));
  return markerIndex >= 0 ? [markerIndex + 1] : [];
}

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}
