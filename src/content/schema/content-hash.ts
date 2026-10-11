import { createHash } from "node:crypto";

import { canonicalizeContent } from "./canonicalize";
import type { ContentPackage } from "./content-types";

export function calculateContentHash(content: ContentPackage): string {
  return createHash("sha256").update(canonicalizeContent(content), "utf8").digest("hex");
}
